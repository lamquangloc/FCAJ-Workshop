---
title: "Các hàm Lambda quản lý dữ liệu"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.7.2. </b> "
---
AWS Lambda là gì? Lambda là dịch vụ giúp bạn chạy code (mã lập trình) mà không cần phải đi thuê nguyên một máy chủ (server) rườm rà. Hệ thống module dữ liệu của chúng ta cần 4 hàm Lambda nhỏ để nhận lệnh từ người dùng và đi đọc/ghi dữ liệu vào S3 và DynamoDB.

---

### BƯỚC 3.1: Tạo hàm lấy chi tiết tài liệu (Get Document Lambda)

Hàm này có nhiệm vụ: Khi người dùng bấm xem chi tiết chứng từ (API `GET /documents/{documentId}`), hàm sẽ đi lấy dữ liệu chi tiết trả về cho họ.

1. **Truy cập dịch vụ Lambda**:
   * Tại thanh tìm kiếm trên cùng của AWS Console, nhập Lambda và chọn dịch vụ **Lambda**.
   ![image24.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image24.png)
2. **Khởi tạo hàm**:
   * Nhấn nút **Create function** ở góc phải màn hình.
   * Chọn tùy chọn **Author from scratch** (Mặc định).
   ![image25.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image25.png)
   

3. **Cấu hình thông tin cơ bản (Basic information)**:
   * **Function name**: Nhập chính xác tên chuẩn mã nguồn: `docuflow-dev-data-get-document-lambda`. Hoặc đặt tên theo yêu cầu của bản đặt ra.
   * **Runtime**: Chọn ngôn ngữ lập trình thống nhất của dự án (Ví dụ: `Node.js 24.x`).
   ![image26.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image26.png)
   * **Architecture**: Chọn `arm64`.
4. **Cấu hình quyền hạn (Permissions)**:
   * Kéo xuống và bấm mở rộng mục **Additional settings**.
   ![image27.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image27.png)
   * Tại mục **Custom execution role**, chọn **Use an existing role** và chọn role `docuflow-dev-data-lambda-role` đã được tạo ở phần IAM.
   
   ![image28.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image28.png)
   * Nhấn **Save**.
   ![image29.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image29.png)
5. **Nhập tags**:
   * Nhấn vào tags.
   * Chọn các tags cần thiết theo thiết lập (Ví dụ: Project: DocuFlowAI).
   ![image30.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image30.png)
   * Nhấn **Save**.
   ![image31.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image31.png)
6. Nhấn nút **Create function** để tạo lambda.
   ![image32.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image32.png)

Khi hàm được tạo xong, bạn sẽ thấy giao diện quản lý. Tại mục **Code source**, bạn có thể dán code lập trình dưới đây vào và bấm nút **Deploy** (Triển khai) để lưu code.
![image33.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image33.png)

---

**Mã nguồn (`index.mjs`)**:

{{< source-code file="services/functions/get-document/index.mjs" language="javascript" >}}

---

### BƯỚC 3.2: TẠO HÀM LIST DOCUMENTS LAMBDA

Hàm này giúp lấy danh sách toàn bộ chứng từ của người dùng hoặc lọc những chứng từ bị lỗi (API `GET /documents`).

1. Quay lại giao diện chính của dịch vụ Lambda (bấm vào chữ **Functions** ở menu bên trái).
![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image34.png)
2. Nhấn nút **Create function** và chọn **Author from scratch**.
   ![image35.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image35.png)

3. **Cấu hình thông tin cơ bản**:
   * **Function name**: Nhập chính xác `docuflow-dev-data-list-documents-lambda`. Hoặc đặt tên theo yêu cầu của bạn đặt ra.
   * **Runtime**: Chọn ngôn ngữ lập trình thống nhất của dự án (`Node.js 24.x`).
   ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image36.png)
   * **Architecture**: Chọn `arm64`.
4. **Cấu hình quyền hạn**:
   * Bấm mở rộng mục **Additional settings**.
   * Tại mục **Custom execution role**, chọn **Use an existing role** và chọn role `docuflow-dev-data-lambda-role`.
   ![image37.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image37.png)

