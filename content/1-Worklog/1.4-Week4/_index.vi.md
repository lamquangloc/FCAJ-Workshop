---
title: "Worklog Tuần 4"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.4. </b> "
---
 

### Mục tiêu tuần 4:

* Tìm hiểu và triển khai kiến trúc Hybrid DNS kết hợp giữa on-premise và AWS sử dụng Amazon Route 53 Resolver.
* Tìm hiểu kiến thức cốt lõi về cơ sở dữ liệu NoSQL và thực hành thao tác dữ liệu với Amazon DynamoDB.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| --- | --- | --- | --- | --- |
| 2 | - Tìm hiểu lý thuyết về quản lý DNS lai (Hybrid DNS) với Route 53.<br>- Chuẩn bị hạ tầng CloudFormation, Security Group và thiết lập môi trường Microsoft AD trên AWS. | 25/05/2026 | 25/05/2026 | <https://000010.awsstudygroup.com/> |
| 3 | - **Thực hành Route 53 Resolver:**<br>&emsp; + Tạo Outbound Endpoints.<br>&emsp; + Thiết lập Resolver Rules để chuyển tiếp (forward) DNS queries.<br>&emsp; + Tạo Inbound Endpoints và kiểm tra phân giải DNS 2 chiều giữa AWS và on-premise.<br>&emsp; + Dọn dẹp tài nguyên. | 26/05/2026 | 26/05/2026 | <https://000010.awsstudygroup.com/> |
| 4 | - Tìm hiểu lý thuyết cốt lõi của DynamoDB: Primary Key, Secondary Index, Capacity Modes (Read/Write), Consistency.<br>- **Thực hành qua AWS Console:**<br>&emsp; + Tạo bảng DynamoDB, thêm, sửa, đọc và truy vấn (query) dữ liệu.<br>&emsp; + Tạo và truy vấn Global Secondary Index (GSI). | 27/05/2026 | 27/05/2026 | <https://000060.awsstudygroup.com/> |
| 5 | - **Thực hành qua AWS CloudShell / CLI:**<br>&emsp; + Lặp lại các thao tác tạo bảng, ghi dữ liệu, đọc dữ liệu, cập nhật dữ liệu, và truy vấn bằng command-line.<br>&emsp; + Tạo và truy vấn GSI qua CLI.<br>&emsp; + Dọn dẹp các tài nguyên DynamoDB. | 28/05/2026 | 28/05/2026 | <https://000060.awsstudygroup.com/> |

### Kết quả đạt được tuần 4:

* Nắm bắt và triển khai thành công mô hình Hybrid DNS với Route 53 Resolver.
  * Cấu hình thành công Inbound và Outbound endpoints.
  * Hiểu cách định tuyến traffic phân giải tên miền giữa môi trường AWS và máy chủ DNS nội bộ.
  
* Làm chủ các khái niệm và thao tác cơ bản trên Amazon DynamoDB.
  * Hiểu sâu về cấu trúc khóa (Partition key, Sort key) và các loại Index (GSI, LSI).
  * Biết cách dùng Console và CloudShell/CLI để quản lý vòng đời dữ liệu (CRUD operations) và thực hiện Query.
