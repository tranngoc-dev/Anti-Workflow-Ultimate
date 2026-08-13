'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('pending'); // Mặc định hiển thị tab Chờ duyệt

  useEffect(() => {
    loadComments();
  }, [currentFilter]);

  async function loadComments() {
    setLoading(true);
    try {
      let query = supabase.from('comments').select('*').order('created_at', { ascending: false });
      if (currentFilter !== 'all') {
        query = query.eq('status', currentFilter);
      }

      const [
        { data: commentsRaw, error },
        { count: pendingRaw }
      ] = await Promise.all([
        query,
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      if (error) throw error;
      setComments(commentsRaw || []);
      setPendingCount(pendingRaw || 0);
    } catch (err) {
      console.error('[AdminComments] Lỗi load bình luận:', err);
    } finally {
      setLoading(false);
    }
  }

  // Duyệt hoặc từ chối bình luận
  async function handleUpdateStatus(id, newStatus) {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      loadComments();
    } catch (err) {
      console.error('[AdminComments] Lỗi cập nhật trạng thái:', err);
      alert('Không thể cập nhật bình luận.');
    }
  }

  // Xóa bình luận
  async function handleDelete(id) {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?\n\nHành động này không thể hoàn tác.')) return;

    try {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
      loadComments();
    } catch (err) {
      console.error('[AdminComments] Lỗi xóa bình luận:', err);
      alert('Lỗi khi xóa bình luận.');
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

  const FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: pendingCount > 0 ? `Chờ duyệt (${pendingCount})` : 'Chờ duyệt' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Từ chối' },
  ];

  const STATUS_BADGE = {
    pending: 'admin-badge--pending',
    approved: 'admin-badge--published',
    rejected: 'admin-badge--draft',
  };

  const STATUS_LABEL = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
  };

  return (
    <>
      <h1 className="admin-page__title">Bình luận</h1>

      {/* Tabs */}
      <div className="admin-tabs" role="tablist" aria-label="Lọc bình luận">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setCurrentFilter(f.key)}
            className={`admin-tab ${currentFilter === f.key ? 'admin-tab--active' : ''}`}
            role="tab"
            aria-selected={currentFilter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Đang tải bình luận...</p>
      ) : comments.length === 0 ? (
        <div className="admin-empty">
          <p>Không có bình luận nào trong mục này.</p>
        </div>
      ) : (
        <div className="admin-comments-list">
          {comments.map((c) => (
            <div className="admin-comment-card" key={c.id}>
              <div className="admin-comment-card__header">
                <div className="admin-comment-card__author">
                  <strong>{c.author_name}</strong>
                  <span className="admin-comment-card__email">{c.author_email}</span>
                </div>
                <div className="admin-comment-card__meta">
                  <span className={`admin-badge ${STATUS_BADGE[c.status] || ''}`}>
                    {STATUS_LABEL[c.status] || c.status}
                  </span>
                  <time className="admin-comment-card__date" dateTime={c.created_at}>
                    {formatDate(c.created_at)}
                  </time>
                </div>
              </div>
              <p className="admin-comment-card__content">{c.content}</p>
              <div className="admin-comment-card__footer">
                <span className="admin-comment-card__post">
                  Bài: <strong>{c.post_slug}</strong>
                </span>
                <div className="admin-comment-card__actions">
                  {c.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'approved')}
                      className="admin-btn admin-btn--sm admin-btn--success"
                    >
                      ✓ Duyệt
                    </button>
                  )}
                  {c.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'rejected')}
                      className="admin-btn admin-btn--sm admin-btn--warning"
                    >
                      ✗ Từ chối
                    </button>
                  )}
                  <button onClick={() => handleDelete(c.id)} className="admin-btn admin-btn--sm admin-btn--danger">
                    Xóa
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
