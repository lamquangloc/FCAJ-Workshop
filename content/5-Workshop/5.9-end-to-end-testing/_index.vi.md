---
title: "Kiểm thử tích hợp End-to-End"
date: 2024-01-01
weight: 9
chapter: false
pre: " <b> 5.9. </b> "
---
### 1. Mục tiêu (Goal)
Tiến hành chạy thử nghiệm liên thông toàn bộ hệ thống từ giao diện người dùng đến luồng xử lý ngầm, kiểm tra hoạt động của các nhánh xử lý logic của Step Functions và thu thập bằng chứng kiểm thử (evidence).

### 2. Các kịch bản kiểm thử (Test Cases)

#### Kịch bản 1: Luồng kiểm duyệt thủ công (Low-Confidence Path - Hóa đơn mờ/thiếu trường)
* **Mô phỏng thao tác**: Tải lên tệp tin hóa đơn bị mờ hoặc thiếu một số trường quan trọng như tổng tiền (totalAmount).
* **Quy trình hệ thống**:
  1. Các bước xử lý trung gian diễn ra tương tự kịch bản Happy Path.
  2. Tại bước tính điểm tin cậy, Confidence & Status Lambda phát hiện điểm tin cậy trung bình < 90% hoặc thiếu trường bắt buộc (`vendorName`, `totalAmount`).
  3. Lambda chuyển trạng thái bản ghi trong DynamoDB thành `REVIEW_REQUIRED` và gán trạng thái review là `PENDING`.
  4. Hệ thống kích hoạt CloudWatch Alarm bắn cảnh báo lỗi sang SNS, gửi email cảnh báo về điện thoại/hộp thư Admin.
  5. Admin/Reviewer mở trang Phê duyệt (Reviewer Dashboard) trên UI, xem biểu mẫu chỉnh sửa thông tin bị nhận diện sai.
  6. Sau khi sửa lại số tiền và nhấn **Approve** (Duyệt), Frontend gọi API `review` Lambda cập nhật trạng thái bản ghi trong DynamoDB thành `APPROVED` và ghi đè kết quả `result.json` đã sửa lên S3.
* **Bằng chứng**:

  ![Review Notification](/images/5-Workshop/5.9-end-to-end-testing/review-notification.png)

  ![Reviewer Dashboard](/images/5-Workshop/5.9-end-to-end-testing/human-review-dashboard.png)

  ![Low Confidence Fields](/images/5-Workshop/5.9-end-to-end-testing/low-confidence-fields.png)

  ![Review Timeline](/images/5-Workshop/5.9-end-to-end-testing/review-timeline.png)

#### Kịch bản 2: Luồng xử lý lỗi (Failed Path - File sai định dạng/quá tải)
* **Mô phỏng thao tác**: Tải lên tệp tin định dạng `.txt` (hoặc tệp ảnh dung lượng > 10MB).
* **Quy trình hệ thống**:
  1. Frontend kiểm tra file đúng định dạng chưa.
  2. Nếu sai định dạng, Frontend sẽ hiển thị file sai định dạng và không cho upload lên
* **Bằng chứng**: 

  ![Invalid File Format](/images/5-Workshop/5.9-end-to-end-testing/invalid-file-format.png)

#### Kịch bản 3: Tin nhắn rơi vào hàng đợi chết (SQS DLQ Path)
* **Mô phỏng thao tác**: Thu hồi quyền đọc Secrets Manager của hàm AI Proxy Lambda để mô phỏng lỗi sập logic liên tục khi gọi API.
* **Quy trình hệ thống**:
  1. Khi người dùng upload tệp tin mới, SQS nhận tin nhắn và gọi Job Starter Lambda kích hoạt Step Functions.
  2. Luồng chạy bị sập tại bước AI Proxy do lỗi phân quyền (`AccessDenied`).
  3. Tin nhắn được rollback lại SQS và Lambda retry liên tục.
  4. Sau khi số lần thử lại vượt ngưỡng tối đa (`Maximum receives = 3`), tin nhắn lỗi tự động được đưa sang Dead Letter Queue `docuflow-dev-processing-dlq`.
  5. CloudWatch Alarm `docuflow-dev-sqs-dlq-not-empty-alarm` kích hoạt SNS gửi mail cảnh báo tin nhắn kẹt.
* **Bằng chứng**: Chụp màn hình SQS Console hiển thị chỉ số tin nhắn hiển thị tại DLQ > 0.

### 3. Kết quả mong đợi (Expected Result)
* Luồng xử lý bất đồng bộ hoạt động chính xác cho cả 3 kịch bản kiểm thử.
* Cơ chế ghi vết và gửi cảnh báo tự động hoạt động mượt mà khi xảy ra lỗi hoặc khi có hóa đơn cần review.
* Dữ liệu đồng bộ và lưu trữ nhất quán giữa S3 và DynamoDB.
