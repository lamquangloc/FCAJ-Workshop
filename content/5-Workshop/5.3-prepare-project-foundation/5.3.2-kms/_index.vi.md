---
title: "Khởi tạo AWS KMS CMK"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.3.2. </b> "
---
Chúng ta sẽ tạo khóa mã hóa đối xứng do khách hàng quản lý (Customer Managed Key) để mã hóa toàn bộ dữ liệu trong S3, DynamoDB và Secrets Manager.

---

### Các bước thực hiện

1. Tại ô tìm kiếm của AWS Console, gõ **kms** ➔ Chọn dịch vụ **Key Management Service (KMS)**.
   
   ![image72.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image72.png)

2. Ở menu bên trái, chọn **Customer managed keys** ➔ Bấm nút **Create key**.
   
   ![image73.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image73.png)

3. Cấu hình loại khóa (Configure key):
   * **Key type**: Chọn **Symmetric** (Khóa đối xứng - bắt buộc theo kiến trúc).
   * **Key usage**: Chọn **Encrypt and decrypt**.
   * Bấm **Next**.

![image74.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image74.png)
4. Thêm Nhãn và Định danh (Add labels):
   * **Alias**: Điền chính xác `docuflow-dev-main-key` (Hệ thống sẽ tự thêm tiền tố `alias/` thành `alias/docuflow-dev-main-key`).


   * **Description**: Điền: `CMK KMS Key for DocuFlow AI project to encrypt S3 buckets, DynamoDB, and Secrets Manager.`
   
   ![image75.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image75.png)

   * Bấm **Next**.


5. Định nghĩa quyền Quản trị khóa (Define Key Administrative Permissions):
   * Tại danh sách User/Role, tích chọn tên tài khoản của bạn (hoặc role Administrator của bạn) để làm người có quyền xóa/sửa khóa này.
   
   ![image76.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image76.png)

   * **Key deletion**: Tích chọn **Allow key administrators to delete this key** (Cho phép xóa khóa khi kết thúc đồ án).
   
   ![image77.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image77.png)

   * Bấm **Next**.


6. Định nghĩa quyền Sử dụng khóa (Define Key Usage Permissions):
   * Đây là bước cực kỳ quan trọng. Bạn cần cấp quyền cho các dịch vụ cốt lõi và các IAM Role của nhóm được phép dùng khóa này để mã hóa/giải mã dữ liệu.
   * Tại danh sách, bạn tích chọn vào tất cả các IAM Role Lambda và Step Functions mà bạn đã tạo ở bước trước (từ Bộ 1 đến Bộ 9, ví dụ: `docuflow-dev-ai-textract-lambda-role`, `docuflow-dev-workflow-stepfunctions-role`,...).
   
   ![image86.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image86.png)

   ![image85.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image85.png)

   ![image84.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image84.png)

   ![image83.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image83.png)

   ![image82.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image82.png)

   ![image81.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image81.png)

   ![image80.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image80.png)

   ![image79.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image79.png)

   ![image78.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image78.png)

   * Bấm **Next**.


7. Xem lại Key Policy (JSON) và Hoàn tất:
   * AWS sẽ tự động sinh ra một đoạn mã Key Policy. Hãy cuộn xuống dưới cùng và bấm **Finish**.
   
   ![image87.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image87.png)
