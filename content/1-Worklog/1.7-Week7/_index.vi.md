---
title: "Worklog Tuần 7"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.7. </b> "
---


### Mục tiêu tuần 7:

* Hiểu và vận dụng IAM Permission Boundaries để quản lý quyền bảo mật nâng cao.
* Xây dựng Serverless Backend hoàn chỉnh với AWS Lambda, Amazon S3 và DynamoDB.
* Phát triển và tích hợp Frontend gọi đến Serverless APIs thông qua API Gateway.
* Giám sát (Monitoring) ứng dụng Serverless bằng Amazon CloudWatch và AWS X-Ray.
* Thiết kế và vẽ kiến trúc cho project nhóm.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| --- | --- | --- | --- | --- |
| 2 | - Tìm hiểu Permission Management với IAM Permission Boundaries.<br>- **Thực hành:**<br>&emsp; + Tạo chính sách giới hạn quyền (Restriction Policy).<br>&emsp; + Tạo IAM User và áp dụng Permission Boundary để giới hạn quyền tối đa.<br>&emsp; + Kiểm tra và xác minh các giới hạn quyền của IAM User. | 15/06/2026 | 15/06/2026 | <https://000030.awsstudygroup.com/> |
| 3 | - Xây dựng Serverless Backend với Lambda, S3 và DynamoDB.<br>- **Thực hành:**<br>&emsp; + Tạo Lambda function để tự động xử lý/resize hình ảnh khi có sự kiện từ S3.<br>&emsp; + Tạo bảng DynamoDB lưu trữ dữ liệu.<br>&emsp; + Viết Lambda function để ghi dữ liệu (write data) vào DynamoDB. | 16/06/2026 | 16/06/2026 | <https://000078.awsstudygroup.com/> |
| 4 | - Phát triển Frontend cho Serverless APIs.<br>- **Thực hành:**<br>&emsp; + Triển khai Frontend web application.<br>&emsp; + Tạo các Lambda function xử lý logic: Write, List, Delete data.<br>&emsp; + Cấu hình API Gateway (tạo methods, bật CORS) để kết nối Frontend với Backend.<br>&emsp; + Kiểm thử API bằng Postman và trực tiếp trên giao diện Frontend. | 17/06/2026 | 17/06/2026 | <https://000079.awsstudygroup.com/> |
| 5 | - Giám sát (Monitoring) các ứng dụng Serverless.<br>- **Thực hành:**<br>&emsp; + Sử dụng CloudWatch để debug log của Lambda function.<br>&emsp; + Tạo custom metric và thiết lập cảnh báo (CloudWatch Alarm) dựa trên metric.<br>&emsp; + Theo dõi (Tracing) luồng xử lý API từ đầu đến cuối bằng AWS X-Ray. | 18/06/2026 | 18/06/2026 | <https://000085.awsstudygroup.com/> |
| 6 | - Thiết kế kiến trúc tổng thể.<br>- **Thực hành:**<br>&emsp; + Thảo luận nhóm và thống nhất yêu cầu dự án.<br>&emsp; + Vẽ sơ đồ kiến trúc cho project nhóm, thể hiện rõ các dịch vụ AWS sẽ sử dụng. | 19/06/2026 | 19/06/2026 | Project nhóm |

### Kết quả đạt được tuần 7:

* Quản lý phân quyền chặt chẽ hơn với IAM Permission Boundaries, chống rủi ro leo thang đặc quyền (privilege escalation).
* Hoàn thiện kiến thức về kiến trúc Serverless. Đã tự tay xây dựng được một luồng ứng dụng hoàn chỉnh từ Frontend -> API Gateway -> Lambda -> S3/DynamoDB.
* Có khả năng debug, tracing và giám sát ứng dụng Serverless hiệu quả nhờ sự kết hợp giữa CloudWatch và AWS X-Ray.
* Có bản thiết kế kiến trúc chuẩn xác làm tiền đề triển khai project nhóm trong thời gian tới.
