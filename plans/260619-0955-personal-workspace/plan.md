# Plan: Personal Workspace (Next.js & Supabase)
Created: 2026-06-19T09:55:07+07:00
Status: 🟡 In Progress

## Overview
Xây dựng một trang không gian làm việc cá nhân (/working) tích hợp các công cụ: Todo List nâng cao (có priority, deadline, liên kết Pomodoro), Ghi chú đa tab có Auto-save, và Đồng hồ Pomodoro tập trung (phát âm thanh chuông báo và popup, thống kê số cà chua trong ngày). Dữ liệu được đồng bộ online lên Supabase.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), React 18, Framer Motion (hiệu ứng mượt mà), Lucide React (icons)
- **Styling:** Vanilla CSS (tích hợp trong global.css hoặc workspace.css riêng biệt)
- **Database:** Supabase (PostgreSQL)
- **Utility:** Web Audio API (chuông báo Pomodoro), Web Browser Notification API (popup cảnh báo)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Setup Route & CSS | ✅ Complete | 100% |
| 02 | Database Schema | ✅ Complete | 100% |
| 03 | Frontend Core Layout & UI Widgets | ✅ Complete | 100% |
| 04 | Integration & Auto-save Logic | ✅ Complete | 100% |
| 05 | Pomodoro Logic & Audio Notifications | ✅ Complete | 100% |
| 06 | Testing & Verification | ✅ Complete | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
- Run dev server: `npm run dev`
