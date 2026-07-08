import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3Client = new S3Client({});
const sfnClient = new SFNClient({});

const TABLE_NAME = process.env.DOCUFLOW_DEV_TABLE_NAME;
const RAW_BUCKET =
  process.env.DOCUFLOW_DEV_RAW_BUCKET ||
  process.env.DOCUFLOW_DEV_RAW_BUCKET_NAME;
const STATE_MACHINE_ARN =
  process.env.DOCUFLOW_DEV_STATE_MACHINE_ARN ||
  process.env.STATE_MACHINE_ARN;

const RETRYABLE_STATUSES = new Set(["FAILED", "REVIEW_REQUIRED"]);
const ACTIVE_STATUSES = new Set(["QUEUED", "PROCESSING"]);

export const handler = async (event) => {
  try {
    return await handleRequest(event);
  } catch (error) {
    logError("Unhandled process-control error.", error);
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

async function handleRequest(event) {
  const method = getHttpMethod(event);

  if (method === "OPTIONS") {
    return formatResponse(200, true, null);
  }

  if (method !== "POST") {
    return formatResponse(
      405,
      false,
      null,
      "Method not allowed.",
      "API",
      "METHOD_NOT_ALLOWED"
    );
  }

  const envError = validateEnvironment();
  if (envError) return envError;

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

  const documentId = event?.pathParameters?.documentId;
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

  const action = getRouteAction(event);
  if (!action) {
    return formatResponse(
      404,
      false,
      null,
      "Route not found.",
      "API",
      "NOT_FOUND"
    );
  }

  const body = parseBody(event);
  if (body === null) {
    return formatResponse(
      400,
      false,
      null,
      "Request body must be valid JSON.",
      "SCHEMA_VALIDATION",
      "SCHEMA_VALIDATION_FAILED"
    );
  }

  const key = {
    PK: `USER#${userId}`,
    SK: `DOC#${documentId}`,
  };

  let existingItem;

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: key,
        ConsistentRead: true,
      })
    );
    existingItem = result.Item || null;
  } catch (error) {
    logError("Failed to load document metadata.", error, {
      documentId,
      userId,
      action,
    });
    return formatResponse(
      500,
      false,
      null,
      "Could not load document metadata.",
      "DYNAMODB",
      "DYNAMODB_READ_FAILED"
    );
  }

  if (action === "RETRY" && !existingItem) {
    return formatResponse(
      404,
      false,
      null,
      "Document not found.",
      "DYNAMODB",
      "NOT_FOUND"
    );
  }

  if (existingItem && ACTIVE_STATUSES.has(existingItem.status)) {
    return formatResponse(200, true, {
      documentId,
      ...(action === "RETRY"
        ? { retryStarted: false }
        : { started: false }),
      status: existingItem.status,
      message: "Document is already queued or processing.",
      executionId: existingItem.workflowExecutionArn || null,
    });
  }

  if (
    action === "RETRY" &&
    !RETRYABLE_STATUSES.has(existingItem?.status)
  ) {
    return formatResponse(
      409,
      false,
      null,
      `Document status ${existingItem?.status || "UNKNOWN"} cannot be retried.`,
      "WORKFLOW",
      "INVALID_DOCUMENT_STATUS"
    );
  }

  const rawLocation = resolveRawLocation({
    requestRawS3Key: body.rawS3Key,
    storedRawS3Key:
      existingItem?.rawS3Key ||
      existingItem?.storage?.rawS3Key ||
      existingItem?.raw?.s3Key,
  });

  if (rawLocation.error) {
    return formatResponse(
      rawLocation.statusCode,
      false,
      null,
      rawLocation.error,
      "S3_RAW",
      rawLocation.errorCode
    );
  }

  const expectedPrefix = `raw/${userId}/${documentId}/`;
  if (!rawLocation.key.startsWith(expectedPrefix)) {
    return formatResponse(
      403,
      false,
      null,
      "The raw S3 key does not belong to the authenticated document owner.",
      "S3_RAW",
      "RAW_KEY_FORBIDDEN"
    );
  }

  let rawObject;
  try {
    rawObject = await s3Client.send(
      new HeadObjectCommand({
        Bucket: RAW_BUCKET,
        Key: rawLocation.key,
      })
    );
  } catch (error) {
    const notFound =
      error?.name === "NotFound" ||
      error?.name === "NoSuchKey" ||
      error?.$metadata?.httpStatusCode === 404;

    logError("Raw document object validation failed.", error, {
      documentId,
      userId,
      rawS3Key: rawLocation.key,
    });

    return formatResponse(
      notFound ? 404 : 500,
      false,
      null,
      notFound
        ? "Uploaded raw document was not found in S3."
        : "Could not validate the uploaded raw document.",
      "S3_RAW",
      notFound ? "RAW_OBJECT_NOT_FOUND" : "S3_HEAD_FAILED"
    );
  }

  const now = new Date().toISOString();
  const requestId = randomUUID();
  const objectMetadata = rawObject?.Metadata || {};
  const originalFileName =
    decodeMetadataValue(objectMetadata["original-file-name"]) ||
    body.originalFileName ||
    existingItem?.originalFileName ||
    inferOriginalFileName(rawLocation.key);
  const mimeType =
    rawObject?.ContentType ||
    body.mimeType ||
    existingItem?.mimeType ||
    existingItem?.contentType ||
    inferMimeType(rawLocation.key);
  const metadataDocumentType = normalizeDocumentType(
    objectMetadata["document-type"]
  );
  const requestedDocumentType = normalizeDocumentType(
    body.documentType || existingItem?.documentType
  );
  const documentType =
    metadataDocumentType !== "UNKNOWN"
      ? metadataDocumentType
      : requestedDocumentType;
  const pageCount = normalizePageCount(
    objectMetadata["page-count"] || body.pageCount || existingItem?.pageCount
  );
  const fileExtension = inferFileExtension(originalFileName, rawLocation.key);

  if (pageCount > 1) {
    return formatResponse(
      422,
      false,
      null,
      "Multi-page documents require the asynchronous Textract workflow.",
      "TEXTRACT_VALIDATION",
      "MULTI_PAGE_REQUIRES_ASYNC_TEXTRACT"
    );
  }

  try {
    await queueDocument({
      action,
      documentId,
      documentType,
      fileExtension,
      existingItem,
      key,
      mimeType,
      now,
      originalFileName,
      pageCount,
      rawS3Key: rawLocation.key,
      requestId,
      userId,
    });
  } catch (error) {
    if (error?.name === "ConditionalCheckFailedException") {
      return formatResponse(
        409,
        false,
        null,
        "Document status changed before processing could start. Refresh and try again.",
        "DYNAMODB",
        "DOCUMENT_STATE_CONFLICT"
      );
    }

    logError("Failed to queue document metadata.", error, {
      documentId,
      userId,
      action,
    });
    return formatResponse(
      500,
      false,
      null,
      "Could not queue document for processing.",
      "DYNAMODB",
      "DYNAMODB_UPDATE_FAILED"
    );
  }

  const executionName = sanitizeExecutionName(
    `docuflow-dev-${action.toLowerCase()}-${documentId}-${requestId}`
  );
  const workflowInput = {
    documentId,
    userId,
    documentType,
    bucket: RAW_BUCKET,
    key: rawLocation.key,
    rawS3Bucket: RAW_BUCKET,
    rawS3Key: rawLocation.key,
    s3RawPath: `s3://${RAW_BUCKET}/${rawLocation.key}`,
    fileName: originalFileName,
    originalFileName,
    fileExtension,
    pageCount,
    fileSizeBytes: rawObject?.ContentLength ?? null,
    contentType: mimeType,
    mimeType,
    source: action === "RETRY" ? "API_RETRY" : "API_PROCESS",
    requestId,
    requestedAt: now,
  };

  let executionArn;

  try {
    const result = await sfnClient.send(
      new StartExecutionCommand({
        stateMachineArn: STATE_MACHINE_ARN,
        name: executionName,
        input: JSON.stringify(workflowInput),
      })
    );
    executionArn = result.executionArn;
  } catch (error) {
    const failure = classifyWorkflowStartFailure(error);

    await markWorkflowStartFailed({
      documentId,
      error,
      key,
      requestId,
      userId,
    });

    logError("Failed to start workflow execution.", error, {
      documentId,
      userId,
      action,
      requestId,
    });

    return formatResponse(
      failure.statusCode,
      false,
      null,
      failure.message,
      failure.errorStage,
      failure.errorCode
    );
  }

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: key,
        UpdateExpression:
          "SET workflowExecutionArn = :executionArn, workflowExecutionName = :executionName, updatedAt = :updatedAt",
        ConditionExpression: "processingRequestId = :requestId",
        ExpressionAttributeValues: {
          ":executionArn": executionArn,
          ":executionName": executionName,
          ":requestId": requestId,
          ":updatedAt": new Date().toISOString(),
        },
      })
    );
  } catch (error) {
    // The workflow is already running; do not return a false failure to the client.
    logError("Workflow started but execution metadata could not be persisted.", error, {
      documentId,
      userId,
      executionArn,
      requestId,
    });
  }

  logInfo("Workflow execution started.", {
    documentId,
    userId,
    rawS3Key: rawLocation.key,
    executionArn,
    action,
    requestId,
  });

  if (action === "RETRY") {
    return formatResponse(200, true, {
      documentId,
      retryStarted: true,
      status: "QUEUED",
      updatedAt: now,
      executionId: executionArn,
    });
  }

  return formatResponse(200, true, {
    documentId,
    started: true,
    status: "QUEUED",
    message: "Processing started.",
    executionId: executionArn,
  });
}

