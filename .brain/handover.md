# 📋 HANDOVER DOCUMENT (v4.0.2)

**Dự án:** Tulanh Web Application  
**Ngày cập nhật:** 2026-08-15 12:05:00 UTC+7  
**Người bàn giao:** Antigravity AI  

---

## 📍 TRẠNG THÁI HIỆN TẠI
* **Giai đoạn:** Production & Development - Q&A Gamification & Admin Suite hoàn thiện
* **Trạng thái hệ thống:** Hoạt động ổn định 100%, vượt qua tất cả kiểm thử Guardrails.

---

## ✅ ĐÃ HOÀN THÀNH TRONG PHIÊN LÀM VIỆC:

1. **Phản hồi Bình luận Đa cấp (Facebook-style Nested Replies):**
   * Bổ sung cột `parent_id UUID REFERENCES thread_comments(id) ON DELETE CASCADE` trong bảng `public.thread_comments`.
   * Giao diện `/thread/[id]` hiển thị nút "↩️ Trả lời", khung phản hồi con thụt lề, viền kết nối, hỗ trợ sửa inline, xóa và thả tim (Like) cho cả bình luận cha lẫn phản hồi con.

2. **Quản lý Thành viên & Cấp bậc Rank ([`/admin/users`](file:///d:/AntiGravity/tulanh-simple-Tulanh/app/admin/users/page.js)):**
   * Bổ sung nút **`💾 LƯU NGAY (Save)`** nổi bật với nhận diện thay đổi (dirty state).
   * Tạo hàm RPC bảo mật **`public.admin_update_user_rank_and_gold`** với quyền `SECURITY DEFINER` trên Supabase.
   * Cập nhật hàm `is_admin()` nhận diện toàn quyền tài khoản `vutrongvtv24@gmail.com`.
   * Khắc phục hoàn toàn lỗi đồng bộ hiển thị cột **ĐIỂM GOLD**.

3. **Cơ chế Tự động Cộng điểm Gold & Cộng bù (Backfill):**
   * **Đăng câu hỏi mới (`threads`):** +10 Gold cho tác giả.
   * **Bình luận / Trả lời (`thread_comments`):** +1 Gold.
   * **Nhận lượt Thích (Like):** +1 Gold.
   * **Được chọn Câu trả lời hay nhất (Best Answer):** +10 Gold.
   * **Cộng bù (Backfill):** Đã tính toán và cập nhật chính xác số dư Gold cho toàn bộ các thành viên đã có hoạt động trong hệ thống.

4. **Tự động Highlight & Tạo Hyperlink:**
   * Viết hàm tiện ích `renderWithLinks` tự động biến toàn bộ các đường dẫn URL (`http://`, `https://`, `www.`) trong bài viết, trích đoạn, câu hỏi, bình luận và phản hồi thành liên kết an toàn có highlight màu thương hiệu.
   * Tích hợp `stopPropagation()` tránh nhảy trang ngoài ý muốn và tách dấu câu thông minh.

---

## 🔧 QUYẾT ĐỊNH KỸ THUẬT QUAN TRỌNG:
* **Supabase Project:** `xywmdsieytqsxqpqvcwj` (ap-northeast-2).
* **Bảo vệ Dữ liệu:** Thay thế trigger chặn cập nhật thô bằng RPC có kiểm tra đặc quyền Admin (`is_admin()`).
* **Hệ thống Rank:** Kim Ngư (0G) → Linh Long (50G) → Đế Long (200G) → Hỏa Long (500G) → Thiên Long (1000G).
* **Repositories:** 
  * `origin`: `https://github.com/tranngoc-dev/tulanh_simple.git`
  * `ultimate`: `https://github.com/tranngoc-dev/Anti-Workflow-Ultimate.git`

---

## 📁 CÁC FILE QUAN TRỌNG:
* [`.brain/brain.json`](file:///d:/AntiGravity/tulanh-simple-Tulanh/.brain/brain.json): Tri thức tĩnh dự án (schema, rules, tech stack).
* [`.brain/session.json`](file:///d:/AntiGravity/tulanh-simple-Tulanh/.brain/session.json): Lịch sử thay đổi và trạng thái phiên làm việc.
* [`utils/qa-api.js`](file:///d:/AntiGravity/tulanh-simple-Tulanh/utils/qa-api.js): Toàn bộ API helpers, format ngày gọn gàng và `renderWithLinks`.
* [`scripts/qa-setup.sql`](file:///d:/AntiGravity/tulanh-simple-Tulanh/scripts/qa-setup.sql): Toàn bộ script DDL, Triggers, RPC của Supabase.
* [`app/admin/users/page.js`](file:///d:/AntiGravity/tulanh-simple-Tulanh/app/admin/users/page.js): Trang quản lý Rank, Gold và Ban bình luận thành viên.
* [`app/thread/[id]/page.js`](file:///d:/AntiGravity/tulanh-simple-Tulanh/app/thread/[id]/page.js): Trang chi tiết chủ đề Q&A và bình luận lồng nhau.
