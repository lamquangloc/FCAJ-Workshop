---
title: "Bản đề xuất"
date: 2026-07-04
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# DocuFlow AI - Serverless Invoice & Receipt Processing Platform trên AWS

### 1. Tóm tắt điều hành
DocuFlow AI là nền tảng xử lý hóa đơn và biên nhận tự động được thiết kế bởi team AeroOps. Nền tảng sử dụng kiến trúc AWS Serverless kết hợp AI để giải quyết bài toán nhập liệu thủ công của các nhóm tài chính/kế toán. Hệ thống tự động trích xuất dữ liệu từ các tệp PDF/JPG/PNG thông qua Amazon Textract và chuẩn hóa bằng External AI API. Với quy trình bất đồng bộ (asynchronous workflow) thông qua EventBridge, SQS và Step Functions, giải pháp đảm bảo độ tin cậy cao, khả năng mở rộng tốt và tối ưu hóa chi phí vận hành.

### 2. Tuyên bố vấn đề
*Vấn đề hiện tại*
Các nhóm tài chính và vận hành SME (doanh nghiệp vừa và nhỏ) thường xuyên phải xử lý lượng lớn hóa đơn, biên nhận và chứng từ. Việc nhập liệu thủ công vào spreadsheet hoặc hệ thống kế toán dẫn đến sai sót thông tin (vendor, số tiền, ngày tháng), mất nhiều thời gian, file nằm rải rác khó tìm kiếm và không có hệ thống cảnh báo, theo dõi trạng thái.

*Giải pháp*
DocuFlow AI tự động hóa toàn bộ quy trình này. Người dùng tải file lên qua giao diện web bảo mật bằng Amazon Cognito và CloudFront/Amplify. File được lưu tại S3 Raw Bucket, kích hoạt EventBridge đưa thông báo vào SQS queue. Từ đây, Step Functions điều phối quy trình trích xuất: kiểm tra định dạng, dùng Amazon Textract để lấy dữ liệu thô, sau đó gọi External AI (qua AI Proxy Lambda) để chuẩn hóa thành JSON. Cuối cùng, kết quả và trạng thái (EXTRACTED, REVIEW_REQUIRED, FAILED) được lưu vào DynamoDB và S3 Processed. Người dùng có thể kiểm tra và chỉnh sửa kết quả trực tiếp trên giao diện. Các lỗi sẽ kích hoạt cảnh báo qua SNS/SES.

*Lợi ích và hoàn vốn đầu tư (ROI)*
Hệ thống giúp giảm triệt để thời gian nhập liệu thủ công, tăng tốc xử lý và hỗ trợ quá trình audit chứng từ hiệu quả nhờ dữ liệu được lưu trữ tập trung. Kiến trúc serverless (chỉ trả tiền khi sử dụng) giúp tối ưu hóa chi phí, đặc biệt phù hợp với lưu lượng không đồng đều của hóa đơn. Các biện pháp bảo mật như IAM, KMS, Secrets Manager và AWS Budgets đảm bảo an toàn dữ liệu tài chính và tránh phát sinh chi phí ngoài ý muốn.

### 3. Kiến trúc giải pháp
Kiến trúc của DocuFlow AI tuân thủ chặt chẽ mô hình serverless, event-driven và asynchronous workflow.

![Kiến trúc giải pháp](/images/2-Proposal/architecture.png)


*Dịch vụ AWS sử dụng*
- **Amazon CloudFront & Amplify:** Phân phối và lưu trữ ứng dụng Frontend.
- **Amazon Cognito:** Xác thực và quản lý quyền truy cập người dùng.
- **Amazon API Gateway & Lambda:** Tạo presigned URL cho phép người dùng upload trực tiếp lên S3.
- **Amazon S3:** Lưu trữ file gốc (Raw Bucket) và file kết quả JSON (Processed Bucket).
- **Amazon EventBridge & SQS:** Bắt sự kiện upload và đưa vào hàng đợi (kèm DLQ) để xử lý bất đồng bộ.
- **AWS Step Functions:** Điều phối luồng xử lý (Validate -> Textract -> AI Proxy -> Confidence Logic -> Save).
- **Amazon Textract:** Trích xuất thông tin văn bản và dữ liệu thô từ chứng từ.
- **Amazon DynamoDB:** Lưu trữ metadata, trạng thái xử lý và phục vụ truy vấn tốc độ cao.
- **Amazon SNS & SES:** Gửi cảnh báo hệ thống và email thông báo cho người dùng.
- **AWS KMS, Secrets Manager, CloudTrail:** Đảm bảo bảo mật, mã hóa dữ liệu nhạy cảm và theo dõi hoạt động (audit).

*Thiết kế thành phần*
Kiến trúc phân chia rõ ràng theo nhóm: Edge/Frontend, Authentication & API, Document Ingestion (S3/EventBridge/SQS), AI Processing Pipeline (Step Functions/Textract/Lambda), Data Persistence (DynamoDB/S3), và Observability/Security.

