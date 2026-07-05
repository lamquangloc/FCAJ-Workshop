---
title: "Blog 4"
date: 2026-07-03
weight: 4
chapter: false
pre: " <b> 3.4. </b> "
---

# Xây Dựng Lớp Tìm Kiếm Người Dùng Có Khả Năng Mở Rộng Trên Amazon Cognito

**Người đăng bài: Nguyễn Hữu Tịnh**

Trong các hệ thống hiện đại có số lượng người dùng lớn, việc quản lý danh tính chỉ là một phần của bài toán. Thách thức thực sự xuất hiện khi cần tìm kiếm người dùng theo nhiều tiêu chí khác nhau như email, số điện thoại, tên hiển thị, trạng thái tài khoản hoặc các thuộc tính tùy chỉnh. Mặc dù Amazon Cognito cung cấp khả năng quản lý người dùng mạnh mẽ, chức năng tìm kiếm nâng cao lại không phải là thế mạnh của dịch vụ này.

Để giải quyết vấn đề đó, AWS đề xuất xây dựng một lớp tìm kiếm riêng hoạt động bên trên Amazon Cognito, kết hợp cùng AWS Lambda, Amazon DynamoDB và Amazon OpenSearch Service. Kiến trúc này giúp mở rộng khả năng tìm kiếm, đồng thời vẫn tận dụng được hệ thống xác thực và quản lý danh tính sẵn có của Cognito.

### Những Điểm Nổi Bật Của Giải Pháp

* **Tách biệt chức năng xác thực và tìm kiếm:** Amazon Cognito được sử dụng đúng với vai trò quản lý người dùng, xác thực và phân quyền truy cập. Trong khi đó, các yêu cầu tìm kiếm được xử lý bởi một lớp riêng biệt nhằm tránh ảnh hưởng đến hiệu năng và giới hạn truy vấn của Cognito. Cách tiếp cận này giúp hệ thống dễ mở rộng hơn khi số lượng người dùng tăng lên trong tương lai.
* **Đồng bộ dữ liệu bằng AWS Lambda:** Mỗi khi người dùng được tạo mới, cập nhật hoặc xóa trong Cognito, AWS Lambda sẽ được kích hoạt để đồng bộ thông tin sang các dịch vụ lưu trữ và tìm kiếm khác. Nhờ cơ chế xử lý theo sự kiện này, dữ liệu tìm kiếm luôn được cập nhật gần như theo thời gian thực mà không cần thực hiện các tác vụ đồng bộ thủ công.
* **DynamoDB đóng vai trò lớp lưu trữ trung gian:** Amazon DynamoDB được sử dụng để lưu trữ dữ liệu người dùng dưới dạng có cấu trúc, hỗ trợ truy cập nhanh với độ trễ thấp và khả năng mở rộng tự động. Việc sử dụng DynamoDB giúp giảm tải cho Cognito, đồng thời cung cấp nguồn dữ liệu ổn định phục vụ các tác vụ xử lý phía sau.
* **OpenSearch nâng cao khả năng tìm kiếm:** Amazon OpenSearch Service là thành phần quan trọng nhất trong kiến trúc này. Dữ liệu người dùng được lập chỉ mục (indexing) để hỗ trợ các hình thức tìm kiếm linh hoạt như:
  * Tìm kiếm theo từ khóa.
  * Tìm kiếm gần đúng.
  * Tìm kiếm theo nhiều thuộc tính cùng lúc.
  * Lọc dữ liệu theo điều kiện.
  * Phân trang và sắp xếp kết quả.
  * Nhờ đó, trải nghiệm tìm kiếm người dùng được cải thiện đáng kể so với các truy vấn mặc định của Cognito.
* **Khả năng mở rộng phù hợp với hệ thống lớn:** Khi số lượng tài khoản tăng từ hàng nghìn lên hàng triệu người dùng, kiến trúc vẫn có thể mở rộng bằng cách tăng năng lực xử lý của DynamoDB và OpenSearch mà không cần thay đổi cách vận hành của Cognito. Điều này giúp doanh nghiệp duy trì hiệu năng ổn định ngay cả khi quy quy mô hệ thống phát triển nhanh chóng.

### Vai Trò Của Các Dịch Vụ AWS

Kiến trúc được xây dựng dựa trên sự phối hợp của nhiều dịch vụ AWS:
* **Amazon Cognito:** Quản lý người dùng và xác thực.
* **AWS Lambda:** Đồng bộ dữ liệu theo sự kiện.
* **Amazon DynamoDB:** Lưu trữ dữ liệu người dùng.
* **Amazon OpenSearch Service:** Thực hiện tìm kiếm nâng cao.

Mỗi thành phần đảm nhận một nhiệm vụ riêng biệt, giúp hệ thống dễ quản lý, dễ mở rộng và giảm phụ thuộc vào một dịch vụ duy nhất.

### Lợi Ích Đối Với Doanh Nghiệp

Việc xây dựng lớp tìm kiếm riêng bên trên Cognito mang lại nhiều lợi ích:
* Tăng tốc độ tìm kiếm người dùng.
* Hỗ trợ các truy vấn phức tạp.
* Dễ dàng mở rộng khi dữ liệu tăng trưởng.
* Giảm tải cho hệ thống xác thực.
* Nâng cao trải nghiệm quản trị người dùng.
* Linh hoạt trong việc bổ sung các thuộc tính tìm kiếm mới.

Đây là một giải pháp phù hợp cho các ứng dụng SaaS, nền tảng thương mại điện tử, hệ thống giáo dục trực tuyến hoặc các dịch vụ có lượng người dùng lớn.

### Kết Luận

Amazon Cognito là một nền tảng quản lý danh tính mạnh mẽ, tuy nhiên nhu cầu tìm kiếm người dùng ở quy mô lớn thường đòi hỏi các khả năng vượt ra ngoài chức năng mặc định. Bằng cách kết hợp AWS Lambda, DynamoDB và Amazon OpenSearch Service, AWS đã xây dựng một kiến trúc cho phép mở rộng khả năng tìm kiếm mà vẫn duy trì hiệu quả quản lý người dùng trên Cognito.

Giải pháp này thể hiện cách tiếp cận phổ biến trong kiến trúc hiện đại: mỗi dịch vụ tập trung giải quyết một bài toán chuyên biệt, sau đó được kết nối với nhau để tạo thành một hệ thống linh hoạt, hiệu quả và sẵn sàng mở rộng theo nhu cầu thực tế.

---
**Nguồn bài viết / Đọc thêm:** 
[Building a scalable user search layer on top of Amazon Cognito](https://aws.amazon.com/vi/blogs/architecture/building-a-scalable-user-search-layer-on-top-of-amazon-cognito/)

### Hình ảnh tham khảo

![Kiến trúc giải pháp](/images/3-BlogsPosted/3.4-Blog4/blog4architecture.jpg)
