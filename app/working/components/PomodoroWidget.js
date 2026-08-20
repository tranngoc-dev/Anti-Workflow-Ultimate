'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Target, Award, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { formatTime } from '../utils/format';

export default function PomodoroWidget({
  activeTodo,
  timeLeft = 1500, // 25:00
  isRunning = false,
  mode = 'work', // 'work' | 'break'
  todayPomodoroCount = 0,
  onStart,
  onPause,
  onReset,
  showPopup = false,
  onClosePopup,
  isMuted = false,
  setIsMuted
}) {
  const totalSeconds = mode === 'work' ? 1500 : 300;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  
  // SVG circle calculations
  const radius = 72;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="pomo-container">
      {/* 1. Status Indicator Header */}
      <div className={`pomo-status-banner ${mode}`}>
        <span className="pomo-pulse-dot"></span>
        {mode === 'work' ? 'ĐANG TẬP TRUNG 🎯' : 'GIẢI LAO NGẮN ☕'}
      </div>

      {/* 2. Visual Radial Timer Clock */}
      <div className="pomo-clock-container">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="pomo-svg"
        >
          {/* Background Circle */}
          <circle
            stroke="var(--border)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{ opacity: 0.3 }}
          />
          {/* Progress Circle with Animation */}
          <motion.circle
            stroke={mode === 'work' ? 'var(--pomo-red)' : 'var(--pomo-green)'}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, strokeLinecap: 'round' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>

        {/* Numeric time text inside circle */}
        <div className="pomo-time-display">
          <span className="time-text">{formatTime(timeLeft)}</span>
          <span className="mode-sub-text">{mode === 'work' ? 'Làm việc' : 'Nghỉ ngơi'}</span>
        </div>
      </div>

      {/* 3. Target Task Area */}
      <div className="pomo-target-card">
        <Target size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
        <div className="pomo-target-content">
          <span className="pomo-target-label">Mục tiêu hiện tại:</span>
          <span className="pomo-target-name">
            {activeTodo ? activeTodo.title : 'Chọn 1 việc bên cột trái để focus'}
          </span>
        </div>
      </div>

      {/* 4. Controls Row */}
      <div className="pomo-controls-row">
        {/* Toggle Mute Sound */}
        <button
          onClick={() => setIsMuted && setIsMuted(!isMuted)}
          className={`pomo-control-btn circle-btn mute-btn ${isMuted ? 'muted' : ''}`}
          title={isMuted ? "Bật chuông báo" : "Tắt chuông báo"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Main Start / Pause Button */}
        {isRunning ? (
          <button 
            onClick={onPause} 
            className="pomo-control-btn main-btn pause"
            title="Tạm dừng"
          >
            <Pause size={18} fill="currentColor" />
            <span>Tạm dừng</span>
          </button>
        ) : (
          <button 
            onClick={onStart} 
            className={`pomo-control-btn main-btn start ${mode}`}
            title="Bắt đầu"
          >
            <Play size={18} fill="currentColor" />
            <span>Bắt đầu</span>
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="pomo-control-btn circle-btn reset-btn"
          title="Thiết lập lại"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* 5. Productivity Stats Today */}
      <div className="pomo-stats-card">
        <div className="pomo-stats-header">
          <Award size={18} color="var(--accent)" />
          <span>Năng suất hôm nay</span>
        </div>
        <div className="pomo-tomato-collection">
          {todayPomodoroCount === 0 ? (
            <span className="pomo-empty-stats">Chưa hoàn thành phiên nào. Cố lên anh nhé! 🍅</span>
          ) : (
            <>
              <div className="pomo-tomato-row">
                {Array.from({ length: Math.min(todayPomodoroCount, 10) }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: i * 0.05 }}
                    style={{ fontSize: '20px', cursor: 'default' }}
                    title={`Phiên thứ ${i + 1}`}
                  >
                    🍅
                  </motion.span>
                ))}
                {todayPomodoroCount > 10 && (
                  <span className="pomo-stats-plus" title={`Cộng thêm ${todayPomodoroCount - 10} phiên`}>
                    +{todayPomodoroCount - 10}
                  </span>
                )}
              </div>
              <span className="pomo-count-summary">
                Đã hoàn thành <strong>{todayPomodoroCount}</strong> phiên ({todayPomodoroCount * 25} phút tập trung).
              </span>
            </>
          )}
        </div>
      </div>

      {/* 6. Alarm Notification Popup Modal */}
      <AnimatePresence>
        {showPopup && (
          <div className="pomo-popup-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="pomo-popup-card"
            >
              <div className="pomo-popup-icon-container">
                <AlertTriangle size={32} color="#ffffff" />
              </div>
              <h3>
                {mode === 'work' 
                  ? 'Hoàn thành phiên tập trung! 🎉' 
                  : 'Hết giờ giải lao! ☕'}
              </h3>
              <p>
                {mode === 'work'
                  ? 'Tuyệt vời! Anh đã hoàn thành xuất sắc 25 phút làm việc tập trung. Hãy dành ra 5 phút giải lao nhé.'
                  : 'Thời gian nghỉ ngơi đã hết. Anh em mình cùng quay lại công việc với sự tập trung tối đa nào!'}
              </p>
              <button 
                onClick={onClosePopup}
                className={`pomo-popup-btn ${mode}`}
              >
                {mode === 'work' ? 'Bắt đầu giải lao' : 'Bắt đầu làm việc'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
