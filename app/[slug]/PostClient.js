'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Image from 'next/image';

function prepareHtmlForIframe(htmlContent = '') {
  if (!htmlContent) return '';
  
  // Inject viewport meta if missing
  let finalHtml = htmlContent;
  if (!/<meta[^>]*name=["']viewport["']/i.test(htmlContent)) {
    if (/<head[^>]*>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/(<head[^>]*>)/i, '$1\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />');
    } else if (/<html[^>]*>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/(<html[^>]*>)/i, '$1\n<head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>');
    } else {
      finalHtml = `<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n` + finalHtml;
    }
  }
  
  // Inject CSS to ensure image and element responsiveness inside the iframe
  const responsiveStyles = `
    <style>
      img, video, iframe, table, pre { max-width: 100% !important; height: auto !important; }
      body { word-wrap: break-word; box-sizing: border-box; margin: 0; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      * { box-sizing: border-box; }
    </style>
  `;
  if (/<head[^>]*>/i.test(finalHtml)) {
    finalHtml = finalHtml.replace(/(<\/head>)/i, responsiveStyles + '\n$1');
  } else {
    finalHtml = responsiveStyles + finalHtml;
  }
  
  return finalHtml;
}

export default function PostClient({ initialPost, slug }) {
  const [post, setPost] = useState(initialPost);
  const [unlockedContent, setUnlockedContent] = useState(null);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);

  // Voting state
  const [votes, setVotes] = useState(initialPost.votes || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', password: '', content: '' });
  const [authAction, setAuthAction] = useState('login'); // 'login' | 'signup'
  const [authMessage, setAuthMessage] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const isAdmin = user?.user_metadata?.is_admin === true || user?.email === 'vutrongvtv24@gmail.com';

  const [renderedBody, setRenderedBody] = useState('');

  // 1. Khởi tạo trạng thái và check sessionStorage xem đã mở khóa chưa
  useEffect(() => {
    // Check votes in localStorage
    const votedKey = `voted_${slug}`;
    if (localStorage.getItem(votedKey) === 'true') {
      setHasVoted(true);
    }

    // Check comments auth session
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setCommentForm((prev) => ({
          ...prev,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
        }));
      }
    }
    checkAuth();

    // Check password cache
    const cachedPassword = sessionStorage.getItem(`unlocked_${slug}`);
    if (cachedPassword && post.is_locked) {
      handleUnlock(cachedPassword);
    }

    // Load comments
    loadComments();

    // Setup tracking page view
    trackPageView();
  }, [slug]);

  // 2. Render content (Markdown -> HTML + DOMPurify)
  useEffect(() => {
    const rawContent = unlockedContent || post.content || '';
    if (!rawContent) return;

    if (isFullHtmlDocument(rawContent)) {
      setRenderedBody(DOMPurify.sanitize(rawContent, { FORBID_ATTR: ['style', 'class', 'id'] }));
    } else {
      marked.setOptions({ breaks: true, gfm: true });
      const html = marked.parse(normalizeMarkdownImageUrls(rawContent));
      setRenderedBody(DOMPurify.sanitize(html));
    }
  }, [post.content, unlockedContent]);

  // ── Helpers ──
  function isFullHtmlDocument(content = '') {
    return /^\s*<!doctype html[\s\S]*<html[\s\S]*<\/html>\s*$/i.test(content) || /^\s*<html[\s\S]*<\/html>\s*$/i.test(content);
  }

  function normalizeMarkdownImageUrls(content = '') {
    return content
      .replace(/https:\/\/drive\.google\.com\/file\/d\/([^/)]+)\/[^)\s]*/g, 'https://drive.google.com/thumbnail?id=$1&sz=w1600')
      .replace(/https:\/\/drive\.google\.com\/uc\?export=view&id=([^)&\s]+)([^)\s]*)?/g, 'https://drive.google.com/thumbnail?id=$1&sz=w1600');
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // ── Mở khóa bài viết ──
  async function handleUnlock(passToTry = password) {
    if (!passToTry.trim()) return;
    setUnlockLoading(true);
    setUnlockError('');

    try {
      const { data, error } = await supabase.rpc('get_public_post', {
        p_slug: slug,
        p_password: passToTry.trim(),
      });

      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;

      if (result?.unlocked && result.content) {
        sessionStorage.setItem(`unlocked_${slug}`, passToTry.trim());
        setUnlockedContent(result.content);
        setPost((prev) => ({ ...prev, unlocked: true }));
      } else {
        setUnlockError('Mật khẩu không đúng, vui lòng thử lại.');
      }
    } catch (err) {
      console.error('[Post] Lỗi mở khóa bài viết:', err);
      setUnlockError('Không thể kiểm tra mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setUnlockLoading(false);
    }
  }

  // ── Bình chọn bài viết ──
  async function handleVote() {
    if (voteLoading) return;
    setVoteLoading(true);

    let ip = '';
    try {
      const response = await fetch('/api/track', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        ip = data?.ip || '';
      }
    } catch (e) {
      console.warn('[Post] Lỗi lấy IP từ server:', e);
    }

    if (!ip) {
      ip = localStorage.getItem('visitor_fingerprint') || '';
      if (!ip) {
        ip = 'fp_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('visitor_fingerprint', ip);
      }
    }

    try {
      if (hasVoted) {
        // UNVOTE
        const { data: newVotes, error } = await supabase.rpc('unvote_post', {
          p_slug: slug,
          p_ip: ip,
        });

        if (error) throw error;

        localStorage.removeItem(`voted_${slug}`);
        setHasVoted(false);
        setVotes(newVotes !== null && newVotes !== undefined ? newVotes : Math.max(votes - 1, 0));
      } else {
        // VOTE
        const { data: newVotes, error } = await supabase.rpc('vote_post', {
          p_slug: slug,
          p_ip: ip,
        });

        if (error) throw error;

        localStorage.setItem(`voted_${slug}`, 'true');
        setHasVoted(true);
        setVotes(newVotes !== null && newVotes !== undefined ? newVotes : votes + 1);
      }
    } catch (err) {
      console.error('[Post] Lỗi bình chọn:', err);
      alert('Không thể gửi bình chọn lúc này. Vui lòng thử lại sau!');
    } finally {
      setVoteLoading(false);
    }
  }

  // ── Tracking view ──
  async function trackPageView() {
    const viewKey = `tulanh_view_${slug}`;
    const lastView = localStorage.getItem(viewKey);
    if (lastView && Date.now() - parseInt(lastView) < 30000) {
      return; // Bỏ qua nếu reload trong 30s
    }

    // Set timeout hoặc IntersectionObserver cuộn đến cuối bài
    localStorage.setItem(viewKey, Date.now().toString());

    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'post_view',
          slug: slug,
        }),
      });
    } catch (e) {
      console.warn('[Post] Lỗi gửi yêu cầu ghi nhận lượt xem:', e);
    }
  }

  // ── Comments ──
  async function loadComments() {
    setCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, user_id, author_name, content, created_at, status')
        .eq('post_slug', slug)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
      setCommentsCount(data?.length || 0);
    } catch (err) {
      console.error('[Post] Lỗi load bình luận:', err);
    } finally {
      setCommentsLoading(false);
    }
  }

  // Comments Auth
  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthMessage('');
    setSubmitLoading(true);

    const email = commentForm.email.trim().toLowerCase();
    const password = commentForm.password;
    const name = commentForm.name.trim();

    if (!email || !password) {
      setSubmitLoading(false);
      return;
    }

    try {
      if (authAction === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name || email.split('@')[0] } },
        });
        if (error) throw error;

        if (data.session) {
          setUser(data.session.user);
          setCommentForm((prev) => ({ ...prev, name: name || email.split('@')[0] }));
        } else {
          setAuthMessage('Tài khoản đã được tạo. Vui lòng kiểm tra email để xác nhận trước khi đăng nhập.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.session.user);
        const uName = data.session.user.user_metadata?.name || data.session.user.user_metadata?.full_name || email.split('@')[0];
        setCommentForm((prev) => ({ ...prev, name: uName }));
      }
    } catch (err) {
      setAuthMessage(err.message || 'Không thể xác thực tài khoản. Vui lòng thử lại.');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // Submit comment
  async function handleCommentSubmit(e) {
    e.preventDefault();
    const { name, content } = commentForm;

    if (!name.trim() || !content.trim()) {
      alert('Vui lòng điền đầy đủ Tên hiển thị và Nội dung bình luận.');
      return;
    }

    if (content.trim().length < 5) {
      alert('Bình luận quá ngắn, vui lòng nhập ít nhất 5 ký tự.');
      return;
    }

    setSubmitLoading(true);

    try {
      const { error } = await supabase.from('comments').insert({
        post_slug: slug,
        user_id: user.id,
        author_name: name.trim(),
        author_email: user.email,
        content: content.trim(),
      });

      if (error) throw error;
      setCommentSubmitted(true);
    } catch (err) {
      console.error('[Post] Gửi bình luận thất bại:', err);
      alert('Gửi bình luận thất bại. Vui lòng thử lại sau.');
    } finally {
      setSubmitLoading(false);
    }
  }

  // Handle edit blog comment
  async function handleSaveBlogComment(commentId) {
    if (!editingContent.trim()) {
      alert('Nội dung bình luận không được để trống.');
      return;
    }
    setEditLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editingContent.trim(), updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;
      setEditingCommentId(null);
      setEditingContent('');
      loadComments();
    } catch (err) {
      alert('Lỗi khi sửa bình luận: ' + (err.message || 'Thử lại sau.'));
    } finally {
      setEditLoading(false);
    }
  }

  // Handle delete blog comment
  async function handleDeleteBlogComment(commentId) {
    if (!confirm('Bạn có chắc muốn xóa bình luận này không?')) return;
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      loadComments();
    } catch (err) {
      alert('Lỗi khi xóa bình luận: ' + (err.message || 'Thử lại sau.'));
    }
  }

  const AVATAR_COLORS = ['#0f766e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];
  function getAvatarColor(name) {
    const code = (name || '?').charCodeAt(0);
    return AVATAR_COLORS[code % AVATAR_COLORS.length];
  }

  return (
    <main id="main-content" className="post-container">
      {/* Back link */}
      <a href="/" className="post-back">
        Tất cả bài viết
      </a>

      <article className="post-article" id="post-content">
        {/* Cover Image */}
        {post.cover_image && (
          <div className="post-cover-wrapper" style={{ position: 'relative', width: '100%', height: '400px', maxHeight: '400px', overflow: 'hidden', borderRadius: '12px', marginBottom: 'var(--sp-8)' }}>
            <Image 
              src={post.cover_image} 
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Post Header */}
        <header className="post-header">
          <h1 id="post-title">{post.title}</h1>
          <div className="post-author-badge">
            <Image 
              src="/images/vutrong_avatar.png" 
              alt="Vũ Trọng" 
              width={44}
              height={44}
              className="post-author-avatar"
            />
            <div className="post-author-info">
              <div className="post-author-name-row">
                <span className="post-author-name">Vũ Trọng</span>
                <svg viewBox="0 0 24 24" className="verified-badge-svg" aria-label="Đã xác minh">
                  <g>
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.406-.17-.867-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.27 3.422 2.27s2.825-1.005 3.422-2.27c.406.17.867.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 3.39l-3.39-3.39 1.42-1.42 1.98 1.98 5.57-5.57 1.42 1.42-6.99 7.0z"></path>
                  </g>
                </svg>
              </div>
              <div className="post-author-meta-row">
                <span className="post-author-handle">@vutrongblog</span>
                <span className="post-meta-dot">•</span>
                <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                {post.is_locked && (
                  <>
                    <span className="post-meta-dot">•</span>
                    <span className="post-lock-badge-new">🔒 Có mật khẩu</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div id="post-tags" className="post-tags">
            {(post.tags || []).map((t, index) => {
              if (t.includes('/')) {
                const [parent, child] = t.split('/', 2);
                return (
                  <span className="tag tag--hierarchical" key={index}>
                    <span className="tag__parent">{parent}</span>
                    <span className="tag__separator">›</span>
                    <span className="tag__child">{child}</span>
                  </span>
                );
              }
              return (
                <span className="tag" key={index}>
                  {t}
                </span>
              );
            })}
          </div>
        </header>

        {/* Post Body (Markdown hoặc Locked) */}
        <div id="post-body" className="prose" aria-live="polite">
          {post.is_locked && !post.unlocked ? (
            <>
              <div className="post-content-visible">
                <p>{post.excerpt || 'Bài viết này đang được bảo vệ bằng mật khẩu.'}</p>
              </div>
              <div className="post-content-locked">
                <div className="post-content-locked__blur" aria-hidden="true">
                  <p>Nội dung đầy đủ của bài viết đang được ẩn.</p>
                  <p>Vui lòng nhập mật khẩu để mở khóa và đọc toàn bộ nội dung.</p>
                  <p>Các phần tiếp theo chỉ hiển thị sau khi mật khẩu được xác nhận.</p>
                </div>
                <div className="post-unlock-overlay">
                  <div className="post-unlock-card">
                    <div className="post-unlock-icon">🔒</div>
                    <h3 className="post-unlock-title">Nội dung được bảo vệ</h3>
                    <p className="post-unlock-desc">Nhập mật khẩu để xem toàn bộ bài viết</p>
                    <div className="post-unlock-form">
                      <input
                        type="password"
                        className="post-unlock-input"
                        placeholder="Nhập mật khẩu..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                        autoComplete="off"
                      />
                      <button
                        className="post-unlock-btn"
                        onClick={() => handleUnlock()}
                        disabled={unlockLoading}
                      >
                        {unlockLoading ? 'Đang kiểm tra...' : 'Mở khóa'}
                      </button>
                    </div>
                    {unlockError && (
                      <p id="post-unlock-error" className="post-unlock-error" style={{ display: 'block' }}>
                        {unlockError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : isFullHtmlDocument(unlockedContent || post.content) ? (
            <iframe
              srcDoc={prepareHtmlForIframe(unlockedContent || post.content)}
              sandbox="allow-same-origin allow-popups"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '300px' }}
              title={post.title}
              onLoad={(e) => {
                const iframe = e.target;
                const resizeIframe = () => {
                  if (iframe.contentWindow?.document.body) {
                    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
                  }
                };
                // Resize on load
                resizeIframe();
                // Resize on content changes (e.g. image loads)
                if (iframe.contentWindow) {
                  iframe.contentWindow.addEventListener('resize', resizeIframe);
                  // Observe DOM changes inside the iframe for robust height calculation
                  const observer = new MutationObserver(resizeIframe);
                  observer.observe(iframe.contentWindow.document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true
                  });
                }
              }}
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: renderedBody || '<p>Đang tải nội dung...</p>' }} />
          )}
        </div>
      </article>

      {/* Share Section & Vote */}
      <div className="share-section" aria-label="Chia sẻ và tương tác bài viết">
        <span className="share-section__label">Tương tác:</span>
        <button
          id="share-fb-btn"
          className="share-btn"
          aria-label="Chia sẻ lên Facebook"
          onClick={() =>
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
              '_blank',
              'width=600,height=400'
            )
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
        <button
          id="vote-btn"
          className={`vote-btn ${hasVoted ? 'vote-btn--voted' : ''}`}
          aria-label="Bình chọn bài viết"
          disabled={voteLoading}
          onClick={handleVote}
          style={hasVoted ? { backgroundColor: 'var(--red-50)', color: 'var(--red-600)', borderColor: 'var(--red-200)' } : {}}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>
            {voteLoading ? 'Đang gửi...' : hasVoted ? `Bỏ Vote (${votes})` : `Vote (${votes})`}
          </span>
        </button>
      </div>

      {/* Native Comments Section */}
      <section className="comment-section" aria-label="Bình luận">
        <h2 className="comment-section__title">
          Bình luận <span id="comments-count" className="comment-section__count">{commentsCount > 0 && `(${commentsCount})`}</span>
        </h2>

        {/* Comment form */}
        <div id="comment-form-wrapper">
          {commentSubmitted ? (
            <div className="comment-section__success">
              <div style={{ fontSize: '2rem' }} aria-hidden="true">
                ✅
              </div>
              <p className="comment-section__success-title">Bình luận đã được gửi!</p>
              <p className="comment-section__success-text">Vui lòng chờ quản trị viên duyệt. Cảm ơn bạn đã tham gia!</p>
              <button className="comment-section__another-btn" onClick={() => setCommentSubmitted(false)}>
                Gửi thêm bình luận
              </button>
            </div>
          ) : user ? (
            <>
              <div className="comment-section__success" style={{ marginBottom: '1rem' }}>
                <div>
                  <p className="comment-section__success-title">Đang bình luận với {user.email}</p>
                  <p className="comment-section__success-text">Bình luận sẽ được gửi vào hàng chờ duyệt.</p>
                </div>
                <button type="button" className="comment-section__another-btn" onClick={handleSignOut}>
                  Đăng xuất
                </button>
              </div>
              <form id="commentForm" className="comment-section__form" onSubmit={handleCommentSubmit} noValidate>
                <div className="comment-section__field">
                  <label htmlFor="authorName">Tên hiển thị *</label>
                  <input
                    id="authorName"
                    type="text"
                    required
                    maxLength={100}
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                  />
                </div>
                <div className="comment-section__field">
                  <label htmlFor="content">Nội dung *</label>
                  <textarea
                    id="content"
                    rows={4}
                    placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                    required
                    maxLength={2000}
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  ></textarea>
                  <span className="comment-section__charcount" id="charCount" aria-live="polite">
                    {commentForm.content.length}/2000
                  </span>
                </div>
                <button type="submit" className="comment-section__submit" disabled={submitLoading}>
                  {submitLoading ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
              </form>
            </>
          ) : (
            <div className="comment-section__form">
              <p className="comment-section__success-title">Đăng nhập để bình luận</p>
              <p className="comment-section__success-text">
                Tài khoản của bạn chỉ dùng để gửi bình luận và theo dõi trạng thái duyệt.
              </p>
              {authMessage && (
                <p className="comment-section__success-text" id="comment-auth-message">
                  {authMessage}
                </p>
              )}
              <form id="commentAuthForm" onSubmit={handleAuthSubmit}>
                <div className="comment-section__form-row">
                  <div className="comment-section__field">
                    <label htmlFor="commentAuthName">Tên hiển thị</label>
                    <input
                      id="commentAuthName"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      maxLength={100}
                      value={commentForm.name}
                      onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    />
                  </div>
                  <div className="comment-section__field">
                    <label htmlFor="commentAuthEmail">Email *</label>
                    <input
                      id="commentAuthEmail"
                      type="email"
                      placeholder="email@example.com"
                      required
                      value={commentForm.email}
                      onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="comment-section__field">
                  <label htmlFor="commentAuthPassword">Mật khẩu *</label>
                  <input
                    id="commentAuthPassword"
                    type="password"
                    required
                    minLength={6}
                    value={commentForm.password}
                    onChange={(e) => setCommentForm({ ...commentForm, password: e.target.value })}
                  />
                </div>
                <div className="comment-section__form-row">
                  <button
                    type="submit"
                    className="comment-section__submit"
                    onClick={() => setAuthAction('login')}
                    disabled={submitLoading}
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="submit"
                    className="comment-section__another-btn"
                    onClick={() => setAuthAction('signup')}
                    disabled={submitLoading}
                  >
                    Đăng ký
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Comments list */}
        <div id="comments-list" className="comment-section__list" style={{ marginTop: '2rem' }} aria-live="polite">
          {commentsLoading ? (
            <p className="comment-section__loading">Đang tải bình luận...</p>
          ) : comments.length === 0 ? (
            <p className="comment-section__empty">Chưa có bình luận nào. Hãy là người đầu tiên! 🎉</p>
          ) : (
            comments.map((c, index) => {
              const initial = (c.author_name || '?').charAt(0).toUpperCase();
              const color = getAvatarColor(c.author_name);
              const isCommentAuthor = user?.id && user?.id === c.user_id;
              const isEditing = editingCommentId === c.id;

              return (
                <div className="comment-item" key={c.id || index}>
                  <div className="comment-item__avatar" style={{ background: color }} aria-hidden="true">
                    {initial}
                  </div>
                  <div className="comment-item__body">
                    <div className="comment-item__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="comment-item__name">{c.author_name}</span>
                        <time className="comment-item__date" dateTime={c.created_at}>
                          {formatDate(c.created_at)}
                        </time>
                      </div>
                      {!isEditing && (isCommentAuthor || isAdmin) && (
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
                          {isCommentAuthor && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(c.id);
                                setEditingContent(c.content);
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Sửa
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteBlogComment(c.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Xóa {isAdmin && !isCommentAuthor && '(Admin)'}
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div style={{ marginTop: '8px' }}>
                        <textarea
                          rows={3}
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--accent)',
                            backgroundColor: 'var(--surface)',
                            color: 'var(--text)',
                            fontSize: '0.95rem',
                            outline: 'none',
                            marginBottom: '6px'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingContent('');
                            }}
                            disabled={editLoading}
                            style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveBlogComment(c.id)}
                            disabled={editLoading}
                            style={{ padding: '4px 10px', fontSize: '0.8rem', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: editLoading ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                          >
                            {editLoading ? 'Đang lưu...' : 'Lưu'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-item__text">{c.content}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
