---
title: "Build Asynchronous Document Ingestion Pipeline"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---
### Goal
When a user successfully uploads a file to the S3 Raw bucket, S3 automatically triggers an `ObjectCreated` event to Amazon EventBridge. EventBridge will filter the event and send it to an Amazon SQS queue. The Job Starter Lambda function polls messages from SQS, reads the file information (`s3RawPath`, `documentId`, `userId`), and triggers the Step Functions State Machine to asynchronously launch the AI processing workflow.

Please navigate to the labs on the left to get started!