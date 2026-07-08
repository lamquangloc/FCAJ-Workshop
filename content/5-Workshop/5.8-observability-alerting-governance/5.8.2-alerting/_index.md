---
title: "SES, SNS & CloudWatch Alarms"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.8.2. </b> "
---
To receive instant notifications when the processing system encounters an error or when there are low-confidence invoices requiring review, we will configure the SES email sending service, the SNS distribution channel, and set up 4 automated CloudWatch Alarms.

After configuring SNS and SES, continue with **[Notification Trigger Lambda](5.8.2.1-notification-trigger-lambda/)** to publish `REVIEW_REQUIRED` and workflow failure messages from Step Functions.

---

### Step 1: Verify Email on Amazon SES (Avoid Spam)
Because your AWS account is in the Sandbox environment, you need to verify the sending and receiving email addresses to avoid security blocking:
1. In the AWS Console search bar, type **SES** ➔ Select the **Amazon Simple Email Service**.
   
   ![image42.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image42.png)

2. On the left vertical menu, select **Verified identities** ➔ Click the orange **Create identity** button.
![image43.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image43.png)
![image44.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image44.png)
3. Configure Identity:
   * **Identity type**: Check **Email address**.
   ![image45.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image45.png)
   * **Email address**: Enter exactly the personal email address you use to receive messages (e.g., `your-email@gmail.com`).
   
   ![image46.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image46.png)

4. Click **Create identity**.
5. **Confirmation Action**: AWS SES will send a verification email from the AWS system to your inbox. Check your email and click the confirmation link. The email status on the SES console will turn green **Verified**.
   
   ![image47.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image47.png)

---

### Step 2: Initialize Amazon SNS Topic and Create Subscription
1. Type **SNS** in the search bar ➔ Select **Simple Notification Service**.
![image48.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image48.png)
2. On the left menu, select **Topics** ➔ Click **Create topic**.
![image49.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image49.png)
3. Configure Topic:
   * **Type**: Select **Standard** (Must be Standard to support Email protocol, do not select FIFO).
   ![image50.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image50.png)
   * **Name**: Enter `docuflow-dev-notification-system-alerts-topic`.
   ![image51.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image51.png)
   * Click **Create topic** at the bottom.
   ![image52.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image52.png)
4. **Register to Receive Email (Create Subscription)**:
   * On the detail screen of the newly created Topic, scroll down to the **Subscriptions** section ➔ Click **Create subscription**.
   ![image53.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image53.png)

   * **Protocol**: Select **Email**.
   ![image54.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image54.png)
   * **Endpoint**: Enter the personal email address you verified in the SES step above.
   ![image55.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image55.png)
   * Click **Create subscription**.
   ![image56.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image56.png)
   ![image57.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image57.png)
   * **Verify Subscription**: AWS SNS will send a verification email to your inbox. Check your email, click the **Confirm subscription** link in the received email. The Subscription status on the console will change from *Pending confirmation* to **Confirmed**.
   ![image58.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image58.png)
   
   ![image59.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image59.png)

---

### Step 3: Configure 4 CloudWatch Alarms

We will create 4 automated alarms to send email alerts via the SNS Topic:

1. **Alarm 1: `docuflow-dev-workflow-failed-alarm` (Step Functions execution failed)**
   * Go to **CloudWatch** ➔ **Alarms** ➔ **All alarms** ➔ Click **Create alarm**.
   ![image131.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image131.png)

   * Click **Select metric** ➔ Choose **States** ➔ **StateMachineName** ➔ Select the `ExecutionsFailed` metric of the project's State Machine.
   
   ![image132.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image132.png)

   * **Statistic**: Select `Sum`. **Period**: Select `1 minute`.
   * **Condition**: Static threshold, select **Greater/Equal (>=)** and enter `1`.
   ![image133.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image133.png)
   * Click **Next**. In the **Notification** section, choose to send the notification to the SNS Topic `docuflow-dev-notification-system-alerts-topic`.
   
   ![image134.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image134.png)

   * Click **Next** ➔ Name the Alarm: `docuflow-dev-workflow-failed-alarm` ➔ Click **Create alarm**.

   
   ![image135.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image135.png)
![image136.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image136.png)


2. **Alarm 2: `docuflow-dev-sqs-dlq-not-empty-alarm` (Error messages stuck in DLQ)**
   * Click **Create alarm** ➔ **Select metric** ➔ Choose **SQS** ➔ **QueueName** ➔ Select the `ApproximateNumberOfMessagesVisible` metric of the `docuflow-dev-processing-dlq` queue.
   
   ![image137.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image137.png)

   * **Statistic**: Select `Sum`. **Period**: `1 minute`.

   * **Condition**: Static threshold, **Greater/Equal (>=) 1**.
   ![image138.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image138.png)
   
   * **Action**: Send notification to SNS Topic. Name the Alarm: `docuflow-dev-sqs-dlq-not-empty-alarm` ➔ Click **Create alarm**.
   ![image139.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image139.png)
   ![image140.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image140.png)
   ![image141.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image141.png)
   
3. **Alarm 3: `docuflow-dev-lambda-ai-proxy-error-alarm` (AI Proxy function calling external API failed)**
   * Click **Create alarm** ➔ **Select metric** ➔ Choose **Lambda** ➔ **By Function Name** ➔ `docuflow-dev-ai-proxy-lambda` ➔ select the `Errors` metric.
   
   ![image142.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image142.png)

   * **Statistic**: Select `Sum`. **Period**: `5 minutes`.
   * **Condition**: **Greater/Equal (>=) 1**.
   ![image143.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image143.png)
   * **Action**: Send notification to SNS Topic. Name the Alarm: `docuflow-dev-lambda-ai-proxy-error-alarm` ➔ Click **Create alarm**.
   ![image144.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image144.png)
   ![image145.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image145.png)
   ![image146.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image146.png)


4. **Alarm 4: `docuflow-dev-low-confidence-spike-alarm` (Sudden spike in low-confidence invoices)**
   * Click **Create alarm** ➔ **Select metric** ➔ Choose **Custom Namespaces** ➔ **DocuFlowAI/Metrics** ➔ Select the `InvoicesRequiringHumanReview` metric (created from the Metric Filter in the previous lesson).
   ![image147.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image147.png)
   
   * **Statistic**: Select `Sum`. **Period**: `5 minutes`.
   * **Condition**: **Greater/Equal (>=) 5** (If 5 low-confidence invoices occur within 5 minutes, the AI might be experiencing structural drift or batch blurring issues).
   ![image148.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image148.png)
   * **Action**: Send notification to SNS Topic. 
   ![image149.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image149.png)
   Name the Alarm: `docuflow-dev-low-confidence-spike-alarm` ➔ Click **Create alarm**.
     ![image150.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image150.png)
   ![image151.png](/images/5-Workshop/5.8-observability-alerting-governance/5.8.2-alerting/image151.png)

---