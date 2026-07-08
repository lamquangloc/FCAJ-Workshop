---
title: "Tạo EventBridge rule và Test"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.6.3. </b> "
---
#### Tạo EventBridge rule: S3 Raw → SQS
1. Mở EventBridge chọn: **Amazon EventBridge**. Ở menu trái, chọn: **Rules** → Bấm: **Create rule**
![image27.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image27.png)
![image28.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image28.png)
![image29.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image29.png)
![image30.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image30.png)
2. Define rule detail:
![image31.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image31.png)
   | Field | Giá trị |
   | --- | --- |
   | Name | docuflow-dev-ingestion-s3-object-created-rule |
   | Description | Route S3 Raw ObjectCreated events to DocuFlow processing SQS queue. |
   | Event bus | default |
   | Rule type | Rule with an event pattern |
3. Build event pattern:
   - Ở phần **Event source**, chọn: **Other**
   ![image32.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image32.png)
   - Kéo xuống ô JSON và dán pattern này:
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
   - Sau đó bấm **Next**.
4. Select target:
   - Ở màn hình Select target(s) chọn:
     | Field | Chọn |
     | --- | --- |
     | Target type | AWS service |
     | Select a target | SQS queue |
     | Queue | docuflow-dev-ingestion-processing-queue |
     | Input | Matched event |
  - ![image34.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image34.png)
  ![image35.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image35.png)
5. Xem lại Role name: `docuflow-dev-ingestion-eventbridge-sqs-role`, Configures tags và bấm **Review and create**.
![image36.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image36.png)
![image37.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image37.png)
![image38.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image38.png)
![image39.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image39.png)
#### Test S3 Raw → EventBridge → SQS
**Bước 1: Upload file test vào đúng prefix raw/**
- Vào S3 bucket: `docuflow-dev-raw-[accountId]-ap-southeast-1`
- Bấm Create folder lần lượt: `raw`
- Vào folder `raw`, tạo tiếp: `user-demo`
- Vào folder `user-demo`, tạo tiếp: `doc-manual-001`
![image40.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image40.png)
![image41.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image41.png)
![image42.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image42.png)
- Vào folder `doc-manual-001`, bấm **Upload** và upload 1 file PDF/JPG/PNG. Đặt tên file là: `original.pdf`
![image43.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image43.png)
![image44.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image44.png)
![image45.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image45.png)
![image46.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image46.png)
**Bước 2: Poll message trong SQS**
- Vào Amazon SQS → Queues → `docuflow-dev-ingestion-processing-queue`
![image47.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image47.png)
![image48.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image48.png)
- Nhấp **poll message**. Sau khi message hiện ra, tick chọn một message.
![image49.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image49.png)
![image50.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image50.png)
- Bấm **View details**. Mở phần **Body**.
- Kiểm tra có đoạn giống JSON EventBridge bắn qua SQS không: 
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