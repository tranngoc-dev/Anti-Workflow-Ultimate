---
description: 🐛 Sửa lỗi theo phương pháp Điều tra Gốc rễ & Truy vết Đồ thị
---

# WORKFLOW: /debug - Sửa Lỗi Khoa Học & Truy Vết Bằng Chứng

**Vai trò:** Root-Cause Investigator & Debugging Lead  
**Mục tiêu:** Định vị chính xác nguyên nhân gốc rễ (Root Cause) bằng chứng cứ, sử dụng công cụ truy vết đồ thị **GitNexus Trace**, bắt buộc viết test tái hiện lỗi trước khi sửa và tuân thủ tuyệt đối quy tắc **Failed-First-Fix**.

---

## 🗺️ Vị Trí Trong Quy Trình Khép Kín

```
Khi gặp Bug trong [/code], [/test] hoặc Live-Test
   ↓
[/debug] ← BẠN ĐANG Ở ĐÂY (4 Phase Root-Cause Debugging)
   ↓
PASS ➔ Quay lại [/code] hoặc [/test]
```

---

## Giai đoạn 1: Tái Hiện & Lập Giả Thuyết (Phase A - Investigate)

1. **Tái hiện triệu chứng lỗi:**
   * Thu thập log lỗi, input gây lỗi và expected behavior.
2. **Truy vết chuỗi gọi qua GitNexus:**
   * Sử dụng công cụ `gitnexus:trace` để tìm đường dẫn gọi giữa hàm phát sinh lỗi và nguồn dữ liệu đầu vào.
   * Sử dụng `gitnexus:impact` để kiểm tra các hàm/module liên đới.
3. **Hình thành tối đa 3 giả thuyết xếp hạng:**
   * Đưa ra nguyên nhân khả dĩ nhất và chứng minh bằng log runtime hoặc debug tracer.
   * **CẤM:** Tuyệt đối không thay đổi mã nguồn production trong giai đoạn này.

---

## Giai đoạn 2: Khóa Lỗi Bằng Test (Phase B - Lock Regression)

* Viết một unit test / integration test tự động tái hiện chính xác lỗi đó (Test kỳ vọng FAIL).
* Chạy test để xác nhận lỗi xuất hiện đúng như dự đoán.

---

## Giai đoạn 3: Thực Thi Bản Vá Tối Thiểu (Phase C - Minimal Fix)

* Chỉ sửa đúng các file/hàm liên quan trực tiếp đến root cause đã được chứng minh.
* Không refactor diện rộng, không thêm thư viện mới, không tạo các nhánh fallback che giấu lỗi.

### 🚨 QUY TẮC BẮT BUỘC: Failed-First-Fix Rule
Nếu bản vá đầu tiên không giải quyết được lỗi hoặc làm hỏng một test hợp lệ khác:
1. **DỪNG LẠI NGAY LẬP TỨC.**
2. Revert bản vá thử nghiệm về trạng thái ban đầu.
3. Quay lại Giai đoạn 1 với bằng chứng mới thu thập được.
4. **CẤM:** Không được đắp thêm bản vá suy đoán thứ 2, thứ 3 chồng lên bản vá hỏng.

---

## Giai đoạn 4: Xác Minh & Xóa Dấu Vết (Phase D - Verify)

1. Chạy regression test $\to$ Kết quả **PASS**.
2. Chạy toàn bộ test suite và typecheck của dự án.
3. Xóa bỏ toàn bộ debug logs, debug markers (`DEBUG_ONLY`, `console.log`) và cờ tạm thời.
4. Commit thay đổi thông qua cổng kiểm tra `guardrails/hooks/pre-commit`.
