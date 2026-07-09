---
title: "Notification Trigger Lambda"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.8.5. </b> "
---
The official DocuFlow AI architecture uses `docuflow-dev-notification-trigger-lambda` to publish workflow failure and `REVIEW_REQUIRED` notifications to the system SNS topic. SNS then distributes the message to confirmed email subscriptions or other configured consumers.

## 1. Create the function

1. Open **AWS Lambda** and choose **Create function**.
2. Select **Author from scratch**.
3. Enter `docuflow-dev-notification-trigger-lambda` as the function name.
4. Select the same supported Node.js runtime used by the other project Lambdas and the `arm64` architecture.
5. Select the existing execution role `docuflow-dev-notification-lambda-role`.
6. Create the function and set the timeout to **30 seconds**.

## 2. Configure environment variables

Add this required variable:

| Key | Value |
|---|---|
| `DOCUFLOW_DEV_NOTIFICATION_TOPIC_ARN` | ARN of `docuflow-dev-notification-system-alerts-topic` |

The execution role must allow `sns:Publish` on this topic and CloudWatch Logs write access.

## 3. Deploy the code

Replace the default `index.mjs` code with the current project source and choose **Deploy**.

{{< source-code file="services/functions/notification-trigger/index.mjs" language="javascript" >}}

## 4. Test REVIEW_REQUIRED notification

Create a Lambda test event:

```json
{
  "documentId": "doc-review-001",
  "userId": "user-001",
  "status": "REVIEW_REQUIRED",
  "review": {
    "reviewStatus": "PENDING",
    "reviewReasonCodes": ["LOW_CONFIDENCE", "MISSING_INVOICE_DATE"]
  },
  "error": {
    "errorCode": null,
    "errorStage": null
  }
}
```

Expected result: `notified` is `true`, an SNS `MessageId` is returned, and the confirmed subscriber receives a review-required email.

## 5. Test failure notification

```json
{
  "documentId": "doc-failed-001",
  "userId": "user-001",
  "status": "FAILED",
  "review": {
    "reviewStatus": "PENDING",
    "reviewReasonCodes": []
  },
  "error": {
    "errorCode": "TEXTRACT_FAILED",
    "errorStage": "TEXTRACT"
  }
}
```

Expected result: the function publishes an error notification without exposing document contents, extracted financial fields, or secrets.

## 6. Step Functions integration

The processing state machine invokes this Lambda from two states:

- `PublishSNSAlert` for `REVIEW_REQUIRED` documents.
- `PublishFailureAlert` after failure metadata has been persisted.

When deploying with SAM, map `${NotificationTriggerFunctionArn}` to this function ARN through `DefinitionSubstitutions`.
