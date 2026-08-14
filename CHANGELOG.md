# Changelog

All notable changes to this project will be documented in this file.

## [2026-08-14]
### Added
- Thêm lối tắt "Admin" kèm icon trên thanh điều hướng Taskbar cho tài khoản quản trị `vutrongvtv24@gmail.com`.
- Bổ sung cấu trúc các bảng Blog & Thống kê vào CSDL Supabase mới (`site_settings`, `posts`, `comments`, `visit_logs`, `page_views`) và 5 hàm RPC analytics.
- Tạo 8 chỉ mục (Indexes) trên cơ sở dữ liệu để tăng tốc độ truy vấn Dashboard và lọc dữ liệu.
- Tạo báo cáo kiểm thử và bảo mật toàn diện tại `docs/reports/audit_2026_08_14.md`.
- Tạo kịch bản kiểm thử tự động với Playwright tại `tests/browser_login.test.js`.

### Changed
- Đồng bộ hiển thị tên thương hiệu toàn trang thành "Tulanh".
- Cập nhật cơ chế xác thực Admin: Kiểm tra trực tiếp quyền từ `session.user.user_metadata.is_admin` thay vì gọi RPC bất đồng bộ.
- Cập nhật cấu hình Supabase URL và Anon Key trong Next.js Middleware trỏ đúng project `xywmdsieytqsxqpqvcwj`.
- Bổ sung các biến toàn cục trình duyệt (`Blob`, `DOMParser`, `Notification`...) vào cấu hình ESLint.

### Fixed
- Sửa triệt để lỗi F5/Redirect Loop khi đăng nhập trang quản trị Admin.
- Sửa lỗi không lưu được IP loại trừ do thiếu bảng `site_settings`.
- Khắc phục lỗ hổng bảo mật XSS tiềm ẩn trong component `NotesWidget.js` bằng `DOMPurify`.
- Khắc phục 5 lỗ hổng bảo mật của các gói thư viện phụ thuộc qua `npm audit fix`.

### Security
- Thiết lập phân quyền RLS (Row Level Security) nghiêm ngặt cho toàn bộ các bảng trong CSDL.
- Bọc toàn bộ các điểm hiển thị HTML động với màng lọc khử độc `DOMPurify.sanitize()`.
