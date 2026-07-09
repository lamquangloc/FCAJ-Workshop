---
title: "Kết quả mong đợi & Minh chứng"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.4.2. </b> "
---
### 1. Kết quả mong đợi (Expected Result)

* Ứng dụng chạy mượt mà dưới môi trường Localhost.
* Cơ chế xác thực JWT Cognito hoạt động chuẩn xác.
* Nút tải tài liệu kích hoạt Lambda tạo Presigned URL thành công và đẩy tệp gốc trực tiếp lên S3 Raw Bucket.

---

### 2. Minh chứng thực hành (Evidence)

Trước khi tiếp tục, hãy xác nhận:

* Ứng dụng React chạy local mà không có lỗi trên console.
* Đăng ký và đăng nhập Cognito thành công.
* Frontend thông báo tải tệp thành công.
* Tệp đã xuất hiện đúng key trong S3 Raw Bucket.
