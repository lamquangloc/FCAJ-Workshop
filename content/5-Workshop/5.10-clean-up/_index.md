---
title: "Clean Up"
date: 2024-01-01
weight: 10
chapter: false
pre: " <b> 5.10. </b> "
---

### 1. Goal
Clean up and delete all deployed AWS resources after the workshop to avoid unwanted charges and verify solid project cost control.

### 2. Steps

#### Step 1: Empty and Delete Amazon S3 Buckets
AWS does not allow S3 buckets to be deleted if they contain objects. We must empty them first:
1. In the **S3 Console**, complete the following for all three buckets:
   * `docuflow-dev-raw-<AWS_ACCOUNT_ID>-ap-southeast-1`
   * `docuflow-dev-processed-<AWS_ACCOUNT_ID>-ap-southeast-1`
   * `docuflow-dev-cloudtrail-logs-<RANDOM_STRING>`
2. For each bucket, select the checkbox next to its name -> Click **Empty** -> Type `permanently delete` to confirm.

   ![Empty S3 Bucket](/images/5-Workshop/5.10-clean-up/empty-s3-bucket.png)

3. Once empty, select the bucket -> Click **Delete** -> Type the name of the bucket to delete it permanently.

   ![Delete S3 Bucket](/images/5-Workshop/5.10-clean-up/delete-s3-bucket.png)

#### Step 2: Delete DynamoDB Documents Table
1. Go to **DynamoDB** -> select **Tables** from the left sidebar.

   ![DynamoDB Tables](/images/5-Workshop/5.10-clean-up/dynamodb-tables.png)

2. Select the main project table: `docuflow-dev-documents-table`.

   ![DynamoDB Select Table](/images/5-Workshop/5.10-clean-up/dynamodb-select-table.png)

3. Click the **Delete** button in the top menu -> Type `confirm` in the confirmation dialog and click **Delete**.

   ![DynamoDB Confirm Delete](/images/5-Workshop/5.10-clean-up/dynamodb-confirm-delete.png)

#### Step 3: Delete Backend Lambda Functions
1. Go to Lambda, select all the newly created functions.

   ![Select Lambda Functions](/images/5-Workshop/5.10-clean-up/select-lambda-functions.png)

2. In Actions, click the dropdown to select Delete.

   ![Delete Lambda Functions](/images/5-Workshop/5.10-clean-up/delete-lambda-functions.png)

3. After clicking Delete, a Delete functions screen will appear, type confirm to delete the newly created functions.

   ![Confirm Lambda Delete](/images/5-Workshop/5.10-clean-up/confirm-lambda-delete.png)

#### Step 4: Delete the Connected API Gateway
1. Go to the **API Gateway Console**.

   ![API Gateway Console](/images/5-Workshop/5.10-clean-up/api-gateway-console.png)

2. Select the project API: `docuflow-dev-api`.

   ![Select API Gateway](/images/5-Workshop/5.10-clean-up/select-api-gateway.png)

3. Click the **Delete** button -> Confirm the action.

   ![Delete API Gateway](/images/5-Workshop/5.10-clean-up/delete-api-gateway.png)

#### Step 5: Delete CloudWatch Alarms
1. Go to **CloudWatch** -> Choose **Alarms** -> **All alarms** in the left sidebar.
2. Select the four alarms created for the project:
   * `docuflow-dev-workflow-failed-alarm`
   * `docuflow-dev-sqs-dlq-not-empty-alarm`
   * `docuflow-dev-lambda-ai-proxy-error-alarm`
   * `docuflow-dev-low-confidence-spike-alarm`
3. Click **Actions** -> Select **Delete** -> click **Delete** to confirm.

![image162.png](/images/5-Workshop/5.10-clean-up/image162.png)

#### Step 6: Delete CloudWatch Log Groups
1. Still in CloudWatch, choose **Logs** -> **Log groups**.
2. Select the six log groups associated with your Lambda functions:
   * `/aws/lambda/docuflow-dev-api-generate-upload-url-lambda`
   * `/aws/lambda/docuflow-dev-ingestion-job-starter-lambda`
   * `/aws/lambda/docuflow-dev-workflow-validate-lambda`
   * `/aws/lambda/docuflow-dev-ai-textract-lambda`
   * `/aws/lambda/docuflow-dev-ai-proxy-lambda`
   * `/aws/lambda/docuflow-dev-ai-confidence-status-lambda`
