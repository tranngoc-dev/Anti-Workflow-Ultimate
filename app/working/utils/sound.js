/**
 * Phát âm thanh chuông báo bằng Web Audio API (không dùng file MP3 bên ngoài)
 * Tạo chuỗi 3 tiếng bíp "Bíp - Bíp - Bíp" thanh lịch báo hiệu hoàn thành phiên Pomodoro.
 */
export function playAlarmSound() {
  if (typeof window === 'undefined') return;
  
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Trình duyệt không hỗ trợ Web Audio API.');
      return;
    }

    const ctx = new AudioContextClass();
    
    // Hàm phụ phát một tiếng bíp
    const playBeep = (startTime, duration, frequency) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine'; // Sóng hình sin cho âm thanh trong trẻo
      osc.frequency.setValueAtTime(frequency, startTime);
      
      // Xử lý âm lượng mịn để không có tiếng "click" rác do sóng âm ngắt đột ngột
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.04);
      gainNode.gain.setValueAtTime(0.25, startTime + duration - 0.04);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    
    // Phát chuỗi bíp bíp bíp
    playBeep(now, 0.15, 880);       // Bíp ngắn 1 (nốt La - A5)
    playBeep(now + 0.25, 0.15, 880); // Bíp ngắn 2
    playBeep(now + 0.5, 0.35, 987.77); // Bíp dài 3 cao hơn (nốt Si - B5) để tạo điểm nhấn
    
  } catch (err) {
    console.error('[WebAudioAPI] Lỗi phát âm thanh cảnh báo:', err);
  }
}

/**
 * Phát tiếng chuông chánh niệm (bell.mp3) lặp lại đúng số lần quy định (mặc định 3 lần)
 * Nghe sự kiện 'ended' để phát tuần tự các lần tiếp theo.
 */
export function playZenBell(times = 3) {
  if (typeof window === 'undefined') return;

  try {
    const audio = new Audio('/sounds/bell.mp3');
    let playCount = 0;

    const playNext = () => {
      if (playCount < times) {
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.warn('[SoundAPI] Trình duyệt chặn tự động phát âm thanh. Cần tương tác với trang trước.', err);
        });
        playCount++;
      }
    };

    audio.addEventListener('ended', playNext);

    // Phát lần đầu tiên
    playNext();
  } catch (err) {
    console.error('[SoundAPI] Lỗi phát âm thanh chuông chánh niệm:', err);
  }
}
