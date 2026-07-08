---
title: "Textract Lambda"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.5.2. </b> "
---
Hàm này nhận đầu vào từ Step Functions, gọi API `AnalyzeExpense` của Amazon Textract để bóc tách thông tin thô, sau đó sử dụng bộ từ điển ánh xạ để định dạng lại dữ liệu thô đưa sang bước chuẩn hóa AI.

---

### Các bước cấu hình trên AWS Console

1. **Khởi tạo hàm Lambda**:
   * Truy cập dịch vụ **Lambda** ➔ Nhấn **Create function**.
   
   ![image1.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image1.png)
   
   * Chọn **Author from scratch** (Mặc định).
   
   ![image2.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image2.png)
   
   * Ở ô **Function name**: Nhập chính xác `docuflow-dev-ai-textract-lambda`.
   
   ![image3.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image3.png)
   
   * **Runtime**: Chọn `Node.js 24.x`.
   
   ![image4.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image4.png)
   
   * Mở rộng **Additional settings** kéo xuống chỗ General **Architecture**: Chọn `arm64` architecture.
   
   ![image5.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image5.png)
   
   * Kế bên ARM64 architecture chọn Custom Execution role: Chọn **Use an existing role** và trỏ đến `docuflow-dev-ai-textract-lambda-role` vừa tạo ở IAM.
   
   ![image6.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image6.png)
   
   * Cuộn xuống chỗ gắn Tag: Kéo xuống tab **Tags**, thêm các tag chuẩn sau để quản lý chi phí và phân quyền: 
     * **Project**: DocuFlowAI
     * **Environment**: dev
     * **ManagedBy**: SAM
     * **Module**: ai
     * **Owner**: Team
     * **CostCenter**: Workshop
       ![image7.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image7.png)
  ![image8.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image8.png)
  ![image9.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image9.png)
  
   * Nhấn **Save** để lưu lại.
   ![image10.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image10.png)
   * Sau đó nhấn nút **Create function** để tạo Function.
  ![image11.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image11.png)
2. **Cấu hình tham số vận hành**:
   * Sau khi tạo xong function chọn cái function vừa tạo rồi kéo xuống chuyển sang tab **Configuration** chọn **General configuration** và nhấn nút **Edit**.
   ![image12.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image12.png)
   
   * Ở chỗ Timeout để là **30 sec** sau đó nhấn nút **Save**.
   ![image13.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image13.png)

3. **Triển khai Code**:
   * Chuyển sang lại tab **Code** bạn hãy copy toàn bộ đoạn code dưới đây, dán đè lên code cũ trong AWS Console và nhấn **Deploy**:

{{< source-code file="services/functions/textract/index.mjs" language="javascript" >}}

4. **Kiểm thử hàm Lambda**:
   * Sau khi deploy thì chuyển sang tab **Test**.
   * Chọn **Create new event**.
   ![image14.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image14.png)
   * Sau đó chọn tiếp **Synchronous**.
   ![image15.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image15.png)
   * Ở chỗ **Event name** đặt tên mà bạn muốn (ví dụ: `Test`).
   ![image16.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image16.png)
   * Ở chỗ **Event JSON** sao chép đoạn code phía dưới. Lưu ý trong S3 phải có đúng định dạng file `raw/user-001/doc-20260628-001/original.pdf`.
     ```json
     {
       "rawS3Bucket": "docuflow-dev-raw-<AWS_ACCOUNT_ID>-ap-southeast-1",
       "rawS3Key": "raw/user-001/doc-20260628-001/original.pdf"
     }
     ```
   ![image17.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image17.png)
   * Cuối cùng nhấn **Save** sau đó nhấn **Test**. Nếu kết quả hiện giống đoạn code phía dưới thì hàm lambda vừa tạo là đúng:
   ![image18.png](/images/5-Workshop/5.5-ai-processing-workflow/5.5.2-textract/image18.png)
     ```json
     {
       "extractedData": {
         "documentId": "doc-20260628-001",
         "summaryFields": {
           "dueDate": {
             "value": "26/02/2019",
             "confidenceScore": 0.9998512268066406
           },
           "invoiceDate": {
             "value": "11/02/2019",
             "confidenceScore": 0.9997476959228515
           },
           "invoiceNumber": {
             "value": "US-001",
             "confidenceScore": 0.9965461730957031
           },
           "subtotalAmount": {
             "value": "145.00",
             "confidenceScore": 0.9998919677734375
           },
           "taxAmount": {
             "value": "9.06",
             "confidenceScore": 0.9991468048095703
           },
           "totalAmount": {
             "value": "$154.06",
             "confidenceScore": 0.9999777221679688
           },
           "vendorName": {
             "value": "East Repair Inc.",
             "confidenceScore": 0.9880215454101563
           }
         },
         "lineItems": [
           {
             "quantity": {
               "value": "1",
               "confidenceScore": 0.9984848785400391
             },
             "description": {
               "value": "Front and rear brake cables",
               "confidenceScore": 0.9999493408203125
             },
             "unitPriceAmount": {
               "value": "100.00",
               "confidenceScore": 0.9999201202392578
             },
             "totalAmount": {
               "value": "100.00",
               "confidenceScore": 0.9999593353271484
             }
           },
           {
             "quantity": {
               "value": "2",
               "confidenceScore": 0.9997554779052734
             },
             "description": {
               "value": "New set of pedal arms",
               "confidenceScore": 0.9998876953125
             },
             "unitPriceAmount": {
               "value": "15.00",
               "confidenceScore": 0.9997454071044922
             },
             "totalAmount": {
               "value": "30.00",
               "confidenceScore": 0.9999018859863281
             }
           },
           {
             "quantity": {
               "value": "3",
               "confidenceScore": 0.9997983551025391
             },
             "description": {
               "value": "Labor 3hrs",
               "confidenceScore": 0.9998870086669922
             },
             "unitPriceAmount": {
               "value": "5.00",
               "confidenceScore": 0.9998588562011719
             },
             "totalAmount": {
               "value": "15.00",
               "confidenceScore": 0.9999015045166015
             }
           }
         ]
       }
     }
     ```
