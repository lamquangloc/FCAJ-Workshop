---
title: "Thiết lập & Chạy Frontend"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---
### 1. Mục tiêu (Goal)
Tải mã nguồn Frontend (React/Vite), cấu hình biến môi trường kết nối với các tài nguyên AWS đã tạo ở bước 3, khởi chạy ứng dụng local và xác minh các luồng đăng nhập (Cognito), sinh Presigned URL để tải hóa đơn gốc lên S3 Raw Bucket.

### 2. Các bước thực hiện (Steps)

Phần này chuẩn bị frontend để chạy local. Sau khi backend API đã sẵn sàng, tiếp tục với **[5.4.1 Deploy Frontend with AWS Amplify Hosting](5.4.1-deploy-amplify/)** để publish frontend production URL.

#### Bước 1: Khởi tạo cụm Cognito User Pool
Để người dùng đăng nhập bằng JWT bảo mật trước khi tải file:

1. Trên thanh tìm kiếm của giao diện AWS Console thực hiện tìm kiếm **Cognito**.
   
   ![image1.png](/images/5-Workshop/5.4-setup-and-run-frontend/image1.png)

2. Tại giao diện của Userpools chọn **Create user pool**.
   
   ![image2.png](/images/5-Workshop/5.4-setup-and-run-frontend/image2.png)

3. Tại phần Application type chọn **Single-page application (SPA)**.
   
   ![image3.png](/images/5-Workshop/5.4-setup-and-run-frontend/image3.png)

4. Nhập phần Name your application là `docuflow-dev-auth-user-pool`.
   
   ![image4.png](/images/5-Workshop/5.4-setup-and-run-frontend/image4.png)

5. Phần Options for sign-in identifier tích vào phần **Email**.
   
   ![image5.png](/images/5-Workshop/5.4-setup-and-run-frontend/image5.png)

6. Trong phần Required attributes for sign-up chọn `email`, `family_name`, `given_name`.
   
   ![image6.png](/images/5-Workshop/5.4-setup-and-run-frontend/image6.png)

7. Nhấn **Create user directory** (hoặc Create user pool).
   
   ![image7.png](/images/5-Workshop/5.4-setup-and-run-frontend/image7.png)

8. Lưu lại các trường thông tin `UserPoolID` và `ClientID` để dùng trong file `.env`.
   
   ![image8.png](/images/5-Workshop/5.4-setup-and-run-frontend/image8.png)
   ![image9.png](/images/5-Workshop/5.4-setup-and-run-frontend/image9.png)

9. (Tùy chọn) Dùng các thông tin vừa lưu gán vào file `.env` (chúng ta sẽ thiết lập ở Bước 3).
   
   ![image10.png](/images/5-Workshop/5.4-setup-and-run-frontend/image10.png)

10. Trong phần Userpool hiện tại chọn tab **Groups** để tạo group user.
    
    ![image11.png](/images/5-Workshop/5.4-setup-and-run-frontend/image11.png)

11. Tạo group có tên `docuflow-dev-admin`.
    
    ![image12.png](/images/5-Workshop/5.4-setup-and-run-frontend/image12.png)

12. Nhấn nút **Create group**.
    
    ![image13.png](/images/5-Workshop/5.4-setup-and-run-frontend/image13.png)

13. Thực hiện tương tự nhưng với group name là `docuflow-dev-users` để đạt được kết quả sau:
    
    ![image14.png](/images/5-Workshop/5.4-setup-and-run-frontend/image14.png)

#### Bước 2: Clone mã nguồn & Cài đặt Thư viện
1. Mở Terminal tại thư mục workspace và tiến hành clone mã nguồn dự án:
   ```bash
   git clone https://github.com/AeroOps-AWS-FCAJ/aws-serverless-document-processing-workshop.git
   cd aws-serverless-document-processing-workshop/apps/web
   pnpm install
   pnpm run lint
   pnpm run typecheck
   ```