async function queueDocument({
  action,
  documentId,
  documentType,
  fileExtension,
  existingItem,
  key,
  mimeType,
  now,
  originalFileName,
  pageCount,
  rawS3Key,
  requestId,
  userId,
}) {
  const expressionAttributeValues = {
    ":schemaVersion": "1.0.0",
    ":documentId": documentId,
    ":userId": userId,
    ":documentType": documentType,
    ":fileExtension": fileExtension,
    ":originalFileName": originalFileName,
    ":pageCount": pageCount,
    ":mimeType": mimeType,
    ":status": "QUEUED",
    ":rawS3Key": rawS3Key,
    ":createdAt": now,
    ":updatedAt": now,
    ":gsi1pk": "STATUS#QUEUED",
    ":gsi1sk": now,
    ":requestId": requestId,
    ":source": action === "RETRY" ? "API_RETRY" : "API_PROCESS",
  };

  let conditionExpression;

  if (!existingItem) {
    conditionExpression = "attribute_not_exists(PK) AND attribute_not_exists(SK)";
  } else if (action === "RETRY") {
    conditionExpression = "#status IN (:failed, :reviewRequired)";
    expressionAttributeValues[":failed"] = "FAILED";
    expressionAttributeValues[":reviewRequired"] = "REVIEW_REQUIRED";
  } else {
    conditionExpression =
      "attribute_not_exists(#status) OR #status = :uploaded";
    expressionAttributeValues[":uploaded"] = "UPLOADED";
  }

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key,
      UpdateExpression:
        "SET schemaVersion = :schemaVersion, documentId = :documentId, userId = :userId, documentType = :documentType, originalFileName = :originalFileName, fileExtension = :fileExtension, pageCount = :pageCount, mimeType = :mimeType, contentType = :mimeType, #status = :status, rawS3Key = :rawS3Key, updatedAt = :updatedAt, createdAt = if_not_exists(createdAt, :createdAt), GSI1PK = :gsi1pk, GSI1SK = :gsi1sk, processingRequestId = :requestId, processingSource = :source REMOVE errorMessage",
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
}

