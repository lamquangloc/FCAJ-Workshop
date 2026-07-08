---
title: "Configure Budget Alerts"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.3.6. </b> "
---
To manage the project budget and protect your account from unexpected bills, we will configure three distinct types of monthly cost budgets that trigger email alerts.

---

### Step-by-Step Budget Deployment in AWS Console

#### Common Steps:
1. Search for **Budgets** in the AWS Console search bar ➔ Select **AWS Budgets**.
   
   ![image166.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image166.png)

2. Click the **Create budget** button ➔ Select **Cost budget - Recommended** ➔ Click **Next**.
   
   ![image167.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image167.png)

3. Configure period and amount:
   * **Period**: Select `Monthly`.
   * **Budget planning**: Select `Recurring budget`.
   * **Budgeting method**: Select `Fixed`.
![image168.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image168.png)

---

#### 1. Budget 1: Actual Cost Budget (Soft Limit)
* **Budget Name**: `DocuFlow-Monthly-Actual-Cost`
* **Budget Amount**: Enter `$10` USD.
![image169.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image169.png)
* **Configure Alerts**: Click **Add alert threshold** to create 4 alert thresholds sent to your email:
  * Threshold 1: **50% Actual** (When actual cost reaches $5 USD).
  ![image170.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image170.png)
  * Threshold 2: **80% Actual** (When actual cost reaches $8 USD).
  ![image171.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image171.png)
  * Threshold 3: **100% Actual** (When actual cost reaches $10 USD).

   ![image172.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image172.png)

  * Threshold 4: **100% Forecasted** (When the system forecasts the cost will reach or exceed $10 USD by the end of the month).
   
   ![image173.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image173.png)

* **Email recipients**: Enter your email address to receive alerts.
* Click **Next** ➔ **Create budget**.
![image174.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image174.png)

---

#### 2. Budget 2: Credits Safety Budget
* **Budget Name**: `DocuFlow-Credit-Safety`
* **Budget Amount**: Enter `$50` USD.
* **Purpose**: Acts as an Escalation Warning to protect the project's $200 credit package.
* **Configure Alerts**: Add thresholds for **40%**, **70%**, **90%**, and **100%** for both Actual and Forecasted costs.
   
   ![image175.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image175.png)

---

#### 3. Budget 3: Free Tier Monitor Budget
* **Budget Name**: `DocuFlow-FreeTier-Watch`
* **Budget Amount**: Enter `$1` USD.
* **Purpose**: Closely monitor if free tier limits are exceeded.
* **Important Note**: Use Email-only alerts, absolutely do not enable **Budget Actions** (automatically blocking/stopping resources) to avoid disrupting the system during testing or demos.
   
   ![image176.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.6-budgets/image176.png)
