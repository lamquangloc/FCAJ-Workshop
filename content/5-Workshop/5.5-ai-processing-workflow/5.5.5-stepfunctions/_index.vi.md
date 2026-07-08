---
title: "Step Functions Workflow"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5.5. </b> "
---
Chúng ta sẽ sử dụng AWS Step Functions để điều phối bốn Lambda xử lý AI cốt lõi, lưu kết quả và gọi Notification Trigger Lambda cho nhánh cần review hoặc thất bại.

---

### Các bước thực hiện trên AWS Console

1. **Truy cập dịch vụ Step Functions**:
   * Tại thanh tìm kiếm trên cùng của AWS Console, gõ **Step Functions** ➔ Chọn dịch vụ **Step Functions**.
   ![Tìm dịch vụ Step Functions](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image52.png)
   * Ở menu dọc bên trái, bấm chọn **State machines** ➔ Nhấn nút **Create state machine**.
   ![Danh sách State machines](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image53.png)
   ![Tạo State Machine mới](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image54.png)
   ![Chọn tạo State Machine trống](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image55.png)

2. **Cấu hình mã định nghĩa**:
   * Chọn **Write in JSON** (ASL Editor - Amazon States Language) để dán code định nghĩa luồng.
   ![Mở workflow editor](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image56.png)
   ![Chuyển sang ASL JSON editor](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image57.png)
   * Xóa JSON mặc định và dán định nghĩa ASL bên dưới.
   * Nếu triển khai bằng AWS SAM, các giá trị `${...}` được truyền qua `DefinitionSubstitutions`.
   * Nếu tạo State Machine thủ công trên Console, thay `${WorkflowValidateFunctionArn}`, `${TextractFunctionArn}`, `${AiProxyFunctionArn}`, `${ConfidenceStatusFunctionArn}`, `${NotificationTriggerFunctionArn}`, `${DocumentsTableName}` và `${ProcessedBucketName}` bằng giá trị đã triển khai trước khi lưu.

{{< source-code file="services/statemachines/processing.asl.json" language="json" >}}

   ![Dán định nghĩa ASL vào JSON editor](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image58.png)

3. **Cấu hình Quyền hạn (Permissions) và Hoàn tất**:
   * Nhấn **Next**.
   * **State machine name**: Đặt tên chuẩn `docuflow-dev-workflow-processing-state-machine`.
   * **Permissions**: Chọn **Choose an existing role** ➔ Trỏ đến `docuflow-dev-workflow-stepfunctions-role` đã tạo ở bước IAM.
   ![Cấu hình tên và quyền State Machine](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image59.png)
   ![Xác nhận vai trò IAM](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image60.png)
   * Nhấn **Create state machine**.
   ![Tạo State Machine thành công](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image61.png)
   ![State Machine xuất hiện trong danh sách](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image62.png)
   ![Chi tiết State Machine](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image63.png)

4. **Đồng bộ biến môi trường cho Job Starter Lambda**:
   * Sao chép **ARN** của State Machine vừa tạo (Ví dụ: `arn:aws:states:ap-southeast-1:<AWS_ACCOUNT_ID>:stateMachine:docuflow-dev-workflow-processing-state-machine`).
   * Quay lại cấu hình hàm Lambda `docuflow-dev-ingestion-job-starter-lambda`.
   * Vào tab **Configuration** ➔ **Environment variables** ➔ Bấm **Edit** ➔ Cập nhật giá trị biến `STATE_MACHINE_ARN` bằng chuỗi ARN của State Machine bạn vừa sao chép. Nhấn **Save**.

---

### Minh chứng thực hành (Evidence)

Xác nhận sơ đồ State Machine có bốn tác vụ Lambda theo đúng thứ tự cùng trạng thái kết thúc thành công và thất bại.

![Chạy thử State Machine với input mẫu](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image64.png)
![Execution thành công](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image65.png)
![Sơ đồ graph execution thành công](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image66.png)
![Input và output của execution](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image67.png)
![Chạy thử nhánh thất bại](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image68.png)
![Execution thất bại được ghi nhận](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image69.png)