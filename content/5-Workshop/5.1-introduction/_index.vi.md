---
title: "Giới thiệu tổng quan"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---
### 1. Giới thiệu giải pháp (Use case)
Trong thời đại chuyển đổi số, việc nhập liệu thủ công các loại hóa đơn, biên nhận (invoice/receipt) vẫn là một điểm nghẽn lớn (pain point) đối với các phòng ban tài chính kế toán hoặc vận hành của doanh nghiệp (finance/SME operation teams). Quy trình nhập tay từ ảnh quét hay file PDF vào bảng tính Excel hoặc hệ thống ERP thường tốn thời gian, dễ gây sai sót về số liệu (sai tên nhà cung cấp, ngày xuất, số tiền, thuế phí, loại tiền tệ) và gặp rủi ro rò rỉ dữ liệu tài chính hoặc API key.

**DocuFlow AI** được thiết kế nhằm tự động hóa hoàn toàn quy trình này bằng cách kết hợp giữa kiến trúc AWS Serverless linh hoạt, công nghệ OCR (Amazon Textract) và trí tuệ nhân tạo (External AI Normalization) bên ngoài AWS để phân tích cấu trúc, chuẩn hóa dữ liệu. Hệ thống đảm bảo tính bảo mật tuyệt đối nhờ Cognito, IAM least privilege, Secrets Manager và S3 Block Public Access.

### 2. Sơ đồ kiến trúc đã được duyệt (Approved Architecture)
Kiến trúc của hệ thống DocuFlow AI đã được admin trong group duyệt bao gồm các khối: Edge/Frontend, Authentication & API, Document Ingestion, AI Processing Pipeline, Data Persistence, Observability, Alerting và Cross-cutting Security & Governance.

**Hình 1 - Kiến trúc và luồng xử lý DocuFlow AI**

![Kiến trúc và luồng xử lý DocuFlow AI](/images/5-Workshop/architecture/DocuFlowAI-architecture-2.png)

Luồng xử lý tổng thể của hệ thống:

```text
Frontend -> Cognito / API Gateway -> S3 Raw
         -> EventBridge -> SQS -> Job Starter Lambda
         -> Step Functions -> Validate -> Textract -> AI Proxy -> Confidence
         -> DynamoDB metadata + S3 Processed results -> Review APIs
```

### 3. Quy trình xử lý chính (Main Flow) và Kiến trúc xử lý bất đồng bộ
Một trong những điểm mấu chốt và quan trọng nhất của kiến trúc này là **hệ thống không xử lý trực tiếp (đồng bộ) từ Frontend đến AI**.
* **Tại sao xử lý bất đồng bộ được chọn?** Nếu xử lý đồng bộ, người dùng sẽ phải chờ đợi trên giao diện web trong thời gian dài khi hệ thống chạy OCR và gọi API AI bên ngoài, rất dễ dẫn đến lỗi timeout của HTTP hoặc treo trình duyệt. Việc tách rời (decouple) luồng tải lên (Upload) ra khỏi luồng xử lý (Processing) thông qua hàng đợi giúp hệ thống vận hành bền bỉ, có khả năng chịu tải tốt (buffer queue), tự động retry khi gặp lỗi tạm thời (retry policy), ghi nhận lịch sử thực thi (execution history) và cô lập lỗi dễ dàng (DLQ).

