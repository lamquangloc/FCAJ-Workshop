---
title: "SES, SNS & Cảnh báo Alarms"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.8.2. </b> "
---
Để nhận thông báo tức thời khi hệ thống xử lý xảy ra lỗi hoặc khi có hóa đơn điểm tin cậy thấp cần duyệt, chúng ta sẽ cấu hình dịch vụ gửi email SES, kênh phân phối SNS và thiết lập 4 báo động tự động CloudWatch Alarms.

Sau khi cấu hình SNS và SES, tiếp tục với **[Notification Trigger Lambda](5.8.2.1-notification-trigger-lambda/)** để gửi cảnh báo `REVIEW_REQUIRED` và lỗi workflow từ Step Functions.

---

### Bước 1: Xác thực Email trên Amazon SES (Tránh Spam)
Do tài khoản AWS của bạn đang ở môi trường Sandbox, bạn cần xác thực địa chỉ email gửi và nhận tin để tránh bị chặn bảo mật:
1. Tại ô tìm kiếm của AWS Console, gõ **SES** ➔ Bấm chọn dịch vụ **Amazon Simple Email Service**.
   
   ![image42.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image42.png)

   

   

   

   

   

   

   

   

2. Ở menu dọc bên trái, chọn **Verified identities** ➔ Bấm nút **Create identity** màu cam.
![image43.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image43.png)
![image44.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image44.png)
3. Cấu hình Identity:
   * **Identity type**: Tích chọn **Email address**.
   ![image45.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image45.png)
   * **Email address**: Nhập chính xác địa chỉ email cá nhân bạn dùng để nhận tin (Ví dụ: `your-email@gmail.com`).
   
   ![image46.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image46.png)

   

   

   

   

   

   

4. Nhấn **Create identity**.
5. **Hành động xác nhận**: AWS SES sẽ gửi một thư xác thực từ hệ thống AWS về hòm thư của bạn. Bạn check mail, bấm vào đường link xác nhận. Trạng thái (Status) email trên console SES sẽ chuyển sang màu xanh **Verified**.
   
   ![image47.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image47.png)

   

   


---

### Bước 2: Khởi tạo Amazon SNS Topic và Đăng ký nhận thư (Subscription)
1. Gõ **SNS** trên thanh tìm kiếm ➔ Chọn **Simple Notification Service**.
![image48.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image48.png)
2. Ở menu bên trái, chọn **Topics** ➔ Nhấn nút **Create topic**.
![image49.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image49.png)
3. Cấu hình Topic:
   * **Type**: Chọn **Standard** (Bắt buộc phải là Standard để hỗ trợ giao thức Email, không chọn FIFO).
   ![image50.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image50.png)
   * **Name**: Điền `docuflow-dev-notification-system-alerts-topic`.
   ![image51.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image51.png)
   * Nhấn **Create topic** ở dưới cùng.
   ![image52.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image52.png)
4. **Đăng ký nhận Email (Create Subscription)**:
   * Tại màn hình chi tiết của Topic vừa tạo, nhìn xuống mục **Subscriptions** ➔ Bấm **Create subscription**.
   ![image53.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image53.png)

   

   

   * **Protocol**: Chọn **Email**.
   ![image54.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image54.png)
   * **Endpoint**: Nhập địa chỉ email cá nhân bạn đã xác thực ở bước SES ở trên.
   ![image55.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image55.png)
   * Nhấn **Create subscription**.
   ![image56.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image56.png)
   ![image57.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image57.png)
   * **Xác thực Subscription**: AWS SNS sẽ gửi một thư xác thực về hòm thư của bạn. Bạn check mail, bấm chọn link **Confirm subscription** trong email nhận được. Trạng thái Subscription trên console sẽ chuyển từ *Pending confirmation* sang **Confirmed**.
   ![image58.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image58.png)
   
   ![image59.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image59.png)

   

   

   

   

   

   

   

   


---

### Bước 3: Thiết lập 4 báo động CloudWatch Alarms

Chúng ta sẽ tạo 4 báo động tự động để gửi cảnh báo email thông qua SNS Topic:

