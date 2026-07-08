---
title: "Cấu hình Secrets Manager"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.3.5. </b> "
---
Chúng ta sẽ lưu trữ và mã hóa an toàn khóa truy cập (API Key) của External AI sử dụng dịch vụ AWS Secrets Manager. Khóa bí mật này sẽ được mã hóa bằng KMS Key của dự án, và chỉ duy nhất hàm AI Proxy Lambda mới có quyền lấy giá trị của nó.

### Chuẩn bị External AI API Key

Trước khi tạo secret trong AWS, bạn cần có API key của nhà cung cấp LLM. Trong workshop này, code của AI Proxy Lambda đang gọi OpenAI API tại `/v1/chat/completions` và mặc định sử dụng model `gpt-4o`.

1. Truy cập [OpenAI API keys](https://platform.openai.com/api-keys), đăng nhập hoặc tạo tài khoản OpenAI Platform nếu chưa có.
2. Chọn đúng Project dùng cho workshop, hoặc tạo một Project riêng, ví dụ `docuflow-ai-workshop`.
3. Tạo secret key mới, đặt tên dễ nhận diện, ví dụ `docuflow-dev-ai-proxy`.
4. Sao chép API key ngay khi nó được tạo. OpenAI chỉ hiển thị đầy đủ secret key tại thời điểm tạo; nếu mất key, bạn cần tạo key mới và cập nhật lại secret trong AWS.
5. Kiểm tra tài khoản OpenAI Platform đã có billing/quota phù hợp và model bạn định dùng đã được cấp quyền. Nếu không dùng `gpt-4o`, hãy ghi lại model name để cấu hình biến môi trường `OPENAI_MODEL` ở bước AI Proxy Lambda.

{{% notice warning %}}
Không đưa API key vào frontend, GitHub, file `.env` public hoặc ảnh chụp màn hình. Trong workshop này, API key chỉ được dán vào AWS Secrets Manager với key name `api_key`.
{{% /notice %}}

---

### Các bước thực hiện chi tiết

1. **Khởi tạo Secret Key mới**:
   * Tại ô tìm kiếm của AWS Console, gõ **Secrets Manager** ➔ Chọn dịch vụ tương ứng.
   
   ![image88.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.5-secrets-manager/image88.png)

   

   

   * Nhấn nút **Store a new secret** (Lưu một bí mật mới).
   * **Choose secret type**: Chọn **Other type of secret** (Loại bí mật khác).
   
   ![image89.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.5-secrets-manager/image89.png)

   

   



2. **Cấu hình Cặp khóa/giá trị (Key/value pairs)**:
   * Ô bên trái (**Key**): Điền chữ `api_key` (viết thường, viết liền chuẩn theo code dự án).
   * Ô bên phải (**Value**): Dán mã Token / API Key của External AI của bạn.
   * **Encryption key** (Khóa mã hóa): Nhấp vào menu thả xuống và chọn đúng khóa KMS của dự án: `alias/docuflow-dev-main-key` (Không sử dụng khóa mặc định `aws/secretsmanager` để đảm bảo tiêu chuẩn an toàn thông tin tối đa).
   
![image90.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.5-secrets-manager/image90.png)

   

   

   

   * Nhấn **Next**.


3. **Đặt tên và mô tả bí mật**:
   * **Secret name**: Điền chính xác `docuflow-dev-external-ai-api-key`.
   
   ![image91.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.5-secrets-manager/image91.png)

   

   

   * **Description**: `Stores API Key for External AI normalization integration used exclusively by AI Proxy Lambda.`
   
   ![image91.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.5-secrets-manager/image91.png)

   

   

   * Các phần khác giữ nguyên mặc định, nhấn **Next** ➔ Bỏ qua cấu hình xoay vòng (Rotation) nhấn **Next** ➔ Nhấp **Store** ở dưới cùng để hoàn tất.
      ![image92.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.5-secrets-manager/image92.png)

   ![image93.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.5-secrets-manager/image93.png)

   

   

   

   

   

   

   

   

   


4. **Ghi lại ARN của Secret**:
   * Sau khi lưu xong, nhấp vào tên Secret vừa tạo.
   * Sao chép lại chuỗi **Secret ARN** của nó (Ví dụ: `arn:aws:secretsmanager:ap-southeast-1:<AWS_ACCOUNT_ID>:secret:docuflow-dev-external-ai-api-key-XXXXXX`).

5. **Cấp quyền chuyên biệt cho duy nhất AI Proxy Lambda (Chốt chặn bảo mật)**:
   * Để cấu hình chính xác con Lambda của bạn được đọc bí mật này, bạn thực hiện cấu hình IAM Policy như sau:
     1. Vào dịch vụ **IAM** ➔ **Policies** ➔ `docuflow-dev-ai-secret-read-policy` ➔ Chọn tab **JSON** ➔ **Edit**.
     2. Xóa hết code cũ và dán đoạn JSON "quyền tối thiểu" sau vào (Hãy thay chuỗi ARN bí mật của bạn vào phần Resource nếu muốn bảo mật tuyệt đối, hoặc giữ dấu `*` ở đuôi như dưới):
     
     ![image94.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.5-secrets-manager/image94.png)
     
     3. Bấm **Next** rồi chọn **Save changes**.
     
     ![image95.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.5-secrets-manager/image95.png)

---