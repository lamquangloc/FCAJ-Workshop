---
title: "CloudWatch Logs & Filters"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.8.1. </b> "
---
**PHẦN 1: THIẾT LẬP THỜI GIAN LƯU TRỮ LOG (RETENTION SETTING)**

- Tạo CloudWatch log groups, metric filters/custom metrics nếu cần.

Lưu ý an toàn tài chính (Cost Guardrails): AWS mặc định lưu log vô thời hạn (Never Expire), điều này sẽ làm tăng chi phí lưu trữ của Account. Tài liệu yêu cầu bạn phải đưa về 7 ngày.

Bạn thực hiện các bước sau lần lượt cho cả 6 tên nhóm:
1. Tại ô tìm kiếm trên cùng của AWS Console, gõ CloudWatch ➔ Chọn dịch vụ CloudWatch.
   ![image111.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image111.png)

2. Ở menu thanh bên trái, tìm đến mục Logs ➔ Bấm chọn Log groups.
3. Nhìn sang góc phải màn hình, bấm nút Create log group.
4. Cấu hình chi tiết:
   * **Log group name**: Copy chính xác tên đầu tiên: `/aws/lambda/docuflow-dev-ai-proxy-lambda`
   * **Retention setting**: Bấm vào menu thả xuống, chọn 1 week (7 days).
   * **KMS key ARN**: Để trống (hoặc dán ARN của khóa `alias/docuflow-dev-main-key` nếu bạn muốn mã hóa log theo chuẩn an ninh cao nhất).
      ![image112.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image112.png)

5. Bấm nút Create ở dưới cùng.
   ![image113.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image113.png)

Lặp lại chính xác các bước trên cho 5 cái tên còn lại:
* `/aws/lambda/docuflow-dev-ingestion-job-starter-lambda`
* `/aws/lambda/docuflow-dev-api-generate-upload-url-lambda`
* `/aws/lambda/docuflow-dev-ai-textract-lambda`
* `/aws/lambda/docuflow-dev-ai-confidence-status-lambda`
* `/aws/lambda/docuflow-dev-data-lambda`


**PHẦN 2: TẠO METRIC FILTERS ĐỂ THEO DÕI CÁC CHỈ SỐ QUAN TRỌNG (CUSTOM METRICS)**

Để phục vụ cho buổi Workshop/Demo hiển thị biểu đồ trực quan, bạn cần trích xuất các chỉ số từ Log ra thành Metric. Chúng ta sẽ làm 2 bộ filter cốt lõi:

**Bộ Filter 1: Bắt lỗi hệ thống errorType (Cấu hình trên hàm AI Proxy của Tài)**

Filter này giúp đếm số lần hàm AI Proxy lỗi khi gọi LLM bên ngoài hoặc lỗi code.
1. Tại danh sách Log groups, bấm thẳng vào tên nhóm: `/aws/lambda/docuflow-dev-ai-proxy-lambda`.
2. Chọn tab Metric filters (nằm cạnh tab Log streams) ➔ Bấm nút Create metric filter.
   ![image114.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image114.png)

**Bước 1: Define pattern (Định nghĩa từ khóa tìm kiếm):**
* Tại ô Filter pattern, bạn nhập chính xác chuỗi: `"errorType"` (có cả 2 dấu ngoặc kép để quét đúng cấu trúc log lỗi chuẩn JSON).
* Bạn có thể bấm nút Test pattern để xem thử log hiện tại có dính chữ này không. Sau đó bấm Next.
   ![image115.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image115.png)

**Bước 2: Assign metric (Gán chỉ số hệ thống):**
* **Filter name**: Điền `docuflow-dev-proxy-error-filter`
* **Metric namespace**: Điền `DocuFlowAI/Metrics` (Viết liền, đây là cái hộp tổng để chứa tất cả các chỉ số tự chế của dự án).
* **Metric name**: Điền `ProxyExecutionErrors`
* **Metric value**: Điền số `1` (Nghĩa là cứ mỗi dòng log xuất hiện chữ `"errorType"`, hệ thống tự động đếm tăng lên 1).
* Các ô còn lại để trống. Bấm Next.
   ![image116.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image116.png)

**Bước 3: Review and create:**
* Xem lại một lượt rồi bấm Create metric filter.
   ![image117.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image117.png)
   ![image118.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image118.png)

**Bộ Filter 2: Theo dõi số hóa đơn cần kiểm duyệt thủ công REVIEW_REQUIRED (Cấu hình trên hàm của Trà)**

Filter này giúp đếm xem có bao nhiêu hóa đơn có điểm tin cậy thấp cần con người nhảy vào duyệt lại.
1. Quay lại danh sách Log groups, bấm vào tên nhóm: `/aws/lambda/docuflow-dev-ai-confidence-status-lambda`.
2. Chọn tab Metric filters ➔ Bấm nút Create metric filter.

**Bước 1: Define pattern:**
* Tại ô Filter pattern, bạn nhập chính xác chuỗi: `"REVIEW_REQUIRED"`. Bấm Next.
   ![image119.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image119.png)

**Bước 2: Assign metric:**
* **Filter name**: Điền `docuflow-dev-review-required-filter`
* **Metric namespace**: Điền giống hệt cái trên để gom nhóm: `DocuFlowAI/Metrics`
* **Metric name**: Điền `InvoicesRequiringHumanReview`
* **Metric value**: Điền số `1`. Bấm Next.
   ![image120.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image120.png)

**Bước 3: Review and create:**
* Bấm Create metric filter để hoàn tất.
   ![image121.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image121.png)

   ![image122.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.1-logging/image122.png)
