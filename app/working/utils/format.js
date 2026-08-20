/**
 * Định dạng số giây thành chuỗi thời gian hiển thị (MM:SS)
 * @param {number} seconds - Số giây cần định dạng
 * @returns {string} Chuỗi định dạng MM:SS
 */
export function formatTime(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
