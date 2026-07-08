---
title: "Governance & Audit Logs"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.8.4. </b> "
---
To track administrative API activities, monitor changes to infrastructure configuration, and maintain compliance auditing (Audit Logging), we will establish a trail using AWS CloudTrail.

---

### Step-by-Step Console Configuration

#### Step 1: Create a Dedicated S3 Bucket for CloudTrail Logs
Due to strict security standards prohibiting the co-location of system logs with raw data, you need to create a dedicated bucket:
1. Go to the **S3** service ➔ Click **Create bucket**.
2. **Bucket name**: Enter exactly using the naming convention: `docuflow-dev-cloudtrail-logs-[random-string]`.
3. **Region**: Select Singapore (`ap-southeast-1`).
![image103.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image103.png)
4. Leave other options as default (Block Public Access is automatically enabled).
5. Click **Create bucket** and copy this bucket name.

   ![image104.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image104.png)

#### Step 2: Initialize and Configure CloudTrail
1. In the AWS Console search bar, type **CloudTrail** ➔ Select the **CloudTrail** service.

   ![image105.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image105.png)

2. In the left menu, select **Trails** ➔ Click the **Create trail** button on the top right.
3. Section 1: **Trail settings**:
   * **Trail name**: Enter exactly `docuflow-dev-audit-trail`.
   * **Storage location**: Check the box for **Use an existing S3 bucket**.
   * **Trail log bucket**: Click or paste the bucket name `docuflow-dev-cloudtrail-logs-[random-string]` created in Step 1.
   * **Log file SSE-KMS encryption**: **Uncheck** this option (Use the default S3 encryption to avoid unnecessary KMS charges as per Cost guardrails).
   ![image106.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image106.png)
4. Click **Next**.
5. Section 3: **Choose log events**
   * **Event type**: Only check the box for **Management events**. Absolutely **DO NOT** check: *Data events* and *Insights events* (to avoid incurring huge unexpected costs).
   ![image107.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image107.png)
   * **API activity**: Check both **Read** and **Write**.
   ![image108.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image108.png)
6. Click **Next** ➔ Scroll to the bottom and click **Create trail**.
![image109.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image109.png)
The system will display the log trail status as **Logging** with a green dot. From this moment on, every activity of the AeroOps team on the AWS account is recorded with undeniable audit evidence!
![image110.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.4-governance/image110.png)