---
title: "Cấu hình DynamoDB Table"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.3.4. </b> "
---
Amazon DynamoDB là gì? Khác với ổ cứng S3 dùng để chứa file, DynamoDB là một Cơ sở dữ liệu (Database) cực nhanh dùng để lưu dạng bảng biểu. Bảng này sẽ lưu trữ các thông tin siêu dữ liệu (metadata) ngắn gọn như: mã chứng từ, lịch sử xử lý, số tiền, và trạng thái để ứng dụng Frontend có thể tìm kiếm và hiển thị nhanh chóng.

1. Truy cập dịch vụ DynamoDB:
Tìm kiếm DynamoDB trên thanh công cụ của AWS và chọn dịch vụ.

![image10.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image10.png)

2. Tạo bảng mới:
Ở menu bên trái, chọn Tables, sau đó nhấn nút **Create table**.

![image11.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image11.png)

3. Cấu hình khóa chính (Table details):
* **Table name**: Nhập tên `docuflow-dev-documents-table`. Hoặc các tên khác dựa theo yêu cầu đã đặt ra của bạn.
![image12.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image12.png)
* **Partition key** (Khóa phân vùng - chìa khóa chính để tìm dữ liệu): Nhập tên trường là `PK` và chọn kiểu dữ liệu bên cạnh là `String` (Chuỗi ký tự). (Giải thích thêm: Khi chạy thật, trường này sẽ lưu dữ liệu dưới dạng `USER#{userId}` để gom tất cả tài liệu của 1 người dùng vào một chỗ).
![image13.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image13.png)
* **Sort key** (Khóa sắp xếp - chìa khóa phụ): Tích chọn ô vuông **Add sort key**. Nhập tên trường là `SK` và chọn kiểu dữ liệu là `String`. (Trường này sẽ lưu dưới dạng `DOC#{documentId}` giúp phân biệt các tài liệu của cùng 1 người).

![image14.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image14.png)

4. Cấu hình Chỉ mục phụ toàn cục (Global Secondary Index - GSI):
Tại sao cần GSI? Nếu bạn muốn tìm chứng từ theo "Trạng thái" (ví dụ: tìm các chứng từ bị lỗi) thay vì tìm theo "Người dùng", bạn cần tạo một mục lục tìm kiếm phụ gọi là GSI.

* Cuộn xuống mục **Table settings**, chuyển từ **Default settings** sang **Customize settings**.

![image15.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image15.png)

* Cuộn xuống phần **Secondary indexes** và nhấn **Create index**.

![image16.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image16.png)

* **Partition key** (của Index): Nhập `GSI1PK` (Kiểu `String`). (Giá trị lưu trữ thực tế sẽ là `STATUS#{status}` ).
![image17.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image17.png)
* **Sort key** (của Index): Nhập `GSI1SK` (Kiểu `String`). (Giá trị lưu trữ thực tế sẽ là trường thời gian `createdAt` ).
![image18.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image18.png)
* **Index name**: Hãy đổi lại chính xác thành: `docuflow-dev-documents-status-createdAt-index`. Hoặc dựa theo yêu cầu đã đặt ra của bạn.
![image19.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image19.png)
* **Attribute projection**: Chọn **All** để đảm bảo trả đủ dữ liệu cần thiết cho Frontend khi tìm kiếm theo trạng thái.
![image20.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image20.png)
* Nhấn **Create index** để xác nhận cấu hình chỉ mục.

![image21.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image21.png)

5. Thêm các Tags để cấu hình và giúp dễ quản lý dự án:

![image22.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image22.png)
6. Hoàn tất tạo bảng:
Giữ nguyên các cấu hình mặc định khác, cuộn xuống cuối trang và nhấn **Create table**. Hệ thống sẽ mất khoảng 1-2 phút để tạo bảng và chỉ mục.
![image23.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image23.png)
