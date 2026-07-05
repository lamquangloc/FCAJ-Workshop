---
title: "Worklog Tuần 8"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.8. </b> "
---


### Mục tiêu tuần 8:

* Cập nhật và hoàn thiện kiến trúc dự án nhóm theo các góp ý từ admin.
* Xây dựng Serverless CRUD API bằng cách kết hợp AWS Lambda và Amazon DynamoDB.
* Quản lý xác thực người dùng và lưu trữ tệp tin thông qua AWS Amplify.
* Tích hợp Frontend gọi API thông qua Amazon API Gateway.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| --- | --- | --- | --- | --- |
| 2 | - Làm việc nhóm và rà soát lại bản thiết kế kiến trúc.<br>- **Thực hành:** Chỉnh sửa lại kiến trúc của dự án nhóm qua những góp ý của anh/chị admin. | 22/06/2026 | 22/06/2026 | Project nhóm |
| 3 | - Phát triển các hàm Serverless CRUD để xử lý dữ liệu với DynamoDB.<br>- **Thực hành:**<br>&emsp; + Tạo bảng DynamoDB lưu trữ tài liệu.<br>&emsp; + Viết các Lambda function thực hiện logic nghiệp vụ: List (danh sách), Upload/Create (tải lên/tạo mới), Delete (xóa).<br>&emsp; + Kiểm thử (Test) các Lambda function vừa tạo. | 23/06/2026 | 23/06/2026 | <https://000133.awsstudygroup.com/> |
| 4 | - Tích hợp hệ thống quản lý danh tính và kho lưu trữ tĩnh.<br>- **Thực hành:**<br>&emsp; + Cấu hình Authentication (Cognito) bằng AWS Amplify.<br>&emsp; + Cấu hình Storage (S3) để lưu file qua AWS Amplify.<br>&emsp; + Thiết lập và kiểm tra các mức độ phân quyền truy cập (Access Level). | 24/06/2026 | 24/06/2026 | <https://000134.awsstudygroup.com/> |
| 5 | - Làm việc nhóm và hoàn thiện thiết kế kiến trúc.<br>- **Thực hành:** Tiếp tục chỉnh sửa lại kiến trúc của dự án nhóm qua những góp ý bổ sung của anh/chị admin. | 25/06/2026 | 25/06/2026 | Project nhóm |
| 6 | - Tích hợp Frontend gọi API qua API Gateway.<br>- **Thực hành:**<br>&emsp; + Triển khai mã nguồn Frontend (Front-end Deployment).<br>&emsp; + Cấu hình Amazon API Gateway làm cầu nối.<br>&emsp; + Kiểm thử API độc lập bằng Postman.<br>&emsp; + Kiểm thử tích hợp gọi API trực tiếp từ giao diện Frontend. | 26/06/2026 | 26/06/2026 | <https://000135.awsstudygroup.com/> |

### Kết quả đạt được tuần 8:

* Bản thiết kế kiến trúc dự án nhóm trở nên thực tế và tối ưu hơn sau khi được review và chỉnh sửa theo góp ý từ admin.
* Xây dựng thành công hệ thống Serverless CRUD có thể ghi/đọc dữ liệu từ DynamoDB bằng Lambda.
* Nắm bắt cách tích hợp xác thực người dùng và lưu trữ dữ liệu an toàn, nhanh chóng bằng hệ sinh thái AWS Amplify.
* Triển khai hoàn chỉnh luồng Frontend tương tác với hệ thống Serverless backend thông qua API Gateway.
