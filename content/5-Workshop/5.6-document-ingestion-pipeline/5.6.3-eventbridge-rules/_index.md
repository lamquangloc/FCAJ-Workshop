---
title: "Create EventBridge rule and Test"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.6.3. </b> "
---
#### Create EventBridge rule: S3 Raw → SQS
1. Open EventBridge and select: **Amazon EventBridge**. On the left menu, select: **Rules** → Click: **Create rule**.
![image27.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image27.png)
![image28.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image28.png)
![image29.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image29.png)
![image30.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image30.png)
2. Define rule detail:
![image31.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image31.png)
   | Field | Value |
   | --- | --- |
   | Name | docuflow-dev-ingestion-s3-object-created-rule |
   | Description | Route S3 Raw ObjectCreated events to DocuFlow processing SQS queue. |
   | Event bus | default |
   | Rule type | Rule with an event pattern |
3. Build event pattern:
   - In the **Event source** section, select: **Other**.
   ![image32.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image32.png)
   - Scroll down to the JSON box and paste this pattern:
     ```json
     {
       "source": ["aws.s3"],
       "detail-type": ["Object Created"],
       "detail": {
         "bucket": {
           "name": ["docuflow-dev-raw-[accountId]-ap-southeast-1"]
         },
         "object": {
           "key": [
             {
               "prefix": "raw/"
             }
           ]
         }
       }
     }
     ```
     ![image33.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image33.png)
   - Then click **Next**.
4. Select target:
   - On the Select target(s) screen, choose:
     | Field | Selection |
     | --- | --- |
     | Target type | AWS service |
     | Select a target | SQS queue |
     | Queue | docuflow-dev-ingestion-processing-queue |
     | Input | Matched event |
  - ![image34.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image34.png)
  ![image35.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image35.png)
5. Review Role name: `docuflow-dev-ingestion-eventbridge-sqs-role`, Configure tags and click **Review and create**.
![image36.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image36.png)
![image37.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image37.png)
![image38.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image38.png)
![image39.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image39.png)
#### Test S3 Raw → EventBridge → SQS
**Step 1: Upload a test file to the correct prefix raw/**
- Go to S3 bucket: `docuflow-dev-raw-[accountId]-ap-southeast-1`
- Click Create folder sequentially: `raw`
- Inside the `raw` folder, create: `user-demo`
- Inside the `user-demo` folder, create: `doc-manual-001`
![image40.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image40.png)
![image41.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image41.png)
![image42.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image42.png)
- Inside the `doc-manual-001` folder, click **Upload** and upload a PDF/JPG/PNG file. Name the file: `original.pdf`
![image43.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image43.png)
![image44.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image44.png)
![image45.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image45.png)
![image46.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image46.png)
**Step 2: Poll message in SQS**
- Go to Amazon SQS → Queues → `docuflow-dev-ingestion-processing-queue`
![image47.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image47.png)
![image48.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image48.png)
- Click **poll message**. After messages appear, check one message.
![image49.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image49.png)
![image50.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image50.png)
- Click **View details**. Open the **Body** section.
- Check if it contains a JSON similar to what EventBridge routes to SQS: 
  ```json
  {
    "source": "aws.s3",
    "detail-type": "Object Created",
    "detail": {
      "bucket": {
        "name": "docuflow-dev-raw-[accountId]-ap-southeast-1"
      },
      "object": {
        "key": "raw/user-demo/doc-manual-001/original.pdf"
      }
    }
  }
  ```
![image51.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image51.png)