async function markWorkflowStartFailed({
  documentId,
  error,
  key,
  requestId,
  userId,
}) {
  const now = new Date().toISOString();

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: key,
        UpdateExpression:
          "SET #status = :failed, errorMessage = :errorMessage, updatedAt = :updatedAt, GSI1PK = :gsi1pk, GSI1SK = :gsi1sk",
        ConditionExpression: "processingRequestId = :requestId",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":failed": "FAILED",
          ":errorMessage":
            error?.message || "Step Functions execution could not be started.",
          ":updatedAt": now,
          ":gsi1pk": "STATUS#FAILED",
          ":gsi1sk": now,
          ":requestId": requestId,
        },
      })
    );
  } catch (rollbackError) {
    logError("Failed to mark workflow start failure in DynamoDB.", rollbackError, {
      documentId,
      userId,
      requestId,
    });
  }
}

function resolveRawLocation({ requestRawS3Key, storedRawS3Key }) {
  const requestLocation = parseS3Location(requestRawS3Key);
  const storedLocation = parseS3Location(storedRawS3Key);

  if (requestLocation.bucket && requestLocation.bucket !== RAW_BUCKET) {
    return {
      statusCode: 403,
      error: "The requested raw object belongs to a different S3 bucket.",
      errorCode: "RAW_BUCKET_FORBIDDEN",
    };
  }

  if (storedLocation.bucket && storedLocation.bucket !== RAW_BUCKET) {
    return {
      statusCode: 500,
      error: "Stored raw object points to an unexpected S3 bucket.",
      errorCode: "INVALID_STORED_RAW_LOCATION",
    };
  }

  if (
    requestLocation.key &&
    storedLocation.key &&
    requestLocation.key !== storedLocation.key
  ) {
    return {
      statusCode: 409,
      error: "rawS3Key does not match the document metadata.",
      errorCode: "RAW_KEY_MISMATCH",
    };
  }

  const key = storedLocation.key || requestLocation.key;
  if (!key) {
    return {
      statusCode: 400,
      error: "rawS3Key is required.",
      errorCode: "INVALID_INPUT",
    };
  }

  return { bucket: RAW_BUCKET, key };
}

