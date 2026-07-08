---
title: "Dựng luồng thu thập tài liệu bất đồng bộ"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---
### Mục tiêu (Goal)
Khi người dùng tải tệp lên S3 Raw bucket thành công, S3 tự động bắn sự kiện `ObjectCreated` sang Amazon EventBridge. EventBridge sẽ lọc sự kiện và gửi vào hàng đợi Amazon SQS. Hàm Job Starter Lambda thực hiện thăm dò (polling) tin nhắn từ SQS, đọc thông tin tệp tin (`s3RawPath`, `documentId`, `userId`) và kích hoạt Step Functions State Machine khởi chạy bất đồng bộ luồng xử lý AI.

Hãy chuyển sang các bài thực hành bên trái để bắt đầu!  