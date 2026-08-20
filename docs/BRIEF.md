# 💡 BRIEF: Personal Working Space (Next.js & Supabase)

**Ngày tạo:** 2026-06-19
**Brainstorm cùng:** User (Trong)

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Người dùng cần một không gian làm việc tập trung (Working Space) ngay trên website cá nhân để quản lý công việc hàng ngày, ghi chép nhanh thông tin, và duy trì sự tập trung bằng phương pháp Pomodoro. Tất cả dữ liệu cần được lưu trữ online để truy cập từ mọi thiết bị.

## 2. GIẢI PHÁP ĐỀ XUẤT
Tích hợp một trang `/working` riêng biệt. Chi những người dùng đã đăng nhập (Google Auth qua Supabase) mới có quyền sử dụng. Trang này sẽ được thiết kế theo dạng Dashboard đa cột tiện dụng, tối ưu hóa trải nghiệm người dùng với các hiệu ứng mượt mà (sử dụng Framer Motion).

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Chính:** Chủ sở hữu website (làm việc cá nhân hàng ngày).

## 4. GIAO DIỆN & BỐ CỤC (DASHBOARD 3 CỘT)
- **Cột Trái (Todo List - 35%):** Quản lý công việc.
- **Cột Giữa (Note Space - 40%):** Soạn thảo ghi chú nhiều tab, tự động lưu.
- **Cột Phải (Pomodoro Timer - 25%):** Đồng hồ tập trung và thống kê.

---

## 5. CHI TIẾT TÍNH NĂNG (MVP & NICE-TO-HAVE)

### 🚀 Todo List (Quản lý công việc)
- [ ] **Thêm, sửa, xóa task:** Thêm nhanh công việc, chỉnh sửa tiêu đề trực tiếp, xóa task dễ dàng.
- [ ] **Trạng thái hoàn thành:** Tích chọn để đánh dấu hoàn thành (có gạch ngang chữ và hiệu ứng mờ).
- [ ] **Mức độ ưu tiên:** 3 mức độ (Cao - Đỏ, Trung bình - Vàng, Thấp - Xanh).
- [ ] **Hạn hoàn thành (Deadline):** Cho phép chọn ngày/giờ deadline cho từng task.
- [ ] **Gắn kết Pomodoro:** Cho phép chọn 1 task trong danh sách để "Active" làm mục tiêu hiện tại cho đồng hồ Pomodoro. Số phiên Pomodoro hoàn thành sẽ được cộng trực tiếp vào task này.

### 📝 Note Space (Ghi chú công việc)
- [ ] **Đa ghi chú (Multi-tabs/List):** Cho phép tạo nhiều trang ghi chú khác nhau (ví dụ: "Học tập", "Dự án A", "Lưu ý chung"). Có sidebar phụ bên trong cột để chọn trang ghi chú.
- [ ] **Rich Text Editor:** Soạn thảo hỗ trợ in đậm (`Ctrl+B`), in nghiêng (`Ctrl+I`), gạch đầu dòng (danh sách). Sử dụng `contentEditable` gọn nhẹ để tương thích mượt mà.
- [ ] **Tự động lưu (Auto-save):** Tự động lưu nội dung ghi chú lên Supabase sau 2 giây khi người dùng ngừng gõ (debounced save), hiển thị trạng thái "Đang lưu..." và "Đã lưu".

### ⏱️ Pomodoro Timer (Đồng hồ tập trung)
- [ ] **Đếm ngược chuẩn:** 25 phút làm việc / 5 phút nghỉ ngơi (chuyển trạng thái tự động hoặc thủ công).
- [ ] **Điều khiển:** Start (Bắt đầu), Pause (Tạm dừng), Reset (Quay lại từ đầu).
- [ ] **Âm thanh cảnh báo:** Sử dụng Web Audio API để phát âm thanh chuông báo (không cần tải file ngoài, hoạt động cực kỳ ổn định).
- [ ] **Popup cảnh báo:** Hiển thị Dialog/Modal cảnh báo khi hết giờ để nhắc nhở người dùng chuyển sang phiên nghỉ/làm việc.
- [ ] **Thống kê hiệu suất:** Hiển thị tổng số phiên Pomodoro hoàn thành trong ngày (ví dụ: hiển thị icon quả cà chua 🍅).

---

## 6. THIẾT KẾ CƠ SỞ DỮ LIỆU (SUPABASE SCHEMA)

Đề xuất tạo 3 bảng mới trên Supabase:

### Bảng `workspace_todos`
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `title` (text, not null)
- `is_completed` (boolean, default false)
- `priority` (text, default 'medium') - 'high', 'medium', 'low'
- `deadline` (timestamp with time zone, nullable)
- `pomodoros_completed` (integer, default 0)
- `created_at`, `updated_at`

### Bảng `workspace_notes`
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `title` (text, default 'Ghi chú mới')
- `content` (text, default '')
- `created_at`, `updated_at`

### Bảng `workspace_pomodoro_history`
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `todo_id` (uuid, references workspace_todos, nullable)
- `duration_minutes` (integer, default 25)
- `completed_at` (timestamp with time zone, default now())

---

## 7. BƯỚC TIẾP THEO
1. Gửi Brief cho User phê duyệt.
2. Thiết lập Schema database trên Supabase (chạy SQL Script).
3. Viết mã nguồn React/Next.js cho trang `/working`.
4. Thiết lập styles CSS riêng cho Workspace mang phong cách hiện đại, tối giản, có hỗ trợ Dark Mode.
