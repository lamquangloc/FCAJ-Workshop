---
title: "Textract Lambda"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.5.2. </b> "
---
This Lambda function receives input parameters from Step Functions, invokes the Amazon Textract `AnalyzeExpense` API to perform raw OCR processing, and maps the output raw fields using dictionary mapping rules before passing them to the AI normalization step.

---

### Step-by-Step Console Configuration

1. **Create the Lambda function**:
   * Go to **Lambda** ➔ Click **Create function**.
   
   ![image1.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image1.png)
   
   * Choose **Author from scratch** (default).
   
   ![image2.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image2.png)
   
   * **Function name**: Enter `docuflow-dev-ai-textract-lambda`.
   
   ![image3.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image3.png)
   
   * **Runtime**: Select `Node.js 24.x`.
   
   ![image4.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image4.png)
   
   * Expand **Additional settings** and under **Architecture** select `arm64` for cost optimization.
   
   ![image5.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image5.png)
   
   * Under **Permissions** ➔ **Change default execution role**, choose **Use an existing role** and select `docuflow-dev-ai-textract-lambda-role`.
   
   ![image6.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image6.png)
   
   * Scroll down to the **Tags** tab and add the following standard tags for cost allocation and governance:
     * **Project**: DocuFlowAI
     * **Environment**: dev
     * **ManagedBy**: SAM
     * **Module**: ai
     * **Owner**: Team
     * **CostCenter**: Workshop
       ![image7.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image7.png)
  ![image8.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image8.png)
  ![image9.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image9.png)
  
   * Click **Save** to save the tags.
   ![image10.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image10.png)
   * Then click **Create function**.
  ![image11.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image11.png)

2. **Configure General settings**:
   * Go to the **Configuration** tab ➔ **General configuration** ➔ Click **Edit**.
   ![image12.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image12.png)
   
   * Change **Timeout** to **30 seconds**. Click **Save**.
   ![image13.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image13.png)

3. **Deploy Code**:
   * In the **Code** tab, paste the following Node.js code over the boilerplate code in the `index.mjs` editor.
   * Click **Deploy**.

{{< source-code file="services/functions/textract/index.mjs" language="javascript" >}}

4. **Test the Lambda function**:
   * Switch to the **Test** tab.
   * Select **Create new event**.
   ![image14.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image14.png)
   * Select **Synchronous**.
   ![image15.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image15.png)
   * Enter `Test` in the **Event name** field.
   ![image16.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image16.png)
   * In the **Event JSON** block, paste the following JSON payload. *(Note: Make sure the file exists in your S3 raw bucket at `raw/user-001/doc-20260628-001/original.pdf`)*.
     ```json
     {
       "rawS3Bucket": "docuflow-dev-raw-<AWS_ACCOUNT_ID>-ap-southeast-1",
       "rawS3Key": "raw/user-001/doc-20260628-001/original.pdf"
     }
     ```
   ![image17.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image17.png)
   * Click **Save** and then click **Test**. If the execution succeeds and returns output similar to the following, the Lambda is configured correctly:
   ![image18.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image18.png)
     ```json
     {
       "extractedData": {
         "documentId": "doc-20260628-001",
         "summaryFields": {
           "dueDate": {
             "value": "26/02/2019",
             "confidenceScore": 0.9998512268066406
           },
           "invoiceDate": {
             "value": "11/02/2019",
             "confidenceScore": 0.9997476959228515
           },
           "invoiceNumber": {
             "value": "US-001",
             "confidenceScore": 0.9965461730957031
           },
           "subtotalAmount": {
             "value": "145.00",
             "confidenceScore": 0.9998919677734375
           },
           "taxAmount": {
             "value": "9.06",
             "confidenceScore": 0.9991468048095703
           },
           "totalAmount": {
             "value": "$154.06",
             "confidenceScore": 0.9999777221679688
           },
           "vendorName": {
             "value": "East Repair Inc.",
             "confidenceScore": 0.9880215454101563
           }
         },
         "lineItems": [
           {
             "quantity": {
               "value": "1",
               "confidenceScore": 0.9984848785400391
             },
             "description": {
               "value": "Front and rear brake cables",
               "confidenceScore": 0.9999493408203125
             },
             "unitPriceAmount": {
               "value": "100.00",
               "confidenceScore": 0.9999201202392578
             },
             "totalAmount": {
               "value": "100.00",
               "confidenceScore": 0.9999593353271484
             }
           },
           {
             "quantity": {
               "value": "2",
               "confidenceScore": 0.9997554779052734
             },
             "description": {
               "value": "New set of pedal arms",
               "confidenceScore": 0.9998876953125
             },
             "unitPriceAmount": {
               "value": "15.00",
               "confidenceScore": 0.9997454071044922
             },
             "totalAmount": {
               "value": "30.00",
               "confidenceScore": 0.9999018859863281
             }
           },
           {
             "quantity": {
               "value": "3",
               "confidenceScore": 0.9997983551025391
             },
             "description": {
               "value": "Labor 3hrs",
               "confidenceScore": 0.9998870086669922
             },
             "unitPriceAmount": {
               "value": "5.00",
               "confidenceScore": 0.9998588562011719
             },
             "totalAmount": {
               "value": "15.00",
               "confidenceScore": 0.9999015045166015
             }
           }
         ]
       }
     }
     ```
