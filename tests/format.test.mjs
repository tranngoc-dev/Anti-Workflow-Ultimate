import test from 'node:test';
import assert from 'node:assert';
import { formatTime } from '../app/working/utils/format.js';

test('formatTime Helper Tests', async (t) => {
  await t.test('định dạng đúng thời gian chuẩn Pomodoro (25 phút)', () => {
    assert.strictEqual(formatTime(1500), '25:00');
  });

  await t.test('định dạng đúng thời gian giải lao (5 phút)', () => {
    assert.strictEqual(formatTime(300), '05:00');
  });

  await t.test('định dạng đúng các số giây lẻ và nhỏ', () => {
    assert.strictEqual(formatTime(59), '00:59');
    assert.strictEqual(formatTime(9), '00:09');
    assert.strictEqual(formatTime(0), '00:00');
  });

  await t.test('xử lý an toàn khi đầu vào không hợp lệ (số âm, không phải là số)', () => {
    assert.strictEqual(formatTime(-10), '00:00');
    assert.strictEqual(formatTime('invalid'), '00:00');
    assert.strictEqual(formatTime(null), '00:00');
    assert.strictEqual(formatTime(undefined), '00:00');
    assert.strictEqual(formatTime(NaN), '00:00');
  });
});
