---
title: "Configure DynamoDB Table"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.3.4. </b> "
---
What is Amazon DynamoDB? Unlike the S3 hard drive used to store files, DynamoDB is a blazing fast Database used to store table-like data. This table will store concise metadata such as: document ID, processing history, amounts, and statuses so the Frontend application can search and display it quickly.

1. Access the DynamoDB service:
Search for DynamoDB in the AWS toolbar and select the service.

![image10.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image10.png)

2. Create a new table:
On the left menu, select Tables, then click the **Create table** button.

![image11.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image11.png)

3. Configure the primary key (Table details):
* **Table name**: Enter `docuflow-dev-documents-table`. Or another name based on your established requirements.
![image12.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image12.png)
* **Partition key** (the main key to find data): Enter `PK` as the field name and choose `String` as the data type next to it. (Additional explanation: In reality, this field will store data in the form of `USER#{userId}` to group all documents of 1 user into one place).
![image13.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image13.png)
* **Sort key** (the secondary key): Check the **Add sort key** box. Enter `SK` as the field name and choose `String` as the data type. (This field will be stored in the form of `DOC#{documentId}` to distinguish documents of the same user).

![image14.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image14.png)

4. Configure Global Secondary Index (GSI):
Why do we need a GSI? If you want to find documents by "Status" (e.g., finding failed documents) instead of by "User", you need to create a secondary search index called GSI.

* Scroll down to the **Table settings** section, switch from **Default settings** to **Customize settings**.

![image15.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image15.png)

* Scroll down to the **Secondary indexes** section and click **Create index**.

![image16.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image16.png)

* **Partition key** (of the Index): Enter `GSI1PK` (`String` type). (The actual stored value will be `STATUS#{status}` ).
![image17.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image17.png)
* **Sort key** (of the Index): Enter `GSI1SK` (`String` type). (The actual stored value will be the `createdAt` timestamp field).
![image18.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image18.png)
* **Index name**: Change it exactly to: `docuflow-dev-documents-status-createdAt-index`. Or based on your established requirements.
![image19.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image19.png)
* **Attribute projection**: Select **All** to ensure all necessary data is returned to the Frontend when searching by status.
![image20.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image20.png)
* Click **Create index** to confirm the index configuration.

![image21.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image21.png)

5. Add Tags to configure and help easily manage the project:

![image22.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image22.png)
6. Finish creating the table:
Keep other default configurations unchanged, scroll to the bottom of the page and click **Create table**. The system will take about 1-2 minutes to create the table and index.
![image23.png](/images/5-Workshop/5.3-prepare-project-foundation/5.3.4-dynamodb/image23.png)