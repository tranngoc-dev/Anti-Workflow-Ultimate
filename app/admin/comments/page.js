'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { deleteComment as deleteThreadComment, renderWithLinks } from '@/utils/qa-api';

export default function AdminCommentsPage() {
  const [blogComments, setBlogComments] = useState([]);
  const [threadComments, setThreadComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'blog' | 'thread'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

  useEffect(() => {
    loadAllComments();
  }, []);

  async function loadAllComments() {
    setLoading(true);
    try {
      // 1. Lấy bình luận Blog
      const { data: bComments, error: bErr } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (bErr) console.error('Lỗi tải bình luận Blog:', bErr);

      // 2. Lấy câu trả lời Q&A (Diễn đàn)
      const { data: tComments, error: tErr } = await supabase
        .from('thread_comments')
        .select(`
          id,
          thread_id,
          author_id,
          content,
          is_best_answer,
          likes_count,
          created_at,
          author:profiles!thread_comments_author_id_fkey(id, display_name, rank, avatar_url),
          thread:threads!thread_comments_thread_id_fkey(id, title)
        `)
        .order('created_at', { ascending: false });

      if (tErr) console.error('Lỗi tải câu trả lời Q&A:', tErr);

      setBlogComments(bComments || []);
      setThreadComments(tComments || []);
    } catch (err) {
      console.error('[AdminComments] Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  }

  // Duyệt hoặc từ chối bình luận Blog
  async function handleUpdateBlogStatus(id, newStatus) {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadAllComments();
    } catch (err) {
      console.error('[AdminComments] Lỗi cập nhật trạng thái:', err);
      alert('Không thể cập nhật trạng thái bình luận: ' + (err.message || 'Thử lại sau.'));
    }
  }

  // Xóa bình luận Blog
  async function handleDeleteBlogComment(id) {
    if (!confirm('Bạn có chắc muốn xóa bình luận Blog này?\n\nHành động này không thể hoàn tác.')) return;

    try {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
      loadAllComments();
    } catch (err) {
      console.error('[AdminComments] Lỗi xóa bình luận Blog:', err);
      alert('Lỗi khi xóa bình luận: ' + (err.message || 'Thử lại sau.'));
    }
  }

  // Xóa câu trả lời Q&A (Diễn đàn)
  async function handleDeleteThreadComment(id) {
    if (!confirm('Bạn có chắc muốn xóa câu trả lời Diễn đàn này?\n\nHành động này không thể hoàn tác.')) return;

    try {
      await deleteThreadComment(id);
      loadAllComments();
    } catch (err) {
      console.error('[AdminComments] Lỗi xóa câu trả lời Q&A:', err);
      alert('Lỗi khi xóa câu trả lời: ' + (err.message || 'Thử lại sau.'));
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Chuẩn hóa và gộp danh sách
  const normalizedBlog = blogComments.map(c => ({
    id: c.id,
    type: 'blog',
    typeName: 'Blog',
    authorName: c.author_name || 'Khách',
    authorMeta: c.author_email || '',
    avatar: null,
    content: c.content,
    targetTitle: c.post_slug,
    targetUrl: `/${c.post_slug}`,
    status: c.status || 'pending',
    isBestAnswer: false,
    likesCount: 0,
    createdAt: c.created_at
  }));

  const normalizedThread = threadComments.map(c => ({
    id: c.id,
    type: 'thread',
    typeName: c.parent_id ? '💬 Phản hồi Q&A' : '💬 Câu trả lời Q&A',
    isReply: !!c.parent_id,
    authorName: c.author?.display_name || 'Thành viên',
    authorMeta: `Rank: ${c.author?.rank || 'Kim Ngư'}`,
    avatar: c.author?.avatar_url || null,
    content: c.content,
    targetTitle: c.thread?.title || 'Chủ đề hỏi đáp',
    targetUrl: `/thread/${c.thread_id}`,
    status: 'approved', // Thread comments luôn hiển thị công khai
    isBestAnswer: !!c.is_best_answer,
    likesCount: c.likes_count || 0,
    createdAt: c.created_at
  }));

  // Tổng hợp và lọc
  let allList = [...normalizedBlog, ...normalizedThread];
  
  // Sắp xếp thời gian mới nhất lên đầu
  allList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Lọc theo Type
  if (typeFilter === 'blog') {
    allList = allList.filter(item => item.type === 'blog');
  } else if (typeFilter === 'thread') {
    allList = allList.filter(item => item.type === 'thread');
  }

  // Lọc theo Status (với blog)
  if (statusFilter !== 'all') {
    allList = allList.filter(item => item.status === statusFilter);
  }

  const pendingBlogCount = blogComments.filter(c => c.status === 'pending').length;

  const TYPE_FILTERS = [
    { key: 'all', label: `Tất cả (${blogComments.length + threadComments.length})` },
    { key: 'blog', label: `📝 Bình luận Blog (${blogComments.length})` },
    { key: 'thread', label: `💬 Câu trả lời Q&A (${threadComments.length})` },
  ];

  const STATUS_BADGE = {
    pending: 'admin-badge--pending',
    approved: 'admin-badge--published',
    rejected: 'admin-badge--draft',
  };

  const STATUS_LABEL = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt / Công khai',
    rejected: 'Từ chối',
  };

  return (
    <>
      <div className="admin-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="admin-page__title" style={{ margin: 0 }}>Quản lý Bình luận & Câu trả lời</h1>
        {pendingBlogCount > 0 && (
          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem', border: '1px solid #fde68a' }}>
            ⏳ Có {pendingBlogCount} bình luận blog đang chờ duyệt
          </span>
        )}
      </div>

      {/* Tabs lọc loại nguồn */}
      <div className="admin-tabs" role="tablist" aria-label="Lọc nguồn bình luận" style={{ marginBottom: '16px' }}>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={`admin-tab ${typeFilter === f.key ? 'admin-tab--active' : ''}`}
            role="tab"
            aria-selected={typeFilter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bộ lọc trạng thái phụ (cho blog) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Trạng thái:</span>
        {['all', 'pending', 'approved', 'rejected'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              border: statusFilter === st ? '1px solid var(--accent)' : '1px solid var(--border)',
              backgroundColor: statusFilter === st ? 'var(--accent)' : 'var(--surface)',
              color: statusFilter === st ? 'white' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            {st === 'all' ? 'Tất cả trạng thái' : STATUS_LABEL[st]}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Đang tải dữ liệu bình luận...</p>
      ) : allList.length === 0 ? (
        <div className="admin-empty">
          <p>Không có bình luận hoặc câu trả lời nào phù hợp với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="admin-comments-list">
          {allList.map((item) => (
            <div className="admin-comment-card" key={`${item.type}-${item.id}`}>
              <div className="admin-comment-card__header">
                <div className="admin-comment-card__author" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.avatar ? (
                    <img src={item.avatar} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                  ) : (
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'inline-block' }} />
                  )}
                  <div>
                    <strong>{item.authorName}</strong>
                    <span className="admin-comment-card__email" style={{ marginLeft: '6px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      {item.authorMeta}
                    </span>
                  </div>
                </div>

                <div className="admin-comment-card__meta" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: item.type === 'blog' ? '#e0f2fe' : '#f3e8ff',
                    color: item.type === 'blog' ? '#0369a1' : '#7e22ce'
                  }}>
                    {item.typeName}
                  </span>

                  {item.isBestAnswer && (
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309' }}>
                      🏆 Hữu ích nhất
                    </span>
                  )}

                  <span className={`admin-badge ${STATUS_BADGE[item.status] || ''}`}>
                    {STATUS_LABEL[item.status] || item.status}
                  </span>

                  <time className="admin-comment-card__date" dateTime={item.createdAt}>
                    {formatDate(item.createdAt)}
                  </time>
                </div>
              </div>

              <p className="admin-comment-card__content" style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: '12px 0' }}>
                {renderWithLinks(item.content)}
              </p>

              <div className="admin-comment-card__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <span className="admin-comment-card__post">
                  {item.type === 'blog' ? 'Bài viết: ' : 'Chủ đề: '}
                  <a href={item.targetUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                    {item.targetTitle} ↗
                  </a>
                </span>

                <div className="admin-comment-card__actions" style={{ display: 'flex', gap: '6px' }}>
                  {item.type === 'blog' && item.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateBlogStatus(item.id, 'approved')}
                      className="admin-btn admin-btn--sm admin-btn--success"
                    >
                      ✓ Duyệt
                    </button>
                  )}
                  {item.type === 'blog' && item.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateBlogStatus(item.id, 'rejected')}
                      className="admin-btn admin-btn--sm admin-btn--warning"
                    >
                      ✗ Từ chối
                    </button>
                  )}
                  <button 
                    onClick={() => item.type === 'blog' ? handleDeleteBlogComment(item.id) : handleDeleteThreadComment(item.id)} 
                    className="admin-btn admin-btn--sm admin-btn--danger"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

