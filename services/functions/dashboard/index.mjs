import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.DOCUFLOW_DEV_TABLE_NAME;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

const DEFAULT_VND_EXCHANGE_RATES = {
  VND: 1,
  USD: 25000,
  EUR: 27000,
  GBP: 31500,
  JPY: 170,
  CNY: 3450,
  KRW: 18,
  SGD: 18500,
  THB: 690,
  AUD: 16500,
  CAD: 18200,
  CHF: 28000,
  HKD: 3200,
  INR: 300,
  IDR: 1.55,
  MYR: 5300,
  PHP: 430,
  TWD: 780,
};

const VND_EXCHANGE_RATES = loadExchangeRates();

export const handler = async (event) => {
  try {
    const method = getMethod(event);

    if (method === "OPTIONS") {
      return formatResponse(200, true, null);
    }

    if (method !== "GET" && method !== "PATCH") {
      return formatResponse(
        405,
        false,
        null,
        "Only GET and PATCH are supported.",
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

    const route = getRoute(event);

    if (method === "PATCH" && route === "NOTIFICATION_DETAIL") {
      return acknowledgeNotification(event, userId);
    }

    if (method === "GET" && route === "NOTIFICATIONS") {
      const documents = await queryUserItems(userId, "DOC#");
      const acknowledgements = await queryUserItems(userId, "NOTIF#");
      const notifications = buildNotifications(documents, acknowledgements);
      return formatResponse(
        200,
        true,
        paginate(notifications, event?.queryStringParameters)
      );
    }

    if (method === "GET" && route === "ACTIVITY") {
      const documents = await queryUserItems(userId, "DOC#");
      return formatResponse(
        200,
        true,
        paginate(buildActivity(documents), event?.queryStringParameters)
      );
    }

    if (method === "GET" && route === "REPORTS_SUMMARY") {
      const documents = await queryUserItems(userId, "DOC#");
      return formatResponse(200, true, buildReportSummary(documents));
    }

    return formatResponse(
      404,
      false,
      null,
      "Route not found.",
      "API",
      "NOT_FOUND"
    );
  } catch (error) {
    logError("Unhandled dashboard error.", error);
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

async function acknowledgeNotification(event, userId) {
  const notificationId = event?.pathParameters?.notificationId;

  if (
    !notificationId ||
    notificationId.length > 240 ||
    !/^notif-[A-Za-z0-9._:-]+$/.test(notificationId)
  ) {
    return formatResponse(
      400,
      false,
      null,
      "Invalid notificationId.",
      "VALIDATION",
      "INVALID_INPUT"
    );
  }

  const now = new Date().toISOString();

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `NOTIF#${notificationId}`,
      },
      UpdateExpression:
        "SET notificationId = :notificationId, unread = :unread, acknowledgedAt = :now, updatedAt = :now, createdAt = if_not_exists(createdAt, :now)",
      ExpressionAttributeValues: {
        ":notificationId": notificationId,
        ":unread": false,
        ":now": now,
      },
    })
  );

  return formatResponse(200, true, {
    notificationId,
    unread: false,
    acknowledgedAt: now,
  });
}

async function queryUserItems(userId, sortKeyPrefix) {
  const items = [];
  let exclusiveStartKey;

  do {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":prefix": sortKeyPrefix,
        },
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    items.push(...(result.Items || []));
    exclusiveStartKey = result.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return items;
}

function buildNotifications(documents, acknowledgementItems) {
  const acknowledgedIds = new Set(
    acknowledgementItems
      .filter((item) => item.unread === false)
      .map((item) => item.notificationId)
      .filter(Boolean)
  );

  const notifications = documents
    .map(toDocumentSummary)
    .map((document) => notificationForDocument(document, acknowledgedIds))
    .filter(Boolean);

  return notifications.sort(compareNewestFirst);
}

function notificationForDocument(document, acknowledgedIds) {
  const timestamp = document.updatedAt || document.createdAt || epochIso();

  if (document.status === "REVIEW_REQUIRED") {
    const id = `notif-${document.documentId}-review`;
    return {
      id,
      documentId: document.documentId,
      kind: "ACTION",
      title: "Yêu cầu kiểm duyệt",
      body: document.reviewReasonCodes.length
        ? document.reviewReasonCodes.join(", ")
        : "Tài liệu cần được kiểm tra lại.",
      timestamp,
      unread: !acknowledgedIds.has(id),
      requiresAction: true,
      severity: "warning",
      document,
    };
  }

  if (document.status === "FAILED") {
    const id = `notif-${document.documentId}-failed`;
    return {
      id,
      documentId: document.documentId,
      kind: "FAILED",
      title: "Xử lý tài liệu thất bại",
      body:
        document.errorMessage ||
        "Pipeline xử lý tài liệu bị lỗi. Có thể chạy lại tài liệu này.",
      timestamp,
      unread: !acknowledgedIds.has(id),
      requiresAction: true,
      severity: "critical",
      document,
    };
  }

  if (["APPROVED", "CORRECTED", "EXTRACTED"].includes(document.status)) {
    return {
      id: `notif-${document.documentId}-complete`,
      documentId: document.documentId,
      kind: "COMPLETE",
      title:
        document.status === "APPROVED"
          ? "Tài liệu đã được phê duyệt"
          : "Tài liệu đã xử lý xong",
      body: `${document.originalFileName} đã hoàn tất bước ${document.status}.`,
      timestamp,
      unread: false,
      requiresAction: false,
      severity: "success",
      document,
    };
  }

  if (["QUEUED", "PROCESSING"].includes(document.status)) {
    return {
      id: `notif-${document.documentId}-processing`,
      documentId: document.documentId,
      kind: "PROCESSING",
      title:
        document.status === "QUEUED"
          ? "Tài liệu đang chờ xử lý"
          : "Tài liệu đang được xử lý",
      body: `${document.originalFileName} hiện có trạng thái ${document.status}.`,
      timestamp,
      unread: false,
      requiresAction: false,
      severity: "info",
      document,
    };
  }

  return null;
}

