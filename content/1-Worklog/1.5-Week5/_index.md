---
title: "Week 5 Worklog"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.5. </b> "
---


### Week 5 Objectives:

* Learn and deploy Amazon CloudFront for static/dynamic content delivery coupled with S3 and EC2.
* Apply Edge Computing concepts by integrating Lambda@Edge with CloudFront.
* Implement Serverless Automation to optimize EC2 infrastructure costs using AWS Lambda.
* Establish secure Access Control utilizing IAM conditional policies with Resource Tags.

### Tasks to be carried out this week:
| Day | Task | Start Date | Completion Date | Reference Material |
| --- | --- | --- | --- | --- |
| 2 | - Learn Content Delivery with Amazon CloudFront.<br>- **Practice:**<br>&emsp; + Create an S3 bucket and upload static web content (index.html).<br>&emsp; + Configure a CloudFront distribution with S3 as the origin to secure and accelerate page loads.<br>&emsp; + Test and clean up resources. | 01/06/2026 | 01/06/2026 | <https://000094.awsstudygroup.com/> |
| 3 | - Advanced CloudFront configurations (Origin Group, Custom Error Page, Cache Behavior).<br>- **Practice Part 1:**<br>&emsp; + Prepare EC2 and S3 origins.<br>&emsp; + Create a CloudFront Distribution with EC2 origin and test invalidations.<br>&emsp; + Configure a Custom Error Page, Origin Group, and Response Headers. | 02/06/2026 | 02/06/2026 | <https://000130.awsstudygroup.com/> |
| 4 | - Explore Edge Computing with Lambda@Edge.<br>- **Practice Part 2:**<br>&emsp; + Create a new Cache Behavior on CloudFront.<br>&emsp; + Create a Lambda@Edge function and deploy it to CloudFront.<br>&emsp; + Monitor using Metrics/Logs and clean up resources. | 03/06/2026 | 03/06/2026 | <https://000130.awsstudygroup.com/> |
| 5 | - Learn Serverless Automation to optimize EC2 running costs.<br>- **Practice:**<br>&emsp; + Provision infrastructure: VPC, Security Group, EC2, and Slack webhooks.<br>&emsp; + Tag the EC2 instance appropriately.<br>&emsp; + Create an IAM Role and Lambda functions to automatically Stop/Start the EC2 instance.<br>&emsp; + Verify results and clean up. | 04/06/2026 | 04/06/2026 | <https://000022.awsstudygroup.com/> |
| 6 | - Manage EC2 access using IAM combined with Resource Tags (Least privilege model).<br>- **Practice:**<br>&emsp; + Create an IAM User and an IAM Policy with tag-based conditions.<br>&emsp; + Create an IAM Role and perform Switch Roles.<br>&emsp; + Verify policy constraints: attempt to launch EC2 without tags, with valid tags, edit tags, and manage instances based on tags. | 05/06/2026 | 05/06/2026 | <https://000028.awsstudygroup.com/> |

### Week 5 Achievements:

* Successfully deployed a CDN system using Amazon CloudFront.
  * Delivered static content from S3 securely with high performance.
  * Configured advanced routing: Origin Groups (for failover), Custom Error Pages, and specific Cache Behaviors.
* Mastered Edge Computing with Lambda@Edge.
  * Wrote and deployed serverless code to customize HTTP requests/responses at Edge Locations.
* Applied Serverless Automation for cost optimization.
  * Used AWS Lambda to automate the start/stop schedule of EC2 instances, eliminating idle running costs.
* Successfully implemented a Least Privilege security model.
  * Granted fine-grained access to resources strictly based on Resource Tags and IAM Conditions.
