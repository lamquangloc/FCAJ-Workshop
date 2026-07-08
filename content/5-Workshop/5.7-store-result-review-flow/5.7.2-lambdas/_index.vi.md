---
title: "Data Management Lambdas"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.7.2. </b> "
---
What is AWS Lambda? Lambda is a service that lets you run code without provisioning or managing a traditional server. Our data module system requires four small Lambda functions to receive commands from users and read/write data to S3 and DynamoDB.

---

### STEP 3.1: Create Get Document Lambda

This function is responsible for: When a user clicks to view document details (API `GET /documents/{documentId}`), the function will fetch the detailed data and return it to them.

1. **Access the Lambda service**:
   * In the search bar at the top of the AWS Console, enter Lambda and select the **Lambda** service.
   ![image24.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image24.png)
2. **Initialize the function**:
   * Click the **Create function** button in the top right corner.
   * Select the **Author from scratch** option (Default).
   ![image25.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image25.png)

3. **Configure basic information**:
   * **Function name**: Enter the exact source code standard name: `docuflow-dev-data-get-document-lambda`. Or name it according to your requirements.
   * **Runtime**: Choose the standard programming language for the project (e.g., `Node.js 24.x`).
   ![image26.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image26.png)
   * **Architecture**: Select `arm64`.
4. **Configure Permissions**:
   * Scroll down and expand the **Additional settings** section.
   ![image27.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image27.png)
   * Under **Custom execution role**, select **Use an existing role** and choose the `docuflow-dev-data-lambda-role` created in the IAM section.
   
   ![image28.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image28.png)
   * Click **Save**.
   ![image29.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image29.png)
5. **Enter tags**:
   * Click on tags.
   * Select the necessary tags according to the setup (e.g., Project: DocuFlowAI).
   ![image30.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image30.png)
   * Click **Save**.
   ![image31.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image31.png)
6. Click the **Create function** button to create the lambda.
   ![image32.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image32.png)

Once the function is created, you will see the management interface. In the **Code source** section, you can paste the programming code below and click the **Deploy** button to save the code.
![image33.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image33.png)

**Source Code (`index.mjs`)**:
{{< source-code file="services/functions/get-document/index.mjs" language="javascript" >}}

---

### STEP 3.2: CREATE LIST DOCUMENTS LAMBDA

This function helps retrieve the list of all user documents or filter those with errors (API `GET /documents`).

1. Return to the main interface of the Lambda service (click on **Functions** in the left menu).
![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image34.png)
2. Click the **Create function** button and choose **Author from scratch**.
   ![image35.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image35.png)

3. **Configure basic information**:
   * **Function name**: Enter exactly `docuflow-dev-data-list-documents-lambda`. Or name it according to your requirements.
   * **Runtime**: Choose the standard programming language for the project (`Node.js 24.x`).
   ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image36.png)
   * **Architecture**: Select `arm64`.
4. **Configure Permissions**:
   * Expand the **Additional settings** section.
   * Under **Custom execution role**, select **Use an existing role** and choose the `docuflow-dev-data-lambda-role`.
   ![image37.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image37.png)

5. **Enter tags**:
   * Click on tags, select the necessary tags according to the setup.
   ![image38.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image38.png)
   * Click **Save**.
   ![image39.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image39.png)
6. Click the **Create function** button.
   ![image40.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image40.png)
   
Once the function is created, in the Code source section, paste the programming code below and click **Deploy**.
   ![image41.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image41.png)

**Source Code (`index.mjs`)**:
{{< source-code file="services/functions/list-documents/index.mjs" language="javascript" >}}

---

### STEP 3.3: CREATE REVIEW UPDATE LAMBDA

This function is used to save the information that the user manually edited on the interface (e.g., AI recognized the wrong amount and the user corrected it).

1. Click **Create function** ➔ **Author from scratch**.
   ![image42.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image42.png)

2. **Configure basic information**:
   * **Function name**: Enter exactly `docuflow-dev-data-review-update-lambda`.
   * **Runtime**: Choose the standard programming language for the project (`Node.js 24.x`).
   ![image43.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image43.png)
   * **Architecture**: Select `arm64`.
3. **Configure Permissions**:
   * Expand the **Additional settings** section.
   * Under **Custom execution role**, select **Use an existing role** and choose the `docuflow-dev-data-lambda-role`.
   ![image44.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image44.png)

4. **Add tags**:
   * Click on tags, select the necessary tags according to the setup.
   ![image45.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image45.png)
   * Click **Save**.
   ![image46.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image46.png)
5. Click the **Create function** button.
   ![image47.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image47.png)
6. This function is used to save the information that the user manually edited on the interface (e.g., AI recognized the wrong amount and the user corrected it)
![image48.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image48.png)

