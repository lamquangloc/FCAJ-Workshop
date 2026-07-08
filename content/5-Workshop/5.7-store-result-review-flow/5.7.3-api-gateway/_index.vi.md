---
title: "Cấu hình API Gateway"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.7.3. </b> "
---
Trong phần này, chúng ta sẽ cấu hình Amazon API Gateway để làm cổng giao tiếp (API Endpoint) cho tất cả các Lambda functions đã tạo, đồng thời tích hợp xác thực người dùng bằng Cognito Authorizer.

---

### Bước 1: Tạo Resource API Gateway

1. Tìm kiếm **API Gateway** trên giao diện AWS Console.
   
   ![image15.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image15.png)

2. Tại giao diện API Gateway chọn API được tạo trước đó.
   
   ![image16.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image16.png)
   
3. Chọn resourece `document` đã tạo trước đó.
   
   ![image17.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image17.png)
   
4. Chọn **Create resource**.
   
   ![image18.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image18.png)
   
5. Nhập vào tên resource `{documentId}`.
   
   ![image19.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image19.png)
   
6. Nhấn **Create resource**.
   
   ![image20.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image20.png)
   
7. Thực hiện tương tự với các resource theo cấu trúc sau:
   * `/documents/{documentId}/process`
   
     ![image21.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image21.png)
     ![image22.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image22.png)
     ![image23.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image23.png)
     ![image24.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image24.png)
   
   * `/documents/{documentId}/review`
   
     ![image25.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image25.png)
     ![image26.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image26.png)
   
8. Kiểm tra kết quả cấu trúc được tạo đúng chưa.
   
   ![image27.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image27.png)

---

### Bước 2: Tạo Methods và kết nối Lambda

1. Tại resource `document` chọn **Create method**.
   
   ![image28.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image28.png)
   
2. Chọn **GET** method.
   
   ![image29.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image29.png)
   
3. Bật tích phần **Lambda proxy integration**.
   
   ![image30.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image30.png)
   
4. Ở phần Lambda function chọn lambda có đuôi `docuflow-dev-data-list-documents-lambda`.
   
   ![image31.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image31.png)
   
5. Chọn **Create method**.
   
   ![image32.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image32.png)

6. Thực hiện tương tự lần lượt với các method và gắn với Lambda như sau. Các route được đánh dấu **mở rộng** phụ thuộc vào ba Lambda mở rộng ở mục 5.7.2 và không bắt buộc trong MVP đã duyệt:
   
   * **Mở rộng:** `DELETE /documents` ➔ `docuflow-dev-data-delete-lambda`
     ![image33.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image33.png)
     ![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image34.png)
     ![image35.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image35.png)
     ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image36.png)
     
   * **Mở rộng:** `DELETE /documents/{documentId}` ➔ `docuflow-dev-data-delete-lambda`
     ![image33.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image33.png)
     ![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image34.png)
     ![image35.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image35.png)
     ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image36.png)
     
   * `GET /documents/{documentId}` ➔ `docuflow-dev-data-get-document-lambda`
     ![image37.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image37.png)
     ![image38.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image38.png)
     ![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image34.png)
     ![image39.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image39.png)
     ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image36.png)
     
   * **Mở rộng:** `POST /documents/{documentId}/process` ➔ `docuflow-dev-data-process-control-lambda`
     ![image40.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image40.png)
     ![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image34.png)
     ![image41.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image41.png)
     ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image36.png)
     
   * `PATCH /documents/{documentId}/review` ➔ `docuflow-dev-data-review-update-lambda`
     ![image42.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image42.png)
     ![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image34.png)
     ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image36.png)
     ![image43.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image43.png)

   * **Mở rộng:** `POST /documents/{documentId}/retry` ➔ `docuflow-dev-data-process-control-lambda`
   * `POST /documents/upload-url` ➔ `docuflow-dev-api-generate-upload-url-lambda`
   * **Mở rộng:** `GET /notifications` ➔ `docuflow-dev-data-dashboard-lambda`
   * **Mở rộng:** `PATCH /notifications/{notificationId}` ➔ `docuflow-dev-data-dashboard-lambda`
   * **Mở rộng:** `GET /activity` ➔ `docuflow-dev-data-dashboard-lambda`
   * **Mở rộng:** `GET /reports/summary` ➔ `docuflow-dev-data-dashboard-lambda`

---

### Bước 3: Cấu hình Authorizer (Cognito)

1. Ở trang API hiện tại chọn **Authorizers** ở thanh bên trái.
   
   ![image44.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image44.png)
   
2. Tại trang này nhấn chọn **Create authorizer**.
   
   ![image45.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image45.png)
   
3. Tại trang này nhập name là `docuflow-dev-cognito-authorizer`.
   
   ![image46.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image46.png)
   
4. Chỉnh sang kiểu xác thực **Cognito**.
   
   ![image47.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image47.png)
   
5. Chọn Userpool của Cognito đã tạo trước đó.
   
   ![image48.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image48.png)
   
6. Thêm `Authorization` vào Token source.
   
   ![image49.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image49.png)
   ![image50.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image50.png)
   
7. Nhấn **Create authorizer**.
   
   ![image51.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image51.png)

---

### Bước 4: Áp dụng Authorizer vào các Method

1. Tại giao diện của `DELETE Method` của `/documents`. Trong phần method request setting chọn **Edit**.
   
   ![image52.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image52.png)
   
2. Chọn Authorization vừa tạo trước đó và nhấn **Save**.
   
   ![image53.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image53.png)
   ![image54.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image54.png)
   
3. Thực hiện tương tự cho các method còn lại:
   * `GET /documents`
   * `DELETE /documents` *(mở rộng)*
   * `GET /documents/{documentId}`
   * `DELETE /documents/{documentId}` *(mở rộng)*
   * `POST /documents/{documentId}/process` *(mở rộng)*
   * `POST /documents/{documentId}/retry` *(mở rộng)*
   * `PATCH /documents/{documentId}/review`
   * `POST /documents/upload-url`
   * `GET /notifications` *(mở rộng)*
   * `PATCH /notifications/{notificationId}` *(mở rộng)*
   * `GET /activity` *(mở rộng)*
   * `GET /reports/summary` *(mở rộng)*

---

### Bước 5: Deploy API và tích hợp vào Frontend

1. Sau đó tại trang của API hiện tại ấn **Deploy API**.
   
   ![image55.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image55.png)
   
2. Tại giao diện này chọn mục **New stage** và nhập `dev` vào Stage name, nhấn **Deploy**.
   
   ![image56.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image56.png)
   
3. Sau khi tạo sẽ hiển thị trang của Stage, lưu lại **Invoke URL** để dùng vào code.
   
   ![image57.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image57.png)
   ![image58.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image58.png)
   ![image59.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image59.png)
   ![image60.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image60.png)
   ![image61.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image61.png)
   ![image62.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image62.png)
   
4. Dán đoạn URL vừa nhận được vào phần `VITE_API_GATEWAY_URL` (hoặc `VITE_API_BASE_URL`) trong file `.env` của frontend.
   
   ![image63.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image63.png)