Luồng xử lý đầu-cuối (End-to-End Main Flow) diễn ra chi tiết qua 15 bước sau:
1. **User access (Người dùng truy cập)**: Người dùng mở ứng dụng web frontend được phân phối qua CloudFront/Amplify.
2. **Authentication (Xác thực)**: Người dùng đăng nhập bằng Cognito User Pool và nhận mã khóa JWT/token bảo mật.
3. **Request upload URL (Yêu cầu URL tải lên)**: Frontend gọi endpoint `POST /documents/upload-url` của API Gateway kèm tên file và định dạng.
4. **Generate presigned URL (Sinh URL)**: Lambda sinh mã S3 Presigned URL tạm thời (thời gian sống 300 giây) và tạo bản ghi metadata ban đầu với `documentId` duy nhất trong DynamoDB.
5. **Upload file (Tải tệp tin)**: Frontend sử dụng Presigned URL để đẩy trực tiếp tệp gốc (`original.pdf`/ảnh) lên **S3 Raw Bucket** mà không đi qua server trung gian.
6. **Create event (Tạo sự kiện)**: Sự kiện `ObjectCreated` của S3 Raw Bucket tự động kích hoạt và được cấu hình định tuyến thông qua **Amazon EventBridge**.
7. **Queue job (Đưa vào hàng đợi)**: EventBridge chuyển tiếp thông tin công việc vào **Amazon SQS** (`docuflow-dev-processing-queue`). Nếu công việc bị lỗi lặp lại liên tục, tin nhắn sẽ được chuyển hướng sang hàng đợi lỗi **DLQ** để xử lý thủ công.
8. **Start workflow (Khởi chạy Workflow)**: **Job Starter Lambda** lấy tin nhắn từ SQS và gọi API khởi chạy **AWS Step Functions Standard Workflow** (State Machine).
9. **Validate (Kiểm tra hợp lệ)**: State đầu tiên **Validate Lambda** kiểm tra định dạng tệp (PDF/JPG/PNG), kích thước file và cập nhật trạng thái tài liệu thành `PROCESSING`.
10. **Extract (Trích xuất ký tự thô)**: Quy trình gọi **Amazon Textract** với API `AnalyzeExpense` để lấy thông tin thô của hóa đơn/biên nhận.
11. **Normalize (Chuẩn hóa bằng AI)**: **AI Proxy Lambda** được gọi để đọc API key từ Secrets Manager (không lộ ra ngoài Frontend) và thực hiện kết nối HTTPS gửi payload văn bản trích xuất sang **External AI API** nhằm định dạng, phân loại và chuẩn hóa kết quả thành dữ liệu JSON sạch.
12. **Confidence/status logic (Tính điểm tin cậy)**: **Confidence + Status Lambda** chấm điểm tin cậy tổng hợp dựa trên độ tự tin của Textract, tính đầy đủ của schema và kết quả validate JSON. Quyết định cập nhật trạng thái tài liệu tiếp theo là `EXTRACTED` (nếu >= 85%) hoặc `REVIEW_REQUIRED` (nếu < 85% hoặc thiếu trường quan trọng).
13. **Persist (Lưu trữ lâu dài)**: **DynamoDB** lưu trữ metadata/status cuối cùng (bảo vệ chống trùng lặp dữ liệu bằng Idempotency) và **S3 Processed Bucket** lưu trữ tệp kết quả chuẩn hóa `result.json` tại đường dẫn `processed/{userId}/{documentId}/result.json`.
14. **Observe (Giám sát)**: Toàn bộ log có cấu trúc (structured logs) được ghi nhận trong **CloudWatch Logs**, các chỉ số hiệu năng và lỗi kích hoạt **CloudWatch Alarms**, vết request được trace qua **AWS X-Ray**.
15. **Alert (Cảnh báo)**: Gửi thông báo email qua **Amazon SNS/SES** khi có lỗi phát sinh hoặc khi tài liệu cần duyệt (`REVIEW_REQUIRED`).

### 4. Các dịch vụ trong phạm vi MVP (In-Scope Services)
Để hoàn thành bài lab này, các dịch vụ AWS chính được sử dụng bao gồm:
* **Edge & Frontend:** AWS CloudFront, AWS Amplify.
* **Authentication & API:** Amazon Cognito, Amazon API Gateway, AWS Lambda (Presigned URL).
* **Storage:** Amazon S3 (Raw & Processed buckets).
* **Event & Queue:** Amazon EventBridge, Amazon SQS + DLQ.
* **Workflow & Validation:** AWS Step Functions (Standard Workflow), AWS Lambda (Job Starter, Validate, AI Proxy, Confidence/Status).
* **AI & Extraction:** Amazon Textract, External AI API.
* **Database & Secrets:** Amazon DynamoDB, AWS Secrets Manager.
* **Observability & Management:** Amazon CloudWatch (Logs/Metrics/Alarms), AWS X-Ray, Amazon SNS, Amazon SES.
* **Security & Governance:** AWS IAM, AWS KMS, AWS CloudTrail, AWS Budgets, AWS SAM.

### 5. Kết quả mong đợi sau khi kết thúc Workshop
Kết thúc chuỗi bài thực hành này, bạn sẽ dựng hoàn chỉnh một giải pháp tự động hóa:
1. **Frontend hoạt động tốt**: Có giao diện đăng nhập (Cognito), hiển thị danh sách (List), chi tiết (Detail) kết quả trích xuất và màn hình phê duyệt (Reviewer Form).
2. **Xác thực bảo mật**: Quản lý người dùng, phân quyền truy cập thông qua Cognito JWT token.
3. **Upload an toàn**: Frontend upload trực tiếp lên S3 sử dụng Presigned URL.
4. **Ingestion Pipeline**: Luồng đẩy sự kiện tự động thông qua EventBridge và SQS queue.
5. **Workflow Step Functions**: Quy trình xử lý lỗi Try-Catch, Retry tự động tích hợp Textract và LLMs.
6. **Lưu trữ chuẩn hóa**: Metadata lưu trữ tại DynamoDB, kết quả JSON lưu tại S3 Processed bucket.
7. **Observability & Alert**: Có log cấu trúc chi tiết, trace luồng bằng X-Ray, báo động CloudWatch Alarms và nhận email thông báo tự động.
8. **Dọn dẹp (Cleanup)**: Xóa sạch toàn bộ tài nguyên một cách dễ dàng thông qua script hoặc lệnh SAM delete để kiểm soát tối ưu chi phí.