### 4. Triển khai kỹ thuật
*Các giai đoạn triển khai*
Dự án được triển khai bởi nhóm AeroOps gồm 5 thành viên với sự phân công rõ ràng:
1. **Thiết kế và Tiêu chuẩn hóa:** Chốt kiến trúc, AWS resource naming convention (`docuflow-dev-*`), Data Contract và API schemas.
2. **Xây dựng Nền tảng (Foundation):** Thiết lập Cognito, Amplify, S3, EventBridge, SQS, DynamoDB và IAM baseline.
3. **Tích hợp Luồng tải lên và Hàng đợi:** Xử lý luồng tạo Presigned URL và định tuyến sự kiện.
4. **Phát triển AI Pipeline:** Thiết lập Step Functions, Textract, và xây dựng AI Proxy Lambda gọi External API an toàn.
5. **Hoàn thiện Giao diện và Lưu trữ:** Lưu kết quả, xây dựng giao diện hiển thị danh sách, chi tiết và review (chỉnh sửa) hóa đơn.
6. **Bảo mật & Giám sát:** Cấu hình CloudWatch (logs/alarms), X-Ray, Budget alerts và triển khai bằng AWS SAM.

*Yêu cầu kỹ thuật*
- Mã nguồn Infrastructure as Code (IaC) sử dụng AWS SAM.
- Các API endpoints tuân thủ RESTful (POST `/documents/upload-url`, GET `/documents`, PATCH `/documents/{documentId}/review`).
- Dữ liệu JSON phải khớp với schema chuẩn (gồm `schemaVersion`, `status`, `invoice`, `lineItems`, `confidence`).
- AI Proxy Lambda phải xử lý timeout, rate-limit và che giấu API keys lưu trong Secrets Manager.

### 5. Lộ trình & Mốc triển khai (Roadmap theo tuần)
- **Tuần 1:** Chốt thiết kế, data contract v1, API samples, IAM security/cost plan.
- **Tuần 2:** Thiết lập cơ sở hạ tầng (Cognito, S3, DynamoDB, IAM baseline).
- **Tuần 3:** Xây dựng luồng Upload (Presigned URL) và Queue (EventBridge/SQS).
- **Tuần 4:** Dựng khung Step Functions và định nghĩa status/UX.
- **Tuần 5:** Tích hợp AI (Textract + External AI normalization).
- **Tuần 6-7:** Tích hợp lưu trữ kết quả DynamoDB/S3 và quy trình Review (sửa/duyệt hóa đơn).
- **Tuần 8-9:** Xử lý lỗi (Error handling, DLQ), cảnh báo SNS/SES và thiết lập Observability (CloudWatch, X-Ray).
- **Tuần 10-12:** End-to-end testing, viết tài liệu, dọn dẹp tài nguyên (cleanup script) và Final Demo.

### 6. Ước tính ngân sách
**Ước tính chi phí vận hành (Cho 300 hóa đơn/tháng)**

| Dịch vụ | Chi phí ước tính |
| :--- | :--- |
| AWS Lambda | $0.00/tháng (trong Free Tier) |
| Amazon S3 (lưu trữ & request) | ~$0.15/tháng |
| AWS Amplify (hosting frontend) | ~$0.35/tháng |
| Amazon API Gateway | ~$0.01/tháng |
| Amazon Textract (AnalyzeExpense) | ~$0.08/tháng |
| External AI API (qua AI Proxy) | ~$0.02/tháng |
| Truyền tải dữ liệu & SNS Alerts | ~$0.02/tháng |
| **Tổng ước tính** | **~$0.70 USD/tháng** |

**Quy định kiểm soát chi phí**

- **AWS Budgets:** Cảnh báo tự động khi chi phí vượt **$5.00** và **$10.00**.
- **Giới hạn file:** Lambda validate từ chối file lớn hơn **5 MB** hoặc quá **3 trang**.
- **Lifecycle Rules:** Tự động xóa file trong raw/processed bucket sau **14 ngày**.
- **Cleanup sau demo:** Chạy cleanup script và xác nhận không còn resource tốn phí.

### 7. Đánh giá rủi ro
*Ma trận rủi ro và Chiến lược giảm thiểu*
- **Lỗi định dạng file hoặc Textract đọc mờ:** Thiết lập Validation Lambda chặn từ đầu. Gắn cờ `REVIEW_REQUIRED` nếu độ tin cậy (confidence score) thấp.
- **External AI API bị lỗi/rate-limit hoặc lộ API Key:** Sử dụng AI Proxy Lambda với cơ chế retry/catch trong Step Functions. API key lưu nghiêm ngặt tại AWS Secrets Manager, không đẩy lên frontend.
- **Workflow thất bại khó debug:** Bật CloudWatch logs, AWS X-Ray tracing và cấu hình DLQ (Dead-letter queue) cho SQS để giữ lại message lỗi.
- **Chi phí vượt mức (Credits cạn kiệt):** Theo dõi AWS Budgets, hạn chế test hàng loạt và dọn dẹp ngay sau ngày làm việc.

### 8. Kết quả kỳ vọng
- **Kỹ thuật:** Xây dựng thành công quy trình xử lý hóa đơn tự động end-to-end, kết nối mượt mà giữa Frontend (Amplify) và Backend Serverless.
- **Người dùng:** Trải nghiệm thân thiện, dễ dàng theo dõi trạng thái xử lý hóa đơn theo thời gian thực (UPLOADED -> PROCESSING -> EXTRACTED / REVIEW_REQUIRED -> APPROVED).
- **Lưu trữ:** Metadata và thông tin trích xuất chuẩn hóa được lưu trữ an toàn, hỗ trợ đắc lực cho truy vấn và xuất báo cáo tài chính nội bộ.