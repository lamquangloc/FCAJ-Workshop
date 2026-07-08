import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3Client = new S3Client({});

const TABLE_NAME = process.env.DOCUFLOW_DEV_TABLE_NAME;
const PROCESSED_BUCKET = process.env.DOCUFLOW_DEV_PROCESSED_BUCKET;
const RAW_BUCKET =
  process.env.DOCUFLOW_DEV_RAW_BUCKET ||
  process.env.DOCUFLOW_DEV_RAW_BUCKET_NAME;
const DELETE_CONCURRENCY = 10;

export const handler = async (event) => {
  try {
    const method = event?.requestContext?.http?.method || event?.httpMethod || "";
    if (method === "OPTIONS") return formatResponse(200, true, null);
    if (method !== "DELETE") {
      return formatResponse(
        405,
        false,
        null,
        "Only DELETE is supported.",
        "API",
        "METHOD_NOT_ALLOWED"
      );
    }

    const missingEnvironment = [
      ["DOCUFLOW_DEV_TABLE_NAME", TABLE_NAME],
      ["DOCUFLOW_DEV_RAW_BUCKET", RAW_BUCKET],
      ["DOCUFLOW_DEV_PROCESSED_BUCKET", PROCESSED_BUCKET],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missingEnvironment.length) {
      return formatResponse(
        500,
        false,
        null,
        `Missing environment variables: ${missingEnvironment.join(", ")}.`,
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

    const body = parseBody(event);
    if (body === null) {
      return formatResponse(
        400,
        false,
        null,
        "Request body must be valid JSON.",
        "VALIDATION",
        "INVALID_INPUT"
      );
    }

    const pathDocumentId = event?.pathParameters?.documentId;
    const isSingleDelete = Boolean(pathDocumentId);
    const idsToDelete = uniqueDocumentIds(
      pathDocumentId ? [pathDocumentId] : body?.documentIds
    );

    if (!idsToDelete.length) {
      return formatResponse(
        400,
        false,
        null,
        "Missing documentId or documentIds.",
        "VALIDATION",
        "INVALID_INPUT"
      );
    }

    if (idsToDelete.length > 100) {
      return formatResponse(
        400,
        false,
        null,
        "A maximum of 100 documents can be deleted per request.",
        "VALIDATION",
        "INVALID_INPUT"
      );
    }

    const settledResults = await mapWithConcurrency(
      idsToDelete,
      DELETE_CONCURRENCY,
      (documentId) => deleteDocument(userId, documentId)
    );
    const results = { successful: [], failed: [] };

    for (const result of settledResults) {
      if (result.success) results.successful.push(result.documentId);
      else {
        results.failed.push({
          documentId: result.documentId,
          reason: result.reason,
        });
      }
    }

    if (isSingleDelete) {
      if (results.successful.length) {
        const deletedAt = new Date().toISOString();
        return formatResponse(200, true, {
          documentId: idsToDelete[0],
          deleted: true,
          deletedAt,
        });
      }

      const failure = results.failed[0];
      return formatResponse(
        failure?.reason === "NOT_FOUND" ? 404 : 500,
        false,
        null,
        failure?.reason === "NOT_FOUND"
          ? "Document not found."
          : "Document could not be deleted.",
        failure?.reason === "NOT_FOUND" ? "DYNAMODB" : "DELETE",
        failure?.reason === "NOT_FOUND" ? "NOT_FOUND" : "DELETE_FAILED"
      );
    }

    const deletedAt = new Date().toISOString();
    return formatResponse(results.failed.length ? 207 : 200, true, {
      documentIds: results.successful,
      deletedCount: results.successful.length,
      deletedAt,
      failed: results.failed,
    });
  } catch (error) {
    log("ERROR", {
      message: "Unhandled delete error",
      errorName: error?.name,
      errorMessage: error?.message,
    });
    return formatResponse(
      500,
      false,
      null,
      error?.message || "Unknown error.",
      "DELETE",
      "UNKNOWN_ERROR"
    );
  }
};

async function deleteDocument(userId, documentId) {
  try {
    const key = { PK: `USER#${userId}`, SK: `DOC#${documentId}` };
    const { Item: item } = await docClient.send(
      new GetCommand({ TableName: TABLE_NAME, Key: key })
    );

    if (!item) return { documentId, success: false, reason: "NOT_FOUND" };

    await Promise.all([
      emptyS3Directory(RAW_BUCKET, `raw/${userId}/${documentId}/`),
      emptyS3Directory(
        PROCESSED_BUCKET,
        `processed/${userId}/${documentId}/`
      ),
    ]);

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: key,
        ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
      })
    );

    log("INFO", { documentId, userId, message: "Document deleted" });
    return { documentId, success: true };
  } catch (error) {
    log("ERROR", {
      documentId,
      userId,
      errorName: error?.name,
      errorMessage: error?.message,
      message: "Document deletion failed",
    });
    return {
      documentId,
      success: false,
      reason: error?.name || error?.message || "DELETE_FAILED",
    };
  }
}

async function emptyS3Directory(bucket, prefix) {
  let continuationToken;

  do {
    const listResult = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );
    const objects = (listResult.Contents || [])
      .filter((item) => item.Key)
      .map((item) => ({ Key: item.Key }));

    if (objects.length) {
      const deleteResult = await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: objects, Quiet: true },
        })
      );
      if (deleteResult.Errors?.length) {
        const failedKeys = deleteResult.Errors.map((item) => item.Key)
          .filter(Boolean)
          .slice(0, 10);
        throw new Error(
          `S3_DELETE_PARTIAL_FAILURE:${failedKeys.join(",")}`
        );
      }
    }

    continuationToken = listResult.IsTruncated
      ? listResult.NextContinuationToken
      : undefined;
  } while (continuationToken);
}

async function mapWithConcurrency(values, concurrency, worker) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(values[index]);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, values.length) },
      () => runWorker()
    )
  );
  return results;
}

function getUserId(event) {
  return (
    event?.requestContext?.authorizer?.jwt?.claims?.sub ||
    event?.requestContext?.authorizer?.claims?.sub ||
    null
  );
}

function parseBody(event) {
  if (!event?.body) return {};
  if (typeof event.body === "object" && event.body !== null) return event.body;

  try {
    const bodyText = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    const parsed = JSON.parse(bodyText);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function uniqueDocumentIds(values) {
  if (!Array.isArray(values)) return [];
  return [
    ...new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];
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
      "Access-Control-Allow-Methods": "OPTIONS,DELETE",
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
      service: "docuflow-dev-data-delete-lambda",
      ...data,
    })
  );
}
