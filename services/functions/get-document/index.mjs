import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({});

const TABLE_NAME = process.env.DOCUFLOW_DEV_TABLE_NAME;
const RAW_BUCKET = process.env.DOCUFLOW_DEV_RAW_BUCKET || process.env.DOCUFLOW_DEV_RAW_BUCKET_NAME;
const PROCESSED_BUCKET = process.env.DOCUFLOW_DEV_PROCESSED_BUCKET;
const SOURCE_URL_EXPIRES_SECONDS = Number(process.env.SOURCE_URL_EXPIRES_SECONDS || 900);

let getSignedUrl;

export const handler = async (event) => {
  try {
    const method = event?.requestContext?.http?.method || event?.httpMethod || "";

    if (method === "OPTIONS") {
      return formatResponse(200, true, null);
    }

    if (method !== "GET") {
      return formatResponse(
        405,
        false,
        null,
        "Only GET is supported.",
        "API",
        "METHOD_NOT_ALLOWED"
      );
    }

    const envError = validateEnvironment();
    if (envError) return envError;

    const documentId = getDocumentId(event);
    const userId = getUserId(event);
    const admin = isAdmin(event);

    if (!documentId) {
      return formatResponse(400, false, null, "Missing documentId.", "VALIDATION", "INVALID_INPUT");
    }

    if (!userId) {
      return formatResponse(401, false, null, "Missing authenticated Cognito user.", "AUTH", "UNAUTHORIZED");
    }

    logInfo("Get document request received", { documentId, userId, admin });

    let dbRes = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `DOC#${documentId}`,
      },
    }));

    if (!dbRes.Item && admin) {
      const adminResult = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        ExpressionAttributeNames: { "#sk": "SK" },
        ExpressionAttributeValues: { ":sk": `DOC#${documentId}` },
        FilterExpression: "#sk = :sk",
        Limit: 1,
      }));
      dbRes = { Item: adminResult.Items?.[0] };
    }

    if (!dbRes.Item) {
      return formatResponse(404, false, null, "Document not found.", "DYNAMODB", "NOT_FOUND");
    }

    const safeItem = removeDynamoDbKeys(dbRes.Item);
    const processedS3Key = resolveProcessedS3Key(safeItem);

    if (!processedS3Key) {
      return formatResponse(200, true, await normalizeDocumentResponse(safeItem, null));
    }

    let fullDocument;

    try {
      const s3Res = await s3Client.send(new GetObjectCommand({
        Bucket: PROCESSED_BUCKET,
        Key: normalizeS3Key(processedS3Key),
      }));

      fullDocument = await parseS3JsonBody(s3Res.Body);

      logInfo("Processed result loaded from S3", {
        documentId,
        userId,
        processedS3Bucket: PROCESSED_BUCKET,
        processedS3Key,
      });
    } catch (s3Error) {
      logError("Failed to read processed result from S3. Returning DynamoDB metadata only.", {
        documentId,
        userId,
        processedS3Bucket: PROCESSED_BUCKET,
        processedS3Key,
        errorName: s3Error?.name,
        errorMessage: s3Error?.message,
      });

      return formatResponse(200, true, {
        ...await normalizeDocumentResponse({ ...safeItem, processedS3Key }, null),
        s3ReadWarning: {
          errorCode: "S3_READ_FAILED",
          errorMessage: s3Error?.message || "Could not read processed result from S3.",
          errorStage: "S3_PROCESSED",
        },
      });
    }

    return formatResponse(
      200,
      true,
      await normalizeDocumentResponse({ ...safeItem, processedS3Key }, fullDocument)
    );
  } catch (error) {
    logError("Unhandled error", {
      errorName: error?.name,
      errorMessage: error?.message,
    });

    return formatResponse(
      500,
      false,
      null,
      error?.message || "Unknown error.",
      "UNKNOWN",
      "UNKNOWN_ERROR"
    );
  }
};

