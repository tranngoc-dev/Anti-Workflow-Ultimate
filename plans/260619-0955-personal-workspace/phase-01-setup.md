# Phase 01: Setup Route & Stylesheet
Status: ⬜ Pending
Dependencies: None

## Objective
Thiết lập trang workspace trống tại route `/working` được bảo vệ bằng kiểm tra trạng thái đăng nhập, và cấu hình Header để chuyển hướng người dùng khi họ đăng nhập thành công.

## Requirements
### Functional
- [ ] Tạo route `/working` (tạo thư mục `app/working` và `app/working/page.js`).
- [ ] Tích hợp bảo vệ bằng Session: Nếu chưa đăng nhập, hiển thị thông báo đẹp yêu cầu đăng nhập qua Google Auth. Nếu đã đăng nhập, hiển thị giao diện làm việc trống.
- [ ] Cập nhật `app/components/HeaderAuth.js` để chuyển hướng người dùng đến trang `/working` sau khi đăng nhập thay vì `/mindmap`, đồng thời thêm một nút/link "Working Space" trên thanh Header khi đã đăng nhập.
- [ ] Tạo file CSS chứa toàn bộ styles cho workspace: `app/working/working.css` để giữ stylesheet tách biệt, sạch sẽ.

### Non-Functional
- [ ] UI load mượt mà, không bị giật lag hay nhấp nháy giao diện khi đang kiểm tra trạng thái đăng nhập (SSR Safe).
- [ ] Cấu trúc folder chuẩn Next.js App Router.

## Implementation Steps
1. [ ] Tạo file `app/working/working.css` trống để sẵn sàng viết styles sau này.
2. [ ] Tạo file `app/working/page.js` với cấu trúc ban đầu:
   - Sử dụng client component (`'use client'`).
   - Import supabase client để check auth.
   - Thêm phần kiểm tra trạng thái đăng nhập (loading, user logged in, guest).
   - Thiết lập meta tag hoặc UI thông báo nếu chưa đăng nhập.
3. [ ] Sửa file `app/components/HeaderAuth.js` để:
   - Link redirect sau khi OAuth đổi thành `/working`.
   - Thêm nút chuyển sang trang `/working` bên cạnh nút Sign Out (nếu user đã đăng nhập).

## Files to Create/Modify
- `[NEW] app/working/page.js` - Trang workspace chính xử lý routing và bảo mật auth.
- `[NEW] app/working/working.css` - Chứa CSS layout Dashboard, Todo, Note, Pomodoro.
- `[MODIFY] app/components/HeaderAuth.js` - Đổi luồng redirect và hiển thị nút truy cập nhanh Workspace.

## Test Criteria
- [ ] Truy cập `/working` khi chưa đăng nhập: Phải hiện màn hình yêu cầu đăng nhập.
- [ ] Bấm nút "Đăng nhập Google" từ trang chủ/working: Sau khi đăng nhập thành công phải redirect về `/working`.
- [ ] Khi đã đăng nhập: Trên Header phải xuất hiện nút "Không gian làm việc" hoặc "Working Space" để truy cập nhanh, và trang `/working` hiển thị màn hình trống không bị chặn.
