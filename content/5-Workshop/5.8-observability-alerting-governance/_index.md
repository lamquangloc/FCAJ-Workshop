---
title: "Observability, Alerting and Governance"
date: 2024-01-01
weight: 8
chapter: false
pre: " <b> 5.8. </b> "
---
### 1. Goal
Establish comprehensive system observability, configure structured logs and automated alerts for system failures, enable distributed request tracing, log administrative actions (Auditing), and manage your AWS cost footprint to optimize credits.

---

### 2. Lab Exercises

Select a sub-page below to complete the step-by-step instructions for each component:

* **[5.8.1 CloudWatch Logs & Filters](5.8.1-logging/)**: Configure Log retention to 7 days and build Custom Metric Filters to capture processing failures.
* **[5.8.2 SES, SNS & Metric Alarms](5.8.2-alerting/)**: Setup SES verified email, SNS Topics, and configure four CloudWatch alarms to notify when thresholds break.
* **[5.8.3 Tracing AWS X-Ray](5.8.3-tracing/)**: Enable active tracing (AWS X-Ray) across API Gateway ➔ Step Functions ➔ Lambda to compile network Service Maps.
* **[5.8.4 Governance & Audit Logs](5.8.4-governance/)**: Deploy administrative logging using AWS CloudTrail pointing to an isolated audit S3 bucket.
