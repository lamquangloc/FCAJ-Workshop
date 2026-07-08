---
title: "Lưu trữ kết quả & Xây dựng luồng phê duyệt"
date: 2024-01-01
weight: 7
chapter: false
pre: " <b> 5.7. </b> "
---
### 1. Mục tiêu (Goal)
Thiết lập cơ chế lưu trữ bền vững (Data Persistence) theo mô hình "Offloading" giữa DynamoDB và S3, triển khai ba Data Lambda chính thức (Get Document, List Documents và Review Update) cho luồng phê duyệt thủ công. Delete Document, Dashboard và Process Control được tách riêng thành các Lambda mở rộng, chỉ triển khai khi sử dụng các tính năng làm thêm của dự án.

---

### 2. Các nội dung thực hành chi tiết

Vui lòng bấm chọn từng mục dưới đây để thực hiện chi tiết từng bước:

* **[5.7.1 Mô hình dữ liệu & Offloading](5.7.1-persistence/)**: Tìm hiểu thiết kế Single-Table Design trên DynamoDB và cơ chế phân tách Metadata / Payload chi tiết để tối ưu hiệu năng.
* **[5.7.2 Các hàm Lambda quản lý dữ liệu](5.7.2-lambdas/)**: Triển khai ba Data Lambda cốt lõi, sau đó tùy chọn bổ sung ba Lambda mở rộng cho giao diện nâng cao.
* **[5.7.3 Cấu hình API Gateway](5.7.3-api-gateway/)**: Thiết lập Amazon API Gateway làm cổng kết nối cho các Lambda và cấu hình xác thực Cognito Authorizer.
* **[5.7.4 Thử nghiệm & Báo cáo](5.7.4-testing/)**: Hướng dẫn tạo dữ liệu mẫu (Mock data), kiểm thử các hàm Lambda API và chạy script báo cáo chi phí/số liệu thông qua AWS CloudShell.
