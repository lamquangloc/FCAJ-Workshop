---
title: "Deploy Frontend with AWS Amplify Hosting"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.4.1. </b> "
---
Sử dụng AWS Amplify Hosting để publish frontend React/Vite thành ứng dụng web production. Thực hiện mục này sau khi đã tạo Cognito User Pool và đã có API Gateway Invoke URL ở phần **5.7.3**.

---

### 1. Mục tiêu

Deploy frontend DocuFlow AI từ GitHub, cấu hình biến môi trường production, kiểm tra domain Amplify và xác nhận ứng dụng hosted gọi được backend API.

---

### 2. Điều kiện cần có

Chuẩn bị trước các giá trị sau:

| Variable | Lấy từ đâu |
| --- | --- |
| `VITE_COGNITO_REGION` | AWS Region, ví dụ `ap-southeast-1` |
| `VITE_COGNITO_USER_POOL_ID` | Trang chi tiết Cognito User Pool |
| `VITE_COGNITO_CLIENT_ID` | Trang chi tiết Cognito App client |
| `VITE_API_BASE_URL` | API Gateway stage Invoke URL từ phần 5.7.3 |

> Không đưa server-side secret vào biến Vite. Mọi biến có tiền tố `VITE_` sẽ được bundle vào ứng dụng chạy trên trình duyệt.

---

### 3. Deploy bằng Amplify Hosting

1. Mở console **AWS Amplify**.
2. Chọn **New app** -> **Host web app** hoặc **Deploy an app**.
![Mở AWS Amplify và chọn tạo app mới](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image1.png)
3. Chọn Git provider, ví dụ **GitHub**, rồi authorize AWS Amplify GitHub App nếu được yêu cầu.
![Chọn GitHub làm source repository](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image2.png)
4. Chọn repository chứa mã nguồn frontend.
5. Chọn branch cần deploy, ví dụ `main`.
![Chọn repository và branch deploy](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image3.png)
6. Nếu repository là monorepo, đặt application root là:

```text
apps/web
```

7. Ở trang build settings, kiểm tra hoặc thay build specification bằng nội dung sau:
![Cập nhật build specification](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image4.png)

```yaml
version: 1
applications:
  - appRoot: apps/web
    frontend:
      phases:
        preBuild:
          commands:
            - corepack enable
            - pnpm install --frozen-lockfile
        build:
          commands:
            - pnpm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - apps/web/node_modules/**/*
```

8. Thêm các biến môi trường production:
![Thêm biến môi trường production](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image5.png)

```env
VITE_COGNITO_REGION=ap-southeast-1
VITE_COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.ap-southeast-1.amazonaws.com/dev
```

9. Kiểm tra lại cấu hình và chọn **Save and deploy**.
![Review cấu hình và Save and deploy](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image6.png)
10. Chờ build pipeline hoàn tất. Các stage cần chạy thành công: **Provision**, **Build**, **Deploy** và **Verify**.
11. Mở domain Amplify, ví dụ:
![Amplify deploy thành công và có deployed URL](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image7.png)

```text
https://main.xxxxx.amplifyapp.com
```

---

### 4. Cấu hình SPA Routing

Nếu refresh một route trong frontend bị lỗi 404, thêm rewrite rule trong Amplify:

| Source address | Target address | Type |
| --- | --- | --- |
| `</^[^.]+$|\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |

Lưu rule và redeploy app nếu Amplify yêu cầu.

---

### 5. Kiểm tra frontend đã deploy

1. Mở URL của Amplify app.
![Frontend chạy trên domain Amplify](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image8.png)
2. Đăng ký hoặc đăng nhập bằng Cognito test user.
![Đăng ký tài khoản trên frontend hosted](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image9.png)
3. Nhập mã xác thực được gửi về email để confirm tài khoản.
![Nhập mã xác thực Cognito](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image10.png)
![Email chứa mã xác thực](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image11.png)
![Confirm tài khoản thành công](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image12.png)
4. Kiểm tra user đã được tạo và confirm trong Cognito User Pool.
![User Cognito đã được confirm](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image14.png)
5. Đăng nhập vào dashboard của ứng dụng.
![Dashboard frontend sau khi đăng nhập](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image13.png)
6. Chọn **Upload document** để mở màn hình tải tài liệu.
![Mở chức năng Upload document](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image15.png)
7. Chọn một invoice hoặc document mẫu để upload.
![Chọn file để upload](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image16.png)
![Xem preview tài liệu trước khi upload](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image17.png)
8. Bấm **Upload and process** và chờ frontend gửi file lên backend.
![Bắt đầu upload và xử lý tài liệu](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image18.png)
![Upload hoàn tất và hệ thống bắt đầu xử lý](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image19.png)
9. Mở chi tiết tài liệu để kiểm tra dữ liệu trích xuất và trạng thái review.
![Chi tiết tài liệu sau khi xử lý](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image20.png)
10. Thực hiện review và approve để xác nhận luồng frontend gọi API Gateway thành công.
![Review và approve kết quả xử lý](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image21.png)
11. Mở S3 Raw bucket và kiểm tra file đã xuất hiện đúng prefix:
![File đã xuất hiện trong S3 Raw bucket](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image22.png)

```text
raw/{userId}/{documentId}/original.pdf
```

Nếu trình duyệt báo lỗi CORS, cập nhật cấu hình CORS của API Gateway để allow domain Amplify, sau đó redeploy API stage.

---

### 6. Tài liệu tham khảo

* [Getting started with deploying an app to Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html)
* [Setting up Amplify access to GitHub repositories](https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html)
* [Configuring the build settings for an Amplify application](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
* [Setting environment variables](https://docs.aws.amazon.com/amplify/latest/userguide/setting-env-vars.html)
