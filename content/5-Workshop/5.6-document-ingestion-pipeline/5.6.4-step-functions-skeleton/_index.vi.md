---
title: "Tạo và Test Step Functions Skeleton"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.6.4. </b> "
---
#### Tạo Step Functions skeleton
*Mục đích: Tạo một Workflow khung xương (Mock data) để test khả năng gọi từ Lambda sang Step Functions trước khi tích hợp logic AI thật.*
1. Mở Step Functions: Gõ **Step Functions** → **State machines** → Bấm **Create state machine**.
![image52.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image52.png)
![image53.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image53.png)

2. Chọn option: **Create from blank**, **State machine type: Standard** (Kiến trúc dùng Standard Workflow).
![image54.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image54.png)
3. Điền State machine name: `docuflow-dev-workflow-processing-state-machine` → bấm **Continue**.
![image55.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image55.png)
![image56.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image56.png)
4. Sau khi vào màn hình Workflow Studio, tìm tab **Code**. Ở phần **Definition**, xóa nội dung cũ rồi dán ASL skeleton này vào:
![image57.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image57.png)
   ```json
   {
     "Comment": "DocuFlow AI - Processing workflow skeleton for invoice and receipt documents",
     "StartAt": "ValidateInput",
     "States": {
       "ValidateInput": {
         "Type": "Pass",
         "Result": {
           "validationStatus": "PASS",
           "validatedAt": "2026-06-29T00:00:00Z"
         },
         "ResultPath": "$.validation",
         "Next": "CheckForceFailure"
       },
       "CheckForceFailure": {
         "Type": "Choice",
         "Choices": [
           {
             "And": [
               { "Variable": "$.forceFail", "IsPresent": true },
               { "Variable": "$.forceFail", "BooleanEquals": true }
             ],
             "Next": "UpdateStatusFailed"
           }
         ],
         "Default": "UpdateStatusProcessing"
       },
       "UpdateStatusProcessing": {
         "Type": "Pass",
         "Result": {
           "status": "PROCESSING",
           "state": "UpdateStatusProcessing",
           "message": "Document processing started"
         },
         "ResultPath": "$.workflowStatus",
         "Next": "MockTextractAnalyzeExpense"
       },
       "MockTextractAnalyzeExpense": {
         "Type": "Pass",
         "Result": {
           "api": "AnalyzeExpense",
           "summaryFields": [
             { "type": "VENDOR_NAME", "value": "ABC Company", "confidence": 0.95 },
             { "type": "TOTAL", "value": "2500000", "confidence": 0.92 },
             { "type": "INVOICE_RECEIPT_DATE", "value": "2026-06-01", "confidence": 0.9 }
           ],
           "lineItems": []
         },
         "ResultPath": "$.textractResult",
         "Next": "MockAIProxyNormalize"
       },
       "MockAIProxyNormalize": {
         "Type": "Pass",
         "Result": {
           "documentType": "INVOICE",
           "vendorName": "ABC Company",
           "invoiceDate": "2026-06-01",
           "currency": "VND",
           "totalAmount": 2500000,
           "taxAmount": 250000,
           "aiProvider": "external-ai-api",
           "normalizationMethod": "TEXTRACT_PLUS_AI_PROXY_EXTERNAL_API"
         },
         "ResultPath": "$.normalizedResult",
         "Next": "CalculateConfidenceAndStatus"
       },
       "CalculateConfidenceAndStatus": {
         "Type": "Pass",
         "Result": {
           "status": "EXTRACTED",
           "confidenceScore": 0.91,
           "reviewReasons": []
         },
         "ResultPath": "$.statusDecision",
         "Next": "NeedNotification"
       },
       "NeedNotification": {
         "Type": "Choice",
         "Choices": [
           {
             "Variable": "$.statusDecision.status",
             "StringEquals": "REVIEW_REQUIRED",
             "Next": "MockPublishReviewAlert"
           },
           {
             "Variable": "$.statusDecision.status",
             "StringEquals": "FAILED",
             "Next": "MockPublishFailureAlert"
           }
         ],
         "Default": "MockSaveMetadataToDynamoDB"
       },
       "MockSaveMetadataToDynamoDB": {
         "Type": "Pass",
         "Result": {
           "tableName": "docuflow-dev-documents-table",
           "saveStatus": "SAVED",
           "message": "Metadata saved to DynamoDB mock"
         },
         "ResultPath": "$.dynamoDbSave",
         "Next": "MockSaveProcessedJsonToS3"
       },
       "MockSaveProcessedJsonToS3": {
         "Type": "Pass",
         "Result": {
           "bucket": "docuflow-dev-processed-[accountId]-ap-southeast-1",
           "key": "processed/user-demo/doc-manual-001/result.json",
           "saveStatus": "SAVED",
           "message": "Processed result saved to S3 mock"
         },
         "ResultPath": "$.s3ProcessedSave",
         "Next": "Done"
       },
       "MockPublishReviewAlert": {
         "Type": "Pass",
         "Result": {
           "notificationType": "REVIEW_REQUIRED",
           "message": "Review required alert mock"
         },
         "ResultPath": "$.notification",
         "Next": "MockSaveMetadataToDynamoDB"
       },
       "UpdateStatusFailed": {
         "Type": "Pass",
         "Result": {
           "status": "FAILED",
           "errorType": "FORCED_FAILURE",
           "message": "Forced failure for workflow test"
         },
         "ResultPath": "$.failure",
         "Next": "MockPublishFailureAlert"
       },
       "MockPublishFailureAlert": {
         "Type": "Pass",
         "Result": {
           "notificationType": "FAILED",
           "message": "Failure alert mock"
         },
         "ResultPath": "$.notification",
         "Next": "WorkflowFailed"
       },
       "WorkflowFailed": {
         "Type": "Fail",
         "Error": "DocuFlowWorkflowFailed",
         "Cause": "Workflow failed in skeleton test"
       },
       "Done": {
         "Type": "Succeed"
       }
     }
   }
   ```
   ![image58.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image58.png)

