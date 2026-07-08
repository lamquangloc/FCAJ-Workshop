---
title: "Giám sát, Cảnh báo & Quản trị hệ thống"
date: 2024-01-01
weight: 8
chapter: false
pre: " <b> 5.8. </b> "
---
### 1. Mục tiêu (Goal)
Thiết lập khả năng quan sát hệ thống (Observability), cấu hình log và cảnh báo tự động khi có sự cố, kích hoạt tracing xuyên suốt dịch vụ, lưu vết hoạt động (Auditing) và quản lý chặt chẽ ngân sách AWS để tối ưu hóa credits của dự án.

---

### 2. Các nội dung thực hành chi tiết

Vui lòng bấm chọn từng mục dưới đây để thực hiện chi tiết từng bước:

* **[5.8.1 CloudWatch Logs & Filters](5.8.1-logging/)**: Thiết lập hạn lưu trữ log Lambda về 7 ngày để tối ưu chi phí và tạo Custom Metric Filters lọc log lỗi.
* **[5.8.2 SES, SNS & Cảnh báo Alarms](5.8.2-alerting/)**: Xác thực SES email, tạo SNS Topic thông báo và thiết lập 4 Alarms tự động bắn mail cảnh báo khi sập hệ thống.
* **[5.8.3 Tracing AWS X-Ray](5.8.3-tracing/)**: Bật Active Tracing (AWS X-Ray) xuyên suốt các dịch vụ API Gateway ➔ Step Functions ➔ Lambda để xem biểu đồ Service Map.
* **[5.8.4 Governance & Audit Logs](5.8.4-governance/)**: Thiết lập audit logging với AWS CloudTrail lưu trữ vào S3 bucket độc lập để kiểm vết hoạt động tài khoản.
