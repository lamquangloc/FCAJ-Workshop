---
title: "Blog 2"
date: 2026-07-03
weight: 2
chapter: false
pre: " <b> 3.2. </b> "
---

# Building a scalable user search layer on top of Amazon Cognito

**Người đăng bài: Vũ Duy Tài**

Nếu đội của bạn chỉ cần tìm kiếm đơn giản trên các thuộc tính tiêu chuẩn của Amazon Cognito, API ListUsers là đủ. Tuy nhiên, khi hệ thống phải xử lý các yêu cầu nâng cao như tìm kiếm trên thuộc tính tùy chỉnh, fuzzy matching, lọc phức tạp và phản hồi dưới một giây, việc xây dựng một lớp tìm kiếm chuyên dụng sẽ là lựa chọn phù hợp.

Bài viết này trình bày về cách xây dựng một hệ thống tìm kiếm người dùng (user search layer) có khả năng mở rộng và nâng cao trên nền tảng Amazon Cognito, sử dụng kết hợp các dịch vụ của AWS bao gồm AWS Lambda, Amazon DynamoDB và Amazon OpenSearch Service một cách ngắn gọn nhất được đề cập trên AWS.

### Những Điểm Nổi Bật Về Giải Pháp

#### 1. Mở Khóa Khả Năng Tìm Kiếm Nâng Cao
Giải pháp sử dụng Amazon OpenSearch Serverless để cung cấp các tính năng tìm kiếm mà API gốc của Cognito không làm được:
* **Tìm kiếm mờ (Fuzzy search):** Cho phép tìm ra người dùng ngay cả khi chỉ có một phần thông tin (một phần email, tên) hoặc gõ sai lỗi chính tả.
* **Lọc đa điều kiện (Complex filtering):** Thực hiện các truy vấn phức tạp, kết hợp đồng thời nhiều thuộc tính như: email, số điện thoại, nhóm (groups), và ngày đăng ký.

#### 2. Kiến Trúc Nạp Dữ Liệu Kép (Không có "điểm mù")
Đây là thiết kế thông minh nhất của giải pháp nhằm đảm bảo dữ liệu luôn được đồng bộ theo thời gian thực (real-time) mà không cần chạy các tác vụ thủ công:
* **Bắt thay đổi từ phía người dùng:** Sử dụng Cognito Lambda Triggers (Post-confirmation và Pre-token generation) để tự động lưu dữ liệu ngay khi người dùng đăng ký hoặc đăng nhập.
* **Bắt thay đổi từ phía Admin:** Các thao tác của quản trị viên (ví dụ: tạo user bằng tay, đổi mật khẩu) được thu thập tự động thông qua AWS CloudTrail và Amazon EventBridge, đảm bảo không có thay đổi nào bị bỏ sót.

#### 3. Dùng DynamoDB Streams Làm "Vùng Đệm" An Toàn
Thay vì đẩy dữ liệu trực tiếp từ Cognito sang OpenSearch (dễ gây quá tải hoặc mất dữ liệu), giải pháp sử dụng Amazon DynamoDB làm nơi lưu trữ trung gian.
Mọi sự thay đổi trạng thái sẽ kích hoạt DynamoDB Streams, từ đó gọi Lambda để cập nhật OpenSearch. Cơ chế này giúp hệ thống vận hành cực kỳ trơn tru và có khả năng chịu lỗi (fault-tolerant) cao.

#### 4. Tốc Độ và Hiệu Năng (Sub-second Performance)
Việc tách biệt hoàn toàn luồng Ghi dữ liệu (chạy ngầm qua Event) và luồng Đọc dữ liệu (thông qua hàm Search Lambda độc lập) giúp hệ thống không bao giờ bị nghẽn.
Kết quả tìm kiếm được trả về thông qua RESTful API có hỗ trợ phân trang với tốc độ phản hồi dưới 1 giây, bất kể cơ sở dữ liệu có hàng ngàn hay hàng triệu người dùng.

#### 5. Hạ Tầng Serverless & Tự Động Hóa Triển Khai
Toàn bộ giải pháp được xây dựng trên các dịch vụ hoàn toàn không máy chủ (Serverless), tự động mở rộng theo lưu lượng thực tế giúp tối ưu chi phí.
Tác giả của bài viết trên AWS cũng cung cấp sẵn bộ mã nguồn (Infrastructure as Code bằng AWS CDK) bao gồm cả Backend và giao diện React, cho phép bất kỳ ai cũng có thể triển khai hệ thống hoàn chỉnh này lên tài khoản AWS của họ chỉ trong chưa tới 20 phút.
*(Mã nguồn: [sample-user-search-layer-for-cognito](https://github.com/aws-samples/sample-user-search-layer-for-cognito))*

---
**Nguồn bài viết / Đọc thêm:** 
[Building a scalable user search layer on top of Amazon Cognito](https://aws.amazon.com/blogs/architecture/building-a-scalable-user-search-layer-on-top-of-amazon-cognito/)

### Hình ảnh tham khảo

![Kiến trúc giải pháp](/images/3-BlogsPosted/3.2-Blog2/blog2architecture.jpg)