function buildActivity(documents) {
  return documents
    .map(toDocumentSummary)
    .map((document) => ({
      id: `activity-${document.documentId}-${document.status.toLowerCase()}`,
      documentId: document.documentId,
      kind: activityKind(document.status),
      title: activityTitle(document.status),
      detail: `${document.originalFileName} hiện có trạng thái ${document.status}.`,
      timestamp: document.updatedAt || document.createdAt || epochIso(),
      actor:
        ["APPROVED", "CORRECTED"].includes(document.status) &&
        document.reviewedBy
          ? document.reviewedBy
          : "system",
      source: activitySource(document.status),
      severity: activitySeverity(document.status),
      document,
    }))
    .sort(compareNewestFirst);
}

function activityKind(status) {
  if (["APPROVED", "CORRECTED"].includes(status)) return "APPROVAL";
  if (status === "REVIEW_REQUIRED") return "REVIEW";
  if (["PROCESSING", "EXTRACTED", "FAILED"].includes(status)) {
    return "PROCESSING";
  }
  return "UPLOAD";
}

function activityTitle(status) {
  switch (status) {
    case "UPLOADED":
      return "Tài liệu đã được tải lên";
    case "QUEUED":
      return "Tài liệu được đưa vào hàng đợi";
    case "PROCESSING":
      return "Tài liệu đang được xử lý";
    case "EXTRACTED":
      return "Tài liệu đã trích xuất xong";
    case "REVIEW_REQUIRED":
      return "Tài liệu cần kiểm duyệt";
    case "FAILED":
      return "Tài liệu xử lý thất bại";
    case "CORRECTED":
      return "Tài liệu đã được hiệu chỉnh";
    case "APPROVED":
      return "Tài liệu đã được phê duyệt";
    default:
      return "Cập nhật tài liệu";
  }
}

function activitySeverity(status) {
  if (status === "FAILED") return "error";
  if (status === "REVIEW_REQUIRED") return "warning";
  if (["EXTRACTED", "CORRECTED", "APPROVED"].includes(status)) {
    return "success";
  }
  return "info";
}

function activitySource(status) {
  if (["APPROVED", "CORRECTED", "REVIEW_REQUIRED"].includes(status)) {
    return "DocuFlow Review";
  }
  return "DocuFlow Workflow";
}

function buildReportSummary(documents) {
  const summaries = documents.map(toDocumentSummary);
  const approved = summaries.filter((document) => document.status === "APPROVED");
  const pending = summaries.filter((document) => document.status !== "APPROVED");

  const totalAmounts = summarizeAmounts(summaries);
  const approvedAmounts = summarizeAmounts(approved);
  const pendingAmounts = summarizeAmounts(pending);
  const confidenceValues = summaries
    .map((document) => normalizeConfidence(document.confidenceScore))
    .filter((value) => value !== null);

  return {
    totalDocuments: summaries.length,
    approvedDocuments: approved.length,
    reviewRequiredDocuments: summaries.filter(
      (document) => document.status === "REVIEW_REQUIRED"
    ).length,
    failedDocuments: summaries.filter(
      (document) => document.status === "FAILED"
    ).length,
    totalAmountVnd: totalAmounts.convertedVnd,
    approvedAmountVnd: approvedAmounts.convertedVnd,
    pendingAmountVnd: pendingAmounts.convertedVnd,
    averageConfidence: confidenceValues.length
      ? confidenceValues.reduce((sum, value) => sum + value, 0) /
        confidenceValues.length
      : 0,
    amountsByCurrency: totalAmounts.byCurrency,
    approvedAmountsByCurrency: approvedAmounts.byCurrency,
    pendingAmountsByCurrency: pendingAmounts.byCurrency,
    unconvertedCurrencies: Array.from(
      new Set([
        ...totalAmounts.unconvertedCurrencies,
        ...approvedAmounts.unconvertedCurrencies,
        ...pendingAmounts.unconvertedCurrencies,
      ])
    ).sort(),
    exchangeRateSource: process.env.DOCUFLOW_DEV_VND_EXCHANGE_RATES
      ? "DOCUFLOW_DEV_VND_EXCHANGE_RATES"
      : "DOCUFLOW_DEMO_STATIC_RATES",
    generatedAt: new Date().toISOString(),
  };
}

