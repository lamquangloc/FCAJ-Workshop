---
title: "Persistence & Offloading Design"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.7.1. </b> "
---
The DocuFlow AI persistence layout combines a **Single-Table Design** pattern on Amazon DynamoDB with S3 **Offloading** (separating large attributes) to optimize retrieval performance, control database costs, and bypass physical NoSQL record size boundaries.

---

### 1. Hybrid Storage Pattern

* **DynamoDB (Summary Metadata)**:
  * Persists short search properties that require high indexing/lookup rates (such as `status`, `vendorName`, `invoiceDate`, `totalAmount`, and the S3 file path location).
  * This guarantees millisecond response times for dashboard lists (`GET /documents`) while reducing DynamoDB Read/Write Capacity Units (RCUs/WCUs).

* **S3 (Detailed JSON Payload)**:
  * Heavy, nested objects (like the raw OCR outputs and the normalized array of `lineItems`, which can grow to hundreds of KB) are packed into a static `result.json` file on S3 Processed bucket under the structure:
   

    `processed/{userId}/{documentId}/result.json`
  * When a user selects a specific document to inspect, the Frontend pulls this file directly from S3.
  * **Rationale**: DynamoDB limits a single record (Item) size to **400KB**. Storing extensive invoice item lines in DynamoDB would lead to size limit exceptions or inflate read/write costs significantly.

---

### 2. Single-Table Partitioning Strategy

We enforce a single table named `docuflow-dev-documents-table` partitioned using the following keys:

* **Partition Key (`PK`)** = `USER#{userId}`
  * Co-locates all invoice documents belonging to a single user into a unified physical database partition.
  * Supports high-velocity queries (`GET /documents`) using the condition `PK = USER#{userId}`.

* **Sort Key (`SK`)** = `DOC#{documentId}`
  * Ensures uniqueness for each document uploaded by the user.
  * Enables $O(1)$ lookup complexity for Get and Update operations.

* **Global Secondary Index (GSI) for Status Filters**:
  * **GSI Partition Key (`GSI1PK`)** = `STATUS#{status}` (e.g. `STATUS#PROCESSING`, `STATUS#REVIEW_REQUIRED`).
  * **GSI Sort Key (`GSI1SK`)** = `createdAt` (document creation timestamp).
  * **Index name**: `docuflow-dev-documents-status-createdAt-index`
  * **Projection**: `All` (projects all attributes to the GSI index for instant dashboard consumption).
  * **Rationale**: Enables queries like "Show only invoices waiting for review" sorted by latest creation dates.

---

### 3. DynamoDB Record Schema Example

| PK | SK | documentId | userId | status | GSI1PK | GSI1SK |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `USER#user-001` | `DOC#doc-17195616` | `doc-17195616` | `user-001` | `PROCESSING` | `STATUS#PROCESSING` | `2026-06-28T09:00:00Z` |
| `USER#user-001` | `DOC#doc-17195617` | `doc-17195617` | `user-001` | `REVIEW_REQUIRED` | `STATUS#REVIEW_REQUIRED` | `2026-06-28T09:10:00Z` |
| `USER#user-001` | `DOC#doc-17195618` | `doc-17195618` | `user-001` | `APPROVED` | `STATUS#APPROVED` | `2026-06-28T09:20:00Z` |

---

### Evidence

- Verify that the DynamoDB item contains the expected metadata keys and status.
- Verify that `result.json` exists under the expected S3 Processed prefix.