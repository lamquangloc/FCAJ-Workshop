import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3Client = new S3Client({});

const TABLE_NAME = process.env.DOCUFLOW_DEV_TABLE_NAME;
const PROCESSED_BUCKET = process.env.DOCUFLOW_DEV_PROCESSED_BUCKET;
const ALLOWED_REVIEW_STATUSES = new Set(["CORRECTED", "APPROVED"]);
const REVIEWABLE_DOCUMENT_STATUSES = new Set([
  "EXTRACTED",
  "REVIEW_REQUIRED",
  "CORRECTED",
  "APPROVED",
]);

export function isReviewableDocumentStatus(status) {
  return REVIEWABLE_DOCUMENT_STATUSES.has(status);
}
const ALLOWED_CORRECTION_FIELDS = new Set([
  "documentType",
  "invoiceNumber",
  "vendorName",
  "invoiceDate",
  "dueDate",
  "currency",
  "subtotalAmount",
  "discountAmount",
  "shippingAmount",
  "totalAmount",
  "taxAmount",
  "lineItems",
]);
const DYNAMODB_SUMMARY_FIELDS = new Set([
  "documentType",
  "invoiceNumber",
  "vendorName",
  "invoiceDate",
  "dueDate",
  "currency",
  "subtotalAmount",
  "discountAmount",
  "shippingAmount",
  "totalAmount",
  "taxAmount",
]);

export const handler = async (event) => {
  try {
    const method = event?.requestContext?.http?.method || event?.httpMethod || "";
    if (method === "OPTIONS") return formatResponse(200, true, null);
    if (method !== "PATCH") {
      return formatResponse(
        405,
        false,
        null,
        "Only PATCH is supported.",
        "API",
        "METHOD_NOT_ALLOWED"
      );
    }

    const environmentError = validateEnvironment();
    if (environmentError) return environmentError;

    const documentId = event?.pathParameters?.documentId;
    const userId = getUserId(event);

    if (!userId) {
      return formatResponse(
        401,
        false,
        null,
        "Missing authenticated Cognito user.",
        "AUTH",
        "UNAUTHORIZED"
      );
    }

    if (!documentId) {
      return formatResponse(
        400,
        false,
        null,
        "Missing documentId.",
        "VALIDATION",
        "INVALID_INPUT"
      );
    }

    const body = parseBody(event);
    if (!body) {
      return formatResponse(
        400,
        false,
        null,
        "Request body must be valid JSON.",
        "VALIDATION",
        "INVALID_INPUT"
      );
    }

    const reviewStatus = body.reviewStatus;
    if (!ALLOWED_REVIEW_STATUSES.has(reviewStatus)) {
      return formatResponse(
        400,
        false,
        null,
        "reviewStatus must be CORRECTED or APPROVED.",
        "VALIDATION",
        "INVALID_REVIEW_STATUS"
      );
    }

    const corrections = normalizeCorrections(body.corrections);
    if (corrections.error) {
      return formatResponse(
        400,
        false,
        null,
        corrections.error,
        "VALIDATION",
        "INVALID_CORRECTIONS"
      );
    }

    const key = { PK: `USER#${userId}`, SK: `DOC#${documentId}` };
    const { Item: existingItem } = await docClient.send(
      new GetCommand({ TableName: TABLE_NAME, Key: key })
    );

    if (!existingItem) {
      return formatResponse(
        404,
        false,
        null,
        "Document not found.",
        "DYNAMODB",
        "NOT_FOUND"
      );
    }

    if (!isReviewableDocumentStatus(existingItem.status)) {
      return formatResponse(
        409,
        false,
        null,
        "Document is not in a reviewable status.",
        "DYNAMODB",
        "DOCUMENT_STATE_CONFLICT"
      );
    }

    if (!existingItem.processedS3Key) {
      return formatResponse(
        409,
        false,
        null,
        "Processed document is not available for review.",
        "S3_PROCESSED",
        "PROCESSED_DOCUMENT_MISSING"
      );
    }

    const updatedAt = new Date().toISOString();
    const reviewerNote = normalizeReviewerNote(body.reviewerNote);

    let processedUpdate;
    try {
      processedUpdate = await updateProcessedDocument({
        corrections: corrections.items,
        documentId,
        processedS3Key: existingItem.processedS3Key,
        reviewStatus,
        reviewedBy: userId,
        reviewerNote,
        updatedAt,
        userId,
      });
    } catch (error) {
      log("ERROR", {
        documentId,
        userId,
        errorName: error?.name,
        errorMessage: error?.message,
        message: "Processed S3 document update failed",
      });
      return formatResponse(
        error?.name === "PreconditionFailed" ? 409 : 502,
        false,
        null,
        error?.name === "PreconditionFailed"
          ? "Processed document changed before the review could be saved."
          : "Could not update the processed document in S3.",
        "S3_PROCESSED",
        error?.name === "PreconditionFailed"
          ? "DOCUMENT_STATE_CONFLICT"
          : "S3_UPDATE_FAILED"
      );
    }

    let updatedItem;
    try {
      const updateInput = buildDynamoDbUpdate({
        corrections: corrections.items,
        expectedStatus: existingItem.status,
        key,
        reviewStatus,
        reviewedBy: userId,
        reviewerNote,
        updatedAt,
      });
      const result = await docClient.send(new UpdateCommand(updateInput));
      updatedItem = result.Attributes;
    } catch (error) {
      const isConflict = error?.name === "ConditionalCheckFailedException";
      if (processedUpdate) {
        try {
          await rollbackProcessedDocument(processedUpdate);
        } catch (rollbackError) {
          log("ERROR", {
            documentId,
            userId,
            errorName: rollbackError?.name,
            errorMessage: rollbackError?.message,
            message: "Processed S3 document rollback failed",
          });
        }
      }
      log("ERROR", {
        documentId,
        userId,
        errorName: error?.name,
        errorMessage: error?.message,
        message: "Review metadata update failed",
      });
      return formatResponse(
        isConflict ? 409 : 500,
        false,
        null,
        isConflict
          ? "Document status changed before the review could be saved."
          : "Could not update review metadata.",
        "DYNAMODB",
        isConflict ? "DOCUMENT_STATE_CONFLICT" : "DYNAMODB_UPDATE_FAILED"
      );
    }

    log("INFO", {
      documentId,
      userId,
      reviewStatus,
      correctionCount: corrections.items.length,
      message: "Document review updated",
    });

    return formatResponse(200, true, {
      documentId,
      status: updatedItem?.status || reviewStatus,
      reviewStatus: updatedItem?.reviewStatus || reviewStatus,
      updatedAt: updatedItem?.updatedAt || updatedAt,
    });
  } catch (error) {
    log("ERROR", {
      errorName: error?.name,
      errorMessage: error?.message,
      message: "Unhandled review update error",
    });
    return formatResponse(
      500,
      false,
      null,
      error?.message || "Unknown error.",
      "REVIEW",
      "UNKNOWN_ERROR"
    );
  }
};

