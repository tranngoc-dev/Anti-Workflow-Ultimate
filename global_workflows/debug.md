---
description: 🐛 Sửa lỗi theo phương pháp Điều tra Gốc rễ, Cổng E2E & Tự động Đúc kết Bài học
---

# WORKFLOW: /debug - Sửa Lỗi Khoa Học, Cổng E2E & Tự Động Học Hỏi (v4.8.0)

**Vai trò:** Root-Cause Investigator & Continuous Learning Lead  
**Mục tiêu:** Định vị chính xác nguyên nhân gốc rễ (Root Cause) bằng chứng cứ qua **GitNexus Trace**, bắt buộc viết kịch bản E2E tái hiện lỗi, bắt buộc E2E PASS THỰC TẾ mới được coi là sửa xong, và **TỰ ĐỘNG ĐÚC KẾT BÀI HỌC VÀO BỘ NHỚ VĨNH CỬU (`.brain/learnings.md`)**.

---

## 🗺️ Vị Trí Trong Quy Trình Khép Kín

```
Khi phát hiện Bug trong [/code], [/test], E2E Gate hoặc Live-Test
   ↓
[/debug] ← BẠN ĐANG Ở ĐÂY (4 Phase Debugging ➔ E2E Gate ➔ Phase 5: Auto-Reflection)
   ↓
Tự động lưu vào .brain/learnings.md ➔ Tiếp tục [/code] hoặc [/test]
```

---

## Giai đoạn 1: Tái Hiện & Lập Giả Thuyết (Phase A - Investigate)

1. **Tái hiện triệu chứng lỗi:**
   * Thu thập log lỗi, input gây lỗi, request API trả về status code $\ge 400$, hoặc ảnh chụp màn hình lỗi.
2. **Truy vết chuỗi gọi qua GitNexus:**
   * Sử dụng công cụ `gitnexus:trace` để tìm đường dẫn gọi giữa hàm phát sinh lỗi và nguồn dữ liệu đầu vào.
   * Sử dụng `gitnexus:impact` để kiểm tra các hàm/module liên đới.
3. **Hình thành tối đa 3 giả thuyết xếp hạng:**
   * Đưa ra nguyên nhân khả dĩ nhất và chứng minh bằng log runtime hoặc debug tracer.
   * **CẤM:** Tuyệt đối không thay đổi mã nguồn production trong giai đoạn này.

---

## Giai đoạn 2: Khóa Lỗi Bằng Kịch Bản Test E2E Thật (Phase B - Lock Regression)

* Viết một **Kịch bản E2E Test (Playwright / API Integration Probe)** tái hiện chính xác thao tác của người dùng dẫn đến lỗi:
  * Ví dụ: Mở trang `/questions/123` $\to$ Gửi request embed query $\to$ Chứng minh lỗi PostgREST 400 Ambiguous FK xuất hiện (Test FAIL).
* Tuyệt đối không dùng Unit Test mock để tái hiện lỗi nếu lỗi đó phát sinh từ tầng giao tiếp Database / API.

---

## Giai đoạn 3: Thực Thi Bản Vá Tối Thiểu (Phase C - Minimal Fix)

* Sửa đúng các file/hàm liên quan trực tiếp đến root cause đã được chứng minh (ví dụ: thêm explicit FK hint `profiles!author_id(...)`).
* Không refactor diện rộng, không thêm thư viện mới, không tạo các nhánh fallback che giấu lỗi.

### 🚨 QUY TẮC BẮT BUỘC: Failed-First-Fix Rule
Nếu bản vá đầu tiên không giải quyết được lỗi hoặc làm hỏng test khác:
1. **DỪNG LẠI NGAY LẬP TỨC.**
2. Revert bản vá thử nghiệm về trạng thái ban đầu.
3. Quay lại Giai đoạn 1 với bằng chứng mới thu thập được.
4. **CẤM:** Không được đắp thêm bản vá suy đoán thứ 2, thứ 3 chồng lên bản vá hỏng.

---

## Giai đoạn 4: Xác Minh Qua Cổng E2E Bắt Buộc (Phase D - E2E Verification Gate)

1. **Chạy Lại Kịch Bản E2E Test:**
   * Khởi động server và chạy lại kịch bản E2E vừa viết ở Giai đoạn 2 (Timeout 30s).
   * **Yêu cầu:** Test phải chuyển từ **FAIL ➔ PASS 100%**.
2. **Kiểm tra Zero Network Errors:**
   * Xác nhận request API trả về status code `200 OK`, không còn lỗi 400 Ambiguous FK hay 500.
   * Xác nhận dữ liệu hiển thị hoàn hảo trên DOM.
3. **Chạy Toàn Bộ Test Suite & Dọn Dẹp Tiến Trình:**
   * Chạy lại test suite để đảm bảo không phát sinh regression.
   * Xóa bỏ debug markers (`DEBUG_ONLY`, `console.log`).
   * Tắt toàn bộ background test processes (Process Guard).
4. **Commit thay đổi qua cổng kiểm tra `guardrails/hooks/pre-commit`.**

---

## Giai đoạn 5: Tự Động Học Hỏi & Đúc Kết Bài Học (Phase E - Auto-Reflection) ⭐ MỚI

Ngay sau khi commit thành công, AI **TỰ ĐỘNG** thực hiện các bước sau mà không cần người dùng nhắc:

1. **Tạo / Append vào file `.brain/learnings.md`:**
   ```markdown
   ### 📝 [LEARNING-{YYYYMMDD}-{INDEX}] {Tên lỗi & Phân loại}
   - 📍 **Triệu chứng & Mã lỗi:** {Mô tả hiện tượng và error log/HTTP status}
   - 🔍 **Nguyên nhân gốc rễ (Root Cause):** {Bản chất kỹ thuật gây ra lỗi}
   - 💡 **Giải pháp chuẩn (Proven Fix):** {Cách sửa chính xác và an toàn nhất}
   - 🚫 **Anti-Pattern cần tránh:** {Những điều TUYỆT ĐỐI KHÔNG làm trong tương lai}
   - 🛡️ **Tiến hóa Quy trình:** {Đề xuất rule bổ sung vào AI_CODE_WORKFLOW.md hoặc audit.md nếu là lỗi nghiêm trọng}
   ```

2. **Ghi log tiến trình vào `.brain/session_log.txt`:**
   ```
   [HH:MM] BUG_RESOLVED_AND_LEARNED: {Tên lỗi} -> Saved to .brain/learnings.md
   ```

3. **Thông Báo Hoàn Tất Cho Người Dùng:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🎉 BUG ĐÃ ĐƯỢC KHẮC PHỤC TRIỆT ĐỂ & ĐÚC KẾT BÀI HỌC!
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ✅ Nguyên nhân: {Tóm tắt ngắn gọn Root Cause}
   ✅ Xác minh: E2E Test đã chuyển sang PASS 100% (0 Lỗi Network)
   🧠 Trí nhớ vĩnh cửu: Đã lưu bài học vào `.brain/learnings.md`
   🛡️ Hệ thống tự động ghi nhớ để không bao giờ lặp lại lỗi này trong các task sau!
   ```
