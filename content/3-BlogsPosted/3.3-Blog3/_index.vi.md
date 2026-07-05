---
title: "Blog 3"
date: 2026-07-03
weight: 3
chapter: false
pre: " <b> 3.3. </b> "
---

# Xây dựng Dashboard Theo Dõi Patch Compliance Trên Nhiều AWS Account Với Kiro Specs

**Người đăng bài: Hoàng Trọng Trà**

Khi hệ thống chỉ có vài EC2 instances hoặc một vài AWS account, việc kiểm tra máy nào đã được patch, máy nào còn thiếu bản vá có thể làm thủ công được. Nhưng khi môi trường mở rộng ra nhiều account, nhiều Region và nhiều workload khác nhau, việc theo dõi patch compliance bắt đầu trở nên khó kiểm soát hơn rất nhiều.

Bài AWS Blog này làm mình chú ý vì nó không chỉ nói về việc tạo một dashboard, mà còn chỉ ra cách xây dựng dashboard đó theo một quy trình khá bài bản bằng Kiro Specs.

### Ý tưởng chính của giải pháp
Dữ liệu patch compliance từ AWS Systems Manager Patch Manager sẽ được export ra Amazon S3 thông qua Resource Data Sync. Sau đó, một Lambda chạy định kỳ sẽ đọc dữ liệu raw này, tổng hợp lại thành các file cache JSON, rồi dashboard chỉ cần đọc dữ liệu đã được xử lý sẵn để hiển thị nhanh hơn.

### Những điểm đáng chú ý

* **Bảo mật truy cập nội bộ:** Dashboard này không được public ra Internet. Người dùng truy cập thông qua AWS Systems Manager Session Manager port forwarding đến một internal Application Load Balancer. Cách này làm hệ thống an toàn hơn vì không cần mở public endpoint cho một dashboard chứa thông tin compliance nội bộ.
* **Tách biệt luồng dữ liệu:** Giải pháp tách rõ dữ liệu nguồn và dữ liệu phục vụ dashboard. Resource Data Sync bucket chỉ là nơi chứa dữ liệu raw. Dashboard dùng một S3 bucket riêng để lưu frontend assets và cache đã tổng hợp. Nhờ vậy, dashboard không phải đọc hàng ngàn file raw mỗi lần người dùng mở trang.
* **Kiến trúc Serverless hợp lý:** Lambda xử lý frontend, API và cache aggregation; EventBridge kích hoạt Lambda cập nhật cache mỗi 30 phút; ALB route request nội bộ đến Lambda. Cách này vừa giảm phần vận hành server, vừa phù hợp với nhu cầu dashboard không phải lúc nào cũng có traffic liên tục.
* **Thiết kế phân lớp (Drill-down):** Dashboard được thiết kế theo hai lớp. Lớp đầu cho biết toàn cảnh như tổng số instances, tỷ lệ compliant, số máy compliant/non-compliant, phân loại theo platform và severity. Khi cần xem sâu hơn, người dùng có thể drill down vào từng account để biết instance nào còn thiếu patch và thiếu những patch cụ thể nào.

### Phương pháp làm việc với Kiro Specs

Phần mình thấy hay nhất là cách bài viết dùng Kiro Specs. Thay vì chỉ nhờ AI viết code ngay, Kiro đi theo quy trình **Requirements -> Design -> Tasks**. Nghĩa là trước tiên phải xác định rõ cần xây gì, sau đó thiết kế kiến trúc và data flow, rồi mới chia thành các task triển khai.

Cách làm này giúp AI ít “tự đoán” hơn. Đặc biệt với những hệ thống có liên quan đến security như dashboard compliance, nếu không nói rõ từ đầu thì AI có thể tạo ra thiết kế không phù hợp, ví dụ mở public endpoint hoặc xử lý dữ liệu không tối ưu.

Bài viết cũng dùng **steering files** để giữ ngữ cảnh cho Kiro, ví dụ `architecture.md`, `data-schemas.md`, `compliance-logic.md`, `frontend-specs.md` và `security.md`. Theo mình hiểu, đây giống như cách mình ghi sẵn “luật chơi” của project để AI luôn bám theo khi tạo requirements, design hoặc code.

### Bài học rút ra

Điều mình rút ra sau khi đọc bài này là: Một dashboard vận hành tốt không chỉ nằm ở giao diện đẹp hay biểu đồ rõ ràng. Phần quan trọng hơn là dữ liệu được lấy từ đâu, được xử lý như thế nào, quyền truy cập có an toàn không, và kiến trúc có dễ mở rộng khi số lượng account tăng lên không.

---
**Nguồn bài viết / Đọc thêm:** 
[Build a multi-account patch compliance dashboard with Kiro Specs](https://aws.amazon.com/vi/blogs/mt/build-a-multi-account-patch-compliance-dashboard-with-kiro-specs/?fbclid=IwY2xjawS0FfdleHRuA2FlbQIxMABicmlkETFWaGU1Y1hlNVZmMU1KMlJyc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHufwuH-a8mRgofEZnifnepwt7m95MSI7G9VYAiROK76vhOERSNEnjEpJhCfl_aem_rmdqdLNx0MCSzTFFUyH5-g)

### Hình ảnh tham khảo

![Kiến trúc giải pháp](/images/3-BlogsPosted/3.3-Blog3/blog3architecture.jpg)