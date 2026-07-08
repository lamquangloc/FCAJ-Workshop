import {
  TextractClient,
  AnalyzeExpenseCommand,
} from "@aws-sdk/client-textract";

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const summaryFieldMap = {
  VENDOR_NAME: "vendorName",
  INVOICE_DATE: "invoiceDate",
  INVOICE_RECEIPT_DATE: "invoiceDate",
  ORDER_DATE: "invoiceDate",
  PURCHASE_DATE: "invoiceDate",
  RECEIPT_DATE: "invoiceDate",
  TRANSACTION_DATE: "invoiceDate",
  INVOICE_RECEIPT_ID: "invoiceNumber",
  DUE_DATE: "dueDate",
  SUBTOTAL: "subtotalAmount",
  TAX: "taxAmount",
  TOTAL: "totalAmount",
  CURRENCY: "currency",
};

const lineItemFieldMap = {
  ITEM: "description",
  EXPENSE_ROW: "description",
  QUANTITY: "quantity",
  UNIT_PRICE: "unitPriceAmount",
  PRICE: "totalAmount",
  TAX: "taxAmount",
};

export const handler = async (event) => {
  const rawS3Bucket = event?.rawS3Bucket || event?.bucket;
  const rawS3Key = event?.rawS3Key || event?.key;
  const documentId =
    event?.documentId || rawS3Key?.split("/")?.[2] || null;

  log("INFO", {
    documentId,
    rawS3Bucket,
    rawS3Key,
    declaredPageCount: finiteNumber(event?.pageCount),
    message: "Textract extraction started",
  });

  if (!rawS3Bucket || !rawS3Key) {
    throw createError(
      "INVALID_WORKFLOW_INPUT",
      "Missing rawS3Bucket/rawS3Key or bucket/key in event payload"
    );
  }

  assertSynchronousDocumentSupported(event, rawS3Key);

  try {
    const textractResponse = await textractClient.send(
      new AnalyzeExpenseCommand({
        Document: {
          S3Object: { Bucket: rawS3Bucket, Name: rawS3Key },
        },
      })
    );
    const detectedPageCount = finiteNumber(
      textractResponse?.DocumentMetadata?.Pages
    );

    if (detectedPageCount !== null && detectedPageCount > 1) {
      throw createError(
        "MULTI_PAGE_REQUIRES_ASYNC_TEXTRACT",
        "Synchronous AnalyzeExpense supports only one-page PDF or TIFF documents."
      );
    }

    const parsed = parseExpenseDocuments(
      textractResponse?.ExpenseDocuments || []
    );

    log("INFO", {
      documentId,
      detectedPageCount,
      expenseCount: parsed.expenseDocuments.length,
      primaryExpenseIndex: parsed.primaryExpenseIndex,
      summaryFieldCount: Object.keys(parsed.summaryFields).length,
      lineItemCount: parsed.lineItems.length,
      message: "Textract extraction completed",
    });

    return {
      ...event,
      rawS3Bucket,
      rawS3Key,
      extractedData: {
        documentId,
        documentMetadata: {
          pages: detectedPageCount,
          expenseCount: parsed.expenseDocuments.length,
          primaryExpenseIndex: parsed.primaryExpenseIndex,
        },
        summaryFields: parsed.summaryFields,
        summaryFieldCandidates: parsed.summaryFieldCandidates,
        rawSummaryFields: parsed.rawSummaryFields,
        lineItems: parsed.lineItems,
        expenseDocuments: parsed.expenseDocuments,
      },
    };
  } catch (error) {
    log("ERROR", {
      documentId,
      errorName: error?.name,
      errorCode: error?.code,
      errorMessage: error?.message,
      message: "Textract extraction failed",
    });
    throw error;
  }
};

export function parseExpenseDocuments(documents) {
  const expenseDocuments = (Array.isArray(documents) ? documents : []).map(
    (document, index) => parseExpenseDocument(document, index + 1)
  );
  const primaryExpense = selectPrimaryExpense(expenseDocuments);

  return {
    primaryExpenseIndex: primaryExpense?.expenseIndex ?? null,
    summaryFields: primaryExpense?.summaryFields || {},
    summaryFieldCandidates: collectSummaryFieldCandidates(expenseDocuments),
    rawSummaryFields: primaryExpense?.rawSummaryFields || [],
    lineItems: primaryExpense?.lineItems || [],
    expenseDocuments,
  };
}

