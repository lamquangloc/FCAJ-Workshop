---
title: "Tạo SQS DLQ và Queue chính"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.6.2. </b> "
---
#### Tạo SQS DLQ và Queue chính
![image15.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image15.png)
Vào thanh search AWS, gõ: **SQS** → Chọn **Simple Queue Service** → **Queues** → **Create queue**.
![image16.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image16.png)
![image17.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image17.png)

**Bước 1: Tạo Dead-letter queue (DLQ)**
- Ở phần **Type**, chọn: **Standard** (Không chọn FIFO).
- Ở Name, nhập: `docuflow-dev-ingestion-processing-dlq`
![image18.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image18.png)
- Phần Configuration:
  | Mục | Chọn |
  | --- | --- |
  | Visibility timeout | 30 seconds hoặc giữ default |
  | Message retention period | 4 days |
  | Delivery delay | 0 seconds |
  | Maximum message size | default |
  | Receive message wait time | 0 seconds hoặc default |
  | Encryption | chọn Amazon SQS key (SSE-SQS) nếu có |
  | Access policy | Basic / default |
  | Redrive allow policy | giữ default |
- Bấm Create Queue.

![image19.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image19.png)
![image20.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image20.png)

**Bước 2: Tạo QUEUE chính**
Tạo QUEUE name: `docuflow-dev-ingestion-processing-queue`
![image21.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image21.png)
- Các phần cấu hình chọn:
  | Phần | Chọn |
  | --- | --- |
  | Type | Standard |
  | Visibility timeout | 2 minutes |
  | Message retention period | 4 days |
  | Receive message wait time | 10 seconds |
  | Encryption | Enabled |
  | Encryption key type | Amazon SQS key (SSE-SQS) |
  | Access policy | Basic |
  | Send messages | Only the queue owner |
  | Receive messages | Only the queue owner |
- Đến phần **Dead-letter queue**, lần này chọn: **Enable**
![image22.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image22.png)
- Rồi chọn DLQ: `docuflow-dev-ingestion-processing-dlq`
- Maximum receives: `3`
![image23.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image23.png)
- Phần Tag 
![image24.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image24.png)
- Bấm Create Queue.
![image25.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image25.png)
![image26.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image26.png)