function validateEnvironment() {
  if (!TABLE_NAME) {
    return formatResponse(
      500,
      false,
      null,
      "DOCUFLOW_DEV_TABLE_NAME environment variable is missing.",
      "DYNAMODB",
      "UNKNOWN_ERROR"
    );
  }

  if (!PROCESSED_BUCKET) {
    return formatResponse(
      500,
      false,
      null,
      "DOCUFLOW_DEV_PROCESSED_BUCKET environment variable is missing.",
      "S3_PROCESSED",
      "UNKNOWN_ERROR"
    );
  }

  if (
    !Number.isInteger(SOURCE_URL_EXPIRES_SECONDS) ||
    SOURCE_URL_EXPIRES_SECONDS < 60 ||
    SOURCE_URL_EXPIRES_SECONDS > 3600
  ) {
    return formatResponse(
      500,
      false,
      null,
      "SOURCE_URL_EXPIRES_SECONDS must be an integer between 60 and 3600.",
      "CONFIGURATION",
      "INVALID_ENVIRONMENT_VARIABLE"
    );
  }

  return null;
}

function formatResponse(statusCode, success, data, errorMessage = null, errorStage = null, errorCode = "UNKNOWN_ERROR") {
  const body = { success, data, error: null };

  if (errorMessage) {
    body.error = { errorCode, errorMessage, errorStage };
  }

  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "OPTIONS,GET",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function getDocumentId(event) {
  return (
    event?.pathParameters?.documentId ||
    event?.queryStringParameters?.documentId ||
    event?.documentId ||
    null
  );
}

function getUserId(event) {
  const claims =
    event?.requestContext?.authorizer?.jwt?.claims ||
    event?.requestContext?.authorizer?.claims ||
    {};

  return claims.sub || null;
}

function getGroups(event) {
  const claims =
    event?.requestContext?.authorizer?.jwt?.claims ||
    event?.requestContext?.authorizer?.claims ||
    {};
  const groups = claims["cognito:groups"] || [];
  return Array.isArray(groups) ? groups : String(groups).split(",");
}

function isAdmin(event) {
  return getGroups(event).some((group) => group.trim().toLowerCase() === "admin");
}

function removeDynamoDbKeys(item = {}) {
  const { PK, SK, GSI1PK, GSI1SK, ...safeItem } = item;
  return safeItem;
}

function resolveProcessedS3Key(item = {}) {
  return (
    item.processedS3Key ||
    item.storage?.processedS3Key ||
    item.processed?.s3Key ||
    item.resultS3Key ||
    null
  );
}

function resolveRawS3Key(item = {}) {
  return (
    item.rawS3Key ||
    item.storage?.rawS3Key ||
    item.raw?.s3Key ||
    item.sourceS3Key ||
    null
  );
}

function parseS3Location(value, fallbackBucket = null) {
  if (!value) return { bucket: null, key: null };

  if (value.startsWith("s3://")) {
    const withoutScheme = value.slice("s3://".length);
    const slashIndex = withoutScheme.indexOf("/");
    if (slashIndex < 0) return { bucket: withoutScheme, key: null };
    return {
      bucket: withoutScheme.slice(0, slashIndex),
      key: withoutScheme.slice(slashIndex + 1),
    };
  }

  return {
    bucket: fallbackBucket,
    key: normalizeS3Key(value),
  };
}

async function loadGetSignedUrl() {
  if (getSignedUrl) return getSignedUrl;

  const presigner = await import("@aws-sdk/s3-request-presigner");
  getSignedUrl = presigner.getSignedUrl;
  return getSignedUrl;
}

async function createSourceUrl(rawS3Key) {
  const { bucket, key } = parseS3Location(rawS3Key, RAW_BUCKET);

  if (!bucket || !key) {
    return null;
  }

  try {
    const sign = await loadGetSignedUrl();
    return await sign(
      s3Client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      {
        expiresIn: SOURCE_URL_EXPIRES_SECONDS,
      }
    );
  } catch (error) {
    logError("Failed to create source document presigned URL.", {
      rawS3Bucket: bucket,
      rawS3Key: key,
      errorName: error?.name,
      errorMessage: error?.message,
    });
    return null;
  }
}

function normalizeS3Key(key) {
  if (!key) return key;

  if (key.startsWith("s3://")) {
    const withoutScheme = key.slice("s3://".length);
    const slashIndex = withoutScheme.indexOf("/");
    return slashIndex >= 0 ? withoutScheme.slice(slashIndex + 1) : withoutScheme;
  }

  return key.replace(/^\/+/, "");
}

async function parseS3JsonBody(bodyStream) {
  if (!bodyStream) {
    throw new Error("S3 object Body is empty.");
  }

  const text = await bodyStream.transformToString();
  return parsePossiblyDoubleStringifiedJson(text);
}

function parsePossiblyDoubleStringifiedJson(value) {
  let parsed = typeof value === "string" ? JSON.parse(value) : value;

  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }

  return parsed;
}

