---
title: "Blog 5"
date: 2026-07-03
weight: 5
chapter: false
pre: " <b> 3.5. </b> "
---

# How ALS GeoAnalytics LITHOLENS™ Revolutionizes Core Logging Through Machine Learning on Amazon EKS

**Posted by: Pham Tung Duong**

In the mining industry, accurate geological analysis is a key factor in improving mine design and development. Traditionally, this process requires experts to physically inspect core samples in the field—often in remote and harsh areas—which is very time-consuming and labor-intensive.

To address this, ALS GeoAnalytics developed the LITHOLENS™ platform. It is a system applying Machine Learning (ML) and computer vision to automate the core logging process, helping to enhance data consistency, improve operational efficiency, and reduce costs as well as greenhouse gas emissions.

### Challenges in the Traditional Method

Building a 3D resource model for a new mine requires drilling thousands of holes to inspect the structure and composition of samples. This process faces many barriers such as:
* **Difficult field access:** Geologists have to travel long distances to inspect physical sample boxes.
* **Subjective assessment:** Different experts often provide inconsistent geological logs.
* **Forgotten historical data:** Images from previous campaigns often lack standardization tools for meaningful analysis.
* **Sample degradation:** Physical samples can be lost or damaged over time, making it difficult to validate old data.

### Machine Learning at Geological Scale

LITHOLENS™ uses a comprehensive suite of ML and Deep Learning (DL) models to turn raw images into actionable insights:
* **Color Extraction and Clustering:** Uses algorithms like K-Means or GMM to identify mineralogical variations through color pixels.
* **Percentage Reporting:** Segments images into sections (e.g., 20cm intervals) to analyze the spatial distribution of lithological samples.
* **Specialized Deep Learning Models:**
  * **RoQE Net:** An advanced neural network that extracts geotechnical parameters like Rock Quality Designation (RQD).
  * **VeinNet and CobbleNet:** Designed to identify complex geological features such as mineral veins and lithological structures with high accuracy.

### Solution Architecture on AWS

ALS GeoAnalytics built a hybrid architecture combining containerized workloads and serverless components:
* **Amazon EKS (Elastic Kubernetes Service):** Handles heavy ML/DL tasks requiring GPU computing power (G6 instance types).
* **AWS Lambda:** Processes API operations and orchestration, reducing operational costs compared to maintaining always-on API servers.
* **Amazon S3 and Amazon RDS:** Used for storing input data, intermediate results, and managing structured data.
* **Performance highlights:** Thanks to using pre-configured Amazon Machine Images (AMIs), container startup times have decreased from several minutes to under 30 seconds. Additionally, EKS clusters can automatically scale down to 0 when there are no jobs in the queue, maximizing cost optimization.

### Business Impact and Future Vision

To date, LITHOLENS™ has been successfully deployed at 10 mining companies with over 40 active projects. The system not only helps standardize the analysis process but also allows real-time monitoring and reporting, helping managers make faster and more accurate decisions.

The success of LITHOLENS™ on Amazon EKS does not stop at the mining industry. ALS GeoAnalytics is looking to expand this platform into areas such as oil and gas, civil engineering, and even space exploration.

---
**Original Post / Read more:** 
[How ALS GeoAnalytics LITHOLENS™ revolutionizes core logging through machine learning with Amazon EKS](https://aws.amazon.com/vi/blogs/architecture/how-als-geoanalytics-litholens-revolutionizes-core-logging-through-machine-learning-with-amazon-eks/)

### Reference Images

![Solution Architecture](/images/3-BlogsPosted/3.5-Blog5/blog5architecture.jpg)
