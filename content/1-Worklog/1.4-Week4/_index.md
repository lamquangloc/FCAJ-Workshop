---
title: "Week 4 Worklog"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.4. </b> "
---


### Week 4 Objectives:

* Understand and implement a Hybrid DNS architecture connecting on-premise networks with AWS using Amazon Route 53 Resolver.
* Learn core NoSQL database concepts and practice data operations with Amazon DynamoDB.

### Tasks to be carried out this week:
| Day | Task | Start Date | Completion Date | Reference Material |
| --- | --- | --- | --- | --- |
| 2 | - Learn the theory of Hybrid DNS management using Route 53.<br>- Prepare CloudFormation infrastructure, Security Groups, and set up the Microsoft AD environment on AWS. | 05/25/2026 | 05/25/2026 | <https://000010.awsstudygroup.com/> |
| 3 | - **Route 53 Resolver Practice:**<br>&emsp; + Create Outbound Endpoints.<br>&emsp; + Configure Resolver Rules to forward DNS queries.<br>&emsp; + Create Inbound Endpoints and test two-way DNS resolution between AWS and on-premise.<br>&emsp; + Clean up resources. | 05/26/2026 | 05/26/2026 | <https://000010.awsstudygroup.com/> |
| 4 | - Learn DynamoDB core concepts: Primary Key, Secondary Indexes, Capacity Modes (Read/Write), Consistency.<br>- **AWS Console Practice:**<br>&emsp; + Create a DynamoDB table, add, modify, read, and query data.<br>&emsp; + Create and query a Global Secondary Index (GSI). | 05/27/2026 | 05/27/2026 | <https://000060.awsstudygroup.com/> |
| 5 | - **AWS CloudShell / CLI Practice:**<br>&emsp; + Repeat table creation, write, read, update, and query operations using the command-line.<br>&emsp; + Create and query GSI via CLI.<br>&emsp; + Clean up DynamoDB resources. | 05/28/2026 | 05/28/2026 | <https://000060.awsstudygroup.com/> |

### Week 4 Achievements:

* Understood and successfully deployed a Hybrid DNS model with Route 53 Resolver.
  * Successfully configured Inbound and Outbound endpoints.
  * Understood how to route domain name resolution traffic between AWS and an on-premise DNS server.

* Mastered basic concepts and operations on Amazon DynamoDB.
  * Gained deep understanding of key structures (Partition key, Sort key) and Indexes (GSI, LSI).
  * Learned to use both the Console and CloudShell/CLI to manage data lifecycles (CRUD operations) and perform queries.
