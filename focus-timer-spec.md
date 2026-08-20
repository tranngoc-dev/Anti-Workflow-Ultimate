# Đặc tả kỹ thuật: Focus Timer Web App

## 1. Tổng quan sản phẩm

**Tên app:** Focus Timer  
**Mục đích:** Giúp người dùng tập trung làm việc theo phương pháp Pomodoro — xen kẽ giữa các phiên làm việc tập trung và nghỉ ngơi ngắn.  
**Nền tảng:** Web app, chạy hoàn toàn client-side (HTML + CSS + Vanilla JavaScript). Không cần backend, không cần API ngoài.

---

## 2. Tính năng chính

### 2.1 Bộ đếm giờ Pomodoro

- **3 chế độ** có thể chuyển đổi bằng tab:
  - `Làm việc` — mặc định 25 phút
  - `Nghỉ ngắn` — mặc định 5 phút
  - `Nghỉ dài` — mặc định 15 phút
- Vòng tròn tiến trình SVG (circular progress ring) thể hiện % thời gian còn lại
- Hiển thị giờ dạng `MM:SS` ở giữa vòng tròn
- Màu vòng tròn khác nhau theo chế độ:
  - Làm việc: xanh lá (#3B6D11)
  - Nghỉ ngắn: xanh dương (#185FA5)
  - Nghỉ dài: cam (#853B0B)
- Nhãn trạng thái hiển thị phía trên vòng tròn ("Tập trung", "Nghỉ ngắn", "Nghỉ dài")
- Hiển thị tên việc đang làm bên dưới vòng tròn

**Logic bộ đếm:**
- Nút "Bắt đầu" → đếm ngược từng giây
- Khi đang chạy, nút chuyển thành "Tạm dừng"
- Nút reset (biểu tượng refresh) đặt lại về thời gian ban đầu của chế độ hiện tại
- Không thể chuyển chế độ khi timer đang chạy
- Khi đếm về 0: dừng tự động, hiển thị thông báo, cập nhật thống kê

### 2.2 Thống kê phiên (Stats)

Hiển thị 3 ô số liệu ngang hàng:
- **Phiên hôm nay** — số lần hoàn thành phiên làm việc
- **Phút tập trung** — tổng số phút làm việc đã hoàn thành
- **Việc xong** — số task đã đánh dấu hoàn thành

### 2.3 Danh sách việc cần làm (Task List)

- Ô nhập task + nút thêm (icon dấu cộng)
- Nhấn `Enter` hoặc click nút để thêm task
- Giới hạn 60 ký tự mỗi task
- Mỗi task hiển thị dưới dạng hàng gồm:
  - Icon vòng tròn (chưa xong) / dấu tick (đã xong)
  - Tên task (flex grow)
  - Nút đánh dấu hoàn thành (icon tick)
  - Nút xóa (icon X)
- **Click vào task** → chọn làm task hiện tại → tên task hiện lên ở timer card
- Task đang được chọn có viền màu accent và nền nhạt khác biệt
- Task đã hoàn thành: mờ đi (opacity 0.45) + gạch ngang văn bản, không thể chọn làm active
- Khi đánh dấu task hoàn thành: tăng biến đếm "Việc xong"

### 2.4 Âm thanh nền (Ambient Sound)

5 nút chọn âm thanh (radio-style, chỉ active 1 cái):
- **Tắt** — không có âm
- **Mưa** — white noise qua bandpass filter (~1400 Hz)
- **Rừng** — white noise qua lowpass filter (~600 Hz)
- **Quán cà phê** — white noise qua bandpass filter (~800 Hz, Q cao hơn)
- **White noise** — white noise qua lowpass filter (~800 Hz)

**Cài đặt âm thanh:**
- Dùng Web Audio API (`AudioContext`)
- Tạo noise buffer stereo 4 giây, loop
- Fade in 1.5 giây khi bắt đầu (`linearRampToValueAtTime`)
- Âm thanh chỉ phát khi timer đang chạy
- Dừng âm khi pause hoặc reset

### 2.5 Cài đặt thời gian

3 ô `<input type="number">` để người dùng tùy chỉnh:
- Thời gian làm việc (1–90 phút)
- Thời gian nghỉ ngắn (1–30 phút)
- Thời gian nghỉ dài (5–60 phút)

Thay đổi chỉ có hiệu lực khi timer không chạy. Khi thay đổi, cập nhật ngay `remaining` và `total` rồi re-render timer.

### 2.6 Nhật ký phiên (Session Log)

- Mỗi khi hoàn thành một phiên (cả làm việc lẫn nghỉ), thêm 1 dòng log
- Mỗi dòng gồm: dot màu (xanh lá = làm việc, xanh dương = nghỉ) + timestamp (HH:MM) + mô tả ("25 phút làm việc", "5 phút nghỉ ngắn",...)
- Log mới nhất hiển thị đầu tiên (newest first)
- Hiển thị tối đa 10 dòng gần nhất
- Chiều cao cố định, scroll được nếu nhiều log
- Khi chưa có log: hiển thị dòng "Chưa có phiên nào hôm nay."

### 2.7 Thông báo toast (Notification)

- Khi phiên kết thúc: hiện toast ở đầu màn hình
  - Phiên làm việc xong: "Phiên xong! Nghỉ ngơi đi anh nhé 🎉"
  - Phiên nghỉ xong: "Xong nghỉ! Sẵn sàng làm tiếp chưa? 💪"
- Toast trượt xuất hiện rồi tự ẩn sau 3 giây
- Animation: `transform: translateY(-60px → 0)` khi show, class `.show` điều khiển

---

## 3. Giao diện & Bố cục

### 3.1 Cấu trúc layout (từ trên xuống)

```
[Mode Tabs: Làm việc | Nghỉ ngắn | Nghỉ dài]
[Timer Card: vòng tròn + giờ + tên task đang làm]
[Stats Row: Phiên hôm nay | Phút tập trung | Việc xong]
[Controls: Nút Bắt đầu/Tạm dừng + Nút Reset]
[Task Section: input + danh sách task]
[Ambient Sound: 5 nút]
[Settings: 3 ô số]
[Session Log]
```

### 3.2 Thiết kế

- **Font:** Sans-serif hệ thống
- **Màu nền:** Trắng/xám nhạt cho các card
- **Border:** 0.5px solid màu xám nhạt
- **Border-radius:** 8px (controls), 12–16px (cards lớn), 10px (tab, setting)
- **Không dùng shadow** (flat design)
- **Dark mode:** Hỗ trợ qua CSS variables hoặc `prefers-color-scheme`
- Tổng chiều rộng nội dung: max 560px, căn giữa

### 3.3 Vòng tròn tiến trình SVG

```
viewBox: "0 0 120 120"
<circle> track: cx=60, cy=60, r=52, stroke=gray-nhạt, stroke-width=5, fill=none
<circle> progress: cx=60, cy=60, r=52, stroke=màu-chế-độ, stroke-width=5, fill=none
  stroke-linecap: round
  stroke-dasharray: 326.7  (= 2 * π * 52)
  stroke-dashoffset: CIRC * (1 - pct)  (pct = remaining/total)
  transform: rotate(-90deg) quanh tâm (60,60) để bắt đầu từ đỉnh
  transition: stroke-dashoffset 0.5s ease
Số giờ: <div> absolute, căn giữa vòng tròn, font 34px
```

### 3.4 Mode Tabs

- Container nền surface-1, border, border-radius 10px, padding 4px
- Mỗi tab: flex:1, border-radius 7px, font 13px
- Tab active: nền trắng (surface-2), font-weight 500

### 3.5 Task item

```
display: flex, align-items: center, gap: 8px
padding: 8px 12px, border-radius: var(--radius)
background: surface-1, border: 0.5px
cursor: pointer (nếu chưa xong)
```
- State active: border-color accent, background accent-nhạt
- State done: opacity 0.45, text-decoration: line-through

---

## 4. State Management (JavaScript)

Toàn bộ state lưu trong một object `state`:

```javascript
const state = {
  mode: 'work',           // 'work' | 'short' | 'long'
  running: false,         // boolean
  remaining: 25 * 60,    // số giây còn lại (integer)
  total: 25 * 60,        // tổng số giây của phiên hiện tại
  interval: null,         // setInterval ID
  sessions: 0,            // số phiên làm việc hoàn thành
  focusMinutes: 0,        // tổng phút tập trung
  tasksDone: 0,           // số task đã xong
  tasks: [],              // array of { text: string, done: boolean }
  activeTaskIdx: null,    // index task đang được chọn (hoặc null)
  sound: 'none',          // 'none' | 'rain' | 'forest' | 'cafe' | 'white'
  audioCtx: null,         // AudioContext instance
  audioNode: null,        // AudioBufferSourceNode đang phát
  gainNode: null,         // GainNode để fade
  logs: [],               // array of { isWork, label, time }
}
```

---

## 5. Các hàm JavaScript chính

| Hàm | Mô tả |
|-----|-------|
| `switchMode(mode)` | Đổi chế độ, reset timer, cập nhật UI tab và màu ring |
| `toggleTimer()` | Gọi `startTimer()` hoặc `pauseTimer()` |
| `startTimer()` | Set `running=true`, gọi `setInterval(tick, 1000)`, start audio |
| `pauseTimer()` | Clear interval, stop audio, đổi nút |
| `resetTimer()` | Clear interval, reset `remaining`, stop audio, re-render |
| `tick()` | Giảm `remaining` 1 giây, gọi `renderTimer()`, check về 0 |
| `sessionComplete()` | Cập nhật stats, thêm log, hiện toast, reset remaining |
| `renderTimer()` | Tính `pct`, set `stroke-dashoffset`, cập nhật text MM:SS |
| `addTask()` | Lấy value input, push vào `state.tasks`, gọi `renderTasks()` |
| `toggleTask(idx)` | Flip `done`, tăng tasksDone nếu xong, renderTasks |
| `removeTask(idx)` | Splice tasks array, điều chỉnh activeTaskIdx, renderTasks |
| `selectTask(idx)` | Set activeTaskIdx, cập nhật label timer card, renderTasks |
| `renderTasks()` | Render toàn bộ task-list innerHTML từ state.tasks |
| `toggleSound(type)` | Cập nhật `state.sound`, nếu đang chạy thì restart audio |
| `startAudio()` | Tạo AudioContext, buffer noise, filter, gainNode, play |
| `stopAudio()` | Dừng và disconnect audioNode + gainNode |
| `addLog(isWork, label)` | Tạo log entry với timestamp, unshift vào logs, renderLogs |
| `renderLogs()` | Render log-list innerHTML |
| `showNotif(msg)` | Set text, add class `.show`, setTimeout remove `.show` sau 3s |
| `getDurations()` | Đọc 3 input settings, trả về `{ work, short, long }` (phút) |
| `updateSettings()` | Nếu không đang chạy: cập nhật total/remaining, re-render |

---

## 6. Web Audio API — Chi tiết tạo âm thanh

```javascript
// 1. Tạo AudioContext (lazy init)
const ctx = new (window.AudioContext || window.webkitAudioContext)();

// 2. Tạo GainNode để fade in
const gainNode = ctx.createGain();
gainNode.gain.setValueAtTime(0, ctx.currentTime);
gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);
gainNode.connect(ctx.destination);

// 3. Tạo noise buffer (stereo, 4 giây, loop)
const bufLen = ctx.sampleRate * 4;
const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
for (let ch = 0; ch < 2; ch++) {
  const data = buf.getChannelData(ch);
  for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
}
const src = ctx.createBufferSource();
src.buffer = buf;
src.loop = true;

// 4. Tạo BiquadFilter theo loại âm
const filter = ctx.createBiquadFilter();
// rain:   type='bandpass', frequency=1400, Q=0.5,  gain volume=0.22
// forest: type='lowpass',  frequency=600,           gain volume=0.12
// cafe:   type='bandpass', frequency=800,  Q=1.2,  gain volume=0.14
// white:  type='lowpass',  frequency=800,           gain volume=0.18

// 5. Nối chain và phát
src.connect(filter);
filter.connect(gainNode);
src.start();

// 6. Dừng
src.stop();
gainNode.disconnect();
```

**Lưu ý:** Gọi `ctx.resume()` nếu AudioContext bị suspended (browser policy yêu cầu user gesture trước).

---

## 7. Cấu trúc HTML (skeleton)

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Focus Timer</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <!-- Toast notification -->
  <div class="notif" id="notif"></div>

  <div id="app">
    <!-- 1. Mode tabs -->
    <div class="mode-tabs">
      <button class="mode-tab active" id="tab-work">Làm việc</button>
      <button class="mode-tab" id="tab-short">Nghỉ ngắn</button>
      <button class="mode-tab" id="tab-long">Nghỉ dài</button>
    </div>

    <!-- 2. Timer card -->
    <div class="timer-card">
      <div class="timer-phase" id="phase-label">Tập trung</div>
      <div class="timer-ring">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle class="timer-track" cx="60" cy="60" r="52" />
          <circle class="timer-progress" id="ring-progress" cx="60" cy="60" r="52"
            stroke-dasharray="326.7" stroke-dashoffset="0" />
        </svg>
        <div class="timer-time" id="timer-display">25:00</div>
      </div>
      <div class="current-task-row">
        <span>Đang làm:</span>
        <span id="current-task-label">Chưa chọn việc</span>
      </div>
    </div>

    <!-- 3. Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">Phiên hôm nay</div>
        <div class="stat-value" id="sessions-count">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Phút tập trung</div>
        <div class="stat-value" id="focus-minutes">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Việc xong</div>
        <div class="stat-value" id="tasks-done">0</div>
      </div>
    </div>

    <!-- 4. Controls -->
    <div class="controls">
      <button class="btn primary" id="start-btn">▶ Bắt đầu</button>
      <button class="btn" id="reset-btn">↺</button>
    </div>

    <!-- 5. Tasks -->
    <div class="task-section">
      <div class="task-input-row">
        <input type="text" id="task-input" placeholder="Thêm việc cần làm..." maxlength="60" />
        <button class="btn" id="add-task-btn">+</button>
      </div>
      <div class="task-list" id="task-list"></div>
    </div>

    <!-- 6. Ambient sound -->
    <div class="sound-row">
      <button class="sound-btn active" id="snd-none">Tắt</button>
      <button class="sound-btn" id="snd-rain">🌧 Mưa</button>
      <button class="sound-btn" id="snd-forest">🌿 Rừng</button>
      <button class="sound-btn" id="snd-cafe">☕ Quán cà phê</button>
      <button class="sound-btn" id="snd-white">〰 White noise</button>
    </div>

    <!-- 7. Settings -->
    <div class="settings-row">
      <div class="setting-item">
        <label>Làm việc (phút)</label>
        <input type="number" id="set-work" value="25" min="1" max="90" />
      </div>
      <div class="setting-item">
        <label>Nghỉ ngắn (phút)</label>
        <input type="number" id="set-short" value="5" min="1" max="30" />
      </div>
      <div class="setting-item">
        <label>Nghỉ dài (phút)</label>
        <input type="number" id="set-long" value="15" min="5" max="60" />
      </div>
    </div>

    <!-- 8. Session log -->
    <div class="log-list" id="log-list">
      <div class="empty-log">Chưa có phiên nào hôm nay.</div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

---

## 8. Gợi ý cải tiến (tùy chọn)

- **localStorage**: Lưu tasks và log để không mất khi refresh trang
- **Notification API**: Hiện thông báo hệ thống khi phiên kết thúc (cần xin quyền)
- **Âm báo hiệu**: Phát một tiếng "ding" nhỏ khi hết phiên (dùng OscillatorNode)
- **Thống kê tuần**: Vẽ biểu đồ cột số phiên theo từng ngày trong tuần
- **Chế độ tối (Dark mode)**: CSS variable `prefers-color-scheme: dark`
- **PWA**: Thêm `manifest.json` + Service Worker để cài lên điện thoại

---

## 9. Yêu cầu tương thích

- Không cần thư viện ngoài — thuần HTML/CSS/JS
- Web Audio API: hỗ trợ tất cả trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)
- Không cần build tool — mở file HTML trực tiếp là chạy được