5. **Nhập tags**:
   * Nhấn vào tags, chọn các tags cần thiết theo thiết lập.
   ![image38.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image38.png)
   * Nhấn **Save**.
   ![image39.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image39.png)
6. Nhấn nút **Create function**.
   ![image40.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image40.png)
   
Khi hàm được tạo xong, tại mục Code source, bạn có thể dán code lập trình vào và bấm nút **Deploy** (Triển khai) để lưu code.
   ![image41.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image41.png)



---

**Mã nguồn (`index.mjs`)**:

{{< source-code file="services/functions/list-documents/index.mjs" language="javascript" >}}

---

### BƯỚC 3.3: TẠO HÀM REVIEW UPDATE LAMBDA

Hàm này dùng để lưu lại các thông tin mà người dùng sửa tay trên giao diện (ví dụ: AI nhận diện sai số tiền và người dùng sửa lại).

1. Nhấn **Create function** ➔ **Author from scratch**.
   ![image42.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image42.png)

2. **Cấu hình thông tin cơ bản**:
   * **Function name**: Nhập chính xác `docuflow-dev-data-review-update-lambda`.
   * **Runtime**: Chọn ngôn ngữ lập trình thống nhất của dự án (`Node.js 24.x`).
   ![image43.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image43.png)
   * **Architecture**: Chọn `arm64`.
3. **Cấu hình quyền hạn**:
   * Bấm mở rộng mục **Additional settings**.
   * Tại mục **Custom execution role**, chọn **Use an existing role** và chọn role `docuflow-dev-data-lambda-role`.
   ![image44.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image44.png)

4. **Thêm tags**:
   * Nhấn vào tags, chọn các tags cần thiết theo thiết lập.
   ![image45.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image45.png)
   * Nhấn **Save**.
   ![image46.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image46.png)
5. Nhấn nút **Create function**.
   ![image47.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image47.png)
6.	Hàm này dùng để lưu lại các thông tin mà người dùng sửa tay trên giao diện (ví dụ: AI nhận diện sai số tiền và người dùng sửa lại)
![image48.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image48.png)
---

**Mã nguồn (`index.mjs`)**:

{{< source-code file="services/functions/review-update/index.mjs" language="javascript" >}}

---

## Lambda mở rộng (Phần làm thêm của dự án)

Ba hàm dưới đây **không nằm trong danh sách Lambda MVP đã được duyệt**. Đây là các phần làm thêm cho chức năng xóa tài liệu, dữ liệu Dashboard và điều khiển process/retry chủ động. Chỉ triển khai khi sử dụng các route API và giao diện mở rộng tương ứng.

### LAMBDA MỞ RỘNG E1: Tạo hàm Delete Document

Hàm này dùng để xóa dữ liệu 1 hoặc nhiều document của user mà user muốn xóa.

1. Nhấn **Create function** ➔ **Author from scratch**.
![image49.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image49.png)
2. **Cấu hình thông tin cơ bản**:
   * **Function name**: Nhập chính xác `docuflow-dev-data-delete-lambda`.
   * **Runtime**: Chọn ngôn ngữ lập trình thống nhất của dự án (`Node.js 24.x`).
   ![image50.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image50.png)
   * **Architecture**: Chọn `arm64`.
3. **Cấu hình quyền hạn**:
   * Bấm mở rộng mục **Additional settings**.
   * Tại mục **Custom execution role**, chọn **Use an existing role** và chọn role `docuflow-dev-data-lambda-role`.
   
   ![image51.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image51.png)

4. **Thêm tags**:
   * Nhấn vào tags, chọn các tags cần thiết theo thiết lập.
    ![image52.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image52.png)
   * Nhấn **Save**.
   ![image53.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image53.png)
5. Nhấn nút **Create function**.
   ![image54.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image54.png)

6. Hàm này dùng để xóa dữ liệu 1 hoặc nhiều document của user mà user muốn xóa.
   ![image55.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image55.png)

---

**Mã nguồn (`index.mjs`)**:

