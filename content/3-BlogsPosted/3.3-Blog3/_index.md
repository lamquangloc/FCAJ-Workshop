---
title: "Blog 3"
date: 2026-07-03
weight: 3
chapter: false
pre: " <b> 3.3. </b> "
---

# Building a Multi-Account Patch Compliance Dashboard with Kiro Specs

**Posted by: Hoang Trong Tra**

When a system only has a few EC2 instances or a few AWS accounts, checking which machines are patched and which are missing updates can be done manually. But when the environment scales to multiple accounts, multiple Regions, and various workloads, tracking patch compliance becomes much harder to control.

This AWS Blog caught my attention because it doesn't just talk about creating a dashboard; it also shows how to build that dashboard systematically using Kiro Specs.

### Core Idea of the Solution
Patch compliance data from AWS Systems Manager Patch Manager is exported to Amazon S3 via Resource Data Sync. Then, a periodically running Lambda reads this raw data, aggregates it into JSON cache files, and the dashboard simply reads the pre-processed data to display it faster.

### Key Highlights

* **Secure Internal Access:** The dashboard is not exposed to the public Internet. Users access it via AWS Systems Manager Session Manager port forwarding to an internal Application Load Balancer. This approach makes the system safer since there's no need to open a public endpoint for a dashboard containing internal compliance information.
* **Data Flow Separation:** The solution clearly separates source data and dashboard-serving data. The Resource Data Sync bucket is just a repository for raw data. The dashboard uses a separate S3 bucket to store frontend assets and aggregated cache. Because of this, the dashboard doesn't have to read thousands of raw files every time a user opens the page.
* **Reasonable Serverless Architecture:** Lambda handles the frontend, API, and cache aggregation; EventBridge triggers Lambda to update the cache every 30 minutes; ALB routes internal requests to Lambda. This approach minimizes server operations and fits well with a dashboard that doesn't necessarily have continuous traffic.
* **Layered Design (Drill-down):** The dashboard is designed in two layers. The first layer gives an overview such as total instances, compliance rate, compliant/non-compliant machine count, categorized by platform and severity. When a deeper look is needed, users can drill down into each account to know which instances are missing patches and specifically which patches they lack.

### Working with Kiro Specs

The part I found most interesting is how the article uses Kiro Specs. Instead of just asking AI to write code immediately, Kiro follows the process of **Requirements -> Design -> Tasks**. This means you must first clearly define what needs to be built, then design the architecture and data flow, before breaking it down into implementation tasks.

This method helps AI "guess" less. Especially for security-related systems like a compliance dashboard, if things aren't made clear from the start, AI might generate inappropriate designs, such as opening public endpoints or processing data sub-optimally.

The article also uses **steering files** to keep context for Kiro, for example, `architecture.md`, `data-schemas.md`, `compliance-logic.md`, `frontend-specs.md`, and `security.md`. From my understanding, this is like writing down the "rules of the game" for the project in advance so that AI always adheres to them when creating requirements, design, or code.

### Lessons Learned

What I learned after reading this article is: a well-operated dashboard is not just about a beautiful interface or clear charts. The more important part is where the data comes from, how it's processed, whether access permissions are secure, and if the architecture is easily scalable when the number of accounts increases.

---
**Original Post / Read more:** 
[Build a multi-account patch compliance dashboard with Kiro Specs](https://aws.amazon.com/vi/blogs/mt/build-a-multi-account-patch-compliance-dashboard-with-kiro-specs/?fbclid=IwY2xjawS0FfdleHRuA2FlbQIxMABicmlkETFWaGU1Y1hlNVZmMU1KMlJyc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHufwuH-a8mRgofEZnifnepwt7m95MSI7G9VYAiROK76vhOERSNEnjEpJhCfl_aem_rmdqdLNx0MCSzTFFUyH5-g)

### Reference Images

![Solution Architecture](/images/3-BlogsPosted/3.3-Blog3/blog3architecture.jpg)