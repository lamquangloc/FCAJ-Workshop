---
title: "Worklog Tuần 9"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.9. </b> "
---


### Mục tiêu tuần 9:

* Chốt và hoàn thiện bản vẽ kiến trúc cuối cùng cho project nhóm.
* Đảm nhiệm vai trò Data Engineer/Backend: Thiết kế Data Model trên DynamoDB và Amazon S3.
* Phát triển các Backend Logic (Lambda) cho các API: Get, List, Update, Delete.
* Kiểm thử API với dữ liệu mẫu và tích hợp thành công với Frontend.
* Khắc phục các bug hệ thống và xử lý xóa dữ liệu đa luồng.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| --- | --- | --- | --- | --- |
| 2 | - Hoàn thiện tài liệu kiến trúc.<br>- **Thực hành:**<br>&emsp; + Chốt bản vẽ kiến trúc cuối cùng của project nhóm.<br>&emsp; + Chỉnh sửa, format lại bản vẽ cho rõ ràng, trực quan và dễ nhìn hơn. | 29/06/2026 | 29/06/2026 | Project nhóm |
| 3 | - Thiết kế cơ sở dữ liệu.<br>- **Thực hành:**<br>&emsp; + Bắt đầu thực hiện đồ án dựa trên phân công của nhóm trưởng (đảm nhận phần Data).<br>&emsp; + Chuẩn bị và thiết kế Data Model cho cơ sở dữ liệu DynamoDB và kho lưu trữ S3. | 30/06/2026 | 30/06/2026 | Project nhóm |
| 4 | - Xây dựng API Get & List.<br>- **Thực hành:**<br>&emsp; + Viết Backend Logic bằng Lambda function cho các API Get và List dữ liệu.<br>&emsp; + Chạy thử nghiệm và kiểm thử (test) API vừa viết bằng dữ liệu mẫu (mock data). | 01/07/2026 | 01/07/2026 | Project nhóm |
| 5 | - Xây dựng API Update & Delete.<br>- **Thực hành:**<br>&emsp; + Viết Backend Logic bằng Lambda function cho các API Update và Setup API Xóa dữ liệu.<br>&emsp; + Tiến hành kiểm thử lại toàn bộ các hàm này với dữ liệu mẫu trong DB. | 02/07/2026 | 02/07/2026 | Project nhóm |
| 6 | - Tối ưu và Fix Bug hệ thống.<br>- **Thực hành:**<br>&emsp; + Hoàn thiện tính năng Delete đa luồng (multi-threading/concurrency).<br>&emsp; + Sửa các lỗi (Fix bug) hệ thống phát sinh trong quá trình chạy thử.<br>&emsp; + Xử lý các lỗi liên kết (integration bugs) khi ghép nối Backend với Frontend. | 03/07/2026 | 03/07/2026 | Project nhóm |

### Kết quả đạt được tuần 9:

* Có được bản vẽ kiến trúc hệ thống trực quan, dễ hiểu, được cả nhóm đồng thuận để làm kim chỉ nam phát triển.
* Thiết kế xong Data Model và triển khai các bảng DynamoDB, S3 bucket đáp ứng đúng yêu cầu lưu trữ của dự án.
* Hoàn thành toàn bộ các API CRUD (Get, List, Update, Delete) cho Backend bằng AWS Lambda, đảm bảo hoạt động trơn tru với dữ liệu thực tế.
* Giải quyết triệt để các bug kết nối giữa Frontend và Backend, cũng như tối ưu được tính năng xóa dữ liệu đa luồng phức tạp.
