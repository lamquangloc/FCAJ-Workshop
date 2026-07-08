---
title: "Cấu hình S3 Buckets"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3.3. </b> "
---
## PHẦN 1: TẠO AMAZON S3 RAW BUCKET

1. Vào dịch vụ **S3** → **Buckets** → **Create bucket**.
![image2.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image2.png)
2. Điền các thông tin:
   - **Bucket name:** `docuflow-dev-raw-{accountId}-ap-southeast-1`
   - **AWS Region:** Asia Pacific (Singapore) ap-southeast-1
   ![image3.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image3.png)
   - **Object Ownership:** ACLs disabled
   - **Block all public access:** ON
   - **Bucket Versioning:** Off cho MVP
   ![image4.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image4.png)
   - **Default encryption:** AWS KMS key
   ![image5.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image5.png)
3. Phần Tag: 
   | Key | Value |
   | --- | --- |
   | Project | DocuFlowAI |
   | Environment | dev |
   | ManagedBy | Console |
   | Owner | Team |
   | Module | ingestion |
   | Name | docuflow-dev-raw-{accountId}-ap-southeast-1 |

4. Bấm **Create bucket**.
![image6.png](/images/5-Workshop/5.6-document-ingestion-pipeline/image6.png)

---

## PHẦN 2: TẠO AMAZON S3 PROCESSED BUCKET

Amazon S3 là gì? Bạn hãy tưởng tượng S3 giống như một ổ cứng không giới hạn dung lượng trên Internet (tương tự Google Drive). Trong dự án này, Bucket (thùng chứa) này sẽ được dùng để cất giữ các tệp dữ liệu kết quả dạng JSON sau khi AI đã đọc, xử lý và chuẩn hóa xong.

### 1. Truy cập dịch vụ S3:
Trên thanh tìm kiếm ở trên cùng, nhập S3 và chọn dịch vụ S3.

### 2. Bắt đầu tạo Bucket:
Tại giao diện S3, nhấn nút **Create bucket**.

### 3. Cấu hình thông tin cơ bản (General configuration):
* **Bucket name**: Nhập tên chuẩn xác theo công thức: `docuflow-dev-processed-<MÃ_ACCOUNT_AWS_CỦA_BẠN>-ap-southeast-1`.
* **AWS Region**: Chọn khu vực Singapore (ap-southeast-1) để tốc độ kết nối về Việt Nam nhanh nhất.
![Cấu hình bucket processed](/images/5-Workshop/5.3-prepare-project-foundation/5.3.3-s3/image7.png)

### 4. Cấu hình bảo mật (Block Public Access):
Kéo xuống mục **Block Public Access settings for this bucket**. Để dữ liệu của chúng ta được an toàn và không bị người lạ trên mạng đọc được, hãy đảm bảo rằng ô vuông **Block all public access** (Chặn mọi quyền truy cập công khai) đã được tích chọn.

### 5. Mã hóa dữ liệu (Default encryption):
Cuộn xuống mục **Encryption type** (Loại mã hóa), hãy chọn dòng **Server-side encryption with Amazon S3 managed keys (SSE-S3)** để AWS tự động mã hóa bảo vệ các file của bạn.
![Tags và mã hóa bucket processed](/images/5-Workshop/5.3-prepare-project-foundation/5.3.3-s3/image8.png)

### 6. Hoàn tất:
Cuộn xuống cuối trang và nhấn **Create bucket**.
![Bucket processed đã được tạo](/images/5-Workshop/5.3-prepare-project-foundation/5.3.3-s3/image1.png)

### 7. Tạo folder chứa dữ liệu theo cấu trúc
*(Ví dụ: `processed/{userId}/{documentId}/result.json`)*
Nhấn vào nút **Create folder** để tạo folder Processed:

---

## PHẦN 3: BẬT S3 BLOCK PUBLIC ACCESS VÀ ENCRYPTION BẰNG KMS KẾT HỢP

> **Lưu ý:** Các bước này dùng để cấu hình bổ sung tính năng chặn truy cập và mã hóa KMS (SSE-KMS) cho cả 2 bucket (Raw và Processed) theo kiến trúc bảo mật của dự án.

### + Cho Processed Bucket

