---
title: "Create SQS Queues"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.6.2. </b> "
---
#### Create SQS DLQ and Main Queue
![image15.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image15.png)
In the AWS search bar, type: **SQS** → Select **Simple Queue Service** → **Queues** → **Create queue**.
![image16.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image16.png)
![image17.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image17.png)

**Step 1: Create a Dead-letter queue (DLQ)**
- In the **Type** section, select: **Standard** (Do not select FIFO).
- For Name, enter: `docuflow-dev-ingestion-processing-dlq`
![image18.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image18.png)
- Configuration section:
  | Item | Value |
  | --- | --- |
  | Visibility timeout | 30 seconds or keep default |
  | Message retention period | 4 days |
  | Delivery delay | 0 seconds |
  | Maximum message size | default |
  | Receive message wait time | 0 seconds or default |
  | Encryption | choose Amazon SQS key (SSE-SQS) if available |
  | Access policy | Basic / default |
  | Redrive allow policy | keep default |
- Click Create Queue.

![image19.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image19.png)
![image20.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image20.png)

**Step 2: Create the Main QUEUE**
Create QUEUE name: `docuflow-dev-ingestion-processing-queue`
![image21.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image21.png)
- Select the following configurations:
  | Section | Value |
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
- In the **Dead-letter queue** section, this time select: **Enable**
![image22.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image22.png)
- Then select the DLQ: `docuflow-dev-ingestion-processing-dlq`
- Maximum receives: `3`
![image23.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image23.png)
- Tags section
![image24.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image24.png)
- Click Create Queue.
![image25.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image25.png)
![image26.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image26.png)