---
title: "Mô hình dữ liệu & Offloading"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.7.1. </b> "
---
Hệ thống lưu trữ và quản lý kết quả bóc tách chứng từ của DocuFlow AI áp dụng nguyên lý **Single-Table Design** trên Amazon DynamoDB kết hợp với mô hình **Offloading** (phân tách dữ liệu lớn) lưu trên S3 để tối ưu hóa hiệu năng, chi phí và vượt qua các giới hạn vật lý của cơ sở dữ liệu NoSQL.

---

### 1. Kiến trúc lưu trữ kết hợp (Hybrid Architecture)

* **DynamoDB (Lưu siêu dữ liệu tóm tắt - Metadata)**: 
  * Lưu trữ các trường dữ liệu ngắn, có tần suất truy vấn và tìm kiếm cao như: trạng thái hóa đơn (`status`), tên nhà cung cấp (`vendorName`), ngày hóa đơn (`invoiceDate`), tổng tiền (`totalAmount`), và đường dẫn lưu trữ.
  * Việc này giúp việc hiển thị danh sách hóa đơn trên Dashboard của người dùng đạt tốc độ phản hồi tối ưu (mili-giây) và giảm tải dung lượng đọc/ghi (Read/Write Capacity Units) của DynamoDB.

* **S3 (Lưu trữ Payload chi tiết)**:
  * Toàn bộ dữ liệu bóc tách thô, dữ liệu chuẩn hóa dạng JSON đầy đủ (bao gồm cả mảng danh sách mặt hàng `lineItems` nặng hàng trăm KB) được nén và đẩy trực tiếp thành tệp tin tĩnh `result.json` lưu trữ trên S3 Processed bucket theo cấu trúc thư mục:
   

    `processed/{userId}/{documentId}/result.json`
  * Khi người dùng click vào một hóa đơn cụ thể để xem chi tiết, Frontend mới gọi API lấy tệp tin JSON này từ S3 về hiển thị.
  * **Lý do**: Giới hạn kích thước tối đa cho 1 bản ghi (Item) trong DynamoDB là **400KB**. Đối với các hóa đơn dài có hàng trăm dòng sản phẩm, việc lưu trữ trực tiếp vào DynamoDB sẽ làm sập hệ thống (Vượt hạn mức) hoặc tăng chi phí lưu trữ/truy vấn cơ sở dữ liệu lên rất nhiều lần.

---

### 2. Thiết kế Single-Table Design trên DynamoDB

Để phục vụ toàn bộ các nghiệp vụ chỉ sử dụng duy nhất một bảng `docuflow-dev-documents-table`, chúng ta sử dụng thiết kế phân vùng khóa như sau:

* **Khóa chính PK (Partition Key)** = `USER#{userId}`
  * Gom nhóm tất cả tài liệu thuộc về cùng một người dùng về một phân vùng vật lý trên hệ thống. 
  * Hỗ trợ API xem danh sách tài liệu (`GET /documents`) bằng lệnh truy vấn `Query` theo `PK = USER#{userId}` cực kỳ nhanh.

* **Khóa chính SK (Sort Key)** = `DOC#{documentId}`
  * Đảm bảo tính duy nhất của từng tài liệu của người dùng.
  * Hỗ trợ lấy chi tiết chứng từ nhanh chóng bằng cách chỉ định chính xác cặp khóa `PK` và `SK` ($O(1)$ lookup).

* **Global Secondary Index (GSI) để lọc theo trạng thái**:
  * **GSI Partition Key (`GSI1PK`)** = `STATUS#{status}` (Ví dụ: `STATUS#PROCESSING`, `STATUS#REVIEW_REQUIRED`).
  * **GSI Sort Key (`GSI1SK`)** = `createdAt` (Mốc thời gian tạo bản ghi).
  * **Tên GSI**: `docuflow-dev-documents-status-createdAt-index`
  * **Mục đích**: Cho phép Frontend hiển thị danh sách hóa đơn lọc theo trạng thái (ví dụ: "Chỉ hiện hóa đơn chờ duyệt") và sắp xếp theo thứ tự thời gian mới nhất.

---

### 3. Sơ đồ Cấu trúc bản ghi DynamoDB

| PK | SK | documentId | userId | status | GSI1PK | GSI1SK |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `USER#user-001` | `DOC#doc-17195616` | `doc-17195616` | `user-001` | `PROCESSING` | `STATUS#PROCESSING` | `2026-06-28T09:00:00Z` |
| `USER#user-001` | `DOC#doc-17195617` | `doc-17195617` | `user-001` | `REVIEW_REQUIRED` | `STATUS#REVIEW_REQUIRED` | `2026-06-28T09:10:00Z` |
| `USER#user-001` | `DOC#doc-17195618` | `doc-17195618` | `user-001` | `APPROVED` | `STATUS#APPROVED` | `2026-06-28T09:20:00Z` |

---

### Minh chứng thực hành (Evidence)

- Kiểm tra bản ghi DynamoDB có đủ khóa metadata và trạng thái mong đợi.
- Kiểm tra `result.json` tồn tại đúng prefix trong S3 Processed Bucket.