**Source Code (`index.mjs`)**:
{{< source-code file="services/functions/review-update/index.mjs" language="javascript" >}}

---

## Extended Lambdas (Optional project additions)

The following three functions are **not part of the approved MVP Lambda inventory**. They are additional project features for document deletion, Dashboard data, and explicit process/retry controls. Deploy them only when the corresponding extended frontend and API routes are used.

### EXTENDED LAMBDA E1: Create Delete Document Lambda

This function is used to delete the metadata of one or more user documents in DynamoDB and their associated files on S3 Raw & Processed.

1. Click **Create function** ➔ **Author from scratch**.
![image49.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image49.png)
2. **Configure basic information**:
   * **Function name**: Enter exactly `docuflow-dev-data-delete-lambda`.
   * **Runtime**: Choose the standard programming language for the project (`Node.js 24.x`).
   ![image50.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image50.png)
   * **Architecture**: Select `arm64`.
3. **Configure Permissions**:
   * Expand the **Additional settings** section.
   * Under **Custom execution role**, select **Use an existing role** and choose the `docuflow-dev-data-lambda-role`.
   
   ![image51.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image51.png)

4. **Add tags**:
   * Click on tags, select the necessary tags according to the setup.
    ![image52.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image52.png)
   * Click **Save**.
   ![image53.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image53.png)
5. Click the **Create function** button.
   ![image54.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image54.png)

6. This function is used to delete the data of 1 or more user documents that the user wants to delete.
   ![image55.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image55.png)

**Source Code (`index.mjs`)**:
{{< source-code file="services/functions/delete-document/index.mjs" language="javascript" >}}

---

### EXTENDED LAMBDA E2: CREATE DASHBOARD LAMBDA

The `dashboard` handler aggregates KPIs, recent activity, notifications, and status distribution for the frontend Dashboard. Create `docuflow-dev-data-dashboard-lambda` using the same runtime, architecture, and execution role pattern as the other Data Lambdas.

**Source Code (`index.mjs`)**:

{{< source-code file="services/functions/dashboard/index.mjs" language="javascript" >}}

---

### EXTENDED LAMBDA E3: CREATE PROCESS CONTROL LAMBDA

The `process-control` handler verifies document ownership, checks the raw S3 object, and starts Step Functions for process or retry requests. Create `docuflow-dev-data-process-control-lambda` with the same runtime and architecture; its execution role requires Raw S3 read access, DynamoDB read/write access, and `states:StartExecution`.

**Source Code (`index.mjs`)**:

{{< source-code file="services/functions/process-control/index.mjs" language="javascript" >}}

---

### COMMON CONFIGURATION: ENVIRONMENT VARIABLES & TIMEOUT

Our code needs to know what the Table name and Bucket name are to connect. In addition, reading files sometimes takes time, so we need to increase the default wait time so the function doesn't get interrupted.

Perform the following steps for the **three core Data Lambdas and any extended Lambdas that you choose to deploy**:

1. At the details interface of each created Lambda function, switch to the **Configuration** tab.
 ![image56.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image56.png)
2. Select the **General configuration** section in the left vertical menu, click the **Edit** button.
![image57.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image57.png)
3. Change the **Timeout** from 3 sec (Default) to **10 seconds** (or 15 seconds) to ensure the function does not get interrupted midway when querying large data or reading files from S3.
![image58.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image58.png)
Click **Save**.
![image59.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image59.png)
4. Select the **Environment variables** section in the left vertical menu:
![image60.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image60.png)
   * Click the **Edit** button, then select **Add environment variable**.
   * **First variable pair**:
     * **Key**: `DOCUFLOW_DEV_TABLE_NAME`
     * **Value**: `docuflow-dev-documents-table`
   * **Second variable pair**:
     * **Key**: `DOCUFLOW_DEV_PROCESSED_BUCKET`
     * **Value**: Enter exactly the Processed S3 bucket name (e.g., `docuflow-dev-processed-<AWS_ACCOUNT_ID>-ap-southeast-1`)
   * **Third variable pair**:
     * **Key**: `DOCUFLOW_DEV_RAW_BUCKET`
     * **Value**: Enter exactly the Raw S3 bucket name (e.g., `docuflow-dev-raw-<AWS_ACCOUNT_ID>-ap-southeast-1`)
   * For **Process Control**, also add `DOCUFLOW_DEV_STATE_MACHINE_ARN` with the deployed processing State Machine ARN.
   * For **Dashboard**, optionally add `DOCUFLOW_DEV_VND_EXCHANGE_RATES` as a JSON object when report totals must be normalized to VND.

![image61.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image61.png)

5. Click **Save** to apply.
![image62.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image62.png)

After completing this configuration for the selected functions, the Lambdas are ready to integrate with API Gateway and Step Functions.

---