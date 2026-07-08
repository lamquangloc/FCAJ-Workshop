const CONFIDENCE_THRESHOLD = normalizeThreshold(
  process.env.CONFIDENCE_THRESHOLD,
  0.9
);

export const handler = async (event) => {
  const rootFields = isRecord(event) ? { ...event } : {};
  delete rootFields.normalizedResult;

  const normalizedResult = unwrapNormalizedResult(event?.normalizedResult);
  const source = { ...rootFields, ...normalizedResult };
  const invoice = isRecord(source.invoice) ? source.invoice : {};
  const confidence = isRecord(source.confidence) ? source.confidence : {};
  const reviewReasonCodes = [];

  if (!['INVOICE', 'RECEIPT'].includes(source.documentType)) {
    reviewReasonCodes.push("UNKNOWN_DOCUMENT_TYPE");
  }

  if (!hasText(invoice.vendorName)) {
    reviewReasonCodes.push("MISSING_VENDOR_NAME");
  }
  if (!hasText(invoice.invoiceNumber)) {
    reviewReasonCodes.push("MISSING_INVOICE_NUMBER");
  }
  if (!hasText(invoice.invoiceDate)) {
    reviewReasonCodes.push("MISSING_INVOICE_DATE");
  }

  if (invoice.totalAmount === undefined || invoice.totalAmount === null) {
    reviewReasonCodes.push("MISSING_TOTAL_AMOUNT");
  } else if (
    typeof invoice.totalAmount !== "number" ||
    !Number.isFinite(invoice.totalAmount)
  ) {
    reviewReasonCodes.push("INVALID_AMOUNT_FORMAT");
  }

  if (!hasText(invoice.currency)) {
    reviewReasonCodes.push("MISSING_CURRENCY");
  }

  const finalConfidenceScore = resolveConfidenceScore(confidence);
  if (
    finalConfidenceScore < CONFIDENCE_THRESHOLD ||
    confidence.hasLowConfidence === true
  ) {
    reviewReasonCodes.push("LOW_CONFIDENCE");
  }

  const uniqueReasonCodes = [...new Set(reviewReasonCodes)];
  const isReviewRequired = uniqueReasonCodes.length > 0;
  const status = isReviewRequired ? "REVIEW_REQUIRED" : "EXTRACTED";

  log("INFO", {
    documentId: source.documentId,
    documentType: source.documentType || null,
    status,
    confidenceScore: finalConfidenceScore,
    confidenceThreshold: CONFIDENCE_THRESHOLD,
    reviewReasonCodes: uniqueReasonCodes,
    message: "Confidence status evaluated",
  });

  return {
    ...source,
    status,
    invoice,
    confidence: {
      confidenceScore: finalConfidenceScore,
      hasLowConfidence: uniqueReasonCodes.includes("LOW_CONFIDENCE"),
      fieldConfidence: isRecord(confidence.fieldConfidence)
        ? confidence.fieldConfidence
        : {},
    },
    review: {
      reviewStatus: isReviewRequired ? "PENDING" : "NOT_REQUIRED",
      reviewReasonCodes: uniqueReasonCodes,
      reviewedBy: null,
      reviewedAt: null,
      corrections: [],
    },
  };
};

function unwrapNormalizedResult(value) {
  let result = value?.Payload ?? value?.payload ?? value ?? {};

  if (typeof result === "string") {
    try {
      result = JSON.parse(result);
    } catch {
      return {};
    }
  }

  return isRecord(result) ? result : {};
}

function resolveConfidenceScore(confidence) {
  let rawScore = finiteNumber(confidence.confidenceScore);

  if (rawScore === null) {
    const fieldScores = Object.values(confidence.fieldConfidence || {})
      .map(finiteNumber)
      .filter((value) => value !== null)
      .map((value) => (value > 1 ? value / 100 : value));
    rawScore = fieldScores.length
      ? fieldScores.reduce((sum, value) => sum + value, 0) /
        fieldScores.length
      : 0;
  }

  const normalized = rawScore > 1 ? rawScore / 100 : rawScore;
  return Number(Math.max(0, Math.min(1, normalized)).toFixed(4));
}

function normalizeThreshold(value, fallback) {
  const numeric = finiteNumber(value);
  if (numeric === null) return fallback;
  const normalized = numeric > 1 ? numeric / 100 : numeric;
  return Math.max(0, Math.min(1, normalized));
}

function finiteNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    typeof value === "boolean"
  ) {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function hasText(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function log(level, data) {
  console.log(
    JSON.stringify({
      level,
      service: "docuflow-dev-ai-confidence-status-lambda",
      ...data,
    })
  );
}
