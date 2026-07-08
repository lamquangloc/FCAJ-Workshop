---
title: "Thử nghiệm & Báo cáo"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.7.4. </b> "
---
Chúng ta sẽ thiết lập dữ liệu mẫu (Mock Data) để kiểm thử độc lập cụm API quản lý dữ liệu, sau đó sử dụng AWS CloudShell để chạy script truy vấn báo cáo thống kê chứng từ.

---

### Bước 1: Chuẩn bị dữ liệu mẫu (Mock Data)
Để phục vụ việc kiểm thử độc lập (không phụ thuộc vào module AI), các dữ liệu mẫu đã được tạo trực tiếp trên AWS:
* **DynamoDB Item**: Tạo 01 bản ghi (item) giả lập trong bảng `docuflow-dev-documents-table` lưu trữ các siêu dữ liệu (metadata) cơ bản.
![image63.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image63.png)
* **S3 Processed JSON**: Tạo 01 file `result.json` chi tiết (chứa lineItems, workflow, extraction data) lưu tại thư mục `processed/user-001/doc-20260628-001/` trong S3 bucket.
![image64.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image64.png)

---

### Bước 2: Hướng dẫn kiểm thử cụm 3 API Data (API Testing)
Quá trình kiểm thử được thực hiện bằng tính năng **Test Event** trực tiếp trên giao diện AWS Lambda Console, giả lập các request từ API Gateway truyền vào.

* **2.1. API Lấy chi tiết tài liệu** (`GET /documents/{documentId}`)
  * **Lambda Function**: `docuflow-dev-data-get-document-lambda`
  * **Kịch bản test**: Hàm nhận `documentId`, truy vấn DynamoDB để lấy đường dẫn `processedS3Key`, sau đó kết nối với S3 để tải và trả về toàn bộ file JSON chi tiết. Đảm bảo lọc bỏ các khóa bảo mật (PK, SK, GSI).
  ![image65.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image65.png)
  * **Kết quả**: API trả về HTTP Status 200, hiển thị đầy đủ thông tin chi tiết của tài liệu, không lộ khóa nội bộ.
![image66.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image66.png)
* **2.2. API Lấy danh sách tài liệu** (`GET /documents?status=...`)
  * **Lambda Function**: `docuflow-dev-data-list-documents-lambda`
  * **Kịch bản test**: Truyền tham số query string `status: "EXTRACTED"`. Hàm thực hiện lệnh Query vào Global Secondary Index (GSI) của DynamoDB để lọc danh sách.
  ![image67.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image67.png)
  * **Kết quả**: Trả về HTTP Status 200 kèm mảng items chứa các tài liệu đạt điều kiện.
![image68.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image68.png)
* **2.3. API Cập nhật trạng thái kiểm duyệt** (`PATCH /documents/{documentId}/review`)
  * **Lambda Function**: `docuflow-dev-data-review-update-lambda`
  * **Kịch bản test**: Giả lập thao tác người dùng chỉnh sửa số tiền trên giao diện Frontend. Gửi payload cập nhật `reviewStatus` thành `CORRECTED` và log lại mảng corrections.
  ![image69.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image69.png)
  * **Kết quả**: Trả về HTTP Status 200, bảng DynamoDB cập nhật thành công các trường trạng thái.
  ![image70.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image70.png)

---

### Bước 3: Báo cáo thống kê đơn giản (Lightweight Report)
Để hỗ trợ việc giám sát và tổng hợp dữ liệu, một đoạn script Node.js nhẹ đã được triển khai qua AWS CloudShell để xuất báo cáo nhanh từ DynamoDB mà không gây tải cho hệ thống chính.
**Các bước thực hiện:**
1. Truy cập môi trường AWS CloudShell.
![image71.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image71.png)
2. Tạo file thực thi `report.mjs` sử dụng AWS SDK v3 để Query toàn bộ bản ghi của người dùng thông qua Partition Key (`PK = USER#{userId}`).
![image72.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image72.png)
3. Nhấn `ctrl + o` để lưu sau đó nhấn `enter` để xác nhận tên file.
4. Sau đó nhấn `ctrl + x` để thoát ra.
5. Cài package trước khi chạy (nếu cần).

![image74.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image74.png)
6. Thực thi lệnh `node report.mjs` để tiến hành đếm và phân nhóm dữ liệu.
![image73.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image73.png)
**Kết quả báo cáo thực tế:**
* Tổng số chứng từ: (Số lượng)
* Phân loại theo trạng thái: (Bao nhiêu chứng từ EXTRACTED, REVIEW_REQUIRED, FAILED...)
* Tổng chi phí theo nhà cung cấp: Thống kê tổng totalAmount gom nhóm theo vendorName và tháng.
![image75.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image75.png)

---

### Bước 4: Giải thích mô hình dữ liệu (Data Model Explanation)
Để tối ưu hóa chi phí và tốc độ truy xuất trên AWS theo chuẩn Serverless, mô hình dữ liệu (Data Persistence) được thiết kế theo nguyên tắc "Offloading" (chia tách) giữa DynamoDB và S3:

* **Thiết kế Khóa (Keys) trong DynamoDB:**
  * **Partition Key (PK)**: `USER#{userId}`. Giúp gom cụm toàn bộ tài liệu của một người dùng vào cùng một node vật lý, giúp API List Documents chạy cực kỳ nhanh và tiết kiệm RCU (Read Capacity Units).
  * **Sort Key (SK)**: `DOC#{documentId}`. Kết hợp với PK để truy xuất định danh chính xác (O(1)) một tài liệu duy nhất cho API Get/Update.
* **Chỉ mục phụ GSI (Global Secondary Index):**
  * Sử dụng `GSI1PK = STATUS#{status}` và `GSI1SK = createdAt`. Điều này cho phép hệ thống dễ dàng truy vấn các bảng dashboard như: "Lấy 10 chứng từ gần nhất đang bị lỗi (FAILED) hoặc cần kiểm duyệt (REVIEW_REQUIRED)".
* **Tách bạch Metadata và Data chi tiết:**
  * DynamoDB chỉ lưu trữ các trường dữ liệu tóm tắt (metadata) cần thiết cho việc filter và hiển thị danh sách (như tên file, tổng tiền, ngày hóa đơn, trạng thái).
  * Toàn bộ cấu trúc JSON nặng (có thể lên tới hàng trăm KB khi chứa chi tiết từng mặt hàng - line items) được đẩy sang lưu trữ tĩnh tại S3 Bucket (`processedS3Key`). Khi Client cần xem chi tiết, Lambda sẽ kéo file từ S3 về để trả ra. Cách này giúp tránh chạm giới hạn 400KB/item của DynamoDB và giảm chi phí lưu trữ/truy xuất cơ sở dữ liệu đắt đỏ.
