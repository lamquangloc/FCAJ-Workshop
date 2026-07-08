import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});

const TOPIC_ARN =
  process.env.DOCUFLOW_DEV_NOTIFICATION_TOPIC_ARN ||
  process.env.SNS_TOPIC_ARN;
const NOTIFIABLE_STATUSES = new Set(["REVIEW_REQUIRED", "FAILED"]);

export const handler = async (event) => {
  const document = resolveDocument(event);
  const documentId = document.documentId || event?.documentId || null;
  const userId = document.userId || event?.userId || null;
  const status = document.status || event?.status || null;

  log("INFO", {
    documentId,
    userId,
    status,
    message: "Notification evaluation started",
  });

  if (!documentId || !userId || !status) {
    throw createError(
      "INVALID_NOTIFICATION_INPUT",
      "documentId, userId, and status are required"
    );
  }

  if (!NOTIFIABLE_STATUSES.has(status)) {
    log("INFO", {
      documentId,
      userId,
      status,
      message: "Notification skipped for non-alert status",
    });
    return {
      notified: false,
      documentId,
      status,
      reason: "STATUS_DOES_NOT_REQUIRE_NOTIFICATION",
    };
  }

  if (!TOPIC_ARN) {
    throw createError(
      "MISSING_NOTIFICATION_TOPIC_ARN",
      "DOCUFLOW_DEV_NOTIFICATION_TOPIC_ARN environment variable is missing"
    );
  }

  const notification = buildNotification(document, {
    documentId,
    userId,
    status,
  });

  try {
    const result = await snsClient.send(
      new PublishCommand({
        TopicArn: TOPIC_ARN,
        Subject: notification.subject,
        Message: JSON.stringify(notification.message, null, 2),
        MessageAttributes: {
          documentId: {
            DataType: "String",
            StringValue: documentId,
          },
          status: {
            DataType: "String",
            StringValue: status,
          },
          severity: {
            DataType: "String",
            StringValue: notification.message.severity,
          },
        },
      })
    );

    log("INFO", {
      documentId,
      userId,
      status,
      snsMessageId: result.MessageId || null,
      message: "Notification published",
    });

    return {
      notified: true,
      documentId,
      status,
      snsMessageId: result.MessageId || null,
    };
  } catch (error) {
    log("ERROR", {
      documentId,
      userId,
      status,
      errorName: error?.name,
      errorMessage: error?.message,
      message: "Notification publish failed",
    });
    throw createError(
      "NOTIFICATION_FAILED",
      "Could not publish the DocuFlow notification",
      error
    );
  }
};

function resolveDocument(event) {
  const candidate =
    event?.finalDocument ||
    event?.document ||
    event?.Payload ||
    event?.payload ||
    event;
  return isRecord(candidate) ? candidate : {};
}

function buildNotification(document, context) {
  const reviewReasonCodes = Array.isArray(
    document?.review?.reviewReasonCodes
  )
    ? document.review.reviewReasonCodes
    : [];
  const error = isRecord(document?.error) ? document.error : {};
  const isFailure = context.status === "FAILED";

  return {
    subject: isFailure
      ? `[DocuFlow AI] Processing failed: ${context.documentId}`
      : `[DocuFlow AI] Review required: ${context.documentId}`,
    message: {
      project: "DocuFlowAI",
      environment: "dev",
      severity: isFailure ? "ERROR" : "WARNING",
      documentId: context.documentId,
      userId: context.userId,
      status: context.status,
      reviewReasonCodes,
      errorCode: error.errorCode || null,
      errorStage: error.errorStage || null,
      occurredAt: new Date().toISOString(),
      action: isFailure
        ? "Inspect Step Functions execution history and CloudWatch logs."
        : "Open the reviewer interface and verify the extracted fields.",
    },
  };
}

function createError(code, message, cause = null) {
  const error = new Error(message, cause ? { cause } : undefined);
  error.name = code;
  error.code = code;
  return error;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function log(level, data) {
  console.log(
    JSON.stringify({
      level,
      service: "docuflow-dev-notification-trigger-lambda",
      ...data,
    })
  );
}
