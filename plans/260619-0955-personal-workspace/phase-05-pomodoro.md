# Phase 05: Pomodoro Logic, Web Audio API & Task Binding
Status: ⬜ Pending
Dependencies: Phase 04

## Objective
Hiện thực hóa đồng hồ Pomodoro đầy đủ tính năng: đếm ngược 25/5 phút, liên kết trực tiếp với một công việc cụ thể, tự tạo chuông báo bằng Web Audio API, hiển thị popup/trình duyệt notification khi hết giờ, và thống kê năng suất hàng ngày.

## Requirements
### Functional
- [ ] **Logic Pomodoro chính:**
  - Chạy đếm ngược chính xác từng giây bằng `setInterval` trong React.
  - Tự động chuyển đổi giữa phiên Làm việc (25 phút) và Nghỉ ngơi (5 phút) khi hết giờ.
  - Hỗ trợ các nút Pause (tạm dừng), Resume (tiếp tục), Reset (quay lại mốc thời gian ban đầu).
- [ ] **Liên kết Task (Task Binding):**
  - Nhận diện task đang được chọn "Focus" từ TodoWidget.
  - Khi hoàn thành 1 phiên Pomodoro làm việc (25:00 về 00:00):
    - Tự động tăng số phiên Pomodoro của task đang active lên 1 (`pomodoros_completed = pomodoros_completed + 1`).
    - Ghi nhận lịch sử vào bảng `workspace_pomodoro_history`.
- [ ] **Âm thanh chuông báo (Web Audio API):**
  - Viết helper hàm phát ra tiếng chuông báo hiệu hết giờ. 
  - Sử dụng `AudioContext` và `OscillatorNode` để tạo tần số âm thanh (ví dụ: tạo chuỗi âm thanh "bíp bíp" hoặc tiếng chuông ngân vang) ngay trên trình duyệt mà không cần tải file `.mp3` từ ngoài.
- [ ] **Cảnh báo (Popup & Notification):**
  - Hiển thị một Modal Popup đẹp mắt ngay giữa màn hình báo hiệu hết giờ (sử dụng Framer Motion).
  - Sử dụng Web Notification API để hiển thị thông báo đẩy của hệ điều hành/trình duyệt (nếu user cấp quyền), giúp báo hiệu ngay cả khi user đang làm việc ở tab trình duyệt khác.
- [ ] **Thống kê hiệu suất:**
  - Truy vấn số phiên Pomodoro đã hoàn thành trong ngày hôm nay từ bảng `workspace_pomodoro_history` để hiển thị số lượng quả cà chua 🍅 tương ứng.

### Non-Functional
- [ ] Đồng hồ đếm ngược chạy mượt mà, không bị lệch thời gian khi CPU bận.
- [ ] Âm thanh báo êm tai, không quá chói tai nhưng đủ để thu hút chú ý.

## Implementation Steps
1. [ ] Viết helper `sound.js` chứa các hàm phát âm thanh bằng Web Audio API (ví dụ: chuông báo hoàn thành, chuông báo kết thúc giờ nghỉ).
2. [ ] Hoàn thiện Component `PomodoroWidget.js`:
   - Setup state đếm ngược (giây còn lại, trạng thái làm/nghỉ, trạng thái đang chạy/dừng).
   - Sử dụng React `useEffect` quản lý interval.
   - Thêm nút xin quyền Notification của trình duyệt.
   - Viết hàm xử lý khi đồng hồ về 0: phát âm thanh, hiện popup cảnh báo, lưu lịch sử lên database.
3. [ ] Cập nhật đồng bộ state giữa `TodoWidget` và `PomodoroWidget` thông qua component cha `page.js`.

## Files to Create/Modify
- `[NEW] app/working/utils/sound.js` - Helper phát âm thanh bằng Web Audio API.
- `[MODIFY] app/working/components/PomodoroWidget.js` - Viết logic đếm ngược, âm thanh, popup, và thống kê.
- `[MODIFY] app/working/page.js` - Đồng bộ trạng thái active task giữa Todo và Pomodoro.

## Test Criteria
- [ ] Đồng hồ đếm ngược chạy đúng. Thử nghiệm rút ngắn thời gian test (ví dụ set thành 5 giây làm việc) để xác nhận khi hết giờ:
  - Phát tiếng chuông báo qua loa máy tính.
  - Hiển thị popup modal trên màn hình.
  - Gửi thông báo đẩy trình duyệt (nếu đã bật quyền).
  - Tự động chuyển trạng thái từ Làm việc sang Nghỉ ngơi.
  - Số phiên Pomodoro của task active tăng thêm 1 và hiển thị ngay trên UI.
  - Số lượng quả cà chua thống kê trong ngày tăng thêm 1.
