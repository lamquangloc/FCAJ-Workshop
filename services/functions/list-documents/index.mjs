import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME = process.env.DOCUFLOW_DEV_TABLE_NAME;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const ALLOWED_STATUSES = new Set([
  "UPLOADED",
  "QUEUED",
  "PROCESSING",
  "EXTRACTED",
  "REVIEW_REQUIRED",
  "FAILED",
  "CORRECTED",
  "APPROVED",
]);

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

    if (!TABLE_NAME) {
      return formatResponse(
        500,
        false,
        null,
        "DOCUFLOW_DEV_TABLE_NAME environment variable is missing.",
        "CONFIGURATION",
        "MISSING_ENVIRONMENT_VARIABLE"
      );
    }

    const userId = getUserId(event);
    const admin = isAdmin(event);
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

    const query = event?.queryStringParameters || {};
    const statusFilter = String(query.status || "").trim().toUpperCase();
    if (statusFilter && !ALLOWED_STATUSES.has(statusFilter)) {
      return formatResponse(
        400,
        false,
        null,
        "Unsupported document status.",
        "VALIDATION",
        "INVALID_STATUS"
      );
    }

    let exclusiveStartKey;
    try {
      exclusiveStartKey = decodeNextToken(query.nextToken, userId, admin);
    } catch {
      return formatResponse(
        400,
        false,
        null,
        "Invalid nextToken.",
        "VALIDATION",
        "INVALID_NEXT_TOKEN"
      );
    }

    const pageSize = normalizePageSize(query.limit);
    const result = admin
      ? await scanAdminDocuments({ statusFilter, exclusiveStartKey, pageSize })
      : await queryUserDocuments({ userId, statusFilter, exclusiveStartKey, pageSize });
    const items = (result.Items || []).map(normalizeDocumentItem);

    log("INFO", {
      message: "Documents listed successfully",
      userId,
      admin,
      statusFilter: statusFilter || null,
      itemCount: items.length,
    });

    return formatResponse(200, true, {
      items,
      nextToken: encodeNextToken(result.LastEvaluatedKey),
    });
  } catch (error) {
    log("ERROR", {
      message: "Failed to list documents",
      errorName: error?.name,
      errorMessage: error?.message,
    });

    return formatResponse(
      500,
      false,
      null,
      error?.message || "Unknown error.",
      "DYNAMODB",
      "UNKNOWN_ERROR"
    );
  }
};

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

function queryUserDocuments({ userId, statusFilter, exclusiveStartKey, pageSize }) {
  const expressionAttributeNames = statusFilter
    ? { "#status": "status" }
    : undefined;
  const expressionAttributeValues = {
    ":pk": `USER#${userId}`,
    ":documentPrefix": "DOC#",
    ...(statusFilter ? { ":status": statusFilter } : {}),
  };

  return docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression:
      "PK = :pk AND begins_with(SK, :documentPrefix)",
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    FilterExpression: statusFilter ? "#status = :status" : undefined,
    ExclusiveStartKey: exclusiveStartKey,
    Limit: pageSize,
  }));
}

function scanAdminDocuments({ statusFilter, exclusiveStartKey, pageSize }) {
  const expressionAttributeNames = {
    "#sk": "SK",
    ...(statusFilter ? { "#status": "status" } : {}),
  };
  const expressionAttributeValues = {
    ":documentPrefix": "DOC#",
    ...(statusFilter ? { ":status": statusFilter } : {}),
  };

  return docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    FilterExpression: statusFilter
      ? "begins_with(#sk, :documentPrefix) AND #status = :status"
      : "begins_with(#sk, :documentPrefix)",
    ExclusiveStartKey: exclusiveStartKey,
    Limit: pageSize,
  }));
}

function normalizePageSize(value) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(numeric, MAX_PAGE_SIZE);
}

function encodeNextToken(lastEvaluatedKey) {
  if (!lastEvaluatedKey) return null;
  return Buffer.from(JSON.stringify(lastEvaluatedKey), "utf8").toString(
    "base64url"
  );
}

function decodeNextToken(token, userId, admin = false) {
  if (!token) return undefined;
  const decoded = JSON.parse(
    Buffer.from(String(token), "base64url").toString("utf8")
  );
  const expectedPk = admin ? /^USER#/ : new RegExp(`^USER#${escapeRegExp(userId)}$`);
  if (!decoded || !expectedPk.test(String(decoded.PK || "")) || typeof decoded.SK !== "string" || !decoded.SK.startsWith("DOC#")) {
    throw new Error("Invalid nextToken scope.");
  }
  return decoded;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeDynamoDbKeys(item = {}) {
  const { PK, SK, GSI1PK, GSI1SK, ...safeItem } = item;
  return safeItem;
}

function normalizeDocumentItem(item = {}) {
  const safeItem = removeDynamoDbKeys(item);
  const file = isRecord(safeItem.file) ? safeItem.file : {};
  const storage = isRecord(safeItem.storage) ? safeItem.storage : {};
  const rawS3Key = pickString(
    safeItem.rawS3Key,
    storage.rawS3Key,
    safeItem.key
  );
  const processedS3Key = pickString(
    safeItem.processedS3Key,
    storage.processedS3Key
  );
  const originalFileName = pickDisplayFileName({
    documentId: safeItem.documentId,
    explicitFileName: pickString(
      safeItem.originalFileName,
      safeItem.fileName,
      file.originalFileName,
      file.fileName
    ),
    rawS3Key,
  });

  return {
    ...safeItem,
    originalFileName,
    ...(rawS3Key ? { rawS3Key } : {}),
    ...(processedS3Key ? { processedS3Key } : {}),
  };
}

function pickDisplayFileName({ documentId, explicitFileName, rawS3Key }) {
  if (explicitFileName && !isGenericRawObjectName(explicitFileName)) {
    return explicitFileName;
  }

  const rawFileName = rawS3Key ? decodeS3KeySegment(rawS3Key.split("/").pop()) : "";
  if (rawFileName && !isGenericRawObjectName(rawFileName)) {
    return rawFileName;
  }

  if (explicitFileName) {
    const extension = getFileExtension(explicitFileName || rawFileName);
    return documentId ? `${documentId}${extension}` : explicitFileName;
  }

  return documentId ? `${documentId}.pdf` : "unknown";
}

function pickString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function decodeS3KeySegment(value = "") {
  try {
    return decodeURIComponent(value.replace(/\+/g, "%20"));
  } catch {
    return value;
  }
}

function getFileExtension(fileName = "") {
  const match = String(fileName).match(/(\.[A-Za-z0-9]+)$/);
  return match ? match[1].toLowerCase() : "";
}

function isGenericRawObjectName(fileName = "") {
  return /^original\.[A-Za-z0-9]+$/i.test(String(fileName).trim());
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
      "Access-Control-Allow-Methods": "OPTIONS,GET",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function log(level, data) {
  const writer = level === "ERROR" ? console.error : console.log;
  writer(
    JSON.stringify({
      level,
      service: "docuflow-dev-data-list-documents-lambda",
      ...data,
    })
  );
}
