---
title: "API Gateway Configuration"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.7.3. </b> "
---
In this section, we will configure Amazon API Gateway to act as the primary endpoint for all deployed Lambda functions. Additionally, we will secure the API by integrating a Cognito Authorizer.

---

### Step 1: Configure API Gateway Resources

1. Search for **API Gateway** in the AWS Console.
   
   ![image15.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image15.png)

2. Select the API Gateway that was previously created (or create a new HTTP/REST API).
   
   ![image16.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image16.png)
   
3. Select the `document` resource.
   
   ![image17.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image17.png)
   
4. Click **Create resource**.
   
   ![image18.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image18.png)
   
5. Enter `{documentId}` as the resource name.
   
   ![image19.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image19.png)
   
6. Click **Create resource**.
   
   ![image20.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image20.png)
   
7. Repeat the process to create the following resource paths:
   * `/documents/{documentId}/process`
   
     ![image21.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image21.png)
     ![image22.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image22.png)
     ![image23.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image23.png)
     ![image24.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image24.png)
   
   * `/documents/{documentId}/review`
   
     ![image25.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image25.png)
     ![image26.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image26.png)
   
8. Verify the completed resource structure.
   
   ![image27.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image27.png)

---

### Step 2: Create Methods and Integrate Lambdas

1. Select the `document` resource and click **Create method**.
   
   ![image28.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image28.png)
   
2. Select **GET** as the method type.
   
   ![image29.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image29.png)
   
3. Enable **Lambda proxy integration**.
   
   ![image30.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image30.png)
   
4. Choose the lambda function ending with `docuflow-dev-data-list-documents-lambda`.
   
   ![image31.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image31.png)
   
5. Click **Create method**.
   
   ![image32.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image32.png)

6. Repeat the process to create the following methods and map them to their respective Lambda functions. Routes marked **optional extension** depend on the three extended Lambdas from section 5.7.2 and are not required for the approved MVP:
   
   * **Optional extension:** `DELETE /documents` ➔ `docuflow-dev-data-delete-lambda`
     ![image33.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image33.png)
     ![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image34.png)
     ![image35.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image35.png)
     ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image36.png)
     
   * **Optional extension:** `DELETE /documents/{documentId}` ➔ `docuflow-dev-data-delete-lambda`
     ![image33.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image33.png)
     ![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image34.png)
     ![image35.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image35.png)
     ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image36.png)
     
   * `GET /documents/{documentId}` ➔ `docuflow-dev-data-get-document-lambda`
     ![image37.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image37.png)
     ![image38.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image38.png)
     ![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image34.png)
     ![image39.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image39.png)
     ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image36.png)
     
   * **Optional extension:** `POST /documents/{documentId}/process` ➔ `docuflow-dev-data-process-control-lambda`
     ![image40.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image40.png)
     ![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image34.png)
     ![image41.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image41.png)
     ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image36.png)
     
   * `PATCH /documents/{documentId}/review` ➔ `docuflow-dev-data-review-update-lambda`
     ![image42.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image42.png)
     ![image34.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image34.png)
     ![image36.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image36.png)
     ![image43.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image43.png)

   * **Optional extension:** `POST /documents/{documentId}/retry` ➔ `docuflow-dev-data-process-control-lambda`
   * `POST /documents/upload-url` ➔ `docuflow-dev-api-generate-upload-url-lambda`
   * **Optional extension:** `GET /notifications` ➔ `docuflow-dev-data-dashboard-lambda`
   * **Optional extension:** `PATCH /notifications/{notificationId}` ➔ `docuflow-dev-data-dashboard-lambda`
   * **Optional extension:** `GET /activity` ➔ `docuflow-dev-data-dashboard-lambda`
   * **Optional extension:** `GET /reports/summary` ➔ `docuflow-dev-data-dashboard-lambda`

---

### Step 3: Configure Cognito Authorizer

1. In the API Gateway console, select **Authorizers** from the left navigation pane.
   
   ![image44.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image44.png)
   
2. Click **Create authorizer**.
   
   ![image45.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image45.png)
   
3. Enter `docuflow-dev-cognito-authorizer` as the name.
   
   ![image46.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image46.png)
   
4. Set the Authorizer type to **Cognito**.
   
   ![image47.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image47.png)
   
5. Select the Cognito User Pool created earlier.
   
   ![image48.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image48.png)
   
6. Enter `Authorization` into the Token source field.
   
   ![image49.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image49.png)
   ![image50.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image50.png)
   
7. Click **Create authorizer**.
   
   ![image51.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image51.png)

---

### Step 4: Secure Methods using the Authorizer

1. Navigate to the `DELETE` method of `/documents` and click **Edit** in the Method request settings.
   
   ![image52.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image52.png)
   
2. Under Authorization, select the Cognito Authorizer created previously and click **Save**.
   
   ![image53.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image53.png)
   ![image54.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image54.png)
   
3. Repeat this process for all other methods:
   * `GET /documents`
   * `DELETE /documents` *(optional extension)*
   * `GET /documents/{documentId}`
   * `DELETE /documents/{documentId}` *(optional extension)*
   * `POST /documents/{documentId}/process` *(optional extension)*
   * `POST /documents/{documentId}/retry` *(optional extension)*
   * `PATCH /documents/{documentId}/review`
   * `POST /documents/upload-url`
   * `GET /notifications` *(optional extension)*
   * `PATCH /notifications/{notificationId}` *(optional extension)*
   * `GET /activity` *(optional extension)*
   * `GET /reports/summary` *(optional extension)*

---

### Step 5: Deploy API and Update Frontend

1. On the main API page, click **Deploy API**.
   
   ![image55.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image55.png)
   
2. Select **New stage**, enter `dev` for the Stage name, and click **Deploy**.
   
   ![image56.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image56.png)
   
3. Once deployed, the Stage details page will appear. Copy the **Invoke URL**.
   
   ![image57.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image57.png)
   ![image58.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image58.png)
   ![image59.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image59.png)
   ![image60.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image60.png)
   ![image61.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image61.png)
   ![image62.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image62.png)
   
4. Paste the Invoke URL into the `VITE_API_GATEWAY_URL` (or `VITE_API_BASE_URL`) variable in your frontend's `.env` file.
   
   ![image63.png](/images/5-Workshop/5.7-store-result-review-flow/5.7.3-api-gateway/image63.png)