function parseS3Location(value) {
  if (!value || typeof value !== "string") {
    return { bucket: null, key: null };
  }

  const trimmed = value.trim();
  if (!trimmed) return { bucket: null, key: null };

  if (!trimmed.startsWith("s3://")) {
    return { bucket: null, key: normalizeS3Key(trimmed) };
  }

  const location = trimmed.slice(5);
  const separatorIndex = location.indexOf("/");
  if (separatorIndex < 1) {
    return { bucket: location || null, key: null };
  }

  return {
    bucket: location.slice(0, separatorIndex),
    key: normalizeS3Key(location.slice(separatorIndex + 1)),
  };
}

function normalizeS3Key(value) {
  return String(value || "").replace(/^\/+/, "");
}

function parseBody(event) {
  if (!event?.body) return {};

  let value = event.body;
  if (event.isBase64Encoded) {
    value = Buffer.from(value, "base64").toString("utf8");
  }

  if (typeof value === "object" && value !== null) return value;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function getUserId(event) {
  const claims =
    event?.requestContext?.authorizer?.jwt?.claims ||
    event?.requestContext?.authorizer?.claims ||
    {};
  return claims.sub || null;
}

function getHttpMethod(event) {
  return event?.requestContext?.http?.method || event?.httpMethod || "";
}

function getRouteAction(event) {
  const route = String(
    event?.routeKey ||
      event?.resource ||
      event?.rawPath ||
      event?.path ||
      ""
  ).toLowerCase();

  if (route.includes("/retry")) return "RETRY";
  if (route.includes("/process")) return "PROCESS";
  return null;
}

function inferMimeType(rawS3Key) {
  const lower = rawS3Key.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (lower.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

function inferOriginalFileName(rawS3Key) {
  return rawS3Key.split("/").pop() || "original.pdf";
}

function normalizeDocumentType(value) {
  const type = String(value || "").toUpperCase();
  return type === "INVOICE" || type === "RECEIPT" ? type : "UNKNOWN";
}

function normalizePageCount(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : 1;
}

function decodeMetadataValue(value) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function inferFileExtension(originalFileName, rawS3Key) {
  const source = String(originalFileName || rawS3Key || "").toLowerCase();
  const match = source.match(/\.([a-z0-9]+)$/);
  return match?.[1] || "";
}

function sanitizeExecutionName(value) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 80);
}

function validateEnvironment() {
  const missing = [];
  if (!TABLE_NAME) missing.push("DOCUFLOW_DEV_TABLE_NAME");
  if (!RAW_BUCKET) missing.push("DOCUFLOW_DEV_RAW_BUCKET");
  if (!STATE_MACHINE_ARN) missing.push("DOCUFLOW_DEV_STATE_MACHINE_ARN or STATE_MACHINE_ARN");

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

function classifyWorkflowStartFailure(error) {
  const errorName = error?.name || "Unknown";
  const errorMessage = error?.message || "Could not start document workflow.";

  if (errorName === "AccessDeniedException") {
    return {
      statusCode: 403,
      errorCode: "WORKFLOW_ACCESS_DENIED",
      errorStage: "WORKFLOW",
      message:
        "Process-control Lambda is not allowed to start the Step Functions state machine.",
    };
  }

  if (
    errorName === "StateMachineDoesNotExist" ||
    errorName === "ValidationException" ||
    errorMessage.includes("State Machine Does Not Exist")
  ) {
    return {
      statusCode: 500,
      errorCode: "INVALID_STATE_MACHINE_ARN",
      errorStage: "CONFIGURATION",
      message:
        "Configured Step Functions state machine ARN is invalid or does not exist.",
    };
  }

  if (errorName === "ExecutionLimitExceeded") {
    return {
      statusCode: 429,
      errorCode: "WORKFLOW_EXECUTION_LIMIT_EXCEEDED",
      errorStage: "WORKFLOW",
      message: "Step Functions execution limit exceeded. Try again later.",
    };
  }

  return {
    statusCode: 502,
    errorCode: "WORKFLOW_START_FAILED",
    errorStage: "WORKFLOW",
    message: errorMessage,
  };
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
  if (errorMessage) {
    body.error = { errorCode, errorMessage, errorStage };
  }

  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function logInfo(message, details = {}) {
  console.log(
    JSON.stringify({
      level: "INFO",
      service: "docuflow-dev-data-process-control-lambda",
      message,
      ...details,
    })
  );
}

function logError(message, error, details = {}) {
  console.error(
    JSON.stringify({
      level: "ERROR",
      service: "docuflow-dev-data-process-control-lambda",
      message,
      errorName: error?.name,
      errorMessage: error?.message,
      ...details,
    })
  );
}
