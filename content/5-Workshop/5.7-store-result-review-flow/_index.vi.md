---
title: "Store Result and Build Review Flow"
date: 2024-01-01
weight: 7
chapter: false
pre: " <b> 5.7. </b> "
---
### 1. Goal
Implement a persistent storage strategy using an **Offloading Pattern** between Amazon DynamoDB and Amazon S3. Deploy the three approved Data Lambdas (Get Document, List Documents, and Review Update) for the core review workflow. Delete Document, Dashboard, and Process Control are documented separately as optional project extensions.

---

### 2. Lab Exercises

Select a sub-page below to complete the step-by-step instructions for each component:

* **[5.7.1 Persistence & Offloading Design](5.7.1-persistence/)**: Understand Single-Table Design patterns on DynamoDB and the metadata/payload separation mechanisms.
* **[5.7.2 Data Management Lambdas](5.7.2-lambdas/)**: Deploy the three core Data Lambdas, then optionally add the three extended Lambdas used by the enhanced frontend.
* **[5.7.3 API Gateway Configuration](5.7.3-api-gateway/)**: Configure Amazon API Gateway as the frontend connection and integrate the Cognito Authorizer.
* **[5.7.4 API Testing & Reporting](5.7.4-testing/)**: Create mock database/S3 data, test API Lambda execution parameters, and generate statistics reports in AWS CloudShell.