#### Bước 3: Cấu hình biến môi trường (`.env`)
1. Tạo một tệp tin `.env` trong thư mục `apps/web/` dựa trên file `.env.example`:
   ```env
   VITE_COGNITO_REGION=ap-southeast-1
   VITE_COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
   VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_API_BASE_URL=https://xxxxxxxxx.execute-api.ap-southeast-1.amazonaws.com/dev
   ```
   *Lưu ý: Nếu API Gateway chưa sẵn sàng, bạn có thể bỏ trống `VITE_API_BASE_URL`. Frontend sẽ tự động dùng dữ liệu giả lập (Mock data) để bạn trải nghiệm giao diện.*
2. Lưu tệp tin lại.

#### Bước 4: Chạy ứng dụng và Trải nghiệm (Local Demo Roles)
1. Khởi động server phát triển bằng lệnh:
   ```bash
   pnpm --filter docuflow-ai-web dev
   ```
2. Mở trình duyệt và truy cập vào đường dẫn được cung cấp (ví dụ: `http://localhost:5173`).
3. Trong trường hợp hệ thống Cognito chưa tích hợp hoàn chỉnh, Frontend có hỗ trợ tài khoản giả lập (Mock Auth) lưu trong LocalStorage để bạn trải nghiệm phân quyền:
   * **Nhân viên Tài chính (Finance):** `finance@docuflow.ai` / `password` (Chỉ xem và upload hóa đơn của mình, thực hiện review)
   * **Quản trị viên (Admin):** `admin@docuflow.ai` / `password` (Kiểm tra toàn bộ hệ thống, truy cập Operations)

#### Bước 5: Khởi tạo Lambda Sinh URL Tải lên (`docuflow-dev-api-generate-upload-url-lambda`)
Hàm này sẽ nhận event từ Frontend, tạo một S3 Presigned URL và tạo bản ghi metadata ban đầu trong DynamoDB.
1. Truy cập **Lambda** -> nhấn **Create function** -> **Author from scratch**.
2. **Function name**: `docuflow-dev-api-generate-upload-url-lambda`.
3. **Runtime**: Chọn `Node.js 18.x` hoặc cao hơn.
4. **Role**: Chọn **Use an existing role** -> chọn role `docuflow-dev-security-upload-url-role`.
5. Bấm **Create function**.
6. Tại tab **Configuration** -> **General configuration**: Điều chỉnh Timeout thành **10 seconds**.
7. Tại tab **Configuration** -> **Environment variables**: Thêm các cặp biến:
   * `DOCUFLOW_DEV_TABLE_NAME` = `docuflow-dev-documents-table`
   * `DOCUFLOW_DEV_RAW_BUCKET` = `docuflow-dev-raw-<MÃ_ACCOUNT_AWS>-ap-southeast-1`
8. Quay lại tab **Code**, copy đoạn code sau, dán đè vào `index.mjs` và nhấn **Deploy**:
{{< source-code file="services/functions/generate-upload-url/index.mjs" language="javascript" >}}

#### Bước 5: Chạy ứng dụng local & Kiểm tra tính năng
1. Khởi động Frontend:
   ```bash
   npm run dev
   ```
2. Mở trình duyệt truy cập `http://localhost:5173`.
3. Đăng ký một tài khoản kiểm thử -> Xác nhận qua email để xác thực User Pool hoạt động.
4. Đăng nhập -> Chọn một hóa đơn mẫu định dạng PDF/Image để tải lên hệ thống.
5. Kiểm tra trên AWS Console của S3 Raw Bucket để xác nhận tệp tin đã nằm đúng thư mục `raw/user-xxxx/doc-xxxx/original.pdf`.

### 3. Kết quả mong đợi (Expected Result)
* Ứng dụng chạy mượt mà dưới môi trường Localhost.
* Cơ chế xác thực JWT Cognito hoạt động chuẩn xác.
* Nút tải tài liệu kích hoạt Lambda tạo Presigned URL thành công và đẩy tệp gốc trực tiếp lên S3 Raw Bucket.

### 4. Minh chứng thực hành (Evidence)

Trước khi tiếp tục, hãy xác nhận:

- Ứng dụng React chạy local mà không có lỗi trên console.
- Đăng ký và đăng nhập Cognito thành công.
- Frontend thông báo tải tệp thành công.
- Tệp đã xuất hiện đúng key trong S3 Raw Bucket.