function parseExpenseDocument(document, fallbackExpenseIndex) {
  const summaryFieldCandidates = {};
  const rawSummaryFields = [];
  const lineItems = [];

  for (const field of document?.SummaryFields || []) {
    const type = normalizeType(field?.Type?.Text);
    const label = field?.LabelDetection?.Text || null;
    const value = field?.ValueDetection?.Text;
    const confidenceScore = normalizeConfidence(field?.ValueDetection?.Confidence);
    const sourceField = {
      value: value ?? null,
      confidenceScore,
      type,
      label,
      pageNumber: field?.PageNumber || null,
      groupProperties: normalizeGroupProperties(field?.GroupProperties),
    };
    rawSummaryFields.push(sourceField);

    const docuflowKey = summaryFieldMap[type] || inferSummaryFieldKey(field);

    if (docuflowKey && value !== undefined) {
      addCandidate(summaryFieldCandidates, docuflowKey, {
        value,
        confidenceScore,
        type,
        label,
        pageNumber: sourceField.pageNumber,
        groupProperties: sourceField.groupProperties,
      });
    }

    const currencyCode = field?.Currency?.Code;
    if (currencyCode) {
      addCandidate(summaryFieldCandidates, "currency", {
        value: String(currencyCode).trim().toUpperCase(),
        confidenceScore: normalizeConfidence(field?.Currency?.Confidence),
        type: "CURRENCY_METADATA",
        label: field?.LabelDetection?.Text || null,
        pageNumber: field?.PageNumber || null,
        groupProperties: normalizeGroupProperties(field?.GroupProperties),
      });
    }
  }

  for (const group of document?.LineItemGroups || []) {
    for (const lineItem of group?.LineItems || []) {
      const parsedItem = parseLineItem(lineItem, group?.LineItemGroupIndex);
      if (Object.keys(parsedItem.fields).length) lineItems.push(parsedItem);
    }
  }

  return {
    expenseIndex: document?.ExpenseIndex ?? fallbackExpenseIndex,
    summaryFields: selectBestCandidates(summaryFieldCandidates),
    summaryFieldCandidates,
    rawSummaryFields,
    lineItems: lineItems.map((item) => item.fields),
    lineItemDetails: lineItems,
  };
}

function inferSummaryFieldKey(field) {
  const label = normalizeLabel(field?.LabelDetection?.Text);
  const type = normalizeType(field?.Type?.Text);
  const value = field?.ValueDetection?.Text;

  if (!looksLikeDateText(value)) return null;
  if (/\b(DUE|PAYMENT DUE|BALANCE DUE)\b/.test(label) || type === "DUE_DATE") {
    return "dueDate";
  }
  if (
    [
      "DATE",
      "INVOICE_DATE",
      "ORDER_DATE",
      "PURCHASE_DATE",
      "RECEIPT_DATE",
      "SALE_DATE",
      "TRANSACTION_DATE",
    ].includes(type)
  ) {
    return "invoiceDate";
  }
  if (
    /\b(INVOICE|RECEIPT|ORDER|PURCHASE|SALE|TRANSACTION)?\s*DATE\b/.test(label) &&
    !/\b(DUE|EXPIR|SHIP|DELIVERY)\b/.test(label)
  ) {
    return "invoiceDate";
  }

  return null;
}

function parseLineItem(lineItem, lineItemGroupIndex) {
  const fieldCandidates = {};
  const sourceFields = [];

  for (const field of lineItem?.LineItemExpenseFields || []) {
    const type = normalizeType(field?.Type?.Text);
    const value = field?.ValueDetection?.Text;
    if (value === undefined) continue;

    const candidate = {
      value,
      confidenceScore: normalizeConfidence(field.ValueDetection.Confidence),
      type,
      label: field?.LabelDetection?.Text || null,
      pageNumber: field?.PageNumber || null,
      currency: normalizeCurrency(field?.Currency),
    };
    sourceFields.push(candidate);

    const docuflowKey = lineItemFieldMap[type];
    if (!docuflowKey) continue;

    // ITEM is more precise than the full OCR row when both are present.
    const priority = type === "ITEM" ? 2 : type === "EXPENSE_ROW" ? 1 : 2;
    addCandidate(fieldCandidates, docuflowKey, { ...candidate, priority });
  }

  return {
    lineItemGroupIndex: lineItemGroupIndex ?? null,
    fields: selectBestCandidates(fieldCandidates),
    sourceFields,
  };
}