async function updateProcessedDocument({
  corrections,
  documentId,
  processedS3Key,
  reviewStatus,
  reviewedBy,
  reviewerNote,
  updatedAt,
  userId,
}) {
  const location = parseS3Location(processedS3Key, PROCESSED_BUCKET);
  if (
    location.bucket !== PROCESSED_BUCKET ||
    !location.key?.startsWith(`processed/${userId}/${documentId}/`)
  ) {
    throw new Error("processedS3Key is invalid.");
  }

  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: location.bucket, Key: location.key })
  );
  if (!response.Body) throw new Error("Processed S3 document is empty.");

  const originalBody = await response.Body.transformToString();
  const document = parsePossiblyDoubleStringifiedJson(originalBody);
  if (!isRecord(document)) {
    throw new Error("Processed S3 document must contain a JSON object.");
  }

  document.status = reviewStatus;
  document.review = isRecord(document.review) ? document.review : {};
  document.review.reviewStatus = reviewStatus;
  document.review.reviewedAt = updatedAt;
  document.review.reviewedBy = reviewedBy;
  document.review.reviewerNote = reviewerNote;
  document.review.corrections = corrections;
  document.review.reviewReasonCodes = [];
  document.audit = isRecord(document.audit) ? document.audit : {};
  document.audit.updatedAt = updatedAt;

  for (const correction of corrections) {
    applyCorrection(document, correction);
  }

  const putResult = await s3Client.send(
    new PutObjectCommand({
      Bucket: location.bucket,
      Key: location.key,
      Body: JSON.stringify(document),
      ContentType: "application/json",
      Metadata: {
        ...(response.Metadata || {}),
        "document-id": documentId,
      },
      IfMatch: response.ETag,
    })
  );

  return {
    bucket: location.bucket,
    key: location.key,
    originalBody,
    originalContentType: response.ContentType || "application/json",
    originalMetadata: response.Metadata || {},
    updatedETag: putResult.ETag,
  };
}

