---
title: "Blog 5"
date: 2026-07-03
weight: 5
chapter: false
pre: " <b> 3.5. </b> "
---

# Cách ALS GeoAnalytics LITHOLENS™ Cách Mạng Hóa Việc Ghi Chép Mẫu Lõi Khoan Bằng Machine Learning Trên Amazon EKS

**Người đăng bài: Phạm Tùng Dương**

Trong ngành khai thác khoáng sản, việc phân tích địa chất chính xác là yếu tố then chốt để cải thiện thiết kế và phát triển mỏ. Theo phương pháp truyền thống, quy trình này đòi hỏi các chuyên gia phải kiểm tra trực tiếp các mẫu lõi khoan tại hiện trường—thường là những khu vực xa xôi và khắc nghiệt—vốn rất tốn thời gian và công sức.

Để giải quyết vấn đề này, ALS GeoAnalytics đã phát triển nền tảng LITHOLENS™. Đây là một hệ thống ứng dụng Machine Learning (ML) và thị giác máy tính để tự động hóa quy trình ghi chép mẫu lõi, giúp tăng cường tính nhất quán của dữ liệu, nâng cao hiệu quả vận hành và giảm thiểu chi phí cũng như khí thải nhà kính.

### Những Thách Thức Trong Phương Pháp Truyền Thống

Việc xây dựng mô hình tài nguyên 3D cho một mỏ mới đòi hỏi phải khoan hàng nghìn lỗ để kiểm tra cấu trúc và thành phần mẫu vật. Quy trình này đối mặt với nhiều rào cản như:
* **Tiếp cận hiện trường khó khăn:** Các nhà địa chất phải di chuyển quãng đường dài để kiểm tra các hộp mẫu vật lý.
* **Đánh giá mang tính chủ quan:** Các chuyên gia khác nhau thường đưa ra những ghi chép địa chất không đồng nhất.
* **Dữ liệu lịch sử bị lãng quên:** Hình ảnh từ các chiến dịch trước đó thường thiếu công cụ chuẩn hóa để phân tích có ý nghĩa.
* **Mẫu vật bị xuống cấp:** Các mẫu vật lý có thể bị mất hoặc hỏng theo thời gian, gây khó khăn cho việc xác thực dữ liệu cũ.

### Machine Learning Trên Quy Mô Địa Chất

LITHOLENS™ sử dụng một bộ mô hình ML và Deep Learning (DL) toàn diện để biến hình ảnh thô thành thông tin chi tiết có thể thực thi:
* **Trích xuất và Phân cụm màu sắc:** Sử dụng các thuật toán như K-Means hoặc GMM để nhận diện các biến thể khoáng vật học thông qua pixel màu sắc.
* **Báo cáo tỷ lệ phần trăm:** Phân đoạn hình ảnh thành các phần (ví dụ: khoảng cách 20cm) để phân tích sự phân bố không gian của các mẫu thạch học.
* **Mô hình Deep Learning chuyên sâu:**
  * **RoQE Net:** Một mạng thần kinh tiên tiến giúp trích xuất các thông số kỹ thuật địa chất như Chỉ số chất lượng đá (RQD).
  * **VeinNet và CobbleNet:** Được thiết kế để xác định các đặc điểm địa chất phức tạp như mạch khoáng và cấu trúc thạch học với độ chính xác cao.

### Kiến Trúc Giải Pháp Trên AWS

ALS GeoAnalytics đã xây dựng một kiến trúc lai (hybrid) kết hợp giữa các khối công việc được container hóa và các thành phần không máy chủ (serverless):
* **Amazon EKS (Elastic Kubernetes Service):** Đảm nhiệm các tác vụ ML/DL nặng, yêu cầu sức mạnh tính toán từ GPU (instance loại G6).
* **AWS Lambda:** Xử lý các hoạt động API và điều phối công việc (orchestration), giúp giảm chi phí vận hành so với việc duy trì máy chủ API luôn bật.
* **Amazon S3 và Amazon RDS:** Dùng để lưu trữ dữ liệu đầu vào, kết quả trung gian và quản lý dữ liệu có cấu trúc.
* **Điểm nổi bật về hiệu suất:** Nhờ sử dụng các hình ảnh máy ảo (AMI) được cấu hình sẵn, thời gian khởi động container đã giảm từ vài phút xuống dưới 30 giây. Ngoài ra, các cụm EKS có thể tự động giảm quy mô về mức 0 khi không có công việc nào trong hàng đợi, giúp tối ưu hóa chi phí tối đa.

### Tác Động Kinh Doanh Và Tầm Nhìn Tương Lai

Đến nay, LITHOLENS™ đã triển khai thành công tại 10 công ty khai thác với hơn 40 dự án đang hoạt động. Hệ thống không chỉ giúp chuẩn hóa quy trình phân tích mà còn cho phép giám sát và báo cáo theo thời gian thực, giúp các nhà quản lý đưa ra quyết định nhanh chóng và chính xác hơn.

Sự thành công của LITHOLENS™ trên Amazon EKS không chỉ dừng lại ở ngành khai khoáng. ALS GeoAnalytics đang hướng tới việc mở rộng nền tảng này sang các lĩnh vực như dầu khí, kỹ thuật dân dụng và thậm chí là thám hiểm không gian.

---
**Nguồn bài viết / Đọc thêm:** 
[How ALS GeoAnalytics LITHOLENS™ revolutionizes core logging through machine learning with Amazon EKS](https://aws.amazon.com/vi/blogs/architecture/how-als-geoanalytics-litholens-revolutionizes-core-logging-through-machine-learning-with-amazon-eks/)

### Hình ảnh tham khảo

![Kiến trúc giải pháp](/images/3-BlogsPosted/3.5-Blog5/blog5architecture.jpg)
