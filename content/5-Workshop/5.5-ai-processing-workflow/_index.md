---
title: "AI Processing Workflow"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---
### 1. Goal
Establish an asynchronous AI processing workflow using **AWS Step Functions** to orchestrate four Lambda functions in sequence:
1. **Input verification checks (Validate)**
2. **Text extraction calling OCR engines (Amazon Textract)**
3. **Prompt-engineered JSON normalization (AI Proxy)**
4. **Confidence scoring and status routing (Confidence & Status)**

The four functions above are the core AI-processing Lambdas. The workflow also invokes the official **Notification Trigger Lambda** for `REVIEW_REQUIRED` and failure alerts; its setup belongs to [Observability and Alerting](../5.8-observability-alerting-governance/5.8.2-alerting/5.8.2.1-notification-trigger-lambda/).

---

### 2. Lab Exercises

Select a sub-page below to complete the step-by-step instructions for each component:

* **[5.5.1 Validate Lambda](5.5.1-validate/)**: Deploy and configure the input validation checks Lambda.
* **[5.5.2 Textract Lambda](5.5.2-textract/)**: Configure the Lambda function that invokes Amazon Textract OCR AnalyzeExpense APIs.
* **[5.5.3 AI Proxy Lambda](5.5.3-proxy/)**: Configure the Lambda function that routes intermediate OCR outputs to an external LLM.
* **[5.5.4 Confidence Status Lambda](5.5.4-confidence/)**: Deploy the Lambda function that rates field confidence scores and routes document statuses.
* **[5.5.5 Step Functions Workflow](5.5.5-stepfunctions/)**: Deploy the AWS Step Functions State Machine that connects all execution steps with catch-fail transitions.