async function normalizeDocumentResponse(safeItem, fullDocument) {
  const doc = unwrapProcessedDocument(fullDocument);
  const invoice = firstRecord(
    doc?.invoice,
    doc?.normalized?.invoice,
    doc?.extracted?.invoice,
    doc?.data?.invoice,
    {}
  );
  const confidence = firstRecord(doc?.confidence, doc?.normalized?.confidence, {});
  const review = firstRecord(doc?.review, {});
  const audit = firstRecord(doc?.audit, {});
  const storage = firstRecord(doc?.storage, {});
  const file = firstRecord(doc?.file, {});
  const textractSummary = extractTextractSummaryFields(doc);
  const lineItems = extractLineItems(doc, invoice);
  const rawS3Key = pickValue(storage.rawS3Key, doc?.rawS3Key, safeItem.rawS3Key);
  const sourceUrl = pickValue(doc?.sourceUrl, safeItem.sourceUrl, await createSourceUrl(rawS3Key), null);

  return {
    ...safeItem,

    documentId: pickValue(doc?.documentId, safeItem.documentId),
    userId: pickValue(doc?.userId, safeItem.userId),
    documentType: pickValue(doc?.documentType, safeItem.documentType, inferDocumentType(doc), "UNKNOWN"),
    status: pickValue(doc?.status, safeItem.status),

    originalFileName: pickValue(file.originalFileName, doc?.originalFileName, doc?.fileName, safeItem.originalFileName),
    rawS3Key,
    processedS3Key: pickValue(storage.processedS3Key, doc?.processedS3Key, safeItem.processedS3Key),
    sourceUrl,

    vendorName: pickValue(invoice.vendorName, doc?.vendorName, textractSummary.vendorName, safeItem.vendorName, ""),
    invoiceNumber: pickValue(invoice.invoiceNumber, doc?.invoiceNumber, textractSummary.invoiceNumber, safeItem.invoiceNumber, ""),
    invoiceDate: pickValue(invoice.invoiceDate, doc?.invoiceDate, textractSummary.invoiceDate, safeItem.invoiceDate, ""),
    dueDate: pickValue(invoice.dueDate, doc?.dueDate, textractSummary.dueDate, safeItem.dueDate, ""),
    currency: pickValue(invoice.currency, doc?.currency, safeItem.currency, inferCurrency(doc), "USD"),
    subtotalAmount: toNumber(pickValue(invoice.subtotalAmount, doc?.subtotalAmount, textractSummary.subtotalAmount, safeItem.subtotalAmount), 0),
    taxAmount: nullableNumber(pickValue(invoice.taxAmount, doc?.taxAmount, textractSummary.taxAmount, safeItem.taxAmount)),
    discountAmount: toNumber(pickValue(invoice.discountAmount, doc?.discountAmount, safeItem.discountAmount), 0),
    shippingAmount: toNumber(pickValue(invoice.shippingAmount, doc?.shippingAmount, safeItem.shippingAmount), 0),
    totalAmount: toNumber(pickValue(invoice.totalAmount, doc?.totalAmount, textractSummary.totalAmount, safeItem.totalAmount), 0),

    confidenceScore: normalizeConfidence(pickValue(
      confidence.confidenceScore,
      doc?.confidenceScore,
      safeItem.confidenceScore
    )),
    hasLowConfidence: Boolean(pickValue(confidence.hasLowConfidence, doc?.hasLowConfidence, safeItem.hasLowConfidence, false)),
    fieldConfidence: firstRecord(confidence.fieldConfidence, doc?.fieldConfidence, safeItem.fieldConfidence, {}),

    reviewStatus: pickValue(review.reviewStatus, doc?.reviewStatus, safeItem.reviewStatus, "PENDING"),
    reviewReasonCodes: firstArray(review.reviewReasonCodes, doc?.reviewReasonCodes, safeItem.reviewReasonCodes, []),
    corrections: firstArray(review.corrections, doc?.corrections, []),

    lineItems,

    createdAt: pickValue(audit.createdAt, doc?.createdAt, safeItem.createdAt),
    updatedAt: pickValue(audit.updatedAt, doc?.updatedAt, safeItem.updatedAt),
  };
}

