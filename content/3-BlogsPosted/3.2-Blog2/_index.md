---
title: "Blog 2"
date: 2026-07-03
weight: 2
chapter: false
pre: " <b> 3.2. </b> "
---

# Building a scalable user search layer on top of Amazon Cognito

**Posted by: Vu Duy Tai**

If your team only needs simple search across standard Amazon Cognito attributes, the ListUsers API is sufficient. However, when the system must handle advanced requests such as custom attribute search, fuzzy matching, complex filtering, and sub-second responses, building a dedicated search layer becomes the appropriate choice.

This article presents how to build a scalable and advanced user search layer on top of Amazon Cognito, combining AWS services including AWS Lambda, Amazon DynamoDB, and Amazon OpenSearch Service, as briefly mentioned on AWS.

### Highlights of the Solution

#### 1. Unlocking Advanced Search Capabilities
The solution utilizes Amazon OpenSearch Serverless to provide search features that Cognito's native API cannot do:
* **Fuzzy search:** Allows finding users even with partial information (part of an email, name) or misspelled input.
* **Complex filtering:** Performs complex queries, simultaneously combining multiple attributes like email, phone number, groups, and registration date.

#### 2. Dual Data Ingestion Architecture (No "blind spots")
This is the smartest design of the solution, ensuring data is always synced in real-time without running manual tasks:
* **Catching user-side changes:** Uses Cognito Lambda Triggers (Post-confirmation and Pre-token generation) to automatically save data as soon as users register or log in.
* **Catching Admin-side changes:** Administrator actions (e.g., creating users manually, changing passwords) are automatically collected via AWS CloudTrail and Amazon EventBridge, ensuring no changes are missed.

#### 3. Using DynamoDB Streams as a Safe "Buffer"
Instead of pushing data directly from Cognito to OpenSearch (which could cause overloads or data loss), the solution uses Amazon DynamoDB as an intermediate storage.
Every state change triggers DynamoDB Streams, which in turn calls Lambda to update OpenSearch. This mechanism helps the system run extremely smoothly with high fault tolerance.

#### 4. Speed and Sub-second Performance
The complete separation of the Write flow (running implicitly via Events) and the Read flow (via an independent Search Lambda function) prevents the system from ever getting bottlenecked.
Search results are returned via a RESTful API supporting pagination with sub-second response times, regardless of whether the database has thousands or millions of users.

#### 5. Serverless Infrastructure & Automated Deployment
The entire solution is built on fully serverless services, automatically scaling according to actual traffic to optimize costs.
The author of the AWS article also provides the source code (Infrastructure as Code using AWS CDK) including both Backend and a React interface, allowing anyone to deploy this complete system to their AWS account in under 20 minutes.
*(Source code: [sample-user-search-layer-for-cognito](https://github.com/aws-samples/sample-user-search-layer-for-cognito))*

---
**Original Post / Read more:** 
[Building a scalable user search layer on top of Amazon Cognito](https://aws.amazon.com/blogs/architecture/building-a-scalable-user-search-layer-on-top-of-amazon-cognito/)

### Reference Images

![Solution Architecture](/images/3-BlogsPosted/3.2-Blog2/blog2architecture.jpg)