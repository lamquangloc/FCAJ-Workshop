---
title: "Worklog Tuần 5"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.5. </b> "
---

### Mục tiêu tuần 5:

* Tìm hiểu và triển khai Amazon CloudFront để phân phối nội dung tĩnh/động kết hợp với S3 và EC2.
* Ứng dụng điện toán tại biên (Edge Computing) bằng cách tích hợp Lambda@Edge với CloudFront.
* Tự động hóa hệ thống (Serverless Automation) để tối ưu chi phí EC2 bằng AWS Lambda.
* Quản lý quyền truy cập và phân quyền (Access Control) an toàn bằng IAM Policies có điều kiện kết hợp với Resource Tags.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| --- | --- | --- | --- | --- |
| 2 | - Tìm hiểu về Content Delivery với Amazon CloudFront.<br>- **Thực hành:**<br>&emsp; + Tạo S3 bucket và tải lên nội dung web tĩnh (index.html).<br>&emsp; + Cấu hình CloudFront distribution với S3 origin để bảo mật và tăng tốc độ tải trang.<br>&emsp; + Kiểm tra và dọn dẹp tài nguyên. | 01/06/2026 | 01/06/2026 | <https://000094.awsstudygroup.com/> |
| 3 | - Nâng cao kiến thức CloudFront (Origin Group, Custom Error Page, Cache Behavior).<br>- **Thực hành phần 1:**<br>&emsp; + Chuẩn bị EC2, S3 làm nguồn (Origin).<br>&emsp; + Tạo CloudFront Distribution với EC2 origin, kiểm tra distribution invalidations.<br>&emsp; + Cấu hình Custom Error Page, Origin Group và Response Headers. | 02/06/2026 | 02/06/2026 | <https://000130.awsstudygroup.com/> |
| 4 | - Tìm hiểu về Edge Computing (Lambda@Edge).<br>- **Thực hành phần 2:**<br>&emsp; + Tạo Cache Behavior mới trên CloudFront.<br>&emsp; + Tạo function Lambda@Edge và triển khai (deploy) lên CloudFront.<br>&emsp; + Giám sát CloudFront với Metrics và Logs, sau đó dọn dẹp tài nguyên. | 03/06/2026 | 03/06/2026 | <https://000130.awsstudygroup.com/> |
| 5 | - Học cách tự động hóa Serverless để tối ưu chi phí hạ tầng EC2.<br>- **Thực hành:**<br>&emsp; + Chuẩn bị hạ tầng: VPC, Security Group, EC2 và Slack webhook.<br>&emsp; + Đánh Tag (Create Tag) cho EC2 instance.<br>&emsp; + Tạo IAM Role và Lambda functions để tự động Start/Stop EC2 instance theo lịch.<br>&emsp; + Kiểm tra kết quả báo về và dọn dẹp. | 04/06/2026 | 04/06/2026 | <https://000022.awsstudygroup.com/> |
| 6 | - Quản lý quyền truy cập EC2 sử dụng IAM kết hợp Resource Tags (Least privilege).<br>- **Thực hành:**<br>&emsp; + Tạo IAM User, IAM Policy với các điều kiện (condition) bắt buộc về Tag.<br>&emsp; + Tạo IAM Role và thực hiện Assume Role (Switch Roles).<br>&emsp; + Kiểm tra giới hạn quyền: thử tạo EC2 không có tag, tạo EC2 có tag hợp lệ, sửa tag và quản lý EC2 dựa theo policy. | 05/06/2026 | 05/06/2026 | <https://000028.awsstudygroup.com/> |

### Kết quả đạt được tuần 5:

* Triển khai thành công hệ thống CDN với Amazon CloudFront.
  * Phân phối nội dung web tĩnh từ S3 an toàn, hiệu năng cao.
  * Cấu hình nâng cao: Origin Groups (Failover), Custom Error Pages, Cache Behaviors.
* Làm chủ điện toán tại biên với Lambda@Edge.
  * Viết và triển khai mã (code) để tùy chỉnh HTTP requests/responses tại các Edge Locations.
* Ứng dụng Serverless Automation tối ưu hóa chi phí.
  * Dùng AWS Lambda tự động hoá việc bật/tắt các EC2 instances không cần chạy 24/7.
* Triển khai thành công mô hình bảo mật Least Privilege.
  * Quản lý quyền truy cập tài nguyên cực kì chi tiết dựa trên Resource Tags và IAM Conditions.