function unwrapProcessedDocument(value) {
  let doc = value;

  if (typeof doc === "string") {
    doc = parsePossiblyDoubleStringifiedJson(doc);
  }

  if (!isRecord(doc)) return {};

  return firstRecord(
    doc.document,
    doc.result,
    doc.data?.document,
    doc.data?.result,
    doc.data,
    doc
  );
}

function extractLineItems(doc, invoice) {
  const directItems = firstArray(
    doc?.lineItems,
    invoice?.lineItems,
    doc?.normalized?.lineItems,
    doc?.normalized?.invoice?.lineItems,
    doc?.extracted?.lineItems,
    doc?.data?.lineItems,
    []
  );

  if (directItems.length > 0) {
    return directItems.map(normalizeLineItem).filter((item) => item.description || item.totalAmount > 0);
  }

  const textractItems = extractTextractLineItems(doc);

  if (textractItems.length > 0) {
    return textractItems;
  }

  return [];
}

function extractTextractLineItems(doc) {
  const expenseDocuments = firstArray(
    doc?.ExpenseDocuments,
    doc?.expenseDocuments,
    doc?.textract?.ExpenseDocuments,
    doc?.textractResult?.ExpenseDocuments,
    doc?.rawTextract?.ExpenseDocuments,
    doc?.analyzeExpense?.ExpenseDocuments,
    []
  );

  const items = [];

  for (const expenseDocument of expenseDocuments) {
    const groups = firstArray(expenseDocument?.LineItemGroups, expenseDocument?.lineItemGroups, []);

    for (const group of groups) {
      const lineItems = firstArray(group?.LineItems, group?.lineItems, []);

      for (const lineItem of lineItems) {
        const normalized = normalizeTextractLineItem(lineItem);
        if (normalized.description || normalized.totalAmount > 0) {
          items.push(normalized);
        }
      }
    }
  }

  return items;
}

