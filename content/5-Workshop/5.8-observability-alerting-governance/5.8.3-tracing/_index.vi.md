---
title: "Tracing AWS X-Ray"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.8.3. </b> "
---
Để theo dõi chi tiết hiệu năng và vẽ sơ đồ đường đi của request (Service Map) xuyên suốt từ cổng vào API Gateway, đi qua máy trạng thái Step Functions, đến từng hàm Lambda thực thi cụ thể, chúng ta cần bật AWS X-Ray.

---

### Bước 1: Kích hoạt X-Ray trên API Gateway Stage
*API Gateway đóng vai trò cửa ngõ, sinh ra Trace ID ban đầu để truyền dọc luồng xử lý.*
1. Vào dịch vụ **API Gateway** trên AWS Console.
   

2. Bấm chọn tên API của dự án: `docuflow-dev-api`.
3. Ở menu dọc bên trái, chọn mục **Stages**.
4. Click chọn vào tên stage đang chạy (Ví dụ: `dev` hoặc `v1`).
5. Chuyển sang tab **Logs/Tracing** ở khung giao diện bên phải.
6. Tìm mục **X-Ray Tracing** ➔ Tích chọn vào ô **Enable X-Ray Tracing**.
   
   ![image152.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image152.png)

   

   

7. Bấm nút **Save changes** ở dưới cùng để lưu cấu hình.
![image153.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image153.png)
---

### Bước 2: Kích hoạt X-Ray trên Step Functions (Workflow)
*Giúp máy trạng thái kế thừa Trace ID từ API Gateway và chuyển tiếp tới các tác vụ Lambda.*
1. Vào dịch vụ **Step Functions** trên AWS Console.
2. Bấm chọn State Machine của dự án: `docuflow-dev-workflow-processing-state-machine`.
   
   ![image154.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image154.png)

   

   

3. Ở góc trên cùng bên phải, bấm vào nút **Edit**.
4. Cuộn chuột xuống dưới cùng của trang cấu hình, tìm mục **Tracing** (hoặc Additional configuration).
5. Tích chọn vào ô **Enable X-Ray tracing**.
![image155.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image155.png)
6. Bấm nút **Save** ở góc trên cùng bên phải để cập nhật.
![image156.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image156.png)
---

### Bước 3: Kích hoạt X-Ray trên 8 hàm Lambda cốt lõi
*Bạn cần bật Active Tracing thủ công cho từng hàm Lambda để X-Ray ghi nhận log chi tiết thời gian chạy mã code:*

#### Danh sách 8 hàm Lambda cần duyệt qua:
* `docuflow-dev-api-generate-upload-url-lambda`
* `docuflow-dev-ingestion-job-starter-lambda`
* `docuflow-dev-workflow-validate-lambda`
* `docuflow-dev-ai-textract-lambda`
* `docuflow-dev-ai-proxy-lambda`
* `docuflow-dev-ai-confidence-status-lambda`
* `docuflow-dev-data-get-document-lambda`
* `docuflow-dev-data-list-documents-lambda`

#### Các bước thao tác trên từng hàm:
1. Nhấp chọn vào tên của hàm Lambda đầu tiên trong danh sách.
![image157.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image157.png)
2. Chọn tab **Configuration** (nằm cạnh tab Code).
3. Nhìn menu dọc bên trái tab, chọn mục **Monitoring and tools**.
   
   ![image158.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image158.png)

   

   

4. Ở góc trên bên phải khung nội dung, bấm nút **Edit**.
5. Cuộn xuống tìm dòng **Lambda service traces** ➔ Tích chọn **Enable**.
   ![image159.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image159.png)

6. Bấm nút **Save** màu cam ở dưới cùng để áp dụng.
![image160.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image160.png)
7. Lần lượt làm tương tự cho 7 hàm Lambda còn lại.

---

### Bước 4: Sửa lỗi phân quyền IAM Role (Cực kỳ quan trọng)
Khi bật Active Tracing cho Lambda, code Lambda bắt buộc phải có quyền gửi dữ liệu trace telemetry về CloudWatch X-Ray daemon. Nếu thiếu quyền, luồng xử lý có thể bị gián đoạn:

1. Vào dịch vụ **IAM** ➔ Chọn mục **Roles**.
2. Tìm và bấm vào từng Role thực thi của dự án (Ví dụ: `docuflow-dev-data-lambda-role`, `docuflow-dev-security-ai-proxy-role`,...).
3. Với mỗi role, bấm chọn **Add permissions** ➔ Chọn **Attach policies**.
4. Tìm kiếm policy mặc định của AWS: `AWSXRayDaemonWriteAccess`.
5. Tích chọn và bấm **Attach policy** để hoàn tất cấp quyền.

---

### Bước 5: Cách kiểm tra Bản đồ X-Ray Service Map
1. Vào dịch vụ **CloudWatch** ➔ Menu bên trái chọn mục **X-Ray traces** ➔ Chọn **Service map**.
2. Sau khi hệ thống chạy xử lý hóa đơn, bạn sẽ thấy biểu đồ kết nối tự động dạng sơ đồ mạng:
   `API Gateway ➔ Step Functions ➔ Lambdas ➔ DynamoDB / Textract`.
3. Nút tròn hiển thị màu xanh lá cây nghĩa là chạy mượt mà; nếu hiển thị màu đỏ/vàng có nghĩa là bước đó đang bị lỗi hoặc phản hồi chậm.
![image161.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.3-tracing/image161.png)
