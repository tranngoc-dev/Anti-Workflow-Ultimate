# 🚀 WALKTHROUGH: Personal Working Space (Next.js & Supabase)

**Ngày hoàn thành:** 2026-06-19
**Phát triển bởi:** Senior Developer Tuấn (Antigravity Code Partner)
**URL trang mới:** `/working`

---

## 📝 Tổng Quan Các Thay Đổi

Chúng ta đã xây dựng thành công một **Không Gian Làm Việc Cá Nhân (Working Space)** đầy đủ tính năng, hoạt động đồng bộ online thông qua cơ sở dữ liệu Supabase, giao diện tối giản, sang trọng (Warm Minimalist) tương thích mượt mà với website chính.

### 📁 Các file được tạo mới và chỉnh sửa:

#### 1. Frontend & Routing:
- `[NEW]` [app/working/page.js](file:///c:/Users/Trong/Desktop/tulanh-simple-Tulanh/app/working/page.js) - Trang định tuyến chính xử lý Session Auth, nạp dữ liệu song song và quản lý state tập trung cho các Widget.
- `[NEW]` [app/working/working.css](file:///c:/Users/Trong/Desktop/tulanh-simple-Tulanh/app/working/working.css) - File styles CSS hoàn chỉnh cho Dashboard và 3 widget, hỗ trợ hoàn hảo Responsive (Desktop 3 cột, Tablet 2 cột, Mobile 1 cột dọc).
- `[MODIFY]` [app/components/HeaderAuth.js](file:///c:/Users/Trong/Desktop/tulanh-simple-Tulanh/app/components/HeaderAuth.js) - Cấu hình link redirect về `/working` sau khi đăng nhập và hiển thị nút truy cập nhanh **Workspace** trên Header.

#### 2. UI Widgets Components:
- `[NEW]` [app/working/components/TodoWidget.js](file:///c:/Users/Trong/Desktop/tulanh-simple-Tulanh/app/working/components/TodoWidget.js) - Quản lý việc cần làm, deadline, priority badge và Target Focus cho Pomodoro.
- `[NEW]` [app/working/components/NotesWidget.js](file:///c:/Users/Trong/Desktop/tulanh-simple-Tulanh/app/working/components/NotesWidget.js) - Ghi chú đa tab có sidebar phụ và vùng soạn thảo `contentEditable` hỗ trợ In đậm, In nghiêng, List.
- `[NEW]` [app/working/components/PomodoroWidget.js](file:///c:/Users/Trong/Desktop/tulanh-simple-Tulanh/app/working/components/PomodoroWidget.js) - Đồng hồ số, vòng tròn SVG Radial Progress động, nút tắt/bật chuông, thống kê 🍅 hôm nay, và popup modal báo kết thúc.

#### 3. Helpers & Unit Tests:
- `[NEW]` [app/working/utils/format.js](file:///c:/Users/Trong/Desktop/tulanh-simple-Tulanh/app/working/utils/format.js) - Helper định dạng giây sang chuỗi MM:SS.
- `[NEW]` [app/working/utils/sound.js](file:///c:/Users/Trong/Desktop/tulanh-simple-Tulanh/app/working/utils/sound.js) - Bộ tự phát chuỗi âm thanh "Bíp Bíp" báo hiệu bằng Web Audio API.
- `[NEW]` [tests/format.test.mjs](file:///c:/Users/Trong/Desktop/tulanh-simple-Tulanh/tests/format.test.mjs) - Unit tests cho logic định dạng thời gian.
- `[NEW]` [plans/260619-0955-personal-workspace/schema.sql](file:///c:/Users/Trong/Desktop/tulanh-simple-Tulanh/plans/260619-0955-personal-workspace/schema.sql) - Database script tạo bảng, RLS Policies và hàm RPC tích luỹ Pomodoro.

---

## 🧪 Hướng Dẫn Kiểm Thử Thực Tế (Testing & Verification)

### 1. Khởi động ứng dụng local:
Chạy lệnh dưới đây trong Terminal của thư mục dự án để mở Dev Server:
```bash
npm run dev
```
Sau đó mở trình duyệt truy cập: `http://localhost:3000/working`

### 2. Các kịch bản kiểm thử đề xuất:

#### Kịch bản 1: Đăng nhập & Bảo mật
1. Mở tab ẩn danh, truy cập `http://localhost:3000/working`. 
   - *Kết quả mong đợi:* Bị chặn lại ở màn hình welcome sang trọng yêu cầu đăng nhập.
2. Bấm nút **Đăng nhập bằng Google** và tiến hành login.
   - *Kết quả mong đợi:* Sau khi đăng nhập thành công, trình duyệt tự động redirect vào trang `/working` hiển thị đầy đủ giao diện Dashboard 3 cột.

#### Kịch bản 2: Lên danh sách nhiệm vụ (Todo List)
1. Thêm 1 task mới (ví dụ: "Code nốt API"), chọn Priority: Cao, đặt hạn deadline.
   - *Kết quả mong đợi:* Task xuất hiện ở đầu danh sách với badge đỏ rực rỡ và ngày hạn.
2. F5 tải lại trang.
   - *Kết quả mong đợi:* Task vẫn nằm ở đó (đã lưu online lên bảng `workspace_todos` của Supabase).
3. Bấm tích chọn hoàn thành.
   - *Kết quả mong đợi:* Chữ bị gạch ngang và mờ đi, dữ liệu DB đổi thành `is_completed = true`.

#### Kịch bản 3: Ghi chú đa tab & Auto-save
1. Bấm nút **➕ Ghi chú mới** ở sidebar ghi chú.
   - *Kết quả mong đợi:* Xuất hiện tab mới trong danh sách, tự động mở editor.
2. Thay đổi tiêu đề thành `"Kế hoạch tháng 6"` và gõ nội dung vào editor (thử bôi đen chữ bấm in đậm `B` hoặc list gạch đầu dòng).
   - *Kết quả mong đợi:* Khi anh đang gõ, góc trên hiện "Có thay đổi chờ lưu". Dừng gõ 2 giây, hiện "Đang đồng bộ..." và sau đó chuyển thành "Đã đồng bộ ✓".
3. F5 tải lại trang.
   - *Kết quả mong đợi:* Ghi chú của anh giữ nguyên định dạng in đậm/in nghiêng (đã lưu online bảng `workspace_notes`).

#### Kịch bản 4: Pomodoro tập trung kết hợp
1. Bấm chọn nút **🎯 Focus** của task `"Code nốt API"` bên cột Todo.
   - *Kết quả mong đợi:* Tại widget Pomodoro hiện: *"Mục tiêu hiện tại: Code nốt API"*.
2. Bấm nút **Bắt đầu** chạy đếm ngược. (Mẹo kiểm tra nhanh: Có thể sửa tạm thời số giây trong code `timeLeft` của `page.js` thành 5 giây để test nhanh).
3. Khi đồng hồ đếm về `00:00`:
   - *Kết quả mong đợi:*
     - Phát âm thanh chuông bíp bíp vang lên.
     - Hiện Popup Modal thông báo hoàn thành phiên làm việc.
     - Một **Notification đẩy của trình duyệt** xuất hiện ở góc màn hình (nhớ cho phép quyền Notification khi trình duyệt hỏi).
     - Task `"Code nốt API"` được tích lũy `1 🍅`.
     - Thống kê năng suất hôm nay tăng thêm 1 quả 🍅.
     - Lịch sử được lưu online bảng `workspace_pomodoro_history`.

---

*Walkthrough được lập bởi Senior Developer Tuấn — Antigravity Coding Partner*