function selectPrimaryExpense(expenseDocuments) {
  if (!expenseDocuments.length) return null;

  return [...expenseDocuments].sort((left, right) => {
    const scoreDifference = expenseCompletenessScore(right) - expenseCompletenessScore(left);
    if (scoreDifference) return scoreDifference;
    return Number(left.expenseIndex || 0) - Number(right.expenseIndex || 0);
  })[0];
}

function expenseCompletenessScore(expense) {
  const requiredSummaryFields = [
    "vendorName",
    "invoiceDate",
    "invoiceNumber",
    "totalAmount",
  ];
  const summaryScore = requiredSummaryFields.reduce(
    (score, key) => score + (expense?.summaryFields?.[key]?.value ? 2 : 0),
    0
  );
  return summaryScore + Math.min(expense?.lineItems?.length || 0, 5);
}

function collectSummaryFieldCandidates(expenseDocuments) {
  const candidates = {};

  for (const expense of expenseDocuments) {
    for (const [key, values] of Object.entries(
      expense.summaryFieldCandidates || {}
    )) {
      for (const value of values) {
        addCandidate(candidates, key, {
          ...value,
          expenseIndex: expense.expenseIndex,
        });
      }
    }
  }

  return candidates;
}

function addCandidate(candidateMap, key, candidate) {
  if (!candidateMap[key]) candidateMap[key] = [];
  candidateMap[key].push(candidate);
}

function selectBestCandidates(candidateMap) {
  return Object.fromEntries(
    Object.entries(candidateMap).map(([key, candidates]) => {
      const selected = { ...[...candidates].sort(compareCandidates)[0] };
      delete selected.priority;
      return [key, selected];
    })
  );
}

function compareCandidates(left, right) {
  const priorityDifference = (right.priority || 0) - (left.priority || 0);
  if (priorityDifference) return priorityDifference;
  return (right.confidenceScore || 0) - (left.confidenceScore || 0);
}

function normalizeGroupProperties(groupProperties) {
  if (!Array.isArray(groupProperties)) return [];
  return groupProperties.map((group) => ({
    id: group?.Id || null,
    types: Array.isArray(group?.Types) ? group.Types : [],
  }));
}

function normalizeCurrency(currency) {
  if (!currency?.Code) return null;
  return {
    code: String(currency.Code).trim().toUpperCase(),
    confidenceScore: normalizeConfidence(currency.Confidence),
  };
}

function assertSynchronousDocumentSupported(event, rawS3Key) {
  const declaredPageCount = finiteNumber(event?.pageCount);
  const isPdfOrTiff = /\.(pdf|tiff?)$/i.test(rawS3Key);

  if (isPdfOrTiff && declaredPageCount !== null && declaredPageCount > 1) {
    throw createError(
      "MULTI_PAGE_REQUIRES_ASYNC_TEXTRACT",
      "Multi-page PDF or TIFF documents must use asynchronous Textract expense analysis."
    );
  }
}

function normalizeType(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeLabel(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function looksLikeDateText(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/\b\d{4}-\d{1,2}-\d{1,2}\b/.test(text)) return true;
  if (/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(text)) return true;
  if (
    /\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|SEPT|OCT|NOV|DEC)[A-Z]*\.?\s+\d{1,2},?\s+\d{4}\b/i.test(text)
  ) {
    return true;
  }
  return false;
}

function normalizeConfidence(value) {
  const numeric = finiteNumber(value);
  if (numeric === null) return 0;
  const normalized = numeric > 1 ? numeric / 100 : numeric;
  return Number(Math.max(0, Math.min(1, normalized)).toFixed(4));
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function createError(code, message) {
  const error = new Error(message);
  error.name = "DocuFlowTextractError";
  error.code = code;
  return error;
}

function log(level, data) {
  const writer = level === "ERROR" ? console.error : console.log;
  writer(
    JSON.stringify({
      level,
      service: "docuflow-dev-ai-textract-lambda",
      ...data,
    })
  );
}
