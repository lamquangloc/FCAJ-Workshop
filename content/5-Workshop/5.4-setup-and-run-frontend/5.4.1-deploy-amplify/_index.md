---
title: "Deploy Frontend with AWS Amplify Hosting"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.4.1. </b> "
---
Use AWS Amplify Hosting to publish the React/Vite frontend as a production web application. This step should be completed after the Cognito User Pool is created and after the API Gateway Invoke URL is available from section **5.7.3**.

---

### 1. Goal

Deploy the DocuFlow AI frontend from GitHub, configure production environment variables, verify the Amplify domain, and confirm the hosted application can call the backend API.

---

### 2. Prerequisites

Before starting, prepare these values:

| Variable | Source |
| --- | --- |
| `VITE_COGNITO_REGION` | AWS Region, for example `ap-southeast-1` |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool details page |
| `VITE_COGNITO_CLIENT_ID` | Cognito App client details page |
| `VITE_API_BASE_URL` | API Gateway stage Invoke URL from section 5.7.3 |

> Do not put server-side secrets in Vite variables. Any variable prefixed with `VITE_` is bundled into the browser application.

---

### 3. Deploy with Amplify Hosting

1. Open the **AWS Amplify** console.
2. Choose **New app** -> **Host web app** or **Deploy an app**.
![Open AWS Amplify and create a new app](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image1.png)
3. Select your Git provider, for example **GitHub**, then authorize the AWS Amplify GitHub App if prompted.
![Select GitHub as the source repository provider](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image2.png)
4. Select the repository that contains the frontend source code.
5. Select the branch to deploy, for example `main`.
![Select repository and deployment branch](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image3.png)
6. If the repository is a monorepo, set the application root to:

```text
apps/web
```

7. On the build settings page, confirm or replace the build specification with:
![Update the build specification](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image4.png)

```yaml
version: 1
applications:
  - appRoot: apps/web
    frontend:
      phases:
        preBuild:
          commands:
            - corepack enable
            - pnpm install --frozen-lockfile
        build:
          commands:
            - pnpm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - apps/web/node_modules/**/*
```

8. Add the production environment variables:
![Add production environment variables](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image5.png)

```env
VITE_COGNITO_REGION=ap-southeast-1
VITE_COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.ap-southeast-1.amazonaws.com/dev
```

9. Review the configuration and choose **Save and deploy**.
![Review configuration and choose Save and deploy](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image6.png)
10. Wait for the build pipeline to finish. The stages should complete successfully: **Provision**, **Build**, **Deploy**, and **Verify**.
11. Open the Amplify domain, for example:
![Amplify deployment succeeded with a deployed URL](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image7.png)

```text
https://main.xxxxx.amplifyapp.com
```

---

### 4. Configure SPA Routing

If refreshing a frontend route returns a 404 page, add a rewrite rule in Amplify:

| Source address | Target address | Type |
| --- | --- | --- |
| `</^[^.]+$|\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |

Save the rule and redeploy the app if Amplify prompts you to do so.

---

### 5. Verify the Hosted Frontend

1. Open the Amplify app URL.
![Frontend running on the Amplify domain](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image8.png)
2. Register or sign in with a Cognito test user.
![Register an account on the hosted frontend](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image9.png)
3. Enter the verification code sent by email to confirm the account.
![Enter the Cognito verification code](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image10.png)
![Verification email with the code](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image11.png)
![Account confirmation succeeds](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image12.png)
4. Confirm the user is created and confirmed in the Cognito User Pool.
![Confirmed Cognito user](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image14.png)
5. Sign in to the application dashboard.
![Frontend dashboard after sign-in](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image13.png)
6. Choose **Upload document** to open the document upload flow.
![Open the Upload document flow](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image15.png)
7. Select a sample invoice or document to upload.
![Select a file to upload](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image16.png)
![Preview the document before upload](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image17.png)
8. Click **Upload and process** and wait for the frontend to submit the file to the backend.
![Start document upload and processing](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image18.png)
![Upload completes and processing starts](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image19.png)
9. Open the document detail page to inspect extracted data and review status.
![Document detail after processing](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image20.png)
10. Review and approve the result to confirm the frontend calls API Gateway successfully.
![Review and approve the processing result](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image21.png)
11. Open the S3 Raw bucket and verify the uploaded file appears under the expected prefix:
![File appears in the S3 Raw bucket](/images/5-Workshop/5.4-setup-and-run-frontend/5.4.1-deploy-amplify/image22.png)

```text
raw/{userId}/{documentId}/original.pdf
```

If the browser reports a CORS error, update the API Gateway CORS configuration to allow the Amplify domain, then redeploy the API stage.

---

### 6. References

* [Getting started with deploying an app to Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html)
* [Setting up Amplify access to GitHub repositories](https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html)
* [Configuring the build settings for an Amplify application](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
* [Setting environment variables](https://docs.aws.amazon.com/amplify/latest/userguide/setting-env-vars.html)