function extractTextractSummaryFields(doc) {
  const expenseDocuments = firstArray(
    doc?.ExpenseDocuments,
    doc?.expenseDocuments,
    doc?.textract?.ExpenseDocuments,
    doc?.textractResult?.ExpenseDocuments,
    doc?.rawTextract?.ExpenseDocuments,
    doc?.analyzeExpense?.ExpenseDocuments,
    []
  );
  const byType = {};

  for (const expenseDocument of expenseDocuments) {
    const summaryFields = firstArray(expenseDocument?.SummaryFields, expenseDocument?.summaryFields, []);

    for (const field of summaryFields) {
      const type = normalizeKey(field?.Type?.Text || field?.type?.text || field?.Type || field?.type);
      const label = normalizeKey(field?.LabelDetection?.Text || field?.labelDetection?.text || "");
      const key = type || label;
      const value = field?.ValueDetection?.Text || field?.valueDetection?.text || field?.Value || field?.value || "";

      if (key && value && !byType[key]) {
        byType[key] = value;
      }
    }
  }

  return {
    vendorName: pickSummaryValue(byType, ["VENDOR_NAME", "VENDOR", "FROM"]),
    invoiceNumber: pickSummaryValue(byType, ["INVOICE_RECEIPT_ID", "INVOICE_NUMBER", "RECEIPT_NUMBER"]),
    invoiceDate: pickSummaryValue(byType, ["INVOICE_RECEIPT_DATE", "INVOICE_DATE", "RECEIPT_DATE"]),
    dueDate: pickSummaryValue(byType, ["DUE_DATE"]),
    subtotalAmount: pickSummaryValue(byType, ["SUBTOTAL", "SUB_TOTAL"]),
    taxAmount: pickSummaryValue(byType, ["TAX", "TAX_AMOUNT"]),
    totalAmount: pickSummaryValue(byType, ["TOTAL", "TOTAL_DUE", "AMOUNT_DUE"]),
  };
}

function normalizeTextractLineItem(lineItem) {
  const fields = firstArray(lineItem?.LineItemExpenseFields, lineItem?.lineItemExpenseFields, []);
  const byType = {};

  for (const field of fields) {
    const type = normalizeKey(field?.Type?.Text || field?.type?.text || field?.Type || field?.type);
    const label = normalizeKey(field?.LabelDetection?.Text || field?.labelDetection?.text || "");
    const key = type || label;
    const value = field?.ValueDetection?.Text || field?.valueDetection?.text || field?.Value || field?.value || "";
    const confidence = field?.ValueDetection?.Confidence ?? field?.valueDetection?.confidence ?? field?.Confidence ?? field?.confidence;

    if (!key || !value) continue;

    if (!byType[key]) {
      byType[key] = { value, confidence };
    }
  }

  const quantity = pickField(byType, ["QUANTITY", "QTY", "HRS_QTY", "HOURS", "HRS"]);
  const description = pickField(byType, [
    "ITEM",
    "ITEM_DESCRIPTION",
    "DESCRIPTION",
    "SERVICE",
    "PRODUCT",
    "EXPENSE_ROW",
  ]);
  const unitPrice = pickField(byType, [
    "UNIT_PRICE",
    "PRICE",
    "RATE",
    "RATE_PRICE",
    "RATE/PRICE",
    "UNIT_COST",
  ]);
  const total = pickField(byType, [
    "AMOUNT",
    "TOTAL",
    "LINE_TOTAL",
    "SUBTOTAL",
    "SUB_TOTAL",
    "LINE_ITEM_TOTAL",
  ]);
  const tax = pickField(byType, ["TAX", "TAX_AMOUNT"]);
  const confidence = Math.min(
    ...[quantity, description, unitPrice, total, tax]
      .map((field) => normalizeConfidence(field?.confidence))
      .filter((value) => value > 0)
  );

  const normalizedTotal = toNumber(total?.value, toNumber(unitPrice?.value, 0));

  return {
    lineItemId: lineItem?.LineItemExpenseFields?.[0]?.Id || lineItem?.id || "",
    description: cleanDescription(description?.value),
    quantity: toNumber(quantity?.value, normalizedTotal > 0 ? 1 : 0),
    unitPriceAmount: toNumber(unitPrice?.value, normalizedTotal),
    taxAmount: toNumber(tax?.value, 0),
    totalAmount: normalizedTotal,
    confidenceScore: Number.isFinite(confidence) ? confidence : 0,
  };
}

