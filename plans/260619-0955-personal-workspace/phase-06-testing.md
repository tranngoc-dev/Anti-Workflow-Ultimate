# Phase 06: Testing & Verification
Status: ⬜ Pending
Dependencies: Phase 05

## Objective
Thực hiện kiểm thử toàn bộ hệ thống Working Space để đảm bảo tính ổn định, dữ liệu đồng bộ chính xác lên Supabase, trải nghiệm người dùng mượt mà, âm thanh/popup cảnh báo hoạt động chính xác.

## Requirements
### Functional
- [ ] Kiểm thử luồng phân quyền (Auth Flow):
  - Chưa đăng nhập -> Vào `/working` -> Bị chặn, hiển thị trang yêu cầu đăng nhập.
  - Đã đăng nhập -> Vào `/working` -> Hiển thị đầy đủ giao diện Dashboard.
- [ ] Kiểm thử Todo List:
  - Thêm task mới với các mức độ ưu tiên khác nhau -> Dữ liệu lưu đúng lên Supabase.
  - Tích chọn hoàn thành task -> Gạch ngang chữ, chuyển trạng thái trên DB.
  - Cập nhật thông tin task trực tiếp -> DB được cập nhật.
  - Xóa task -> Task biến mất khỏi UI và DB.
- [ ] Ghi Chú & Auto-save:
  - Tạo mới ghi chú -> Xuất hiện trong danh sách tab ghi chú.
  - Soạn thảo nội dung ghi chú (in đậm, in nghiêng, list) -> Dừng gõ 2 giây -> Hiện "Đã lưu" -> Tải lại trang (F5) để kiểm tra dữ liệu cũ không bị mất và định dạng văn bản được giữ nguyên.
  - Xóa ghi chú -> DB xóa ghi chú tương ứng.
- [ ] Pomodoro Timer:
  - Bấm Start/Pause/Reset -> Trạng thái đồng hồ phản hồi ngay lập tức.
  - Hết giờ làm việc -> Phát chuông báo, hiện popup modal và notification.
  - Kiểm tra xem số đếm Pomodoro của task active có được tăng lên 1 trên DB và UI không.
  - Kiểm tra thống kê cà chua của ngày hôm nay có cập nhật chính xác không.

### Non-Functional
- [ ] Kiểm thử Responsive: Giao diện hiển thị đẹp và dễ dùng trên màn hình điện thoại di động (Mobile) và máy tính bảng (Tablet).
- [ ] Kiểm thử lỗi mất mạng (Offline Resilience):
  - Đang gõ ghi chú -> Tắt kết nối internet -> Giao diện hiện cảnh báo lỗi kết nối nhưng không bị mất chữ.
  - Bật lại internet -> Ghi chú tự động đồng bộ lại khi kết nối thành công.

## Implementation Steps
1. [ ] Chạy ứng dụng local bằng lệnh: `npm run dev`
2. [ ] Thực hiện lần lượt tất cả các kịch bản kiểm thử (Test Cases) trong checklist.
3. [ ] Theo dõi log console của trình duyệt để đảm bảo không có lỗi JavaScript (errors/warnings) phát sinh trong quá trình hoạt động.
4. [ ] Kiểm tra tab Network của Chrome DevTools để xác minh số lượng request gửi lên Supabase là hợp lý (đặc biệt là cơ chế debounced auto-save của Note).

## Test Criteria
- [ ] Đạt 100% các đầu mục trong checklist kiểm thử hoạt động đúng như mong đợi.
- [ ] Không có lỗi runtime phá hỏng giao diện (white screen hoặc crash app).
