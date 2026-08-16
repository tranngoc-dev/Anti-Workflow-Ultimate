---
description: 🐛 Sửa lỗi theo phân loại lỗi hệ thống, Cổng E2E, Sổ cái bằng chứng & Tự động Đúc kết Bài học
---

# WORKFLOW: /debug - Sửa Lỗi Khoa Học & Phân Loại Lỗi Hệ Thống (v4.9.0)

**Vai trò:** Root-Cause Investigator & Reliability Lead  
**Mục tiêu:** Phân loại lỗi chính xác (Transient vs Deterministic), định vị nguyên nhân gốc rễ qua **GitNexus Trace**, bắt buộc viết kịch bản E2E tái hiện lỗi, ghi bằng chứng vào **Sổ Cái Kiểm Thử (`.brain/verification_ledger.json`)**, và **TỰ ĐỘNG ĐÚC KẾT BÀI HỌC HOẶC TỔNG HỢP SKILL MỚI**.

---

## 🗺️ Vị Trí Trong Quy Trình Khép Kín

```
Khi phát hiện Bug trong [/code], [/test], E2E Gate hoặc Live-Test
   ↓
[/debug] ← BẠN ĐANG Ở ĐÂY
   ├── Phase A: Phân loại lỗi (Transient vs Deterministic)
   ├── Phase B: Khóa lỗi bằng Targeted E2E Test (FAIL)
   ├── Phase C: Sửa tối thiểu & Failed-First-Fix
   ├── Phase D: Xác minh E2E & Ghi sổ cái (.brain/verification_ledger.json)
   └── Phase E: Tự động đúc kết (.brain/learnings.md & Custom Skill)
   ↓
Tiếp tục [/code] hoặc [/test]
```

---

## Giai đoạn 1: Phân Loại Lỗi & Truy Vết Gốc Rễ (Phase A - Investigate)

### 🔹 1.1. Phân loại lỗi theo Taxonomy (Học hỏi từ Hermes):
* **Nhóm 1: Lỗi tạm thời (Transient Errors):**
  * *Triệu chứng:* Timeout kết nối, HTTP 503 Overloaded, HTTP 429 Rate limit.
  * *Hành động:* Tự động kích hoạt Exponential Backoff & Retry (tối đa 3 lần).
* **Nhóm 2: Lỗi hệ thống / Logic (Deterministic Errors):**
  * *Triệu chứng:* HTTP 400 Bad Request, Ambiguous Foreign Key PostgREST, Lỗi cú pháp/Type, Lỗi Logic, HTTP 401/403.
  * *Hành động:* **CẤM RETRY MÙ QUÁNG.** Dừng ngay lập tức để điều tra nguyên nhân cốt lõi.

### 🔹 1.2. Truy vết chuỗi gọi qua GitNexus:
* Dùng `gitnexus:trace` để tìm đường dẫn gọi giữa điểm nổ lỗi và nguồn input.
* Dùng `gitnexus:impact` để liệt kê toàn bộ các component/hàm liên đới.
* Hình thành tối đa 3 giả thuyết xếp hạng được chứng minh bằng log runtime.

---

## Giai đoạn 2: Khóa Lỗi Bằng Kịch Bản Test E2E Thật (Phase B - Lock Regression)

* Viết một **Kịch bản Targeted E2E Test (Playwright / API Integration Probe)** tái hiện chính xác thao tác gây lỗi:
  * Ví dụ: Gọi query embed `questions` $\to$ Chứng minh lỗi PostgREST 400 Ambiguous FK xuất hiện (**Test FAIL**).
* Tuyệt đối không dùng Unit Test mock để tái hiện lỗi liên quan đến Database/API.

---

## Giai đoạn 3: Thực Thi Bản Vá Tối Thiểu (Phase C - Minimal Fix)

* Sửa đúng các file/hàm liên quan trực tiếp đến root cause (ví dụ: thêm explicit FK hint `profiles!author_id(...)`).
* Tuân thủ nguyên tắc "Thay đổi tối thiểu (Minimal Change Principle)".

### 🚨 QUY TẮC BẮT BUỘC: Failed-First-Fix Rule
Nếu bản vá đầu tiên không pass hoặc làm gãy test khác:
1. **DỪNG LẠI NGAY LẬP TỨC.** Rollback về trạng thái ban đầu.
2. Quay lại Giai đoạn 1 với bằng chứng mới.
3. **CẤM:** Không được đắp thêm bản vá suy đoán thứ 2, thứ 3 chồng lên bản vá hỏng.

---

## Giai đoạn 4: Xác Minh Qua Cổng E2E & Ghi Sổ Cái Bằng Chứng (Phase D)

1. **Chạy Lại Kịch Bản E2E Test:**
   * Khởi động server và chạy lại kịch bản E2E (Timeout 30s).
   * **Yêu cầu:** Test chuyển từ **FAIL ➔ PASS 100%**, Zero Network Status $\ge 400$.
2. **Ghi nhận vào Sổ Cái Bằng Chứng (`.brain/verification_ledger.json`):**
   ```json
   {
     "type": "bugfix_verification",
     "bug_id": "{BUG_ID}",
     "command": "npx playwright test tests/e2e/{bug_spec}.spec.ts",
     "status": "PASSED",
     "exit_code": 0,
     "timestamp": "{ISO_UTC_TIMESTAMP}"
   }
   ```
3. **Chạy Test Suite & Dọn dẹp tiến trình (Process Guard):**
   * Tắt toàn bộ dev server và headless chrome ngầm.
4. **Commit thay đổi qua cổng kiểm tra `guardrails/hooks/pre-commit`.**

---

## Giai đoạn 5: Tự Động Học Hỏi & Tổng Hợp Kỹ Năng (Phase E - Auto-Reflection & Skill Synthesis)

Ngay sau khi commit thành công, AI **TỰ ĐỘNG** thực hiện:

1. **Tạo / Append vào file `.brain/learnings.md`:**
   ```markdown
   ### 📝 [LEARNING-{YYYYMMDD}-{INDEX}] {Tên lỗi & Phân loại}
   - 📍 **Triệu chứng & Phân loại:** {Transient / Deterministic} - {Mã lỗi/HTTP status}
   - 🔍 **Nguyên nhân gốc rễ (Root Cause):** {Bản chất kỹ thuật gây ra lỗi}
   - 💡 **Giải pháp chuẩn (Proven Fix):** {Cách sửa chính xác và an toàn nhất}
   - 🚫 **Anti-Pattern cần tránh:** {Những điều TUYỆT ĐỐI KHÔNG làm trong tương lai}
   - 🛡️ **Tiến hóa Quy trình:** {Đề xuất rule bổ sung nếu là lỗi nghiêm trọng}
   ```

2. **Tổng Hợp Kỹ Năng Tái Sử Dụng (Autonomous Skill Synthesis - Nếu Cần):**
   * Nếu giải pháp giải quyết một bài toán kiến trúc lớn có tính tái sử dụng cao $\to$ AI tự động đóng gói thành một file `skills/custom/[skill-name]/SKILL.md` chuẩn `agentskills.io`.

3. **Ghi log tiến trình vào `.brain/session_log.txt`:**
   ```
   [HH:MM] BUG_RESOLVED_AND_LEARNED: {Tên lỗi} -> Logged to .brain/learnings.md & verification_ledger.json
   ```
