---
title: "Setup and Run Frontend"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---
### 1. Goal
Download the Frontend source code (React/Vite), configure the environment variables to connect with AWS resources created in step 3, start the local development server, and verify user signup/login using Amazon Cognito, along with raw document uploads using S3 Presigned URLs.

### 2. Steps

This section first prepares the frontend for local development. After the backend API is available, continue with **[5.4.1 Deploy Frontend with AWS Amplify Hosting](5.4.1-deploy-amplify/)** to publish the production frontend URL.

#### Step 1: Initialize Amazon Cognito User Pool 
To secure user access using standard JWT tokens before uploading files:

1. Search for **Cognito** in the AWS Console search bar.
   
   ![image1.png](/images/5-Workshop/5.4-setup-and-run-frontend/image1.png)

2. In the User pools interface, click **Create user pool**.
   
   ![image2.png](/images/5-Workshop/5.4-setup-and-run-frontend/image2.png)

3. Under Application type, select **Single-page application (SPA)**.
   
   ![image3.png](/images/5-Workshop/5.4-setup-and-run-frontend/image3.png)

4. Enter `docuflow-dev-auth-user-pool` as the application name.
   
   ![image4.png](/images/5-Workshop/5.4-setup-and-run-frontend/image4.png)

5. For Options for sign-in identifier, check **Email**.
   
   ![image5.png](/images/5-Workshop/5.4-setup-and-run-frontend/image5.png)

6. For Required attributes for sign-up, select `email`, `family_name`, and `given_name`.
   
   ![image6.png](/images/5-Workshop/5.4-setup-and-run-frontend/image6.png)

7. Click **Create user directory** (or Create user pool).
   
   ![image7.png](/images/5-Workshop/5.4-setup-and-run-frontend/image7.png)

8. Save the `UserPoolID` and `ClientID` for your `.env` configuration file.
   
   ![image8.png](/images/5-Workshop/5.4-setup-and-run-frontend/image8.png)
   ![image9.png](/images/5-Workshop/5.4-setup-and-run-frontend/image9.png)

9. (Optional) You can assign these values to your `.env` file now (we'll configure it fully in Step 3).
   
   ![image10.png](/images/5-Workshop/5.4-setup-and-run-frontend/image10.png)

10. In the newly created User pool, select the **Groups** tab to create user groups.
    
    ![image11.png](/images/5-Workshop/5.4-setup-and-run-frontend/image11.png)

11. Create a group named `docuflow-dev-admin`.
    
    ![image12.png](/images/5-Workshop/5.4-setup-and-run-frontend/image12.png)

12. Click **Create group**.
    
    ![image13.png](/images/5-Workshop/5.4-setup-and-run-frontend/image13.png)

13. Repeat the process to create another group named `docuflow-dev-users` to achieve the following result:
    
    ![image14.png](/images/5-Workshop/5.4-setup-and-run-frontend/image14.png)

#### Step 2: Clone & Install Dependencies
1. Open your terminal in the workspace directory and clone the project repository:
   ```bash
   git clone https://github.com/AeroOps-AWS-FCAJ/aws-serverless-document-processing-workshop.git
   cd aws-serverless-document-processing-workshop/apps/web
   pnpm install
   pnpm run lint
   pnpm run typecheck
   ```

#### Step 3: Configure Environment Variables (`.env`)
1. Create a `.env` file in the `apps/web/` directory based on `.env.example`:
   ```env
   VITE_COGNITO_REGION=ap-southeast-1
   VITE_COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
   VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_API_BASE_URL=https://xxxxxxxxx.execute-api.ap-southeast-1.amazonaws.com/dev
   ```
   *Note: If the API Gateway is not yet available, you can leave `VITE_API_BASE_URL` blank. The frontend will automatically fall back to using Mock data for UI exploration.*
2. Save the file.

#### Step 4: Run Application & Explore (Local Demo Roles)
1. Start the local development server:
   ```bash
   pnpm --filter docuflow-ai-web dev
   ```
2. Open your browser and navigate to the provided URL (e.g., `http://localhost:5173`).
3. If Cognito is not yet fully wired, the frontend provides Mock Authentication stored in LocalStorage for authorization testing:
   * **Finance User:** `finance@docuflow.ai` / `password` (Uploads and views their own invoices, performs reviews)
   * **Administrator:** `admin@docuflow.ai` / `password` (Inspects all records, accesses Operations)

#### Step 5: Deploy the Presigned URL Lambda Function (`docuflow-dev-api-generate-upload-url-lambda`)
This Lambda function receives frontend requests, generates S3 Presigned URLs, and initializes metadata inside the DynamoDB documents table.
1. Go to **Lambda** -> click **Create function** -> **Author from scratch**.
2. **Function name**: `docuflow-dev-api-generate-upload-url-lambda`.
3. **Runtime**: Select `Node.js 18.x` or higher.
4. **Role**: Select **Use an existing role** -> choose `docuflow-dev-security-upload-url-role`.
5. Click **Create function**.
6. Under **Configuration** tab -> **General configuration**: Edit the Timeout to **10 seconds**.
7. Under **Configuration** tab -> **Environment variables**: Add the following environment variables:
   * `DOCUFLOW_DEV_TABLE_NAME` = `docuflow-dev-documents-table`
   * `DOCUFLOW_DEV_RAW_BUCKET` = `docuflow-dev-raw-<AWS_ACCOUNT_ID>-ap-southeast-1`
8. In the **Code** tab, copy and paste the code below into `index.mjs` and click **Deploy**:
{{< source-code file="services/functions/generate-upload-url/index.mjs" language="javascript" >}}

#### Step 5: Run the Dev Server & Test Uploads
1. Start the React/Vite local dev server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173` on your browser.
3. Sign up a test user account -> confirm the account using the verification code sent to your email.
4. Log in -> upload a test PDF invoice or receipt.
5. In the S3 console, check your S3 Raw Bucket to verify the file was uploaded directly to `raw/user-xxxx/doc-xxxx/original.pdf`.

### 3. Expected Result
* React Frontend runs successfully in development mode.
* Cognito JWT Authentication works perfectly.
* Frontend uploads PDF documents directly to the S3 Raw Bucket using Presigned URLs.

### 4. Evidence

Before continuing, verify that:

- The React application runs locally without console errors.
- Cognito registration and sign-in succeed.
- The upload flow reports success.
- The uploaded object appears at the expected key in the S3 Raw bucket.