function pickSummaryValue(map, keys) {
  for (const key of keys) {
    const value = map[normalizeKey(key)];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return undefined;
}

function normalizeLineItem(item) {
  const description = pickValue(
    item?.description,
    item?.itemDescription,
    item?.name,
    item?.productName,
    item?.service,
    item?.Service,
    ""
  );
  const quantity = pickValue(item?.quantity, item?.qty, item?.hours, item?.hrsQty);
  const unitPrice = pickValue(item?.unitPriceAmount, item?.unitPrice, item?.ratePrice, item?.rate, item?.price);
  const total = pickValue(item?.totalAmount, item?.amount, item?.subTotal, item?.subtotal, item?.lineTotal);
  const normalizedTotal = toNumber(total, toNumber(unitPrice, 0));

  return {
    lineItemId: String(pickValue(item?.lineItemId, item?.id, "")),
    description: cleanDescription(description),
    quantity: toNumber(quantity, normalizedTotal > 0 ? 1 : 0),
    unitPriceAmount: toNumber(unitPrice, normalizedTotal),
    taxAmount: toNumber(pickValue(item?.taxAmount, item?.tax), 0),
    totalAmount: normalizedTotal,
    confidenceScore: normalizeConfidence(pickValue(item?.confidenceScore, item?.confidence)),
  };
}

function pickField(map, keys) {
  for (const key of keys) {
    const normalizedKey = normalizeKey(key);
    if (map[normalizedKey]) return map[normalizedKey];
  }

  return null;
}

function cleanDescription(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferDocumentType(doc) {
  const type = String(doc?.documentType || doc?.type || "").toUpperCase();
  if (type.includes("RECEIPT")) return "RECEIPT";
  if (type.includes("INVOICE")) return "INVOICE";
  return undefined;
}

function inferCurrency(doc) {
  const text = JSON.stringify(doc || {}).toUpperCase();
  if (text.includes("VND") || text.includes("₫")) return "VND";
  if (text.includes("EUR") || text.includes("€")) return "EUR";
  if (text.includes("GBP") || text.includes("£")) return "GBP";
  if (text.includes("CNY") || text.includes("RMB") || text.includes("CN¥")) return "CNY";
  if (text.includes("JPY") || text.includes("¥")) return "JPY";
  if (text.includes("KRW") || text.includes("₩")) return "KRW";
  if (text.includes("SGD") || text.includes("S$")) return "SGD";
  if (text.includes("THB") || text.includes("฿")) return "THB";
  if (text.includes("AUD") || text.includes("A$")) return "AUD";
  if (text.includes("CAD") || text.includes("C$")) return "CAD";
  if (text.includes("CHF")) return "CHF";
  if (text.includes("HKD") || text.includes("HK$")) return "HKD";
  if (text.includes("INR") || text.includes("₹")) return "INR";
  if (text.includes("IDR") || text.includes("RP")) return "IDR";
  if (text.includes("MYR") || text.includes("RM")) return "MYR";
  if (text.includes("PHP") || text.includes("₱")) return "PHP";
  if (text.includes("TWD") || text.includes("NT$")) return "TWD";
  if (text.includes("USD") || text.includes("$")) return "USD";
  return undefined;
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function pickValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      if (isRecord(value) && "value" in value) return value.value;
      return value;
    }
  }

  return values[values.length - 1];
}

function firstRecord(...values) {
  for (const value of values) {
    if (isRecord(value)) return value;
  }

  return {};
}

function firstArray(...values) {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }

  return [];
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value, fallback = 0) {
  if (isRecord(value) && "value" in value) {
    return toNumber(value.value, fallback);
  }

  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  const cleaned = String(value)
    .replace(/[^\d.,-]/g, "")
    .replace(/,/g, "");
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  return toNumber(value, null);
}

function normalizeConfidence(value) {
  const number = toNumber(value, 0);
  if (number <= 0) return 0;
  if (number <= 1) return number;
  return Math.min(number / 100, 1);
}

function logInfo(message, extra = {}) {
  console.log(JSON.stringify({
    level: "INFO",
    service: "docuflow-dev-data-get-document-lambda",
    message,
    ...extra,
  }));
}

function logError(message, extra = {}) {
  console.error(JSON.stringify({
    level: "ERROR",
    service: "docuflow-dev-data-get-document-lambda",
    message,
    ...extra,
  }));
}
