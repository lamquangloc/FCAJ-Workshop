---
title: "Blog 4"
date: 2026-07-03
weight: 4
chapter: false
pre: " <b> 3.4. </b> "
---

# Building a Scalable User Search Layer on Amazon Cognito

**Posted by: Nguyen Huu Tinh**

In modern systems with a large number of users, identity management is only part of the problem. The real challenge arises when there is a need to search for users based on various criteria such as email, phone number, display name, account status, or custom attributes. Although Amazon Cognito provides robust user management capabilities, advanced search functionality is not its strong suit.

To address this, AWS suggests building a separate search layer operating on top of Amazon Cognito, combining AWS Lambda, Amazon DynamoDB, and Amazon OpenSearch Service. This architecture expands search capabilities while still leveraging Cognito's existing authentication and identity management system.

### Highlights of the Solution

* **Separating authentication and search functions:** Amazon Cognito is used for its true role of user management, authentication, and access authorization. Meanwhile, search requests are handled by a separate layer to avoid impacting Cognito's performance and query limits. This approach makes the system more scalable as the number of users grows in the future.
* **Data synchronization with AWS Lambda:** Whenever a user is created, updated, or deleted in Cognito, AWS Lambda is triggered to synchronize the information to other storage and search services. Thanks to this event-driven mechanism, search data is always updated in near real-time without the need for manual synchronization tasks.
* **DynamoDB as the intermediate storage layer:** Amazon DynamoDB is used to store user data in a structured format, supporting fast access with low latency and automatic scaling. Using DynamoDB helps offload Cognito while providing a stable data source for backend processing tasks.
* **OpenSearch enhances search capabilities:** Amazon OpenSearch Service is the most important component in this architecture. User data is indexed to support flexible search methods such as:
  * Keyword search.
  * Fuzzy search.
  * Multi-attribute search.
  * Condition-based data filtering.
  * Pagination and sorting of results.
  * This significantly improves the user search experience compared to Cognito's default queries.
* **Scalability suitable for large systems:** As the number of accounts grows from thousands to millions of users, the architecture can still scale by increasing the processing capacity of DynamoDB and OpenSearch without changing how Cognito operates. This helps enterprises maintain stable performance even when the system scales rapidly.

### Role of AWS Services

The architecture is built on the coordination of multiple AWS services:
* **Amazon Cognito:** User management and authentication.
* **AWS Lambda:** Event-driven data synchronization.
* **Amazon DynamoDB:** User data storage.
* **Amazon OpenSearch Service:** Performing advanced searches.

Each component assumes a distinct task, making the system easy to manage, easy to scale, and less dependent on a single service.

### Benefits for Enterprises

Building a dedicated search layer on top of Cognito brings many benefits:
* Accelerates user search speed.
* Supports complex queries.
* Easily scalable as data grows.
* Offloads the authentication system.
* Enhances the user administration experience.
* Flexibility in adding new search attributes.

This is an ideal solution for SaaS applications, e-commerce platforms, online education systems, or services with a large user base.

### Conclusion

Amazon Cognito is a powerful identity management platform, but the need for user search at scale often requires capabilities beyond its default functions. By combining AWS Lambda, DynamoDB, and Amazon OpenSearch Service, AWS has built an architecture that enables scalable search capabilities while maintaining effective user management on Cognito.

This solution represents a popular approach in modern architecture: each service focuses on solving a specific problem, and they are then connected together to create a flexible, efficient system ready to scale according to actual needs.

---
**Original Post / Read more:** 
[Building a scalable user search layer on top of Amazon Cognito](https://aws.amazon.com/vi/blogs/architecture/building-a-scalable-user-search-layer-on-top-of-amazon-cognito/)

### Reference Images

![Solution Architecture](/images/3-BlogsPosted/3.4-Blog4/blog4architecture.jpg)