async function rollbackProcessedDocument(update) {
  if (!update.updatedETag) {
    throw new Error("Updated S3 ETag is unavailable for safe rollback.");
  }
  await s3Client.send(
    new PutObjectCommand({
      Bucket: update.bucket,
      Key: update.key,
      Body: update.originalBody,
      ContentType: update.originalContentType,
      Metadata: update.originalMetadata,
      IfMatch: update.updatedETag,
    })
  );
}

function buildDynamoDbUpdate({
  corrections,
  expectedStatus,
  key,
  reviewStatus,
  reviewedBy,
  reviewerNote,
  updatedAt,
}) {
  const names = {
    "#status": "status",
    "#reviewStatus": "reviewStatus",
  };
  const values = {
    ":status": reviewStatus,
    ":reviewStatus": reviewStatus,
    ":gsi1pk": `STATUS#${reviewStatus}`,
    ":gsi1sk": updatedAt,
    ":updatedAt": updatedAt,
    ":reviewedAt": updatedAt,
    ":reviewedBy": reviewedBy,
    ":reviewerNote": reviewerNote,
    ":reviewReasonCodes": [],
    ":expectedStatus": expectedStatus,
  };
  const assignments = [
    "#status = :status",
    "#reviewStatus = :reviewStatus",
    "GSI1PK = :gsi1pk",
    "GSI1SK = :gsi1sk",
    "updatedAt = :updatedAt",
    "reviewedAt = :reviewedAt",
    "reviewedBy = :reviewedBy",
    "reviewerNote = :reviewerNote",
    "reviewReasonCodes = :reviewReasonCodes",
  ];

  for (const correction of corrections) {
    if (!DYNAMODB_SUMMARY_FIELDS.has(correction.fieldName)) continue;
    const nameToken = `#correction${assignments.length}`;
    const valueToken = `:correction${assignments.length}`;
    names[nameToken] = correction.fieldName;
    values[valueToken] = correction.newValue;
    assignments.push(`${nameToken} = ${valueToken}`);
  }

  return {
    TableName: TABLE_NAME,
    Key: key,
    UpdateExpression: `SET ${assignments.join(", ")}`,
    ConditionExpression:
      "attribute_exists(PK) AND attribute_exists(SK) AND #status = :expectedStatus",
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: {
      ...values,
    },
    ReturnValues: "ALL_NEW",
  };
}

function applyCorrection(document, correction) {
  if (correction.fieldName === "documentType") {
    document.documentType = correction.newValue;
    return;
  }

  if (correction.fieldName === "lineItems") {
    document.lineItems = correction.newValue;
    return;
  }

  document.invoice = isRecord(document.invoice) ? document.invoice : {};
  document.invoice[correction.fieldName] = correction.newValue;
}

function normalizeCorrections(value) {
  if (value === undefined) return { items: [] };
  if (!Array.isArray(value)) return { error: "corrections must be an array." };
  if (value.length > 100) {
    return { error: "A maximum of 100 corrections is allowed." };
  }

  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 100_000) {
    return { error: "Corrections payload is too large." };
  }

  const itemsByField = new Map();
  for (const correction of value) {
    if (
      !isRecord(correction) ||
      !ALLOWED_CORRECTION_FIELDS.has(correction.fieldName) ||
      !("newValue" in correction)
    ) {
      return { error: "Each correction must contain an allowed fieldName and newValue." };
    }
    if (correction.fieldName === "lineItems" && !Array.isArray(correction.newValue)) {
      return { error: "The lineItems correction must contain an array." };
    }
    const valueError = validateCorrectionValue(
      correction.fieldName,
      correction.newValue
    );
    if (valueError) return { error: valueError };
    itemsByField.set(correction.fieldName, {
      fieldName: correction.fieldName,
      oldValue: correction.oldValue ?? null,
      newValue: normalizeCorrectionValue(
        correction.fieldName,
        correction.newValue
      ),
    });
  }

  return { items: [...itemsByField.values()] };
}

