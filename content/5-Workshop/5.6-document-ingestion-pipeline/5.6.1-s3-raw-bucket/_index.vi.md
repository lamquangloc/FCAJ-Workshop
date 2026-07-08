---
title: "Cấu hình EventBridge cho S3 Raw Bucket"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.6.1. </b> "
---#### Bật EventBridge notification cho Raw bucket
Sau khi tạo xong bucket, quay lại bucket Raw:
![image9.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image9.png)
1. Vào tab: **Properties**
![image10.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image10.png)
2. Kéo xuống gần cuối, tìm phần: **Event notifications**
![image11.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image11.png)
3. Trong phần đó tìm mục: **Amazon EventBridge**. Bấm **Edit** -> Chọn: **On** -> **Save changes**
![image12.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image12.png)
![image13.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image13.png)
![image14.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image14.png)