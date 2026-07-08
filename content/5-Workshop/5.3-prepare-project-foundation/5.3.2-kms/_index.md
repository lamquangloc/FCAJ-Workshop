---
title: "Initialize AWS KMS CMK"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.3.2. </b> "
---
We will create a symmetric Customer Managed Key to encrypt all data in S3, DynamoDB, and Secrets Manager.

---

### Steps

1. In the AWS Console search bar, type **kms** ➔ Select **Key Management Service (KMS)**.
   
   ![image72.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image72.png)

2. In the left menu, select **Customer managed keys** ➔ Click the **Create key** button.
   
   ![image73.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image73.png)

3. Configure key:
   * **Key type**: Select **Symmetric** (Symmetric key - required for the architecture).
   * **Key usage**: Select **Encrypt and decrypt**.
   * Click **Next**.

![image74.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image74.png)
4. Add labels:
   * **Alias**: Enter exactly `docuflow-dev-main-key` (The system will automatically add the prefix `alias/` to make it `alias/docuflow-dev-main-key`).


   * **Description**: Enter: `CMK KMS Key for DocuFlow AI project to encrypt S3 buckets, DynamoDB, and Secrets Manager.`
   
   ![image75.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image75.png)

   * Click **Next**.


5. Define Key Administrative Permissions:
   * From the User/Role list, check your account name (or your Administrator role) to designate the person with permission to delete/edit this key.
   
   ![image76.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image76.png)

   * **Key deletion**: Check **Allow key administrators to delete this key** (Allows key deletion when the project finishes).
   
   ![image77.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image77.png)

   * Click **Next**.


6. Define Key Usage Permissions:
   * This step is extremely important. You must grant permissions to the core services and the IAM Roles you created so they can use this key to encrypt/decrypt data.
   * From the list, check all the Lambda and Step Functions IAM Roles you created in the previous step (from Role 1 to Role 9, for example: `docuflow-dev-ai-textract-lambda-role`, `docuflow-dev-workflow-stepfunctions-role`,...).
   
   ![image86.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image86.png)

   ![image85.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image85.png)

   ![image84.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image84.png)

   ![image83.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image83.png)

   ![image82.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image82.png)

   ![image81.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image81.png)

   ![image80.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image80.png)

   ![image79.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image79.png)

   ![image78.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image78.png)

   * Click **Next**.


7. Review Key Policy (JSON) and Finish:
   * AWS will automatically generate a Key Policy block. Scroll to the bottom and click **Finish**.
   
   ![image87.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.2-kms/image87.png)