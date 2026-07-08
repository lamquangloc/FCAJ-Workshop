---
title: "Distributed Tracing"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.8.3. </b> "
---
To monitor detailed performance and draw the path of requests (Service Map) throughout the system—from the API Gateway, through the Step Functions state machine, down to each executing Lambda function—we need to enable AWS X-Ray.

---

### Step 1: Enable X-Ray on API Gateway Stage
*API Gateway acts as the entry point, generating the initial Trace ID to pass along the processing flow.*
1. Go to the **API Gateway** service on the AWS Console.
   

2. Click on the project's API name: `docuflow-dev-api`.
3. On the left vertical menu, select **Stages**.
4. Click on the name of the running stage (For example: `dev` or `v1`).
5. Switch to the **Logs/Tracing** tab on the right interface panel.
6. Find the **X-Ray Tracing** section ➔ Check the **Enable X-Ray Tracing** box.
   
   ![image152.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image152.png)

7. Click the **Save changes** button at the bottom to save the configuration.
![image153.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image153.png)
---

### Step 2: Enable X-Ray on Step Functions (Workflow)
*Helps the state machine inherit the Trace ID from API Gateway and forward it to Lambda tasks.*
1. Go to the **Step Functions** service on the AWS Console.
2. Select the project's State Machine: `docuflow-dev-workflow-processing-state-machine`.
   
   ![image154.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image154.png)

3. In the top right corner, click the **Edit** button.
4. Scroll down to the bottom of the configuration page and find the **Tracing** (or Additional configuration) section.
5. Check the **Enable X-Ray tracing** box.
![image155.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image155.png)
6. Click the **Save** button in the top right corner to update.
![image156.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image156.png)
---

### Step 3: Enable X-Ray on 8 core Lambda functions
*You need to manually enable Active Tracing for each Lambda function so X-Ray can record detailed code execution logs:*

#### List of 8 Lambda functions to go through:
* `docuflow-dev-api-generate-upload-url-lambda`
* `docuflow-dev-ingestion-job-starter-lambda`
* `docuflow-dev-workflow-validate-lambda`
* `docuflow-dev-ai-textract-lambda`
* `docuflow-dev-ai-proxy-lambda`
* `docuflow-dev-ai-confidence-status-lambda`
* `docuflow-dev-data-get-document-lambda`
* `docuflow-dev-data-list-documents-lambda`

#### Steps to perform on each function:
1. Click on the name of the first Lambda function in the list.
![image157.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image157.png)
2. Select the **Configuration** tab (next to the Code tab).
3. Look at the left vertical menu in the tab and select **Monitoring and tools**.
   
   ![image158.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image158.png)

4. In the top right corner of the content panel, click the **Edit** button.
5. Scroll down to find the **Lambda service traces** line ➔ Check **Enable**.
   ![image159.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image159.png)

6. Click the orange **Save** button at the bottom to apply.
![image160.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image160.png)
7. Do the same for the remaining 7 Lambda functions, one by one.

---

### Step 4: Fix IAM Role permissions (Extremely important)
When Active Tracing is enabled for Lambda, the Lambda code must have permission to send trace telemetry data back to the CloudWatch X-Ray daemon. If permissions are missing, the processing flow might be interrupted:

1. Go to the **IAM** service ➔ Select the **Roles** section.
2. Find and click on each execution Role of the project (For example: `docuflow-dev-data-lambda-role`, `docuflow-dev-security-ai-proxy-role`,...).
3. For each role, click **Add permissions** ➔ Select **Attach policies**.
4. Search for the default AWS policy: `AWSXRayDaemonWriteAccess`.
5. Check it and click **Attach policy** to complete granting permissions.

---

### Step 5: How to check the X-Ray Service Map
1. Go to the **CloudWatch** service ➔ On the left menu select **X-Ray traces** ➔ Select **Service map**.
2. After the system runs an invoice processing request, you will see an automated connection diagram formatted as a network map:
   `API Gateway ➔ Step Functions ➔ Lambdas ➔ DynamoDB / Textract`.
3. A circle displaying green means it's running smoothly; if it displays red/yellow, it means that step is experiencing errors or slow responses.
![image161.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image161.png)
