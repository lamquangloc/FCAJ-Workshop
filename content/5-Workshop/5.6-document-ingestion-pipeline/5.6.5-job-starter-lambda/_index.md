---
title: "Initialize Job Starter Lambda Function"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.6.5. </b> "
---
#### Lab 8: Initialize Job Starter Lambda Function (`docuflow-dev-ingestion-job-starter-lambda`)
1. Access **Lambda** -> click **Create function** -> **Author from scratch**.
2. **Function name**: `docuflow-dev-ingestion-job-starter-lambda`.
3. **Runtime**: Select `Node.js 18.x` or higher.
4. **Role**: Select **Use an existing role** -> choose the role `docuflow-dev-security-job-starter-role`.
5. Click **Create function**.
6. In the **Configuration** tab -> **General configuration**: Adjust Timeout to **30 seconds**.
7. In the **Configuration** tab -> **Environment variables**: Add the variable:
   * `STATE_MACHINE_ARN` = `<ARN_OF_THE_STEP_FUNCTIONS_STATE_MACHINE_CREATED_ABOVE>`
8. In the **Code** tab, copy the following code, overwrite `index.mjs` and click **Deploy**:
{{< source-code file="services/functions/ingestion-job-starter/index.mjs" language="javascript" >}}

#### Lab 9: Configure SQS Triggers for Job Starter Lambda
1. Return to the Lambda `docuflow-dev-ingestion-job-starter-lambda` interface.
2. In the **Function overview** diagram, click the **Add trigger** button.
3. **Select a source**: Choose **SQS**.
4. **SQS queue**: Select the main queue `docuflow-dev-ingestion-processing-queue`.
5. **Batch size**: Enter `1` (Process each file independently).
6. Click **Add** to complete the connection.

### Expected Result
* S3 Event Notifications are accurately routed to EventBridge.
* EventBridge Rule correctly catches files in the `raw/` directory and successfully pushes them to SQS.
* Job Starter Lambda is automatically triggered when there is an SQS message and successfully initiates the Step Functions workflow skeleton.
