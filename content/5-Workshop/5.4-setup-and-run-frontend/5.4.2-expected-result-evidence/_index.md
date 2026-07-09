---
title: "Expected Result & Evidence"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.4.2. </b> "
---
### 1. Expected Result

* The application runs smoothly in the Localhost environment.
* The Cognito JWT authentication mechanism works accurately.
* The document upload button successfully triggers the Lambda to create a Presigned URL and uploads the original file directly to the S3 Raw Bucket.

---

### 2. Evidence

Before continuing, please confirm:

* The React application runs locally without any errors in the console.
* Successful registration and login with Cognito.
* The frontend notifies successful file upload.
* The file has appeared with the correct key in the S3 Raw Bucket.
