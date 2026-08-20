'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';

function EditorComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const isEdit = !!postId;

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [existingPost, setExistingPost] = useState(null);

  // Editor states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [password, setPassword] = useState('');
  const [clearPassword, setClearPassword] = useState(false);

  // Tags selection
  const [tags, setTags] = useState([]); // array of strings
  const [predefinedTags, setPredefinedTags] = useState({});
  const [tagsLoading, setTagsLoading] = useState(true);

  // Image insertion helper
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const textareaRef = useRef(null);

  // Find states
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');

  // 1. Load data
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Load predefined tags
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'predefined_tags')
          .single();

        if (!error && data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          setPredefinedTags(parsed);
        }
      } catch (err) {
        console.error('[Editor] Lỗi load tags:', err);
      } finally {
        setTagsLoading(false);
      }

      // Check edit mode or import mode
      if (isEdit) {
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

          if (error || !data) {
            alert('Không tìm thấy bài viết.');
            router.push('/admin/posts');
            return;
          }

          setExistingPost(data);
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setExcerpt(data.excerpt || '');
          setContent(data.content || '');
          setCoverImage(data.cover_image || '');
          setIsVisible(data.is_visible !== false);
          setTags(data.tags || []);
        } catch (err) {
          console.error('[Editor] Lỗi tải bài viết cũ:', err);
        }
      } else {
        // Kiểm tra xem có data import trong sessionStorage không
        const isImport = sessionStorage.getItem('is_import') === 'true';
        if (isImport) {
          const importedData = sessionStorage.getItem('imported_post');
          if (importedData) {
            try {
              const parsed = JSON.parse(importedData);
              setTitle(parsed.title || '');
              setSlug(parsed.slug || '');
              setContent(parsed.content || '');
              setExcerpt(parsed.excerpt || '');
              setTags(parsed.tags || []);
              setCoverImage(parsed.cover_image || '');
            } catch (e) {
              console.error('[Editor] Lỗi parse dữ liệu import:', e);
            } finally {
              // Tránh Strict Mode trong môi trường dev xóa sessionStorage trước khi render lại
              setTimeout(() => {
                sessionStorage.removeItem('imported_post');
                sessionStorage.removeItem('is_import');
              }, 1000);
            }
          }
        }
      }
      setLoading(false);
    }

    loadData();
  }, [isEdit, postId, router]);

  // Tự động điều chỉnh chiều cao của textarea theo nội dung
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 20}px`;
    }
  }, [content]);

  // Auto-generate slug khi gõ title (chỉ khi tạo mới và chưa tự chỉnh sửa slug)
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEdit && !slugEdited) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e) => {
    setSlug(e.target.value);
    setSlugEdited(true);
  };

  function generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
  }

  // ── Chèn ảnh vào Markdown ──
  const handleInsertImage = () => {
    const rawUrl = imageUrl.trim();
    if (!rawUrl) {
      alert('Vui lòng dán URL ảnh trước khi chèn.');
      return;
    }

    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error();
      }
    } catch {
      alert('URL ảnh không hợp lệ. Hãy dán link bắt đầu bằng http:// hoặc https://.');
      return;
    }

    // Normalize google drive link
    let finalUrl = rawUrl;
    const driveMatch = rawUrl.match(/^https?:\/\/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) {
      finalUrl = `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1600`;
    }

    const altText = (imageAlt.trim() || 'Ảnh minh họa').replace(/[\[\]\n\r]/g, ' ');
    const markdownString = `\n\n![${altText}](${finalUrl})\n\n`;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? content.length;
      const end = textarea.selectionEnd ?? content.length;
      const newContent = content.slice(0, start) + markdownString + content.slice(end);
      setContent(newContent);

      setTimeout(() => {
        textarea.focus();
        const cursor = start + markdownString.length;
        textarea.setSelectionRange(cursor, cursor);
      }, 50);
    }

    setImageUrl('');
    setImageAlt('');
  };

  // ── Tìm kiếm từ (Find Next) ──
  const handleFindNext = () => {
    if (!findText) {
      alert('Vui lòng nhập từ khóa cần tìm.');
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = content.toLowerCase();
    const search = findText.toLowerCase();
    
    const startPos = textarea.selectionEnd || 0;
    let index = text.indexOf(search, startPos);
    
    // Quay lại từ đầu nếu tìm không thấy ở vị trí hiện tại
    if (index === -1) {
      index = text.indexOf(search, 0);
    }

    if (index !== -1) {
      textarea.focus();
      textarea.setSelectionRange(index, index + search.length);
    } else {
      alert(`Không tìm thấy "${findText}" trong bài viết.`);
    }
  };

  // ── Chọn / Bỏ chọn tag suggestions ──
  const handleTagToggle = (tagVal) => {
    setTags((prev) => {
      if (prev.includes(tagVal)) {
        return prev.filter((t) => t !== tagVal);
      } else {
        if (prev.length >= 3) {
          alert('Tối đa chỉ được gắn 3 tag chủ đề.');
          return prev;
        }
        return [...prev, tagVal];
      }
    });
  };

  // ── Lưu bài viết ──
  async function handleSave(isDraft) {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề.');
      return;
    }
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung.');
      return;
    }

    if (tags.length > 3) {
      alert('Tối đa chỉ được nhập 3 tag chủ đề cho mỗi bài viết.');
      return;
    }

    setSaveLoading(true);

    const finalSlug = slug.trim() || generateSlug(title);

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      content: content.trim(),
      tags,
      excerpt: excerpt.trim(),
      cover_image: coverImage.trim() || null,
      is_visible: isVisible,
      draft: isDraft,
      updated_at: new Date().toISOString(),
    };

    // Password handle
    if (password.trim()) {
      payload.post_password = password.trim();
    } else if (clearPassword && isEdit) {
      payload.post_password = null;
      payload.post_password_hash = null;
    }

    try {
      let error;
      if (isEdit) {
        const { error: err } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', postId);
        error = err;
      } else {
        const { error: err } = await supabase.from('posts').insert({
          ...payload,
          created_at: new Date().toISOString(),
        });
        error = err;
      }

      if (error) {
        if (error.code === '23505') {
          alert('Slug đã tồn tại. Vui lòng đổi slug khác.');
        } else {
          alert('Lỗi khi lưu bài viết: ' + error.message);
        }
      } else {
        router.push('/admin/posts');
      }
    } catch (err) {
      console.error('[Editor] Lỗi lưu bài viết:', err);
      alert('Đã xảy ra lỗi khi lưu bài viết.');
    } finally {
      setSaveLoading(false);
    }
  }

  if (loading) {
    return <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Đang tải trình soạn thảo...</p>;
  }

  const hasExistingPassword = !!(existingPost?.post_password_hash || existingPost?.post_password);
  const passwordHint = hasExistingPassword
    ? '🔒 Bài này đang được bảo vệ. Để trống để giữ mật khẩu hiện tại, hoặc nhập mật khẩu mới để thay đổi.'
    : '🔓 Bài này hiện không có mật khẩu.';

  return (
    <>
      <div className="admin-page__header">
        <h1 className="admin-page__title">{isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h1>
        <div className="admin-page__actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={saveLoading}
            onClick={() => handleSave(true)}
          >
            Lưu nháp
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={saveLoading}
            onClick={() => handleSave(false)}
          >
            {saveLoading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Đăng bài'}
          </button>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} id="postForm">
        <div className="admin-editor">
          {/* Left Fields */}
          <div className="admin-editor__fields">
            <div className="admin-editor__field">
              <label htmlFor="titleInput">Tiêu đề *</label>
              <input
                id="titleInput"
                type="text"
                placeholder="Nhập tiêu đề bài viết..."
                className="admin-editor__title-input"
                value={title}
                onChange={handleTitleChange}
                required
                maxLength={200}
              />
            </div>

            <div className="admin-editor__row">
              <div className="admin-editor__field">
                <label htmlFor="slugInput">Slug URL</label>
                <input
                  id="slugInput"
                  type="text"
                  placeholder="tu-dong-tao-tu-tieu-de"
                  value={slug}
                  onChange={handleSlugChange}
                />
                <p className="admin-editor__hint">Sẽ tự tạo từ tiêu đề nếu để trống. Lưu ý: Đổi slug của bài viết cũ có thể làm hỏng các liên kết đã chia sẻ (lỗi 404).</p>
              </div>

              <div className="admin-editor__field">
                <label>
                  Tags <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(tối đa 3 tag)</span>
                </label>
                <div className="admin-tag-suggestions" style={{ marginTop: '8px' }}>
                  {tagsLoading ? (
                    <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Đang tải tags gợi ý...</div>
                  ) : Object.keys(predefinedTags).length === 0 ? (
                    <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                      ⚠️ Chưa cấu hình tag.{' '}
                      <a href="/admin/tags" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                        Tới Quản lý Tags
                      </a>
                    </div>
                  ) : (
                    <div className="admin-tag-suggestions__groups">
                      {Object.keys(predefinedTags)
                        .sort()
                        .map((parent) => {
                          const children = predefinedTags[parent] || [];
                          return (
                            <div className="admin-tag-suggestions__group" key={parent}>
                              <div className="admin-tag-suggestions__group-title">{parent}</div>
                              <div className="admin-tag-suggestions__pills">
                                <span
                                  className={`admin-tag-suggestions__pill ${
                                    tags.includes(parent) ? 'admin-tag-suggestions__pill--active' : ''
                                  }`}
                                  onClick={() => handleTagToggle(parent)}
                                >
                                  {parent} (toàn bộ)
                                </span>
                                {children.map((child) => {
                                  const fullTagVal = `${parent}/${child}`;
                                  return (
                                    <span
                                      key={child}
                                      className={`admin-tag-suggestions__pill ${
                                        tags.includes(fullTagVal) ? 'admin-tag-suggestions__pill--active' : ''
                                      }`}
                                      onClick={() => handleTagToggle(fullTagVal)}
                                    >
                                      {child}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-editor__field">
              <label htmlFor="excerptInput">Mô tả ngắn (excerpt)</label>
              <textarea
                id="excerptInput"
                rows={2}
                placeholder="Mô tả ngắn gọn bài viết (dùng cho SEO và xem trước card)..."
                maxLength={300}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              ></textarea>
            </div>

            <div className="admin-editor__field">
              <label htmlFor="coverInput">Cover Image URL</label>
              <input
                id="coverInput"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </div>

            <div className="admin-editor__field">
              <label
                className="admin-editor__hint"
                style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}
              >
                <input
                  id="visibleInput"
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                />
                Hiển thị bài viết này trên website
              </label>
              <p className="admin-editor__hint">
                Bỏ chọn nếu muốn ẩn bài khỏi trang chủ công khai (bài viết khóa mật khẩu mặc định ẩn ở trang chủ).
              </p>
            </div>

            <div className="admin-editor__field">
              <label htmlFor="passwordInput">
                🔒 Mật khẩu bảo vệ
                <span style={{ fontWeight: 400, color: 'var(--muted)' }}> (sẽ được hash trên DB)</span>
              </label>
              <input
                id="passwordInput"
                type="text"
                placeholder={hasExistingPassword ? 'Để trống để giữ mật khẩu hiện tại' : 'Nhập mật khẩu để khóa'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
              {isEdit && hasExistingPassword && (
                <label className="admin-editor__hint" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    id="clearPasswordInput"
                    type="checkbox"
                    checked={clearPassword}
                    onChange={(e) => setClearPassword(e.target.checked)}
                  />
                  Gỡ mật khẩu bảo vệ khỏi bài này
                </label>
              )}
              <p className="admin-editor__hint">{passwordHint}</p>
            </div>
          </div>

          {/* Right Editor Area */}
          <div className="admin-editor__content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="contentInput" style={{ margin: 0 }}>Nội dung (Markdown hoặc HTML gốc) *</label>
              <button 
                type="button" 
                className="admin-btn admin-btn--ghost admin-btn--sm" 
                onClick={() => setShowFindReplace(!showFindReplace)}
              >
                {showFindReplace ? 'Đóng bộ lọc' : 'Bộ lọc từ ngữ'}
              </button>
            </div>

            {showFindReplace && (
              <div className="admin-editor__image-tool" style={{ background: 'rgba(15, 118, 110, 0.05)', padding: '12px', borderRadius: '8px', marginBottom: '12px', gridTemplateColumns: '1fr auto' }}>
                <input
                  type="text"
                  placeholder="Từ cần tìm..."
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFindNext();
                    }
                  }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={handleFindNext}
                >
                  Tìm kiếm
                </button>
              </div>
            )}

            <div className="admin-editor__image-tool" aria-label="Chèn ảnh vào nội dung">
              <input
                id="imageUrlInput"
                type="url"
                placeholder="Dán URL ảnh hoặc link Google Drive share..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <input
                id="imageAltInput"
                type="text"
                placeholder="Mô tả ảnh"
                maxLength={120}
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
              <button
                id="insertImageBtn"
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={handleInsertImage}
              >
                Chèn ảnh
              </button>
            </div>
            <p className="admin-editor__hint">
              HTML import sẽ được giữ nguyên cấu trúc CSS gốc. Nếu dùng Google Drive hãy cấp quyền Anyone with the link.
            </p>
            <textarea
              ref={textareaRef}
              id="contentInput"
              className="admin-editor__textarea"
              placeholder="Viết bài viết bằng Markdown hoặc HTML...

# Tiêu đề lớn
## Tiêu đề nhỏ
**In đậm**, *in nghiêng*
"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
        </div>
      </form>
    </>
  );
}

export default function AdminEditPostPage() {
  return (
    <Suspense fallback={<p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Đang tải...</p>}>
      <EditorComponent />
    </Suspense>
  );
}