5. Chuyển sang tab **Config** để kiểm tra:
![image59.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image59.png)
   | Mục | Giá trị |
   | --- | --- |
   | Name | docuflow-dev-workflow-processing-state-machine |
   | Type | Standard |
   | Permissions | Create new role |
   | Role name | docuflow-dev-workflow-stepfunctions-role |
   | Logging | Off cho skeleton |
   | Tracing/X-Ray | Off cho skeleton |
   
   Phần Tags:
   | Key | Value |
   | --- | --- |
   | Project | DocuFlowAI |
   | Environment | dev |
   | Module | workflow |
6. Bấm **Create** ở góc trên bên phải (Nhấn Confirm nếu có popup).
![image60.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image60.png)
![image61.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image61.png)

#### Test Happy Path và Failure Path cho Skeleton
**Test happy path:**
- Vào state machine vừa tạo, bấm **Start execution**.
![image62.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image62.png)
![image63.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image63.png)
- Execution name: `docuflow-dev-doc-manual-001-v2`
- Input JSON:
  ```json
  {
    "documentId": "doc-manual-001",
    "userId": "user-demo",
    "bucket": "docuflow-dev-raw-[accountId]-ap-southeast-1",
    "key": "raw/user-demo/doc-manual-001/original.pdf",
    "s3RawPath": "s3://docuflow-dev-raw-[accountId]-ap-southeast-1/raw/user-demo/doc-manual-001/original.pdf",
    "fileName": "original.pdf",
    "contentType": "application/pdf"
  }
  ```
![image64.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image64.png)
![image65.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image65.png)
![image66.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image66.png)
![image67.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image67.png)

**Test failure path:**
- Bấm **New execution**.
- Execution name: `docuflow-dev-doc-manual-001-fail`
- Input JSON:
  ```json
  {
    "documentId": "doc-manual-001-fail",
    "userId": "user-demo",
    "bucket": "docuflow-dev-raw-[accountId]-ap-southeast-1",
    "key": "raw/user-demo/doc-manual-001/original.pdf",
    "s3RawPath": "s3://docuflow-dev-raw-[accountId]-ap-southeast-1/raw/user-demo/doc-manual-001/original.pdf",
    "fileName": "original.pdf",
    "contentType": "application/pdf",
    "forceFail": true
  }
  ```
  ![image68.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image68.png)
- Graph sẽ đi theo luồng: `ValidateInput -> CheckForceFailure -> UpdateStatusFailed -> MockPublishFailureAlert -> WorkflowFailed`.
![image69.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image69.png)
