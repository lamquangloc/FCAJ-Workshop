---
title: "Validate Lambda"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.5.1. </b> "
---
This Lambda function is responsible for checking file formatting and sizes on the S3 Raw Bucket to ensure only valid files propagate into the processing pipeline.

---

### Step-by-Step Console Configuration

1. **Create the Lambda function**:
   

   * Go to **Lambda** ➔ Click **Create function**.
   * Choose **Author from scratch** (default).
   * **Function name**: Enter `docuflow-dev-workflow-validate-lambda`.
   * **Runtime**: Select `Node.js 18.x` or higher.
   * **Architecture**: Select `arm64` for cost efficiency.
   * **Permissions**: Expand **Change default execution role** ➔ Choose **Use an existing role** ➔ select `docuflow-dev-workflow-validate-lambda-role`.
   * Click **Create function**.


2. **Configure General settings**:
   * Select **Configuration** tab ➔ **General configuration** ➔ Click **Edit**.
   

   

   

   

   

   

   * Change **Timeout** to **30 seconds**. Click **Save**.
   * Go to **Environment variables** ➔ Click **Edit**.
   * Add:
     * `DOCUFLOW_DEV_RAW_BUCKET` = `docuflow-dev-raw-<AWS_ACCOUNT_ID>-ap-southeast-1`
     * `MAX_FILE_SIZE_BYTES` = `10485760` (optional; defaults to 10 MB)
   * Click **Save**.


3. **Deploy Code**:
   * In the **Code** tab, paste this Node.js v18 code over the boilerplate code in the `index.mjs` editor.
   * Click **Deploy**.


{{< source-code file="services/functions/workflow-validate/index.mjs" language="javascript" >}}
