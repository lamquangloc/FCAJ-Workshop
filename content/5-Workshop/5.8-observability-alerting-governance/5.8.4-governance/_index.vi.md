---
title: "Governance & Audit Logs"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.8.4. </b> "
---
Để ghi lại lịch sử hoạt động, kiểm vết API và theo dõi mọi thao tác thay đổi cấu hình trên tài khoản AWS của dự án (Audit Logging), chúng ta sẽ thiết lập đường giám sát với AWS CloudTrail.

---

### Các bước cấu hình trên AWS Console

#### Bước 1: Tạo S3 Bucket riêng biệt để chứa Log CloudTrail
Do tiêu chuẩn an ninh không cho phép lưu chung log hệ thống với dữ liệu thô, bạn cần tạo 1 bucket chuyên biệt:
1. Vào dịch vụ **S3** ➔ Bấm **Create bucket**.
2. **Bucket name**: Điền chính xác theo format quy ước: `docuflow-dev-cloudtrail-logs-[mã-ngẫu-nhiên]`.
3. **Region**: Chọn vùng Singapore (`ap-southeast-1`).
![image103.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image103.png)
4. Giữ nguyên mặc định các phần khác (Hệ thống đã tự động bật Block Public Access).
5. Bấm **Create bucket** và sao chép lại tên bucket này.

   ![image104.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image104.png)

#### Bước 2: Khởi tạo và Cấu hình CloudTrail
1. Tại ô tìm kiếm của AWS Console, gõ **CloudTrail** ➔ Chọn dịch vụ **CloudTrail**.

   ![image105.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image105.png)

2. Ở menu bên trái, chọn **Trails** ➔ Bấm nút **Create trail** ở góc phải.
3. Mục 1: **Trail settings (Cấu hình luồng log)**:
   * **Trail name**: Điền chính xác `docuflow-dev-audit-trail`.
   * **Storage location**: Tích chọn ô **Use an existing S3 bucket** (Sử dụng bucket có sẵn).
   * **Trail log bucket**: Bạn bấm chọn hoặc dán tên bucket `docuflow-dev-cloudtrail-logs-[mã-ngẫu-nhiên]` vừa tạo ở Bước 1 vào.
   * **Log file SSE-KMS encryption**: Tích **bỏ chọn (Uncheck)** mục này (Sử dụng mã hóa mặc định của S3 để tránh bị tính thêm phí KMS không cần thiết theo Cost guardrails).
   ![image106.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image106.png)
4. Bấm **Next**.
5. Bước 3: **Chọn sự kiện cần ghi nhận (Choose log events)**
   * **Event type (Loại sự kiện)**: Chỉ tích chọn duy nhất ô **Management events** (Các sự kiện quản trị hạ tầng). Tuyệt đối **KHÔNG** tích chọn: ô *Data events* và *Insights events* (để tránh phát sinh chi phí lớn).
   ![image107.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image107.png)
   * Mục **API activity**: Tích chọn cả **Read** (Xem/đọc cấu hình) và **Write** (Tạo/Sửa/Xóa tài nguyên).
   ![image108.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image108.png)
6. Bấm **Next** ➔ Cuộn xuống cuối cùng bấm **Create trail**.
![image109.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image109.png)
Hệ thống sẽ hiển thị trạng thái luồng log là **Logging** với dấu chấm xanh lục. Kể từ lúc này, mọi hoạt động của nhóm AeroOps trên tài khoản AWS đều có bằng chứng audit không thể chối cãi!
![image110.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image110.png)
