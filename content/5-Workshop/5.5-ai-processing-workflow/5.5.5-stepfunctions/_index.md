---
title: "Step Functions Workflow"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5.5. </b> "
---
We will use AWS Step Functions to orchestrate the four core AI-processing Lambdas, persist results, and invoke Notification Trigger Lambda for review and failure alerts.

---

### Step-by-Step Console Configuration

1. **Access the Step Functions Dashboard**:
   * Search for **Step Functions** in the AWS Console search bar ➔ Select **Step Functions**.
   ![Search for Step Functions](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image52.png)
   * In the left menu, choose **State machines** ➔ click **Create state machine**.
   ![State machines list](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image53.png)
   ![Create a new State Machine](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image54.png)
   ![Choose a blank State Machine](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image55.png)

2. **Configure Definition Code**:
   * Select **Write in JSON** (ASL Editor - Amazon States Language) to paste the workflow structure.
   ![Open the workflow editor](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image56.png)
   ![Switch to the ASL JSON editor](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image57.png)
   * Clear the default JSON and paste the ASL definition below.
   * With AWS SAM, the `${...}` values are populated through `DefinitionSubstitutions`.
   * When creating the State Machine manually in the Console, replace `${WorkflowValidateFunctionArn}`, `${TextractFunctionArn}`, `${AiProxyFunctionArn}`, `${ConfidenceStatusFunctionArn}`, `${NotificationTriggerFunctionArn}`, `${DocumentsTableName}`, and `${ProcessedBucketName}` with deployed values before saving.

{{< source-code file="services/statemachines/processing.asl.json" language="json" >}}

   ![Paste the ASL definition into the JSON editor](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image58.png)

3. **Configure Permissions and Complete Deployment**:
   * Click **Next**.
   * **State machine name**: Enter `docuflow-dev-workflow-processing-state-machine`.
   * **Permissions**: Choose **Choose an existing role** ➔ select `docuflow-dev-workflow-stepfunctions-role` created in IAM steps.
   ![Configure State Machine name and permissions](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image59.png)
   ![Confirm the IAM role](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image60.png)
   * Click **Create state machine**.
   ![State Machine created successfully](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image61.png)
   ![State Machine appears in the list](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image62.png)
   ![State Machine details](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image63.png)

4. **Sync the State Machine ARN with your Job Starter Lambda**:
   * Copy the **ARN** of your new State Machine (e.g. `arn:aws:states:ap-southeast-1:<AWS_ACCOUNT_ID>:stateMachine:docuflow-dev-workflow-processing-state-machine`).
   * Return to your `docuflow-dev-ingestion-job-starter-lambda` configuration.
   * Open **Configuration** ➔ **Environment variables** ➔ Click **Edit** ➔ update `STATE_MACHINE_ARN` with your copied State Machine ARN. Click **Save**.

---

### Evidence

Confirm that the State Machine graph contains the four Lambda tasks in the expected order and both success and failure terminal states.

![Start the State Machine with sample input](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image64.png)
![Successful execution](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image65.png)
![Successful execution graph](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image66.png)
![Execution input and output](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image67.png)
![Run the failure branch test](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image68.png)
![Failed execution recorded](/images/5-Workshop/5.5-ai-processing-workflow/5.5.5-stepfunctions/image69.png)