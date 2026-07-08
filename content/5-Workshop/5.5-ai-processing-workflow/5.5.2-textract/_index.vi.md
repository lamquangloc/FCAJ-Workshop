---
title: "Validate Lambda"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.5.1. </b> "
---
Hàm này chịu trách nhiệm kiểm tra định dạng và kích thước tệp tin tải lên S3 Raw Bucket để đảm bảo tệp tin hợp lệ trước khi bắt đầu bóc tách.

---

### Các bước cấu hình trên AWS Console

1. **Khởi tạo hàm Lambda**:
   * Truy cập dịch vụ **Lambda** ➔ Nhấn **Create function**.
   

   * Chọn **Author from scratch** (Mặc định).
   * **Function name**: Điền `docuflow-dev-workflow-validate-lambda`.
   * **Runtime**: Chọn `Node.js 18.x` hoặc cao hơn.
   * **Architecture**: Chọn `arm64` để tối ưu chi phí và tăng tốc độ xử lý.
   * **Permissions**: Mở rộng **Change default execution role** ➔ Chọn **Use an existing role** ➔ Trỏ đến `docuflow-dev-workflow-validate-lambda-role`.
   * Nhấn **Create function**.


2. **Cấu hình tham số vận hành**:
   * Chuyển sang tab **Configuration** ➔ **General configuration** ➔ Bấm **Edit**.
   

   

   

   

   

   

   * Đổi **Timeout** thành **30 seconds**. Nhấn **Save**.
   * Chọn tiếp mục **Environment variables** (Biến môi trường) ➔ Bấm **Edit**.
   * Thêm biến môi trường:
     * `DOCUFLOW_DEV_RAW_BUCKET` = `docuflow-dev-raw-<AWS_ACCOUNT_ID>-ap-southeast-1`
     * `MAX_FILE_SIZE_BYTES` = `10485760` (tùy chọn; mặc định 10 MB)
   * Nhấn **Save**.


3. **Triển khai Code**:
   * Chuyển sang tab **Code**, copy đoạn mã Node.js v18 dưới đây và dán đè lên code cũ trong editor `index.mjs` của AWS Console.
   * Bấm nút **Deploy** để lưu lại.


{{< source-code file="services/functions/workflow-validate/index.mjs" language="javascript" >}}