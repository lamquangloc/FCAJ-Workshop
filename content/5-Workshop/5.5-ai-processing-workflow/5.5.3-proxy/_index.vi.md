---
title: "AI Proxy Lambda"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.5.3. </b> "
---
Hàm này chịu trách nhiệm lấy API Key bảo mật từ AWS Secrets Manager, gửi yêu cầu tới mô hình ngôn ngữ lớn (OpenAI GPT-4o) để chuẩn hóa cấu trúc dữ liệu JSON từ các trường thô trích xuất bởi Textract, đồng thời bảo toàn điểm tin cậy (Confidence score).

---

### Các bước cấu hình trên AWS Console

1. **Khởi tạo hàm Lambda**:
   * Truy cập dịch vụ **Lambda** ➔ Nhấn nút **Create a function**.
   ![image1.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image1.png)
   * Chọn **Author from scratch**.
   ![image2.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image2.png)
   * Ở ô **Function name**: Nhập `docuflow-dev-ai-proxy-lambda` hoặc đặt tên bạn thích.
   
   ![image3.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image3.png)
   
   * **Runtime**: Chọn `Node.js 24.x`.

   ![image4.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image4.png)
   
   * Mở rộng **Additional settings** kéo xuống chọn **Architecture**: `arm64`.
   ![image5.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image5.png)
   * Kế bên ARM64 architecture chọn Execution role: Chọn **Use an existing role** và trỏ đến `docuflow-dev-security-ai-proxy-role` (hoặc role proxy mà bạn đã tạo ở IAM).
   ![image19.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image19.png)
   * Gắn Tag (không bắt buộc): Kéo xuống tab **Tags**, thêm các tag chuẩn sau để quản lý chi phí và phân quyền: 
     * **Project**: DocuFlowAI
     * **Environment**: dev
     * **ManagedBy**: SAM
     * **Module**: ai
     * **CostCenter**: Workshop
     * **Owner**: Team
   ![image20.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image20.png)
   ![image21.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image21.png)
   ![image22.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image22.png)
   * Nhấn **Save** để lưu lại các Tags vừa tạo.
   ![image10.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image10.png)
   * Kéo xuống nhấn nút **Create function** để tạo Lambda.
  ![image11.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image11.png)

2. **Cấu hình tham số vận hành**:
   * Sau khi tạo xong function chọn cái function vừa tạo rồi chuyển sang tab **Configuration** chọn **General configuration** và nhấn nút **Edit**.
   ![image23.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image23.png)
   * Sau đó để **Timeout** là **1 min 10 sec** và nhấn **Save**.
   ![image24.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image24.png)
   * Trong **Environment variables**, thêm:
     * `EXTERNAL_AI_SECRET_ID` = `docuflow-dev-external-ai-api-key`
     * `OPENAI_MODEL` = model được cấp quyền trên tài khoản AI bên ngoài
     * `CONFIDENCE_THRESHOLD` = `0.9`
     * `EXTERNAL_AI_TIMEOUT_MS` = `30000`
3. **Triển khai Code**:
   * Chuyển sang lại tab **Code** bạn hãy copy toàn bộ đoạn code dưới đây, dán đè lên code cũ trong AWS Console và nhấn **Deploy**:

{{< source-code file="services/functions/ai-proxy/index.mjs" language="javascript" >}}

4. **Kiểm thử hàm Lambda**:
   * Sau khi deploy thành công thì chuyển sang tab **Test**.
   ![image25.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image25.png)
   * Chọn **Create new event**.
   ![image26.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image26.png)
   * Sau đó chọn tiếp **Synchronous**.
   ![image27.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image27.png)
   * Ở chỗ **Event name** đặt tên mà bạn muốn (ví dụ: `Test`).
   ![image28.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image28.png)  
   * Ở chỗ **Event JSON** sao chép kết quả test đầu ra của `docuflow-dev-ai-textract-lambda` ở bài trước và dán vào.
   * Cuối cùng nhấn **Save** sau đó nhấn **Test**. Nếu kết quả hiện giống với đoạn code phía dưới là thành công:
   ![image29.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.3-proxy/image29.png)
     ```json
     {
       "status": "EXTRACTED",
       "invoice": {
         "vendorName": "East Repair Inc.",
         "invoiceNumber": "US-001",
         "invoiceDate": "2019-02-11",
         "dueDate": "2019-02-26",
         "currency": "USD",
         "subtotalAmount": 145,
         "taxAmount": 9.06,
         "totalAmount": 154.06
       },
       "lineItems": [
         {
           "lineItemId": "item-001",
           "description": "Front and rear brake cables",
           "quantity": 1,
           "unitPriceAmount": 100,
           "taxAmount": 0,
           "totalAmount": 100,
           "confidenceScore": 0.9996
         },
         {
           "lineItemId": "item-002",
           "description": "New set of pedal arms",
           "quantity": 2,
           "unitPriceAmount": 15,
           "taxAmount": 0,
           "totalAmount": 30,
           "confidenceScore": 0.9998
         },
         {
           "lineItemId": "item-003",
           "description": "Labor 3hrs",
           "quantity": 3,
           "unitPriceAmount": 5,
           "taxAmount": 0,
           "totalAmount": 15,
           "confidenceScore": 0.9999
         }
       ],
       "confidence": {
         "confidenceScore": 0.9976,
         "hasLowConfidence": false,
         "fieldConfidence": {
           "dueDate": 0.9999,
           "invoiceDate": 0.9997,
           "invoiceNumber": 0.9965,
           "subtotalAmount": 0.9999,
           "taxAmount": 0.9991,
           "totalAmount": 1,
           "vendorName": 0.988
         }
       }
     }
     ```