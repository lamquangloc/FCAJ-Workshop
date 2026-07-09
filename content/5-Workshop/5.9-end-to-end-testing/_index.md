---
title: "End-to-End Testing"
date: 2024-01-01
weight: 9
chapter: false
pre: " <b> 5.9. </b> "
---
### 1. Goal
Execute a complete integration test of the system from the frontend interface down to the background processing pipelines, verifying all distinct logic paths to collect testing evidence.

### 2. Test Scenarios

#### Scenario 1: Human-in-the-loop Flow (Blurry Invoice / Low Confidence)
* **Simulation steps**: Upload a blurry receipt or an invoice missing critical fields like the total amount (totalAmount).
* **System workflow**:
  1. The document is uploaded and processed through the pipeline steps.
  2. During the confidence check, the Confidence & Status Lambda detects that the average confidence score is < 90% or missing critical fields.
  3. The Lambda function updates the DynamoDB item status to `REVIEW_REQUIRED` and sets the review status to `PENDING`.
  4. A CloudWatch Alarm fires on status changes, publishing an email alert to the Admin via SNS/SES.
  5. The Admin opens the Reviewer Dashboard on the Frontend, examining the review form containing the low-confidence fields.
  6. The Admin corrects the values and clicks **Approve**. The Frontend sends a PATCH request to the `review-update` Lambda, changing DynamoDB status to `APPROVED` and overwriting the corrected `result.json` in S3.
* **Evidence**:

  ![Review Notification](/images/5-Workshop/5.9-end-to-end-testing/review-notification.png)

  ![Reviewer Dashboard](/images/5-Workshop/5.9-end-to-end-testing/human-review-dashboard.png)

  ![Low Confidence Fields](/images/5-Workshop/5.9-end-to-end-testing/low-confidence-fields.png)

  ![Review Timeline](/images/5-Workshop/5.9-end-to-end-testing/review-timeline.png)

#### Scenario 2: Validation Failure (Invalid File Format)
* **Simulation steps**: Upload a plain text `.txt` file (or a file larger than 10MB).
* **System workflow**:
  1. The Frontend checks if the file has the correct format.
  2. If the format is invalid, the Frontend will display an error for the invalid file and prevent it from being uploaded.
* **Evidence**: 

  ![Invalid File Format](/images/5-Workshop/5.9-end-to-end-testing/invalid-file-format.png)

#### Scenario 3: View Document List
* **Simulation steps**: Navigate to the document list page on the user interface.
* **System workflow**:
  1. The Frontend calls the API to retrieve the list of uploaded documents from the backend.
  2. The UI displays the list of documents along with basic information: file name, upload date, and processing status (e.g., APPROVED, REVIEW_REQUIRED, FAILED).
* **Evidence**: 

  ![Document List 1](/images/5-Workshop/5.9-end-to-end-testing/document-list-1.png)

  ![Document List 2](/images/5-Workshop/5.9-end-to-end-testing/document-list-2.png)

#### Scenario 4: View Extraction Details
* **Simulation steps**: Click on a successfully processed document in the list.
* **System workflow**:
  1. The Frontend calls the API to retrieve the extracted details of the document along with the original file URL.
  2. The UI displays the document details, including the original image/PDF alongside the extracted data fields (Vendor Name, Total Amount, Date, etc.).
* **Evidence**: 

  ![Extraction Details 1](/images/5-Workshop/5.9-end-to-end-testing/extraction-details-1.png)

  ![Extraction Details 2](/images/5-Workshop/5.9-end-to-end-testing/extraction-details-2.png)

  ![Extraction Details 3](/images/5-Workshop/5.9-end-to-end-testing/extraction-details-3.png)

#### Scenario 5: Search, Filter & Dashboard Statistics
* **Simulation steps**: 
  1. Switch between different status tabs (e.g., "Action Required", "Approved").
  2. Type a vendor name (e.g., "ForceStore") into the search bar.
* **System workflow**:
  1. The Frontend sends an API query request with the corresponding parameters (status, keyword).
  2. The Backend executes the query on DynamoDB and returns the filtered results.
  3. The UI updates the list and the real-time statistic cards reflecting the total document counts.
* **Evidence**: 

  ![Filter Evidence 1](/images/5-Workshop/5.9-end-to-end-testing/filter-evidence-1.png)

  ![Filter Evidence 2](/images/5-Workshop/5.9-end-to-end-testing/filter-evidence-2.png)

  ![Filter Evidence 3](/images/5-Workshop/5.9-end-to-end-testing/filter-evidence-3.png)

  ![Filter Evidence 4](/images/5-Workshop/5.9-end-to-end-testing/filter-evidence-4.png)

#### Scenario 6: Export Reports & View Raw Data (Export CSV & View JSON)
* **Simulation steps**:
  1. Click the **"Export CSV"** button on the document list page.
  2. Open the details of a document and click the **"JSON"** or **"Download original"** button.
* **System workflow**:
  1. The Export CSV feature aggregates the data from the current list and triggers a `.csv` file download in the browser.
  2. The "JSON" button displays the raw JSON data returned by Textract/AI Proxy that is stored in the system.
* **Evidence**: 

  ![Export CSV and JSON 1](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-1.png)

  ![Export CSV and JSON 2](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-2.png)

  ![Export CSV and JSON 3](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-3.png)

  ![Export CSV and JSON 4](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-4.png)

  ![Export CSV and JSON 5](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-5.png)

  ![Export CSV and JSON 6](/images/5-Workshop/5.9-end-to-end-testing/export-evidence-6.png)

### 3. Expected Result
* The asynchronous processing pipeline and frontend interface behave correctly across all test scenarios.
* Automated alerting dispatches warnings on failures and review-required triggers.
* S3 and DynamoDB maintain consistent data mapping.
