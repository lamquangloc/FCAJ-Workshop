import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

const sfnClient = new SFNClient({});
const s3Client = new S3Client({});

const STATE_MACHINE_ARN =
  process.env.STATE_MACHINE_ARN ||
  process.env.DOCUFLOW_DEV_STATE_MACHINE_ARN;
const EXECUTION_NAME_PREFIX =
  process.env.EXECUTION_NAME_PREFIX || "docuflow-dev";

export const handler = async (event) => {
  if (!STATE_MACHINE_ARN) {
    throw new Error("STATE_MACHINE_ARN environment variable is missing");
  }

  const records = event?.Records || [];
  const batchItemFailures = [];

  log("INFO", {
    message: "SQS event received",
    recordCount: records.length,
  });

  for (const record of records) {
    try {
      await processRecord(record);
    } catch (error) {
      log("ERROR", {
        message: "Failed to process SQS record",
        sqsMessageId: record?.messageId,
        errorName: error?.name,
        errorMessage: error?.message,
      });

      if (record?.messageId) {
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }
  }

  return { batchItemFailures };
};

async function processRecord(record) {
  const sqsMessageId = record?.messageId;
  const eventBridgeEvent = safeJsonParse(record?.body);

  if (!eventBridgeEvent) {
    throw new Error("Invalid SQS message body");
  }

  const bucket = eventBridgeEvent?.detail?.bucket?.name;
  const rawKey = eventBridgeEvent?.detail?.object?.key;
  const eventTime = eventBridgeEvent?.time;
  const eventId = eventBridgeEvent?.id || sqsMessageId;
  const parsedKey = parseDocuFlowS3Key(rawKey);

  if (!bucket || !parsedKey.isValid) {
    log("WARN", {
      sqsMessageId,
      bucket,
      key: rawKey,
      reason: parsedKey.reason,
      message: "Invalid or non-document S3 event. Skipping.",
    });
    return;
  }

  const { userId, documentId, fileName: storedFileName, key } = parsedKey;
  const headResult = await s3Client.send(
    new HeadObjectCommand({ Bucket: bucket, Key: key })
  );
  const metadata = headResult.Metadata || {};
  const originalFileName = decodeMetadataValue(
    metadata["original-file-name"],
    storedFileName
  );
  const pageCount = positiveInteger(metadata["page-count"], 1);
  const documentType = normalizeDocumentType(metadata["document-type"]);
  const contentType =
    headResult.ContentType || getContentTypeFromFileName(storedFileName);
  const fileExtension = getFileExtension(originalFileName || storedFileName);
  const declaredFileSizeBytes = finiteNumber(
    metadata["declared-file-size"]
  );
  const workflowInput = {
    documentId,
    userId,
    documentType,
    bucket,
    key,
    s3RawPath: `s3://${bucket}/${key}`,
    fileName: originalFileName,
    originalFileName,
    fileExtension,
    contentType,
    mimeType: contentType,
    pageCount,
    fileSizeBytes: headResult.ContentLength ?? declaredFileSizeBytes,
    declaredFileSizeBytes,
    eventTime,
    source: "S3_EVENTBRIDGE_SQS",
    sqsMessageId,
  };
  const executionName = sanitizeExecutionName(
    `${EXECUTION_NAME_PREFIX}-${documentId}-${eventId || "unknown-event"}`
  );

  log("INFO", {
    documentId,
    userId,
    bucket,
    key,
    documentType,
    pageCount,
    originalFileName,
    executionName,
    message: "Starting Step Functions execution",
  });

  let result;
  try {
    result = await sfnClient.send(
      new StartExecutionCommand({
        stateMachineArn: STATE_MACHINE_ARN,
        name: executionName,
        input: JSON.stringify(workflowInput),
      })
    );
  } catch (error) {
    if (error?.name === "ExecutionAlreadyExists") {
      log("INFO", {
        documentId,
        userId,
        executionName,
        message: "Duplicate SQS delivery ignored; execution already exists",
      });
      return;
    }
    throw error;
  }

  log("INFO", {
    documentId,
    userId,
    executionArn: result.executionArn,
    startDate: result.startDate,
    message: "Step Functions execution started successfully",
  });
}

function safeJsonParse(value) {
  if (typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function decodeS3Key(key) {
  if (!key) return key;
  return decodeURIComponent(key.replace(/\+/g, " "));
}

function parseDocuFlowS3Key(key) {
  let decodedKey;

  try {
    decodedKey = decodeS3Key(key || "");
  } catch {
    return {
      isValid: false,
      reason: "S3 key contains invalid URL encoding",
      key,
    };
  }

  if (decodedKey.endsWith("/")) {
    return {
      isValid: false,
      reason: "Folder marker object ignored",
      key: decodedKey,
    };
  }

  const parts = decodedKey.split("/");

  if (parts.length < 4) {
    return {
      isValid: false,
      reason: "S3 key does not match raw/{userId}/{documentId}/{fileName}",
      key: decodedKey,
    };
  }

  const [prefix, userId, documentId, ...fileParts] = parts;
  const fileName = fileParts.join("/");

  if (prefix !== "raw") {
    return {
      isValid: false,
      reason: "S3 key does not start with raw/",
      key: decodedKey,
    };
  }

  if (!userId || !documentId || !fileName) {
    return {
      isValid: false,
      reason: "Missing userId, documentId, or fileName",
      key: decodedKey,
    };
  }

  return {
    isValid: true,
    key: decodedKey,
    userId,
    documentId,
    fileName,
  };
}

function getContentTypeFromFileName(fileName) {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (lower.endsWith(".png")) return "image/png";

  return "application/octet-stream";
}

function decodeMetadataValue(value, fallback) {
  if (!value) return fallback;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeDocumentType(value) {
  const type = String(value || "").trim().toUpperCase();
  return type === "INVOICE" || type === "RECEIPT" ? type : "UNKNOWN";
}

function positiveInteger(value, fallback) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : fallback;
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getFileExtension(fileName) {
  const match = String(fileName || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "";
}

function sanitizeExecutionName(value) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 80);
}

function log(level, data) {
  const writer = level === "ERROR" ? console.error : console.log;
  writer(
    JSON.stringify({
      level,
      service: "docuflow-dev-ingestion-job-starter-lambda",
      ...data,
    })
  );
}