**Bước 1: Bật S3 Block Public Access (Chặn truy cập công khai)**
1. Tại ô tìm kiếm của AWS Console, gõ **S3** ➔ Chọn dịch vụ **S3**.
2. Tìm và bấm vào Tên Bucket bạn muốn cấu hình.
![Danh sách bucket S3](/images/5-Workshop/5.3-prepare-project-foundation/5.3.3-s3/image1.png)
3. Chọn tab **Permissions** (Quyền truy cập).
4. Ngay mục đầu tiên Block public access (bucket settings), bấm nút **Edit** (Chỉnh sửa) ở bên phải.
5. Tích chọn vào ô **Block all public access** (Hệ thống sẽ tự động tích cả 4 ô nhỏ bên dưới).
![Bật Block Public Access cho S3 bucket](/images/5-Workshop/5.3-prepare-project-foundation/5.3.3-s3/image3.png)
6. Bấm **Save changes** (Lưu thay đổi).

### + Cho Raw Bucket

**Bước 1: Bật S3 Block Public Access (Chặn truy cập công khai)**
1. Tại ô tìm kiếm của AWS Console, gõ **S3** ➔ Chọn dịch vụ **S3**.
2. Tìm và bấm vào Tên Bucket bạn muốn cấu hình.
![Danh sách bucket S3](/images/5-Workshop/5.3-prepare-project-foundation/5.3.3-s3/image1.png)
3. Chọn tab **Permissions** (Quyền truy cập).
4. Ngay mục đầu tiên Block public access (bucket settings), bấm nút **Edit** (Chỉnh sửa) ở bên phải.
5. Tích chọn vào ô **Block all public access** (Hệ thống sẽ tự động tích cả 4 ô nhỏ bên dưới).
![Bật Block Public Access cho S3 bucket](/images/5-Workshop/5.3-prepare-project-foundation/5.3.3-s3/image3.png)
6. Bấm **Save changes** (Lưu thay đổi).

### + Cho Raw Bucket

**Bước 2: Bật mã hóa S3 Encryption bằng khóa KMS của dự án**
1. Vẫn ở trong giao diện Bucket đó, bạn chuyển sang tab **Properties** (Thuộc tính).
2. Cuộn xuống tìm mục **Default encryption** (Mã hóa mặc định) ➔ Bấm nút **Edit**.
3. Cấu hình chính xác như sau để đạt điểm bảo mật tối đa:
   * **Encryption type**: Chọn **Server-side encryption with AWS Key Management Service keys (SSE-KMS)**.
   * **AWS KMS key**: Chọn tùy chọn **Choose from your AWS KMS keys** (Chọn từ danh sách khóa KMS của bạn).
   * Tại ô tìm kiếm khóa, bạn bấm vào và chọn đúng tên khóa `alias/docuflow-dev-main-key` mà bạn đã tạo ở các bước trước.
   * **Bucket Key**: Chọn **Enable** (Giúp giảm chi phí gọi sang dịch vụ KMS khi hệ thống xử lý lượng lớn hóa đơn).
![Chọn khóa KMS cho S3 bucket](/images/5-Workshop/5.3-prepare-project-foundation/5.3.3-s3/image4.png)
4. Bấm **Save changes** để hoàn tất.

### + Cho Processed Bucket

**Bước 2: Bật mã hóa S3 Encryption bằng khóa KMS của dự án**
1. Vẫn ở trong giao diện Bucket đó, bạn chuyển sang tab **Properties** (Thuộc tính).
2. Cuộn xuống tìm mục **Default encryption** (Mã hóa mặc định) ➔ Bấm nút **Edit**.
3. Cấu hình chính xác như sau để đạt điểm bảo mật tối đa:
   * **Encryption type**: Chọn **Server-side encryption with AWS Key Management Service keys (SSE-KMS)**.
   * **AWS KMS key**: Chọn tùy chọn **Choose from your AWS KMS keys** (Chọn từ danh sách khóa KMS của bạn).
   * Tại ô tìm kiếm khóa, bạn bấm vào và chọn đúng tên khóa `alias/docuflow-dev-main-key` mà bạn đã tạo ở các bước trước.
   * **Bucket Key**: Chọn **Enable** (Giúp giảm chi phí gọi sang dịch vụ KMS khi hệ thống xử lý lượng lớn hóa đơn).
![Chọn khóa KMS cho S3 bucket](/images/5-Workshop/5.3-prepare-project-foundation/5.3.3-s3/image4.png)
4. Bấm **Save changes** để hoàn tất.
