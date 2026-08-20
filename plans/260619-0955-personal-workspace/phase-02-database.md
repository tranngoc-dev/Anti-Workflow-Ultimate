# Phase 02: Database Schema (Supabase & RLS Policies)
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Tạo các bảng cần thiết trên Supabase và cấu hình Row Level Security (RLS) policies để đảm bảo chỉ chủ sở hữu của dữ liệu (user đã đăng nhập) mới có quyền đọc/ghi ghi chú, công việc và lịch sử Pomodoro của họ.

## Requirements
### Functional
- [ ] Tạo bảng `workspace_todos` để lưu công việc cá nhân.
- [ ] Tạo bảng `workspace_notes` để lưu ghi chú của không gian làm việc.
- [ ] Tạo bảng `workspace_pomodoro_history` để ghi nhận các phiên tập trung thành công nhằm thống kê hiệu suất.
- [ ] Bật Row Level Security (RLS) cho cả 3 bảng trên.
- [ ] Định nghĩa các RLS policies (SELECT, INSERT, UPDATE, DELETE) cho từng bảng gắn với `auth.uid() = user_id`.

### Non-Functional
- [ ] Có index trên cột `user_id` của các bảng để tối ưu hiệu năng truy vấn.
- [ ] Đảm bảo khóa ngoại (Foreign Keys) được ràng buộc chính xác, đặc biệt là `todo_id` trong lịch sử Pomodoro phải set `ON DELETE SET NULL` để không bị lỗi khi xóa task.

## Implementation Steps
1. [ ] Viết SQL script khởi tạo database gồm:
   - Tạo enum hoặc check constraints cho `priority` ('high', 'medium', 'low').
   - Tạo bảng `workspace_todos` có cột `pomodoros_completed` để đếm số phiên hoàn thành cho task đó.
   - Tạo bảng `workspace_notes` hỗ trợ nhiều note trên cùng 1 user (có `title` và `content`).
   - Tạo bảng `workspace_pomodoro_history` lưu thời gian hoàn thành.
   - Tạo RLS Policies cho từng bảng để bảo mật dữ liệu.
2. [ ] Hướng dẫn User chạy SQL script này trong phần SQL Editor trên Dashboard Supabase của họ, hoặc chạy file script qua migration nếu có. (Chúng ta sẽ lưu script SQL này vào `plans/260619-0955-personal-workspace/schema.sql` để user dễ copy).

## Files to Create/Modify
- `[NEW] plans/260619-0955-personal-workspace/schema.sql` - File chứa toàn bộ mã SQL tạo bảng và phân quyền trên Supabase.

## Test Criteria
- [ ] Script SQL chạy thành công trên Supabase dashboard mà không có lỗi cú pháp.
- [ ] Kiểm tra phân quyền: Dữ liệu của User A không được hiển thị cho User B. User A chỉ được xem/sửa dữ liệu có `user_id` trùng với UID đăng nhập của họ.
