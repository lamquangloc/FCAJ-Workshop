---
title: "Cấu hình Budget Alerts"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.3.6. </b> "
---
Để quản lý chặt chẽ ngân sách dự án và bảo vệ tài khoản khỏi các chi phí phát sinh bất thường, chúng ta sẽ thiết lập 3 loại Budget cảnh báo chi tiêu hàng tháng qua Email.

---

### Các bước cấu hình 3 ngân sách trên AWS Console

#### Thao tác chung:
1. Gõ **Budgets** trên thanh tìm kiếm AWS Console ➔ Chọn **AWS Budgets**.
   
   ![image166.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image166.png)

   

   

2. Bấm nút **Create budget** ➔ Chọn **Cost budget - Recommended** ➔ Bấm **Next**.
   
   ![image167.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image167.png)

   

   

3. Cấu hình chu kỳ và hạn mức:
   * **Period**: Chọn `Monthly` (Hàng tháng).
   * **Budget planning**: Chọn `Recurring budget`.
   * **Budgeting method**: Chọn `Fixed`.
![image168.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image168.png)

---

#### 1. Ngân sách 1: Ngân sách Chi phí Thực tế (Mềm)
* **Budget Name**: `DocuFlow-Monthly-Actual-Cost`
* **Budget Amount (Hạn mức)**: Điền `$10` USD.
![image169.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image169.png)
* **Cấu hình Alerts (Ngưỡng cảnh báo)**: Bấm **Add alert threshold** để tạo 4 ngưỡng cảnh báo gửi tới email của bạn:
  * Ngưỡng 1: **50% Actual** (Khi chi phí thực tế chạm $5 USD).
  ![image170.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image170.png)
  * Ngưỡng 2: **80% Actual** (Khi chi phí thực tế chạm $8 USD).
  ![image171.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image171.png)
  * Ngưỡng 3: **100% Actual** (Khi chi phí thực tế chạm $10 USD).

   ![image172.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image172.png)

   

   

  * Ngưỡng 4: **100% Forecasted** (Khi hệ thống dự báo chi phí cuối tháng sẽ chạm hoặc vượt $10 USD).
   
   ![image173.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image173.png)

   

   

* **Email recipients**: Điền email của bạn để nhận cảnh báo.
* Bấm **Next** ➔ **Create budget**.
![image174.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image174.png)

---

#### 2. Ngân sách 2: Ngân sách Bảo vệ Quỹ Credits
* **Budget Name**: `DocuFlow-Credit-Safety`
* **Budget Amount (Hạn mức)**: Điền `$50` USD.
* **Mục đích**: Đóng vai trò là cảnh báo leo thang (Escalation Warning) để bảo vệ gói credits $200 của dự án.
* **Cấu hình Alerts**: Thêm các ngưỡng **40%**, **70%**, **90%**, và **100%** cho cả chi phí thực tế (Actual) và dự báo (Forecasted).
   
   ![image175.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image175.png)

---

#### 3. Ngân sách 3: Ngân sách Giám sát Free Tier
* **Budget Name**: `DocuFlow-FreeTier-Watch`
* **Budget Amount (Hạn mức)**: Điền `$1` USD.
* **Mục đích**: Theo dõi sát sao việc vượt quá các hạn mức miễn phí của AWS.
* **Lưu ý quan trọng**: Chỉ sử dụng cảnh báo gửi qua email (Email-only alert), tuyệt đối không bật tính năng **Budget Actions** (tự động khóa/tắt tài nguyên) để tránh làm gián đoạn hệ thống khi đang chạy thử hoặc chạy demo.
   
   ![image176.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image176.png)