1. **Alarm 1: `docuflow-dev-workflow-failed-alarm` (Step Functions chạy lỗi)**
   *Vào **CloudWatch** ➔ **Alarms** ➔ **All alarms** ➔ Bấm **Create alarm**.
   ![image131.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image131.png)

   * Bấm **Select metric** ➔ Chọn **States** ➔ **StateMachineName** ➔ Chọn metric `ExecutionsFailed` của State Machine dự án.
   
   ![image132.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image132.png)

   

   

   * **Statistic**: Chọn `Sum`. **Period**: Chọn `1 minute`.
   * **Condition**: Static threshold, chọn **Greater/Equal (>=)** và điền số `1`.
   ![image133.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image133.png)
   * Bấm **Next**. Tại mục **Notification**, chọn gửi thông báo tới SNS Topic `docuflow-dev-notification-system-alerts-topic`.
   
   ![image134.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image134.png)
   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   * Bấm **Next** ➔ Đặt tên Alarm: `docuflow-dev-workflow-failed-alarm` ➔ Bấm **Create alarm**.

   
   ![image135.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image135.png)
![image136.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image136.png)

   

   

   

   

   

   

   

   


2. **Alarm 2: `docuflow-dev-sqs-dlq-not-empty-alarm` (Có tin nhắn lỗi kẹt ở DLQ)**
   * Bấm **Create alarm** ➔ **Select metric** ➔ Chọn **SQS** ➔ **QueueName** ➔ Chọn metric `ApproximateNumberOfMessagesVisible` của queue `docuflow-dev-processing-dlq`.
   
   ![image137.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image137.png)

   

   

   * **Statistic**: Chọn `Sum`. **Period**: `1 minute`.

   * **Condition**: Static threshold, **Greater/Equal (>=) 1**.
   ![image138.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image138.png)
   
   * **Action**: Gửi thông báo tới SNS Topic. Đặt tên Alarm: `docuflow-dev-sqs-dlq-not-empty-alarm` ➔ Bấm **Create alarm**.
   ![image139.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image139.png)
   ![image140.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image140.png)
   ![image141.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image141.png)
   
3. **Alarm 3: `docuflow-dev-lambda-ai-proxy-error-alarm` (Hàm AI Proxy gọi API ngoài bị lỗi)**
   * Bấm **Create alarm** ➔ **Select metric** ➔ Chọn **Lambda** ➔ **By Function Name** ➔ `docuflow-dev-ai-proxy-lambda` ➔ chọn metric `Errors`.
   
   ![image142.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image142.png)

   

   

   * **Statistic**: Chọn `Sum`. **Period**: `5 minutes`.
   * **Condition**: **Greater/Equal (>=) 1**.
   ![image143.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image143.png)
   * **Action**: Gửi thông báo tới SNS Topic. Đặt tên Alarm: `docuflow-dev-lambda-ai-proxy-error-alarm` ➔ Bấm **Create alarm**.
   ![image144.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image144.png)
   ![image145.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image145.png)
   ![image146.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image146.png)

   
   

   

   

   

   

   

   

   

   


4. **Alarm 4: `docuflow-dev-low-confidence-spike-alarm` (Đột biến số hóa đơn điểm tin cậy thấp)**
   * Bấm **Create alarm** ➔ **Select metric** ➔ Chọn **Custom Namespaces** ➔ **DocuFlowAI/Metrics** ➔ Chọn metric `InvoicesRequiringHumanReview` (tạo từ Metric Filter ở bài trước).
   ![image147.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image147.png)
   

   

   

   * **Statistic**: Chọn `Sum`. **Period**: `5 minutes`.
   * **Condition**: **Greater/Equal (>=) 5** (Nếu trong 5 phút dính 5 hóa đơn điểm tin cậy thấp, có thể AI đang bị lệch cấu trúc hoặc ảnh mờ hàng loạt).
   ![image148.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image148.png)
   * **Action**: Gửi thông báo tới SNS Topic. 
   ![image149.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image149.png)
   Đặt tên Alarm: `docuflow-dev-low-confidence-spike-alarm` ➔ Bấm **Create alarm**.
     ![image150.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image150.png)
   ![image151.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image151.png)

   
 

   

   

   

   

   

   

   

   


---