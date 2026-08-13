# Phase 04: Database Integration & Auto-save Note Logic
Status: ⬜ Pending
Dependencies: Phase 03

## Objective
Kết nối giao diện Todo và Ghi chú với Supabase để thực hiện lưu trữ dữ liệu online theo thời gian thực (realtime updates) và cài đặt tính năng Tự động lưu (Auto-save) cho Ghi chú khi người dùng soạn thảo.

## Requirements
### Functional
- [ ] **Tích hợp Supabase cho Todo List:**
  - Tải toàn bộ danh sách task của user hiện tại khi trang workspace được load.
  - Đồng bộ khi thêm task mới (INSERT vào `workspace_todos`).
  - Đồng bộ khi tích chọn hoàn thành / cập nhật priority / thay đổi deadline (UPDATE).
  - Đồng bộ khi xóa task (DELETE).
- [ ] **Tích hợp Supabase cho Ghi chú:**
  - Tải danh sách ghi chú của user khi load trang.
  - Tạo mới ghi chú (tiêu đề mặc định 'Ghi chú mới') và xóa ghi chú khỏi database.
- [ ] **Cài đặt cơ chế Tự động lưu (Auto-save):**
  - Sử dụng hàm Debounce (ví dụ: chờ 2 giây sau khi người dùng dừng gõ chữ hoặc chỉnh sửa tiêu đề/nội dung).
  - Khi người dùng gõ, đổi trạng thái thành "Đang lưu..." (hoặc hiện icon xoay nhẹ).
  - Khi hoàn thành lưu lên Supabase, đổi trạng thái thành "Đã lưu" hoặc "Đã đồng bộ".
  - Đảm bảo cơ chế tự động lưu không tạo ra quá nhiều request vô ích (chỉ lưu khi có sự thay đổi thực sự so với dữ liệu gốc).

### Non-Functional
- [ ] Xử lý lỗi kết nối mạng: Nếu lưu thất bại, thông báo trạng thái "Lỗi đồng bộ - Sẽ thử lại" và giữ nguyên dữ liệu ở local để tránh mất mát.
- [ ] Không làm đơ/lag giao diện editor khi đang gửi request lưu trữ lên database.

## Implementation Steps
1. [ ] Viết hook hoặc helper hàm để giao tiếp với Supabase cho các thao tác CRUD của Todo và Notes.
2. [ ] Viết hàm `useDebounce` hoặc tích hợp logic debounce trực tiếp trong Component `NotesWidget.js` để theo dõi sự thay đổi của tiêu đề và nội dung note (lắng nghe sự kiện `input` của thẻ `contentEditable`).
3. [ ] Cập nhật state UI để hiển thị trạng thái đồng bộ dữ liệu (Đồng bộ thành công, Đang lưu..., Lỗi kết nối).
4. [ ] Xử lý bảo mật RLS: Đảm bảo truyền đúng `user_id` (UID của user đang đăng nhập qua Supabase Auth) khi thực hiện các câu lệnh INSERT.

## Files to Create/Modify
- `[MODIFY] app/working/components/TodoWidget.js` - Kết nối Supabase API cho Todo.
- `[MODIFY] app/working/components/NotesWidget.js` - Tích hợp logic Debounced Auto-save cho Ghi chú.
- `[MODIFY] app/working/page.js` - Cung cấp session/user context cho các Widget con.

## Test Criteria
- [ ] Thêm/sửa/xóa todo: Tải lại trang (F5) hoặc mở trình ẩn danh đăng nhập lại vẫn hiển thị chính xác danh sách đã cập nhật.
- [ ] Viết ghi chú: Gõ ký tự liên tục -> Trạng thái hiển thị "Đang lưu...". Dừng gõ 2 giây -> Trạng thái chuyển thành "Đã lưu".
- [ ] F5 lại trang: Nội dung ghi chú soạn thảo cuối cùng phải được hiển thị chính xác.
