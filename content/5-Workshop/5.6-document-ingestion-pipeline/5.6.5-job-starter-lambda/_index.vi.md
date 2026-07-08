---
title: "Khởi tạo hàm Job Starter Lambda"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.6.5. </b> "
---
#### Lab 8: Khởi tạo hàm Job Starter Lambda (`docuflow-dev-ingestion-job-starter-lambda`)
1. Truy cập **Lambda** -> nhấn **Create function** -> **Author from scratch**.
2. **Function name**: `docuflow-dev-ingestion-job-starter-lambda`.
3. **Runtime**: Chọn `Node.js 18.x` hoặc cao hơn.
4. **Role**: Chọn **Use an existing role** -> chọn role `docuflow-dev-security-job-starter-role`.
5. Bấm **Create function**.
6. Tại tab **Configuration** -> **General configuration**: Điều chỉnh Timeout thành **30 seconds**.
7. Tại tab **Configuration** -> **Environment variables**: Thêm biến:
   * `STATE_MACHINE_ARN` = `<ARN_CỦA_STEP_FUNCTIONS_STATE_MACHINE_ĐÃ_TẠO_Ở_TRÊN>`
8. Tại tab **Code**, copy đoạn code sau, dán đè vào `index.mjs` và nhấn **Deploy**:
{{< source-code file="services/functions/ingestion-job-starter/index.mjs" language="javascript" >}}

#### Lab 9: Cấu hình Triggers SQS cho Job Starter Lambda
1. Quay lại giao diện con Lambda `docuflow-dev-ingestion-job-starter-lambda`.
2. Tại sơ đồ **Function overview**, nhấn nút **Add trigger**.
3. **Select a source**: Chọn **SQS**.
4. **SQS queue**: Chọn hàng đợi chính `docuflow-dev-ingestion-processing-queue`.
5. **Batch size**: Điền `1` (Xử lý từng tệp tin độc lập).
6. Nhấn **Add** để hoàn tất liên kết.

### Kết quả mong đợi (Expected Result)
* S3 Event Notifications đã định tuyến chuẩn xác sang EventBridge.
* EventBridge Rule bắt đúng các tệp tin trong thư mục `raw/` và đẩy thành công vào SQS.
* Job Starter Lambda tự động kích hoạt (trigger) khi có tin nhắn SQS và ra lệnh khởi chạy Step Functions workflow skeleton thành công.