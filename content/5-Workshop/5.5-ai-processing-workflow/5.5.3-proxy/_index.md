---
title: "AI Proxy Lambda"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.5.3. </b> "
---
This function is responsible for retrieving the secure API Key from AWS Secrets Manager, sending a prompt to a Large Language Model (OpenAI GPT-4o) to normalize the raw JSON data structure extracted by Textract, and preserving the confidence scores.

---

### Step-by-Step Console Configuration

1. **Create the Lambda function**:
   * Go to **Lambda** ➔ Click **Create a function**.
   ![image1.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image1.png)
   * Choose **Author from scratch** (default).
   ![image2.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image2.png)
   * **Function name**: Enter `docuflow-dev-ai-proxy-lambda`.
   
   ![image3.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image3.png)
   
   * **Runtime**: Select `Node.js 24.x`.

   ![image4.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image4.png)
   
   * Expand **Additional settings** and under **Architecture** select `arm64` for cost optimization.
   ![image5.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image5.png)
   * Under **Permissions** ➔ **Change default execution role**, choose **Use an existing role** and select `docuflow-dev-security-ai-proxy-role`.
   ![image19.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image19.png)
   * Scroll down to the **Tags** tab and add the following standard tags for cost allocation and governance:
     * **Project**: DocuFlowAI
     * **Environment**: dev
     * **ManagedBy**: SAM
     * **Module**: ai
     * **CostCenter**: Workshop
     * **Owner**: Team
   ![image20.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image20.png)
   ![image21.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image21.png)
   ![image22.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image22.png)
   * Click **Save** to save the tags.
   ![image10.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image10.png)
   * Click **Create function**.
  ![image11.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image11.png)

2. **Configure General settings**:
   * Go to the **Configuration** tab ➔ **General configuration** ➔ Click **Edit**.
   ![image23.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image23.png)
   * Change **Timeout** to **1 minute 10 seconds** (external LLM API calls require a longer timeout). Click **Save**.
   ![image24.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image24.png)
   * Under **Environment variables**, add:
     * `EXTERNAL_AI_SECRET_ID` = `docuflow-dev-external-ai-api-key`
     * `OPENAI_MODEL` = the model enabled for your external AI account
     * `CONFIDENCE_THRESHOLD` = `0.9`
     * `EXTERNAL_AI_TIMEOUT_MS` = `30000`
3. **Deploy Code**:
   * In the **Code** tab, paste the following Node.js v24 code over the boilerplate code in the `index.mjs` editor.
   * Click **Deploy**.

{{< source-code file="services/functions/ai-proxy/index.mjs" language="javascript" >}}

4. **Test the Lambda function**:
   * Switch to the **Test** tab.
   ![image25.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image25.png)
   * Select **Create new event**.
   ![image26.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image26.png)
   * Select **Synchronous**.
   ![image27.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image27.png)
   * Enter `Test` in the **Event name** field.
   ![image28.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image28.png)  
   * In the **Event JSON** block, paste the test output result from the previous `docuflow-dev-ai-textract-lambda` execution.
   * Click **Save** and then click **Test**. If the execution succeeds and returns output similar to the following JSON, the Lambda is configured correctly:
   ![image29.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image29.png)
     ```json
     {
       "status": "EXTRACTED",
       "invoice": {
         "vendorName": "East Repair Inc.",
         "invoiceNumber": "US-001",
         "invoiceDate": "2019-02-11",
         "dueDate": "2019-02-26",
         "currency": "USD",
         "subtotalAmount": 145,
         "taxAmount": 9.06,
         "totalAmount": 154.06
       },
       "lineItems": [
         {
           "lineItemId": "item-001",
           "description": "Front and rear brake cables",
           "quantity": 1,
           "unitPriceAmount": 100,
           "taxAmount": 0,
           "totalAmount": 100,
           "confidenceScore": 0.9996
         },
         {
           "lineItemId": "item-002",
           "description": "New set of pedal arms",
           "quantity": 2,
           "unitPriceAmount": 15,
           "taxAmount": 0,
           "totalAmount": 30,
           "confidenceScore": 0.9998
         },
         {
           "lineItemId": "item-003",
           "description": "Labor 3hrs",
           "quantity": 3,
           "unitPriceAmount": 5,
           "taxAmount": 0,
           "totalAmount": 15,
           "confidenceScore": 0.9999
         }
       ],
       "confidence": {
         "confidenceScore": 0.9976,
         "hasLowConfidence": false,
         "fieldConfidence": {
           "dueDate": 0.9999,
           "invoiceDate": 0.9997,
           "invoiceNumber": 0.9965,
           "subtotalAmount": 0.9999,
           "taxAmount": 0.9991,
           "totalAmount": 1,
           "vendorName": 0.988
         }
       }
     }
     ```