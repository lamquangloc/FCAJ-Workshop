---
title: "Proposal"
date: 2026-07-04
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# DocuFlow AI - Serverless Invoice & Receipt Processing Platform on AWS

### 1. Executive Summary
DocuFlow AI is an automated invoice and receipt processing platform designed by the AeroOps team. It leverages AWS Serverless architecture combined with AI to eliminate manual data entry for finance and accounting teams. The system automatically extracts data from PDF/JPG/PNG files via Amazon Textract and normalizes it using an External AI API. Built on an asynchronous workflow through EventBridge, SQS, and Step Functions, the solution guarantees high reliability, scalability, and operational cost optimization.

### 2. Problem Statement
*Current Problem*
Finance teams and SME operations frequently process large volumes of invoices, receipts, and purchasing documents. Manual data entry into spreadsheets or accounting systems leads to inaccurate information (vendor, amount, date), consumes significant time, results in scattered files, and lacks a centralized tracking or alerting system.

*Solution*
DocuFlow AI automates this entire pipeline. Users upload files securely via a web interface powered by Amazon Cognito and CloudFront/Amplify. Files stored in the S3 Raw Bucket trigger EventBridge, routing events to an SQS queue. Step Functions orchestrate the extraction process: validating formats, using Amazon Textract for raw data, and invoking an AI Proxy Lambda to call External AI for JSON normalization. The results and statuses (EXTRACTED, REVIEW_REQUIRED, FAILED) are saved to DynamoDB and S3 Processed. Users can review and correct the parsed data directly on the UI, while system errors trigger SNS/SES alerts.

*Benefits and ROI*
The system drastically reduces manual data entry time, accelerates processing, and facilitates document auditing through centralized storage. The serverless architecture ensures pay-as-you-go cost optimization, adapting perfectly to fluctuating invoice volumes. Security guardrails such as IAM, KMS, Secrets Manager, and AWS Budgets ensure financial data safety and prevent unexpected costs.

### 3. Solution Architecture
The DocuFlow AI architecture strictly follows serverless, event-driven, and asynchronous design principles.

![Solution Architecture](/images/2-Proposal/architecture.png)


*AWS Services Utilized*
- **Amazon CloudFront & Amplify:** Frontend hosting and content delivery.
- **Amazon Cognito:** User authentication and access management.
- **Amazon API Gateway & Lambda:** Generating S3 presigned URLs for direct file uploads.
- **Amazon S3:** Storing raw files (Raw Bucket) and normalized JSON results (Processed Bucket).
- **Amazon EventBridge & SQS:** Capturing upload events and buffering asynchronous jobs (with DLQ).
- **AWS Step Functions:** Orchestrating the processing pipeline (Validate -> Textract -> AI Proxy -> Confidence Logic -> Save).
- **Amazon Textract:** Extracting raw text and data points from documents.
- **Amazon DynamoDB:** Storing document metadata, job states, and enabling high-speed queries.
- **Amazon SNS & SES:** Sending system alerts and user email notifications.
- **AWS KMS, Secrets Manager, CloudTrail:** Handling encryption, sensitive key management, and API activity auditing.

### 4. Technical Implementation
*Implementation Phases*
The project is executed by the 5-member AeroOps team with distinct roles:
1. **Design and Standardization:** Finalizing architecture, AWS resource naming conventions (`docuflow-dev-*`), Data Contracts, and API schemas.
2. **Foundation Setup:** Provisioning Cognito, Amplify, S3, EventBridge, SQS, DynamoDB, and IAM baselines.
3. **Ingestion & Queue Integration:** Implementing the Presigned URL upload flow and event routing.
4. **AI Pipeline Development:** Configuring Step Functions, Textract, and the AI Proxy Lambda for secure external API calls.
5. **UI and Data Persistence:** Saving results and building frontend views for document lists, details, and the review (correction) flow.
6. **Security & Observability:** Setting up CloudWatch (logs/alarms), X-Ray, Budget alerts, and deploying via AWS SAM.

*Technical Requirements*
- Infrastructure as Code (IaC) deployed via AWS SAM.
- RESTful API endpoints (POST `/documents/upload-url`, GET `/documents`, PATCH `/documents/{documentId}/review`).
- Output JSON must adhere strictly to the standardized schema (including `status`, `invoice`, `confidence`).
- AI Proxy Lambda must handle timeouts, rate limits, and conceal API keys retrieved from Secrets Manager.

### 5. Roadmap & Milestones (Weekly)
- **Week 1:** Architecture brief, data contract v1, API samples, IAM security/cost plan.
- **Week 2:** Foundation setup (Cognito, S3, DynamoDB, IAM baseline).
- **Week 3:** Upload & Queue implementation (Presigned URL, S3 events, EventBridge, SQS).
- **Week 4:** Workflow skeleton (Step Functions) and status UI setup.
- **Week 5:** AI integration (Textract + External AI normalization).
- **Week 6-7:** Storage integration (DynamoDB/S3 results) and Review flow implementation.
- **Week 8-9:** Error handling (Retry/catch, DLQ) and Observability/Governance (CloudWatch, X-Ray, Alarms).
- **Week 10-12:** E2E testing, workshop documentation, cleanup scripts, and Final Demo.

### 6. Budget Estimation
**Operational Cost Estimate (For 300 invoices/month)**

| Service | Estimated Cost |
| :--- | :--- |
| AWS Lambda | $0.00/month (within Free Tier) |
| Amazon S3 (storage & requests) | ~$0.15/month |
| AWS Amplify (frontend hosting) | ~$0.35/month |
| Amazon API Gateway | ~$0.01/month |
| Amazon Textract (AnalyzeExpense) | ~$0.08/month |
| External AI API (via AI Proxy) | ~$0.02/month |
| Data Transfer & SNS Alerts | ~$0.02/month |
| **Total Estimate** | **~$0.70 USD/month** |

**Cost Control Guidelines**

- **AWS Budgets:** Automated alerts when costs exceed **$5.00** and **$10.00**.
- **File Limits:** Validate Lambda rejects files larger than **5 MB** or exceeding **3 pages**.
- **Lifecycle Rules:** Automatically delete files in raw/processed buckets after **14 days**.
- **Post-demo Cleanup:** Run cleanup script and verify no billable resources remain.

### 7. Risk Assessment
*Risk Matrix and Mitigation Strategies*
- **Invalid File Formats or Blurry Documents:** Blocked early by a Validation Lambda. If extraction confidence is low, the status is flagged as `REVIEW_REQUIRED`.
- **External AI API Timeouts/Rate-limits or Leaked Keys:** Handled by AI Proxy Lambda with Step Functions retry/catch policies. API keys are strictly kept in Secrets Manager and never exposed to the frontend.
- **Workflow Failures Difficult to Debug:** Mitigated by enabling CloudWatch structured logs, AWS X-Ray tracing, and capturing failed executions in an SQS Dead-letter queue (DLQ).
- **Cost Overruns:** Managed by AWS Budgets tracking, limiting batch uploads, and enforcing daily cleanup routines.

### 8. Expected Results
- **Technical:** Successfully deploy an end-to-end automated invoice processing pipeline, smoothly integrating a Serverless Backend with an Amplify Frontend.
- **User Experience:** Deliver a user-friendly interface to track real-time processing statuses (UPLOADED -> PROCESSING -> EXTRACTED / REVIEW_REQUIRED -> APPROVED) with manual correction capabilities.
- **Data Management:** Securely store normalized metadata and extracted JSON, acting as a robust foundation for queries and internal financial reporting.