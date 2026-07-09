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

#### Kịch bản 3: Xem danh sách tài liệu
* **Mô phỏng thao tác**: Truy cập vào trang danh sách tài liệu trên giao diện người dùng.
* **Quy trình hệ thống**:
  1. Frontend gọi API để lấy danh sách các tài liệu đã tải lên từ backend.
  2. Giao diện hiển thị danh sách các tài liệu kèm theo thông tin cơ bản: tên file, ngày tải lên, trạng thái xử lý (Ví dụ: APPROVED, REVIEW_REQUIRED, FAILED).
* **Bằng chứng**: 

  ![Document List 1](/images/5-Workshop/5.9-end-to-end-testing/document-list-1.png)

  ![Document List 2](/images/5-Workshop/5.9-end-to-end-testing/document-list-2.png)

#### Kịch bản 4: Xem chi tiết kết quả trích xuất
* **Mô phỏng thao tác**: Click vào một tài liệu đã xử lý thành công trên danh sách.
* **Quy trình hệ thống**:
  1. Frontend gọi API để lấy chi tiết thông tin đã được trích xuất của tài liệu cùng với URL của file gốc.
  2. Giao diện hiển thị chi tiết tài liệu, bao gồm ảnh/PDF gốc bên cạnh các trường dữ liệu đã trích xuất (Tên người bán, Tổng tiền, Ngày tháng, v.v.).
* **Bằng chứng**: 

  ![Extraction Details 1](/images/5-Workshop/5.9-end-to-end-testing/extraction-details-1.png)

  ![Extraction Details 2](/images/5-Workshop/5.9-end-to-end-testing/extraction-details-2.png)

  ![Extraction Details 3](/images/5-Workshop/5.9-end-to-end-testing/extraction-details-3.png)

#### Kịch bản 5: Tìm kiếm, Lọc dữ liệu và Thống kê (Search, Filter & Dashboard)
* **Mô phỏng thao tác**: 
  1. Chuyển đổi qua lại giữa các tab trạng thái (ví dụ: "Cần hành động", "Đã duyệt").
  2. Gõ tên một nhà cung cấp (ví dụ: "ForceStore") vào ô tìm kiếm.
* **Quy trình hệ thống**:
  1. Frontend gửi yêu cầu truy vấn API với các tham số tương ứng (trạng thái, từ khóa).
  2. Backend thực hiện truy vấn trên DynamoDB và trả về kết quả đã được lọc.
  3. Giao diện cập nhật danh sách hiển thị và các thẻ thống kê tổng số tài liệu theo thời gian thực.
* **Bằng chứng**: 

  ![Filter Evidence 1](/images/5-Workshop/5.9-end-to-end-testing/filter-evidence-1.png)

  ![Filter Evidence 2](/images/5-Workshop/5.9-end-to-end-testing/filter-evidence-2.png)

  ![Filter Evidence 3](/images/5-Workshop/5.9-end-to-end-testing/filter-evidence-3.png)

  ![Filter Evidence 4](/images/5-Workshop/5.9-end-to-end-testing/filter-evidence-4.png)

#### Kịch bản 6: Xuất báo cáo và Xem dữ liệu thô (Export CSV & View JSON)
* **Mô phỏng thao tác**:
  1. Nhấn nút **"Xuất CSV"** ở màn hình danh sách tài liệu.
  2. Mở màn hình chi tiết một tài liệu và nhấn nút **"JSON"** hoặc **"Tải tài liệu gốc"**.
* **Quy trình hệ thống**:
  1. Tính năng xuất CSV gom nhóm dữ liệu của danh sách hiện tại và kích hoạt tải xuống file `.csv` ở trình duyệt.
  2. Nút "JSON" hiển thị trực tiếp dữ liệu thô (Raw JSON) của Textract/AI Proxy đang được lưu trữ ở hệ thống.
* **Bằng chứng**: 

  ![Export CSV and JSON 1](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-1.png)

  ![Export CSV and JSON 2](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-2.png)

  ![Export CSV and JSON 3](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-3.png)

  ![Export CSV and JSON 4](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-4.png)

  ![Export CSV and JSON 5](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-5.png)

  ![Export CSV and JSON 6](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-6.png)

### 3. Kết quả mong đợi (Expected Result)
* Luồng xử lý bất đồng bộ và giao diện hoạt động chính xác cho các kịch bản kiểm thử.
* Cơ chế ghi vết và gửi cảnh báo tự động hoạt động mượt mà khi xảy ra lỗi hoặc khi có hóa đơn cần review.
* Dữ liệu đồng bộ và lưu trữ nhất quán giữa S3 và DynamoDB.