{{< source-code file="services/functions/delete-document/index.mjs" language="javascript" >}}

---

### LAMBDA MỞ RỘNG E2: TẠO DASHBOARD LAMBDA

Hàm `dashboard` tổng hợp KPI, hoạt động gần đây, cảnh báo và phân bố trạng thái để phục vụ Dashboard. Tạo Lambda `docuflow-dev-data-dashboard-lambda` bằng cùng runtime, kiến trúc và execution role của nhóm Data Lambda.

**Mã nguồn (`index.mjs`)**:

{{< source-code file="services/functions/dashboard/index.mjs" language="javascript" >}}

---

### LAMBDA MỞ RỘNG E3: TẠO PROCESS CONTROL LAMBDA

Hàm `process-control` xác thực quyền sở hữu tài liệu, kiểm tra object trong S3 Raw và khởi chạy lại Step Functions khi người dùng yêu cầu retry hoặc process. Tạo Lambda `docuflow-dev-data-process-control-lambda` bằng cùng runtime và kiến trúc của nhóm Data Lambda; execution role cần quyền đọc S3 Raw, đọc/ghi DynamoDB và `states:StartExecution`.

**Mã nguồn (`index.mjs`)**:

{{< source-code file="services/functions/process-control/index.mjs" language="javascript" >}}

---

### CẤU HÌNH CHUNG: BIẾN MÔI TRƯỜNG & TIMEOUT

Code của chúng ta cần biết tên bảng và tên Bucket là gì để kết nối. Ngoài ra, việc đọc file đôi khi tốn thời gian, ta cần tăng thời gian chờ mặc định lên để hàm không bị ngắt ngang.

Thực hiện các bước sau cho **ba Data Lambda cốt lõi và các Lambda mở rộng mà bạn chọn triển khai**:

1. Tại giao diện chi tiết của từng hàm Lambda đã tạo, chuyển sang tab **Configuration**.
 ![image56.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image56.png)
2. Chọn mục **General configuration** ở menu dọc bên trái, nhấn nút **Edit**.
![image57.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image57.png)
3. Thay đổi **Timeout** từ 3 sec (Mặc định) lên **10 seconds** (hoặc 15 giây) để đảm bảo hàm không bị ngắt giữa chừng khi truy vấn dữ liệu lớn hoặc đọc file từ S3.
![image58.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image58.png)
Nhấn **Save**.
![image59.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image59.png)
4. Chọn mục **Environment variables** ở menu dọc bên trái:
![image60.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image60.png)
   * Nhấn nút **Edit**, sau đó chọn **Add environment variable**.
   * **Cặp biến thứ nhất**:
     * **Key**: `DOCUFLOW_DEV_TABLE_NAME`
     * **Value**: `docuflow-dev-documents-table`
   * **Cặp biến thứ hai**:
     * **Key**: `DOCUFLOW_DEV_PROCESSED_BUCKET`
     * **Value**: Nhập đúng tên bucket S3 Processed (ví dụ: `docuflow-dev-processed-<MÃ_ACCOUNT_AWS>-ap-southeast-1`)
   * **Cặp biến thứ ba**:
     * **Key**: `DOCUFLOW_DEV_RAW_BUCKET`
     * **Value**: Nhập đúng tên bucket S3 Raw (ví dụ: `docuflow-dev-raw-<MÃ_ACCOUNT_AWS>-ap-southeast-1`)
   * Riêng **Process Control**, thêm `DOCUFLOW_DEV_STATE_MACHINE_ARN` với ARN của processing State Machine đã triển khai.
   * Riêng **Dashboard**, có thể thêm `DOCUFLOW_DEV_VND_EXCHANGE_RATES` dưới dạng JSON khi cần quy đổi tổng báo cáo sang VND.

![image61.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image61.png)

5. Nhấn **Save** để áp dụng.
![image62.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.2-lambdas/image62.png)

Sau khi cấu hình xong các hàm đã chọn, các Lambda đã sẵn sàng tích hợp với API Gateway và Step Functions của hệ thống.

---