function normalizeCorrectionValue(fieldName, value) {
  if (fieldName === "lineItems") {
    return value.map((item, index) => ({
      lineItemId: String(item.lineItemId || `item-${String(index + 1).padStart(3, "0")}`),
      description: String(item.description || "").trim(),
      quantity: Number(item.quantity || 0),
      unitPriceAmount: Number(item.unitPriceAmount || 0),
      taxAmount: Number(item.taxAmount || 0),
      totalAmount: Number(item.totalAmount || 0),
      confidenceScore: Math.max(
        0,
        Math.min(1, Number(item.confidenceScore ?? 1))
      ),
    }));
  }
  if (fieldName === "currency" || fieldName === "documentType") {
    return String(value).trim().toUpperCase();
  }
  if (fieldName.endsWith("Amount")) return Number(value);
  return String(value).trim();
}

export function validateCorrectionValue(fieldName, value) {
  if (fieldName === "documentType") {
    return ["INVOICE", "RECEIPT"].includes(String(value || "").trim().toUpperCase())
      ? null
      : "documentType must be INVOICE or RECEIPT.";
  }

  if (fieldName === "lineItems") {
    if (value.length > 200) return "A maximum of 200 line items is allowed.";
    for (const item of value) {
      if (!isRecord(item)) return "Each line item must be an object.";
      if (String(item.description || "").trim().length > 500) {
        return "Line item descriptions must not exceed 500 characters.";
      }
      for (const field of [
        "quantity",
        "unitPriceAmount",
        "taxAmount",
        "totalAmount",
        "confidenceScore",
      ]) {
        if (
          item[field] !== undefined &&
          item[field] !== null &&
          !Number.isFinite(Number(item[field]))
        ) {
          return `Line item ${field} must be numeric.`;
        }
      }
    }
    return null;
  }

  if (fieldName === "currency") {
    return /^[A-Z]{3}$/.test(String(value || "").trim().toUpperCase())
      ? null
      : "currency must be a three-letter ISO code.";
  }

  if (fieldName.endsWith("Amount")) {
    return Number.isFinite(Number(value))
      ? null
      : `${fieldName} must be numeric.`;
  }

  if (fieldName === "invoiceDate" || fieldName === "dueDate") {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))
      ? null
      : `${fieldName} must use YYYY-MM-DD format.`;
  }

  return typeof value === "string" && value.trim().length <= 500
    ? null
    : `${fieldName} must be a string of at most 500 characters.`;
}

function normalizeReviewerNote(value) {
  if (typeof value !== "string") return null;
  const note = value.trim();
  return note ? note.slice(0, 2000) : null;
}

function parseBody(event) {
  if (!event?.body) return null;
  if (isRecord(event.body)) return event.body;

  try {
    const value = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getUserId(event) {
  return (
    event?.requestContext?.authorizer?.jwt?.claims?.sub ||
    event?.requestContext?.authorizer?.claims?.sub ||
    null
  );
}

function parseS3Location(value, fallbackBucket) {
  if (typeof value !== "string" || !value.trim()) {
    return { bucket: null, key: null };
  }
  if (!value.startsWith("s3://")) {
    return { bucket: fallbackBucket, key: value.replace(/^\/+/, "") };
  }

  const location = value.slice(5);
  const slashIndex = location.indexOf("/");
  if (slashIndex < 1) return { bucket: location || null, key: null };
  return {
    bucket: location.slice(0, slashIndex),
    key: location.slice(slashIndex + 1),
  };
}

function parsePossiblyDoubleStringifiedJson(value) {
  let parsed = JSON.parse(value);
  if (typeof parsed === "string") parsed = JSON.parse(parsed);
  return parsed;
}

function validateEnvironment() {
  const missing = [];
  if (!TABLE_NAME) missing.push("DOCUFLOW_DEV_TABLE_NAME");
  if (!PROCESSED_BUCKET) missing.push("DOCUFLOW_DEV_PROCESSED_BUCKET");
  if (!missing.length) return null;

  return formatResponse(
    500,
    false,
    null,
    `Missing environment variables: ${missing.join(", ")}.`,
    "CONFIGURATION",
    "MISSING_ENVIRONMENT_VARIABLE"
  );
}

function formatResponse(
  statusCode,
  success,
  data,
  errorMessage = null,
  errorStage = null,
  errorCode = "UNKNOWN_ERROR"
) {
  const body = { success, data, error: null };
  if (errorMessage) body.error = { errorCode, errorMessage, errorStage };

  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,PATCH",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function log(level, data) {
  const writer = level === "ERROR" ? console.error : console.log;
  writer(
    JSON.stringify({
      level,
      service: "docuflow-dev-data-review-update-lambda",
      ...data,
    })
  );
}
