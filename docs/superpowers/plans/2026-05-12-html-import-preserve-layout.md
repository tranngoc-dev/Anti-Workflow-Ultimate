# HTML Import Preserve Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giữ nguyên HTML/CSS của file import khi hiển thị bài viết public.

**Architecture:** Dùng lại cột `posts.content` để lưu full HTML document. Public post detail nhận diện nội dung HTML đầy đủ và render qua `iframe srcdoc` cô lập; các bài Markdown giữ nguyên luồng hiện tại.

**Tech Stack:** Static HTML, vanilla JS, Supabase, Node assertion regression script

---

### Task 1: Khóa hành vi bằng regression test

**Files:**
- Modify: `scripts/audit-regression-tests.mjs`

- [ ] **Step 1: Write the failing test**

```js
assert.doesNotMatch(adminPosts, /TurndownService/)
assert.match(adminPosts, /content:\s*html\.trim\(\)/)
assert.match(postJs, /function isFullHtmlDocument/)
assert.match(postJs, /iframe\.srcdoc = content/)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node .\scripts\audit-regression-tests.mjs`
Expected: FAIL on the old HTML import conversion path.

- [ ] **Step 3: Write minimal implementation**

```js
// Remove Turndown import path and store full HTML in post content.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node .\scripts\audit-regression-tests.mjs`
Expected: PASS

### Task 2: Preserve imported HTML at admin ingest/export boundaries

**Files:**
- Modify: `admin/posts.html`
- Modify: `admin/edit-post.html`

- [ ] **Step 1: Replace HTML->Markdown conversion in import flow**

```js
const importedPost = {
  title: title.trim(),
  content: html.trim(),
  excerpt: excerpt.trim().slice(0, 280),
  slug: title.trim() ? generateSlug(title.trim()) : ''
}
```

- [ ] **Step 2: Export imported posts as their original HTML**

```js
if (isFullHtmlDocument(post.content || '')) {
  return post.content.trim()
}
```

- [ ] **Step 3: Update editor copy so admin knows raw HTML is supported**

```html
<label for="contentInput">Nội dung (Markdown hoặc HTML gốc) *</label>
```

### Task 3: Render imported HTML safely on public post page

**Files:**
- Modify: `js/post.js`
- Modify: `js/posts.js`
- Modify: `style.css`

- [ ] **Step 1: Add full-document detection + readable-text helpers**

```js
function isFullHtmlDocument(content = '') { ... }
function getReadableText(content = '') { ... }
```

- [ ] **Step 2: Add iframe-based renderer**

```js
iframe.sandbox = 'allow-same-origin'
iframe.srcdoc = content
```

- [ ] **Step 3: Route both unlocked and normal content through the new renderer**

```js
if (isFullHtmlDocument(post.content || '')) {
  renderImportedHtmlDocument(bodyEl, post.content || '')
}
```

- [ ] **Step 4: Add shell/frame CSS**

```css
.imported-html-shell { ... }
.imported-html-frame { ... }
```

### Task 4: Verify end to end

**Files:**
- Modify: none

- [ ] **Step 1: Run regression script**

Run: `node .\scripts\audit-regression-tests.mjs`
Expected: PASS

- [ ] **Step 2: Review git diff**

Run: `git diff -- admin/posts.html admin/edit-post.html js/post.js js/posts.js style.css scripts/audit-regression-tests.mjs`
Expected: only HTML import preservation changes