3. Click **Actions** -> Select **Delete log group(s)** -> Confirm the action.

![image163.png](/images/5-Workshop/5.10-clean-up/image163.png)

#### Step 7: Delete SNS Topics & SES Verified Identities
1. **SNS Topic**: Go to **Simple Notification Service (SNS)** -> Select **Topics** -> select `docuflow-dev-notification-system-alerts-topic` -> Click **Delete** -> Type `delete me` to confirm.

![image164.png](/images/5-Workshop/5.10-clean-up/image164.png)

2. **SES Email Identity**: Go to **Simple Email Service (SES)** -> Select **Verified identities** -> select your verified email address -> Click **Delete** -> Confirm the deletion.

#### Step 8: Stop & Delete CloudTrail Audit Logs
1. Go to **CloudTrail** -> Select **Trails** on the left menu.
2. Click on the project trail: `docuflow-dev-audit-trail`.
3. Click **Stop logging** -> then click **Delete** to remove the trail.

![image165.png](/images/5-Workshop/5.10-clean-up/image165.png)

#### Step 9: Delete AWS Budgets cost alerts
1. Search for **Budgets** in the AWS console -> Select **AWS Budgets**.
2. Select the three budgets:
   * `DocuFlow-Monthly-Actual-Cost`
   * `DocuFlow-Credit-Safety`
   * `DocuFlow-FreeTier-Watch`
3. Click **Actions** -> Select **Delete** -> Confirm the deletion.

![image166.png](/images/5-Workshop/5.10-clean-up/image166.png)

#### Step 10: Delete external AI credentials in Secrets Manager
1. Go to **Secrets Manager** -> select the secret: `docuflow-dev-external-ai-api-key`.
2. Click **Actions** -> Select **Delete secret**.
3. Set the waiting period to the minimum of **7 days** to disable the secret immediately and avoid future billing.

![image167.png](/images/5-Workshop/5.10-clean-up/image167.png)

#### Step 11: Remove IAM Roles & Policies
1. Go to **IAM** -> Select **Roles** in the left sidebar.
2. Search and select the nine roles created in Step 3:
   * `docuflow-dev-security-upload-url-role`
   * `docuflow-dev-security-job-starter-role`
   * `docuflow-dev-workflow-stepfunctions-role`
   * `docuflow-dev-ai-textract-lambda-role`
   * `docuflow-dev-security-ai-proxy-role`
   * `docuflow-dev-data-lambda-role`
   * `docuflow-dev-notification-lambda-role`
   * `docuflow-dev-workflow-validate-lambda-role`
   * `docuflow-dev-ai-confidence-status-lambda-role`
3. Click **Delete** and type the role names to confirm.

![image168.png](/images/5-Workshop/5.10-clean-up/image168.png)

4. Go to **Policies** -> Search and delete all custom policies (e.g. `docuflow-dev-ingestion-s3-raw-access-policy`, `docuflow-dev-ai-secret-read-policy`, etc.).

#### Step 12: Schedule KMS Key Deletion (Must be performed last)
1. Go to **Key Management Service (KMS)** -> select **Customer managed keys**.
2. Select the CMK key: `docuflow-dev-main-key`.
3. Click **Key actions** -> Select **Schedule key deletion**.
4. Set the waiting period to **7 days** (the minimum allowed waiting period by AWS).
5. Click the orange confirmation button. The key state will transition to `Pending deletion` and maintenance fees will freeze.

![image169.png](/images/5-Workshop/5.10-clean-up/image169.png)

#### Step 13: Delete Cognito
1. Go to the **Cognito Console**.

   ![Cognito Console](/images/5-Workshop/5.10-clean-up/cognito-console.png)

2. Select the User pool: `User pool - ...`.

   ![Select Cognito User Pool](/images/5-Workshop/5.10-clean-up/select-cognito-user-pool.png)

3. Click **Delete** on the top menu -> Check the prerequisite actions and type the pool name to confirm deletion.

   ![Confirm Delete Cognito User Pool](/images/5-Workshop/5.10-clean-up/confirm-delete-cognito.png)

### 3. Expected Result
* All billable AWS resources are deleted.
* Verification steps ensure no lingering charges accumulate post-workshop.

### 4. Evidence

- Confirm that the workshop S3 buckets no longer appear in the S3 console.
- Confirm that all project resources listed above have been deleted.
- Review AWS Billing and Cost Explorer after cleanup to detect unexpected remaining usage.