function summarizeAmounts(documents) {
  const byCurrency = {};
  const unconvertedCurrencies = new Set();
  let convertedVnd = 0;

  for (const document of documents) {
    const amount = finiteNumber(document.totalAmount);
    if (amount === null) continue;

    const currency = normalizeCurrency(document.currency);
    byCurrency[currency] = (byCurrency[currency] || 0) + amount;

    const rate = VND_EXCHANGE_RATES[currency];
    if (Number.isFinite(rate)) {
      convertedVnd += amount * rate;
    } else {
      unconvertedCurrencies.add(currency);
    }
  }

  return {
    byCurrency,
    convertedVnd,
    unconvertedCurrencies: Array.from(unconvertedCurrencies),
  };
}

function toDocumentSummary(item) {
  const safe = removeKeys(item);
  return {
    documentId: String(safe.documentId || ""),
    originalFileName: String(safe.originalFileName || "original.pdf"),
    documentType: String(safe.documentType || "UNKNOWN"),
    status: String(safe.status || "UNKNOWN").toUpperCase(),
    vendorName: String(safe.vendorName || ""),
    invoiceDate: String(safe.invoiceDate || ""),
    currency: normalizeCurrency(safe.currency),
    totalAmount: finiteNumber(safe.totalAmount) || 0,
    confidenceScore: finiteNumber(safe.confidenceScore) || 0,
    reviewStatus: safe.reviewStatus || null,
    reviewReasonCodes: normalizeStringArray(safe.reviewReasonCodes),
    reviewedBy: safe.reviewedBy || null,
    errorMessage: safe.errorMessage || null,
    createdAt: safe.createdAt || null,
    updatedAt: safe.updatedAt || null,
  };
}

function paginate(items, query = {}) {
  const requestedLimit = Number.parseInt(query?.limit || "", 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;
  const offset = decodeNextToken(query?.nextToken);
  const pageItems = items.slice(offset, offset + limit);
  const nextOffset = offset + pageItems.length;

  return {
    items: pageItems,
    nextToken:
      nextOffset < items.length ? encodeNextToken(nextOffset) : null,
  };
}

function encodeNextToken(offset) {
  return Buffer.from(JSON.stringify({ version: 1, offset }), "utf8").toString(
    "base64url"
  );
}

function decodeNextToken(token) {
  if (!token) return 0;

  try {
    const value = JSON.parse(
      Buffer.from(String(token), "base64url").toString("utf8")
    );
    return Number.isSafeInteger(value?.offset) && value.offset >= 0
      ? value.offset
      : 0;
  } catch {
    return 0;
  }
}

function loadExchangeRates() {
  const configured = process.env.DOCUFLOW_DEV_VND_EXCHANGE_RATES;
  if (!configured) return DEFAULT_VND_EXCHANGE_RATES;

  try {
    const parsed = JSON.parse(configured);
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([currency, rate]) => [
          normalizeCurrency(currency),
          Number(rate),
        ])
        .filter(([, rate]) => Number.isFinite(rate) && rate > 0)
    );
  } catch (error) {
    logError(
      "Invalid DOCUFLOW_DEV_VND_EXCHANGE_RATES; using demo rates.",
      error
    );
    return DEFAULT_VND_EXCHANGE_RATES;
  }
}

function normalizeConfidence(value) {
  const numeric = finiteNumber(value);
  if (numeric === null || numeric < 0) return null;
  return Math.min(numeric > 1 ? numeric / 100 : numeric, 1);
}

function normalizeCurrency(value) {
  const currency = String(value || "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(currency) ? currency : "UNKNOWN";
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function compareNewestFirst(left, right) {
  return new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime();
}

function epochIso() {
  return new Date(0).toISOString();
}

function removeKeys(item = {}) {
  const { PK, SK, GSI1PK, GSI1SK, ...safe } = item;
  return safe;
}

function getUserId(event) {
  const claims =
    event?.requestContext?.authorizer?.jwt?.claims ||
    event?.requestContext?.authorizer?.claims ||
    {};
  return claims.sub || null;
}

function getMethod(event) {
  return event?.requestContext?.http?.method || event?.httpMethod || "";
}

function getRoute(event) {
  const path = String(
    event?.rawPath || event?.path || event?.resource || ""
  ).replace(/\/+$/, "");

  if (/\/notifications\/[^/]+$/.test(path)) return "NOTIFICATION_DETAIL";
  if (path.endsWith("/notifications")) return "NOTIFICATIONS";
  if (path.endsWith("/activity")) return "ACTIVITY";
  if (path.endsWith("/reports/summary")) return "REPORTS_SUMMARY";
  return "UNKNOWN";
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
      "Access-Control-Allow-Methods": "OPTIONS,GET,PATCH",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function logError(message, error, details = {}) {
  console.error(
    JSON.stringify({
      level: "ERROR",
      service: "docuflow-dev-data-dashboard-lambda",
      message,
      errorName: error?.name,
      errorMessage: error?.message,
      ...details,
    })
  );
}
