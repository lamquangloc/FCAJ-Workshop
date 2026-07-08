---
title: "Chuẩn bị môi trường"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
---


### 1. Mục tiêu (Goal)
Đảm bảo người học truy cập thành công vào AWS Management Console, cài đặt các công cụ cần thiết cho Frontend và chuẩn bị tài liệu mẫu để kiểm thử trước khi tiến hành thực hiện các bài lab.

### 2. Các công cụ cần chuẩn bị
Đối với việc xây dựng và quản trị tài nguyên AWS, **cả nhóm thống nhất sử dụng AWS Management Console (giao diện web trực quan)** để tạo và quản lý dịch vụ thay vì chạy lệnh CLI/SAM.
Người học cần cài đặt các công cụ sau trên máy cá nhân để phục vụ chạy mã nguồn Frontend local:
* **Node.js (v18+)**: Runtime chạy Frontend.
* **Git**: Quản lý mã nguồn.
* **VS Code** (hoặc IDE tương tự): Trình soạn thảo mã nguồn.

### 3. Các bước thực hiện (Steps)
1. **Truy cập AWS Console**: Đăng nhập vào tài khoản AWS được chỉ định cho buổi workshop thông qua giao diện **AWS Management Console** bằng thông tin tài khoản IAM User hoặc AWS IAM Identity Center được cung cấp. Đảm bảo vùng làm việc (Region) trên thanh công cụ AWS Console luôn được chọn là **ap-southeast-1** (Singapore).

   **Điểm kiểm tra:** Xác nhận Console đang sử dụng `ap-southeast-1` trước khi tạo tài nguyên.

2. **Kiểm tra công cụ chạy local**: Đảm bảo máy cá nhân chạy được các lệnh kiểm tra phiên bản:
   ```bash
   node --version
   npm --version
   ```

   **Điểm kiểm tra:** Cả hai lệnh phải trả về số phiên bản hợp lệ.

3. **Chuẩn bị các tệp tin mẫu (Sample files)**: Tải hoặc chuẩn bị sẵn ít nhất 3 loại tệp tin sau để test luồng xử lý:
   * Một ảnh/PDF hóa đơn rõ ràng (để test nhánh thành công `EXTRACTED`).
   * Một ảnh hóa đơn mờ hoặc thiếu thông tin quan trọng (để test nhánh `REVIEW_REQUIRED`).
   * Một file không đúng định dạng (ví dụ tệp `.txt` hoặc dung lượng quá lớn) để kiểm tra luồng lỗi `FAILED`.

   **Điểm kiểm tra:** Giữ sẵn ba tệp mẫu để sử dụng trong phần kiểm thử End-to-End.

4. **Thống nhất Quy tắc đặt tên (Naming Convention)**: 
   * Mọi tài nguyên khởi tạo trong stacks phải bắt đầu bằng prefix: `docuflow-dev-*`.
   * Các nhãn gắn thẻ (Tagging) bắt buộc: `Project=DocuFlowAI`, `Environment=dev`, `Team=AeroOps`.

### 4. Kết quả mong đợi (Expected Result)
* Người học truy cập được AWS Management Console và chuyển vùng về ap-southeast-1 thành công.
* Có sẵn đầy đủ các tệp tin mẫu (Sample files) chuẩn bị cho quá trình chạy thử luồng.