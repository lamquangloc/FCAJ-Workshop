---
title: "End-to-End Testing"
date: 2024-01-01
weight: 9
chapter: false
pre: " <b> 5.9. </b> "
---
### 1. Goal
Execute a complete integration test of the system from the frontend interface down to the background processing pipelines, verifying all distinct logic paths to collect testing evidence.

### 2. Test Scenarios

#### Scenario 1: Human-in-the-loop Flow (Blurry Invoice / Low Confidence)
* **Simulation steps**: Upload a blurry receipt or an invoice missing critical fields like the total amount (totalAmount).
* **System workflow**:
  1. The document is uploaded and processed through the pipeline steps.
  2. During the confidence check, the Confidence & Status Lambda detects that the average confidence score is < 90% or missing critical fields.
  3. The Lambda function updates the DynamoDB item status to `REVIEW_REQUIRED` and sets the review status to `PENDING`.
  4. A CloudWatch Alarm fires on status changes, publishing an email alert to the Admin via SNS/SES.
  5. The Admin opens the Reviewer Dashboard on the Frontend, examining the review form containing the low-confidence fields.
  6. The Admin corrects the values and clicks **Approve**. The Frontend sends a PATCH request to the `review-update` Lambda, changing DynamoDB status to `APPROVED` and overwriting the corrected `result.json` in S3.
* **Evidence**:

  ![Review Notification](/images/5-Workshop/5.9-end-to-end-testing/review-notification.png)

  ![Reviewer Dashboard](/images/5-Workshop/5.9-end-to-end-testing/human-review-dashboard.png)

  ![Low Confidence Fields](/images/5-Workshop/5.9-end-to-end-testing/low-confidence-fields.png)

  ![Review Timeline](/images/5-Workshop/5.9-end-to-end-testing/review-timeline.png)

#### Scenario 2: Validation Failure (Invalid File Format)
* **Simulation steps**: Upload a plain text `.txt` file (or a file larger than 10MB).
* **System workflow**:
  1. The Frontend checks if the file has the correct format.
  2. If the format is invalid, the Frontend will display an error for the invalid file and prevent it from being uploaded.
* **Evidence**: 

  ![Invalid File Format](/images/5-Workshop/5.9-end-to-end-testing/invalid-file-format.png)

#### Scenario 3: Dead Letter Queue (SQS DLQ Routing)
* **Simulation steps**: Temporarily remove read permissions for the AWS Secrets Manager secret from the AI Proxy Lambda role to simulate persistent backend API call errors.
* **System workflow**:
  1. Upload a new document. SQS receives the notification and triggers the Job Starter Lambda to start Step Functions.
  2. The workflow fails at the AI Proxy step due to `AccessDeniedException`.
  3. The message returns to SQS and Lambda retries processing.
  4. After exceeding the maximum retry threshold (`Maximum receives = 3`), SQS routes the poison message to the Dead Letter Queue `docuflow-dev-processing-dlq`.
  5. The CloudWatch Alarm `docuflow-dev-sqs-dlq-not-empty-alarm` fires, alerting the Admin via SNS email.
* **Evidence**: Take a screenshot of the SQS console showing messages visible in the DLQ.

### 3. Expected Result
* The asynchronous processing pipeline behaves correctly across all three test scenarios.
* Automated alerting dispatches warnings on failures and review-required triggers.
* S3 and DynamoDB maintain consistent data mapping.
