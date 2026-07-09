---
title: "Notification Trigger Lambda"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.8.5. </b> "
---
Kiến trúc DocuFlow AI được duyệt sử dụng `docuflow-dev-notification-trigger-lambda` để gửi cảnh báo khi workflow thất bại hoặc tài liệu chuyển sang `REVIEW_REQUIRED`. Lambda publish message vào SNS Topic của hệ thống; SNS tiếp tục phân phối đến email subscription hoặc consumer đã cấu hình.

## 1. Tạo Lambda

1. Mở **AWS Lambda** và chọn **Create function**.
2. Chọn **Author from scratch**.
3. Nhập tên hàm `docuflow-dev-notification-trigger-lambda`.
4. Chọn cùng phiên bản Node.js đang được các Lambda khác trong dự án sử dụng và kiến trúc `arm64`.
5. Chọn execution role `docuflow-dev-notification-lambda-role` đã tạo ở phần IAM.
6. Tạo hàm và đặt timeout thành **30 giây**.

## 2. Cấu hình biến môi trường

Thêm biến bắt buộc:

| Key | Value |
|---|---|
| `DOCUFLOW_DEV_NOTIFICATION_TOPIC_ARN` | ARN của `docuflow-dev-notification-system-alerts-topic` |

Execution role phải có quyền `sns:Publish` vào topic này và quyền ghi CloudWatch Logs.

## 3. Triển khai code

Thay code mặc định trong `index.mjs` bằng source hiện tại của dự án rồi nhấn **Deploy**.

{{< source-code file="services/functions/notification-trigger/index.mjs" language="javascript" >}}

## 4. Kiểm thử cảnh báo REVIEW_REQUIRED

Tạo Lambda test event:

```json
{
  "documentId": "doc-review-001",
  "userId": "user-001",
  "status": "REVIEW_REQUIRED",
  "review": {
    "reviewStatus": "PENDING",
    "reviewReasonCodes": ["LOW_CONFIDENCE", "MISSING_INVOICE_DATE"]
  },
  "error": {
    "errorCode": null,
    "errorStage": null
  }
}
```

Kết quả mong đợi: `notified` bằng `true`, Lambda trả về SNS `MessageId` và subscriber đã xác nhận nhận được email yêu cầu review.

## 5. Kiểm thử cảnh báo lỗi

```json
{
  "documentId": "doc-failed-001",
  "userId": "user-001",
  "status": "FAILED",
  "review": {
    "reviewStatus": "PENDING",
    "reviewReasonCodes": []
  },
  "error": {
    "errorCode": "TEXTRACT_FAILED",
    "errorStage": "TEXTRACT"
  }
}
```

Kết quả mong đợi: Lambda gửi cảnh báo lỗi nhưng không đưa nội dung tài liệu, dữ liệu tài chính đã bóc tách hoặc secret vào message.

## 6. Tích hợp Step Functions

Processing State Machine gọi Lambda này tại hai state:

- `PublishSNSAlert` khi tài liệu có trạng thái `REVIEW_REQUIRED`.
- `PublishFailureAlert` sau khi metadata lỗi đã được lưu.

Nếu triển khai bằng SAM, ánh xạ `${NotificationTriggerFunctionArn}` đến ARN của Lambda này qua `DefinitionSubstitutions`.
