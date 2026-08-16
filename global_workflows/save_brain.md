---
description: 🧠 Đóng gói kiến thức dự án, Tổng hợp Custom Skill & Chuẩn bị Bàn giao Session mới
---

# WORKFLOW: /save-brain - Đóng Gói Bộ Nhớ Vĩnh Cửu & Tổng Hợp Kỹ Năng (v4.9.0)

**Vai trò:** Knowledge Archivist & Eternal Context Manager  
**Mục tiêu:** Lưu trữ toàn bộ quyết định kiến trúc, bài học kỹ thuật, sổ cái bằng chứng kiểm thử vào `.brain/`, **tổng hợp Custom Skills tái sử dụng**, và chuẩn bị dữ liệu tinh gọn cho phiên làm việc tiếp theo.

---

## 🗺️ Vị Trí Trong Quy Trình Khép Kín

```
Sau khi hoàn thành [/init], [/plan], hoặc 1 Phase trong [/code]
   ↓
[/save-brain] ← BẠN ĐANG Ở ĐÂY (Đóng gói Eternal Context & Custom Skills)
   ↓
🔄 [MỞ CHAT SESSION MỚI ➔ Gõ /recap]
```

---

## Giai đoạn 1: Thu Thập & Đóng Gói Dữ Liệu

1. **Ghi nhận Quyết định Kỹ thuật (Decisions):**
   * Công nghệ mới chọn lựa, lý do tại sao chọn (Trade-offs) lưu vào `.brain/decisions.json`.
2. **Tổng Hợp Custom Skills Tái Sử Dụng (Autonomous Skill Synthesis):** ⭐ MỚI
   * Rà soát các bài toán phức tạp vừa giải quyết trong Phase vừa qua.
   * Nếu có một module hoặc kỹ thuật đặc thù có giá trị tái sử dụng cao cho tương lai $\to$ Tự động trích xuất thành file `skills/custom/[skill-name]/SKILL.md` theo chuẩn mở `agentskills.io`.
3. **Cập nhật Tiến độ & Checkpoint:**
   * Ghi nhận trạng thái hoàn thành của Phase hiện tại vào `.brain/session.json`.
   * Ghi nhận các file đã thay đổi, commit hash gần nhất vào `.brain/session_log.txt`.
   * Đồng bộ Sổ Cái Bằng Chứng Kiểm Thử `.brain/verification_ledger.json`.
4. **Tạo Snapshot Bàn giao (Handover Snapshot):**
   * Lưu snapshot tóm tắt vào `.brain/handovers/handover-phase-{X}.json`.

---

## Giai đoạn 2: Báo Cáo Hoàn Tất & Hướng Dẫn Bàn Giao

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 BỘ NHỚ VĨNH CỬU & SKILLS ĐÃ ĐƯỢC LƯU AN TOÀN!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Trạng thái: .brain/session.json (Updated)
📝 Tiến độ: .brain/session_log.txt (Logged)
📜 Sổ cái kiểm thử: .brain/verification_ledger.json (Synchronized)
🧠 Bài học kinh nghiệm: .brain/learnings.md ({N} learnings active)
📦 Snapshot bàn giao: .brain/handovers/handover-latest.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 GIAO THỨC MODULAR CONVERSATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dữ liệu đã được lưu trữ an toàn trên ổ đĩa.
👉 Để tiếp tục làm việc với Context Window sạch 100% và tốc độ tối đa:
1. Mở một Thread/Session Chat mới trong Antigravity.
2. Gõ lệnh:

    /recap

AI sẽ nạp lại bối cảnh trong nháy mắt và tiếp tục công việc!
```
