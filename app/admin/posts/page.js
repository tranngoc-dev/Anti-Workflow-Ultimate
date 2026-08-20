'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostIds, setSelectedPostIds] = useState(new Set());
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const [
        { data: postsRaw, error },
        { data: viewsRaw }
      ] = await Promise.all([
        supabase.from('posts')
          .select('id, title, slug, tags, draft, is_visible, created_at')
          .order('created_at', { ascending: false }),
        supabase.rpc('get_post_view_counts')
      ]);

      if (error) throw error;

      // Map view counts
      const viewMap = {};
      (viewsRaw || []).forEach(v => { viewMap[v.slug] = Number(v.views) || 0; });

      const postsWithViews = (postsRaw || []).map(p => ({
        ...p,
        views: viewMap[p.slug] || 0
      }));

      setPosts(postsWithViews);

      // Clean selectedPostIds
      const availableIds = new Set(postsWithViews.map(p => p.id));
      setSelectedPostIds(prev => {
        const next = new Set();
        prev.forEach(id => {
          if (availableIds.has(id)) next.add(id);
        });
        return next;
      });
    } catch (err) {
      console.error('[AdminPosts] Lỗi tải bài viết:', err);
    } finally {
      setLoading(false);
    }
  }

  // ── Xóa bài viết ──
  async function handleDelete(id, title) {
    if (!confirm(`Bạn có chắc muốn xóa bài viết "${title}"?\n\nHành động này không thể hoàn tác.`)) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      loadPosts();
    } catch (err) {
      console.error('[AdminPosts] Lỗi xóa bài viết:', err);
      alert('Lỗi khi xóa bài viết. Vui lòng thử lại.');
    }
  }

  // ── Ẩn / Hiện bài viết ──
  async function handleToggleVisibility(id, currentValue, title) {
    const nextValue = !currentValue;
    const actionLabel = nextValue ? 'hiện' : 'ẩn';
    try {
      const { error } = await supabase.from('posts')
        .update({
          is_visible: nextValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      loadPosts();
    } catch (err) {
      console.error('[AdminPosts] Lỗi thay đổi hiển thị:', err);
      alert(`Không thể ${actionLabel} bài viết "${title}". Vui lòng thử lại.`);
    }
  }

  // ── Chọn / Bỏ chọn bài viết ──
  const toggleSelect = (id) => {
    setSelectedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedPostIds(new Set(posts.map(p => p.id)));
  };

  const handleClearSelection = () => {
    setSelectedPostIds(new Set());
  };

  // ── Xuất file HTML ──
  async function handleExport(postIds, mode) {
    if (!postIds || postIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 bài viết để export.');
      return;
    }

    setExportLoading(true);
    try {
      const { data: fullPosts, error } = await supabase.from('posts')
        .select('id, title, slug, excerpt, content, cover_image, tags, draft, created_at, updated_at')
        .in('id', postIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!fullPosts || fullPosts.length === 0) {
        alert('Chưa có bài viết nào để xuất.');
        return;
      }

      // Đảm bảo import thư viện Markdown động trên client
      const marked = await import('marked');
      marked.marked.setOptions({ breaks: true, gfm: true });

      for (let i = 0; i < fullPosts.length; i++) {
        const post = fullPosts[i];
        setExportProgress(`Đang xuất ${i + 1}/${fullPosts.length}...`);

        let htmlContent = '';
        if (isFullHtmlDocument(post.content || '')) {
          htmlContent = post.content.trim();
        } else {
          // Render HTML xuất bản
          const title = escapeHtml(post.title || 'Không tiêu đề');
          const tags = (post.tags || []).map(tag => {
            if (tag.includes('/')) {
              const [parent, child] = tag.split('/', 2);
              return `<span>${escapeHtml(parent)} &rsaquo; ${escapeHtml(child)}</span>`;
            }
            return `<span>${escapeHtml(tag)}</span>`;
          }).join('');
          const createdAt = post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : '';
          const updatedAt = post.updated_at ? new Date(post.updated_at).toLocaleDateString('vi-VN') : '';
          
          const rawHtml = marked.marked.parse(post.content || '');
          const cleanHtml = sanitizeExportHtml(rawHtml);

          htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #111827; background: #f8fafc; line-height: 1.65; }
    main { max-width: 920px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 32px; margin: 0 0 8px; }
    .post { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 28px; margin-bottom: 28px; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px 16px; color: #64748b; font-size: 14px; margin-bottom: 12px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .tags span { border: 1px solid #cbd5e1; border-radius: 999px; padding: 2px 10px; color: #475569; font-size: 13px; }
    .excerpt { color: #475569; font-style: italic; }
    .cover { display: block; max-width: 100%; height: auto; border-radius: 8px; margin: 18px 0; }
    .content img { max-width: 100%; height: auto; }
    .content pre { overflow-x: auto; background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 8px; }
    .content code { font-family: Consolas, monospace; }
    blockquote { border-left: 4px solid #cbd5e1; margin-left: 0; padding-left: 16px; color: #475569; }
  </style>
</head>
<body>
  <main>
    <article class="post">
      <header>
        <h1>${title}</h1>
        <div class="meta">
          ${createdAt ? `<time datetime="${post.created_at}">Ngày tạo: ${createdAt}</time>` : ''}
          ${updatedAt ? `<span>Cập nhật: ${updatedAt}</span>` : ''}
          <span>Slug: ${escapeHtml(post.slug || '')}</span>
          <span>Trạng thái: ${post.draft ? 'Bản nháp' : 'Đã đăng'}</span>
        </div>
        ${tags ? `<div class="tags">${tags}</div>` : ''}
        ${post.excerpt ? `<p class="excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
        ${post.cover_image ? `<img class="cover" src="${post.cover_image}" alt="${title}" />` : ''}
      </header>
      <div class="content">${cleanHtml}</div>
    </article>
  </main>
</body>
</html>`;
        }

        downloadHtml(buildExportFilename(post), htmlContent);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra khi xuất bài viết.');
    } finally {
      setExportLoading(false);
      setExportProgress('');
    }
  }

  // ── Helpers Xuất file ──
  function isFullHtmlDocument(content = '') {
    return /^\s*<!doctype html[\s\S]*<html[\s\S]*<\/html>\s*$/i.test(content) || /^\s*<html[\s\S]*<\/html>\s*$/i.test(content);
  }

  function escapeHtml(str = '') {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function sanitizeExportHtml(html) {
    if (typeof window === 'undefined') return html;
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    doc.body.querySelectorAll('script, iframe, object, embed, link, meta').forEach(el => el.remove());
    doc.body.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();
        if (name.startsWith('on') || value.startsWith('javascript:')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return doc.body.firstElementChild?.innerHTML || '';
  }

  function buildExportFilename(post) {
    const baseName = sanitizeFilename(post.slug || post.title || 'bai-viet');
    return `${baseName || 'bai-viet'}.html`;
  }

  function sanitizeFilename(value = '') {
    return value
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  function downloadHtml(filename, html) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  // ── Import HTML / Markdown ──
  async function handleHtmlImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const html = new TextDecoder('utf-8').decode(buffer); // Tạm thời dùng UTF-8 chuẩn
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let title = doc.querySelector('title')?.textContent || doc.querySelector('h1')?.textContent;
      if (!title || !title.trim()) {
        title = file.name.replace(/\.html?$/i, "").replace(/[-_]/g, ' ');
      }

      const excerpt = doc.querySelector('meta[name="description"]')?.getAttribute('content')
        || doc.querySelector('p')?.textContent
        || '';

      const importedPost = {
        title: title.trim(),
        content: html.trim(),
        excerpt: excerpt.trim().slice(0, 280),
        slug: title.trim() ? generateSlug(title.trim()) : ''
      };

      sessionStorage.setItem('imported_post', JSON.stringify(importedPost));
      sessionStorage.setItem('is_import', 'true');
      router.push('/admin/edit-post');
    } catch (err) {
      alert(err.message || 'Lỗi khi đọc file HTML.');
    }
  }

  function parseFrontMatter(text) {
    const result = {
      title: '',
      excerpt: '',
      tags: [],
      cover_image: '',
      content: text
    };

    const match = text.match(/^\s*---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (match) {
      const yamlBlock = match[1];
      result.content = match[2];

      const lines = yamlBlock.split('\n');
      lines.forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const key = line.slice(0, colonIdx).trim().toLowerCase();
          const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
          
          if (key === 'title' || (key === 'name' && !result.title)) {
            result.title = value;
          } else if (key === 'excerpt' || key === 'description') {
            result.excerpt = value;
          } else if (key === 'cover_image' || key === 'cover' || key === 'image') {
            result.cover_image = value;
          } else if (key === 'tags') {
            if (value.startsWith('[') && value.endsWith(']')) {
              result.tags = value.slice(1, -1).split(',').map(t => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
            } else {
              result.tags = value.split(',').map(t => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
            }
          }
        }
      });
    }
    return result;
  }

  async function handleMdImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      
      // Parse Front Matter if exists
      const parsedData = parseFrontMatter(text);
      
      let title = parsedData.title;
      let content = parsedData.content;
      let excerpt = parsedData.excerpt;
      let tags = parsedData.tags;
      let coverImage = parsedData.cover_image;

      // Fallback if title is empty
      if (!title || !title.trim()) {
        title = file.name.replace(/\.md$/i, "").replace(/\.markdown$/i, "").replace(/[-_]/g, ' ');
        const lines = content.split('\n');
        const firstHeading = lines.find(line => line.trim().startsWith('# '));
        if (firstHeading) {
          title = firstHeading.replace(/^#\s*/, '').trim();
        }
      }

      const importedPost = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim().slice(0, 280),
        tags: tags,
        cover_image: coverImage,
        slug: title.trim() ? generateSlug(title.trim()) : ''
      };

      sessionStorage.setItem('imported_post', JSON.stringify(importedPost));
      sessionStorage.setItem('is_import', 'true');
      router.push('/admin/edit-post');
    } catch (err) {
      alert(err.message || 'Lỗi khi đọc file Markdown.');
    }
  }

  function generateSlug(title) {
    return title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
  }

  return (
    <>
      <div className="admin-page__header">
        <h1 className="admin-page__title">Bài viết</h1>
        <div className="admin-page__actions">
          <button
            className="admin-btn admin-btn--ghost"
            type="button"
            disabled={selectedPostIds.size === 0 || exportLoading}
            onClick={() => handleExport(Array.from(selectedPostIds), 'selected')}
          >
            {exportLoading && exportProgress ? exportProgress : 'Export đã chọn'}
          </button>
          <button
            className="admin-btn admin-btn--ghost"
            type="button"
            disabled={exportLoading}
            onClick={() => handleExport(posts.map(p => p.id), 'all')}
          >
            Export tất cả
          </button>

          <button
            className="admin-btn admin-btn--ghost"
            onClick={() => document.getElementById('htmlFileInput').click()}
          >
            Import HTML
          </button>
          <input
            type="file"
            id="htmlFileInput"
            accept=".html"
            style={{ display: 'none' }}
            onChange={handleHtmlImport}
          />

          <button
            className="admin-btn admin-btn--ghost"
            onClick={() => document.getElementById('mdFileInput').click()}
          >
            Import Markdown
          </button>
          <input
            type="file"
            id="mdFileInput"
            accept=".md,.markdown"
            style={{ display: 'none' }}
            onChange={handleMdImport}
          />

          <a href="/admin/edit-post" className="admin-btn admin-btn--primary">
            + Viết bài mới
          </a>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Đang tải danh sách bài viết...</p>
      ) : posts.length === 0 ? (
        <div className="admin-empty">
          <p>Chưa có bài viết nào.</p>
          <a href="/admin/edit-post" className="admin-btn admin-btn--primary">
            + Viết bài mới
          </a>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <div className="admin-posts-toolbar">
            <div className="admin-posts-toolbar__selection">
              <span id="selectedPostsCount">
                Đã chọn {selectedPostIds.size}/{posts.length} bài
              </span>
            </div>
            <div className="admin-posts-toolbar__actions">
              <button
                className="admin-btn admin-btn--sm admin-btn--ghost"
                type="button"
                disabled={selectedPostIds.size === posts.length}
                onClick={handleSelectAll}
              >
                Chọn tất cả
              </button>
              <button
                className="admin-btn admin-btn--sm admin-btn--ghost"
                type="button"
                disabled={selectedPostIds.size === 0}
                onClick={handleClearSelection}
              >
                Bỏ chọn
              </button>
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Chọn</th>
                <th>Tiêu đề</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hiển thị</th>
                <th>Lượt xem</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="admin-table__check" data-label="Chọn">
                    <input
                      type="checkbox"
                      checked={selectedPostIds.has(post.id)}
                      onChange={() => toggleSelect(post.id)}
                      aria-label={`Chọn bài viết ${post.title}`}
                    />
                  </td>
                  <td data-label="Tiêu đề">
                    <div className="admin-table__title">{post.title}</div>
                    <div className="admin-table__meta">
                      {(post.tags || []).map((t, idx) => {
                        if (t.includes('/')) {
                          const [parent, child] = t.split('/', 2);
                          return (
                            <span className="admin-tag tag--hierarchical" key={idx}>
                              <span className="tag__parent">{parent}</span>
                              <span className="tag__separator">›</span>
                              <span className="tag__child">{child}</span>
                            </span>
                          );
                        }
                        return (
                          <span className="admin-tag" key={idx}>
                            {t}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="admin-table__date" data-label="Ngày tạo">
                    {new Date(post.created_at).toLocaleDateString('vi-VN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td data-label="Trạng thái">
                    <span className={`admin-badge ${post.draft ? 'admin-badge--draft' : 'admin-badge--published'}`}>
                      {post.draft ? 'Bản nháp' : 'Đã đăng'}
                    </span>
                  </td>
                  <td data-label="Hiển thị">
                    <span className={`admin-badge ${post.is_visible === false ? 'admin-badge--draft' : 'admin-badge--published'}`}>
                      {post.is_visible === false ? 'Đang ẩn' : 'Đang hiện'}
                    </span>
                  </td>
                  <td className="admin-table__views" data-label="Lượt xem">
                    {post.views.toLocaleString()}
                  </td>
                  <td data-label="Thao tác">
                    <div className="admin-table__actions">
                      <a href={`/admin/edit-post?id=${post.id}`} className="admin-btn admin-btn--sm admin-btn--ghost">
                        Sửa
                      </a>
                      <a href={`/${encodeURIComponent(post.slug)}`} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--sm admin-btn--ghost">
                        Xem
                      </a>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--ghost"
                        onClick={() => handleToggleVisibility(post.id, post.is_visible !== false, post.title)}
                      >
                        {post.is_visible === false ? 'Hiện' : 'Ẩn'}
                      </button>
                      <button
                        className="admin-btn admin-btn--sm admin-btn--danger"
                        onClick={() => handleDelete(post.id, post.title)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
