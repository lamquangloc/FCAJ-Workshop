import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({});

const MAX_FILE_SIZE_BYTES = Number(
  process.env.MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024
);
const EXPECTED_RAW_BUCKET =
  process.env.DOCUFLOW_DEV_RAW_BUCKET ||
  process.env.DOCUFLOW_DEV_RAW_BUCKET_NAME ||
  null;
const CONTENT_TYPE_BY_EXTENSION = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export const handler = async (event) => {
  const documentId = event?.documentId;
  const userId = event?.userId;
  const bucket = event?.bucket || event?.rawS3Bucket;
  const key = event?.key || event?.rawS3Key;

  log("INFO", {
    documentId,
    userId,
    bucket,
    key,
    message: "Validation started",
  });

  validateConfiguration();

  if (!documentId || !userId || !bucket || !key) {
    throw createError(
      "INVALID_WORKFLOW_INPUT",
      "Missing required fields: documentId, userId, bucket, key"
    );
  }

  if (EXPECTED_RAW_BUCKET && bucket !== EXPECTED_RAW_BUCKET) {
    throw createError(
      "RAW_BUCKET_MISMATCH",
      "Input bucket does not match the configured DocuFlow raw bucket."
    );
  }

  if (!key.startsWith(`raw/${userId}/${documentId}/`)) {
    throw createError(
      "RAW_KEY_FORBIDDEN",
      "S3 key does not match expected raw/{userId}/{documentId}/ format"
    );
  }

  const fileExtension = getFileExtension(key);
  const expectedContentType = CONTENT_TYPE_BY_EXTENSION[fileExtension];
  if (!expectedContentType) {
    throw createError(
      "UNSUPPORTED_FILE_EXTENSION",
      "Unsupported file extension. Only PDF, JPG, JPEG, PNG are allowed."
    );
  }

  let headResult;
  try {
    headResult = await s3Client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key })
    );
  } catch (error) {
    log("ERROR", {
      documentId,
      userId,
      bucket,
      key,
      errorName: error?.name,
      errorMessage: error?.message,
      message: "Could not read raw S3 object metadata",
    });
    throw error;
  }

  const metadata = headResult.Metadata || {};
  const actualFileSizeBytes = finiteNumber(headResult.ContentLength);
  if (actualFileSizeBytes === null || actualFileSizeBytes <= 0) {
    throw createError("EMPTY_FILE", "Uploaded S3 object is empty.");
  }
  if (actualFileSizeBytes > MAX_FILE_SIZE_BYTES) {
    throw createError(
      "FILE_TOO_LARGE",
      `Object size exceeds the maximum allowed size of ${MAX_FILE_SIZE_BYTES} bytes.`
    );
  }

  const declaredFileSizeBytes = finiteNumber(
    metadata["declared-file-size"] ?? event?.declaredFileSizeBytes
  );
  if (
    declaredFileSizeBytes !== null &&
    declaredFileSizeBytes !== actualFileSizeBytes
  ) {
    throw createError(
      "FILE_SIZE_MISMATCH",
      "Uploaded object size does not match the size declared when the upload URL was created."
    );
  }

  const detectedContentType = normalizeContentType(
    headResult.ContentType || event?.contentType || event?.mimeType
  );
  if (detectedContentType !== expectedContentType) {
    throw createError(
      "CONTENT_TYPE_MISMATCH",
      `File extension ${fileExtension} requires content type ${expectedContentType}, received ${detectedContentType || "unknown"}.`
    );
  }

  const pageCount = positiveInteger(
    metadata["page-count"] ?? event?.pageCount ?? 1
  );
  if (pageCount === null) {
    throw createError(
      "INVALID_PAGE_COUNT",
      "pageCount metadata must be a positive integer."
    );
  }
  if (pageCount > 1) {
    throw createError(
      "MULTI_PAGE_REQUIRES_ASYNC_TEXTRACT",
      "Multi-page documents require the asynchronous Textract workflow."
    );
  }

  const rawDocumentType =
    metadata["document-type"] ?? event?.documentType ?? "UNKNOWN";
  const documentType = normalizeDocumentType(rawDocumentType);
  if (documentType === null) {
    throw createError(
      "INVALID_DOCUMENT_TYPE",
      "documentType metadata must be INVOICE, RECEIPT, or UNKNOWN."
    );
  }

  const originalFileName = decodeMetadataValue(
    metadata["original-file-name"],
    event?.originalFileName || event?.fileName || key.split("/").pop()
  );
  if (!isValidOriginalFileName(originalFileName)) {
    throw createError(
      "INVALID_ORIGINAL_FILE_NAME",
      "Original file name metadata is invalid."
    );
  }

  const result = {
    ...event,
    validationStatus: "PASS",
    documentId,
    userId,
    documentType,
    bucket,
    key,
    rawS3Bucket: bucket,
    rawS3Key: key,
    s3RawPath: event?.s3RawPath || `s3://${bucket}/${key}`,
    fileName: originalFileName,
    originalFileName,
    fileExtension: fileExtension.slice(1),
    contentType: detectedContentType,
    mimeType: detectedContentType,
    pageCount,
    fileSizeBytes: actualFileSizeBytes,
    declaredFileSizeBytes,
    objectSize: actualFileSizeBytes,
    eTag: headResult.ETag,
    validatedAt: new Date().toISOString(),
  };

  log("INFO", {
    documentId,
    userId,
    key,
    documentType,
    pageCount,
    contentType: detectedContentType,
    objectSize: actualFileSizeBytes,
    validationStatus: "PASS",
    message: "Validation completed",
  });

  return result;
};

function validateConfiguration() {
  if (!Number.isFinite(MAX_FILE_SIZE_BYTES) || MAX_FILE_SIZE_BYTES <= 0) {
    throw createError(
      "INVALID_CONFIGURATION",
      "MAX_FILE_SIZE_BYTES must be a positive number."
    );
  }
}

function getFileExtension(key) {
  const match = String(key || "").toLowerCase().match(/\.(pdf|jpe?g|png)$/);
  return match ? `.${match[1]}` : "";
}

function normalizeContentType(value) {
  return String(value || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
}

function normalizeDocumentType(value) {
  const type = String(value || "").trim().toUpperCase();
  return type === "INVOICE" || type === "RECEIPT" || type === "UNKNOWN"
    ? type
    : null;
}

function positiveInteger(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function decodeMetadataValue(value, fallback) {
  if (!value) return fallback;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isValidOriginalFileName(value) {
  return (
    typeof value === "string" &&
    Boolean(value.trim()) &&
    !value.includes("/") &&
    !value.includes("\\") &&
    value.length <= 255
  );
}

function createError(code, message) {
  const error = new Error(message);
  error.name = "DocuFlowValidationError";
  error.code = code;
  return error;
}

function log(level, data) {
  const writer = level === "ERROR" ? console.error : console.log;
  writer(
    JSON.stringify({
      level,
      service: "docuflow-dev-workflow-validate-lambda",
      ...data,
    })
  );
}
