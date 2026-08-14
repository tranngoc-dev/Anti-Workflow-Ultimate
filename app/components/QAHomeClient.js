'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { getThreads, createThread, RANK_BADGES, RANK_COLORS } from '@/utils/qa-api';

export default function QAHomeClient() {
  const [qaThreads, setQaThreads] = useState([]);
  const [qaSearchQuery, setQaSearchQuery] = useState('');
  const [isQAOpen, setIsQAOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);

  // Lấy user session hiện tại
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUser(data?.session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Lọc realtime Q&A Threads với debounce
  useEffect(() => {
    setQaLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      const threads = await getThreads(qaSearchQuery);
      setQaThreads(threads);
      setQaLoading(false);
    }, qaSearchQuery ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [qaSearchQuery]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createThread(newTitle, newContent, currentUser.id);
      setNewTitle('');
      setNewContent('');
      setIsQAOpen(false);
      
      // Reload threads
      const threads = await getThreads(qaSearchQuery);
      setQaThreads(threads);
    } catch (err) {
      alert('Có lỗi xảy ra khi đăng câu hỏi. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  return (
    <main id="main-content" className="home-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text)' }}>
          💬 Cộng Đồng Hỏi Đáp & Thảo Luận
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', margin: 0 }}>
          Đặt câu hỏi, giải đáp thắc mắc, tích lũy điểm Gold và nâng cấp Rank của bạn.
        </p>
      </div>

      {/* Q&A Header & Search */}
      <div className="qa-search-header" style={{ display: 'flex', gap: '12px', marginBottom: '32px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Tìm kiếm câu hỏi của người dùng realtime..."
          value={qaSearchQuery}
          onChange={(e) => setQaSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '14px 18px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
        {currentUser ? (
          <button
            onClick={() => setIsQAOpen(true)}
            style={{
              padding: '14px 24px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            ➕ Đặt câu hỏi
          </button>
        ) : (
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.02)', whiteSpace: 'nowrap' }}>
            Đăng nhập ở góc phải để hỏi
          </div>
        )}
      </div>

      {/* Q&A Threads List */}
      <div className="posts-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {qaLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', width: '100%' }}>Đang tìm kiếm câu hỏi...</div>
        ) : qaThreads.length === 0 ? (
          <div className="no-results" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border)', borderRadius: '12px', backgroundColor: 'var(--surface)' }}>
            <span className="no-results__icon" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>💬</span>
            <p className="no-results__title" style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0' }}>Không tìm thấy câu hỏi nào</p>
            <p className="no-results__text" style={{ color: 'var(--muted)', margin: 0 }}>Hãy thử tìm từ khóa khác hoặc đăng câu hỏi mới để bắt đầu thảo luận!</p>
          </div>
        ) : (
          qaThreads.map((thread) => (
            <article className="blog-card" key={thread.id} style={{ backgroundColor: 'var(--surface)', padding: '28px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <a href={`/thread/${thread.id}`} className="blog-card__link" aria-label={thread.title} style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="blog-card__meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                  {thread.author?.avatar_url ? (
                    <img 
                      src={thread.author.avatar_url} 
                      alt="avatar" 
                      style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                    />
                  ) : (
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'inline-block' }} />
                  )}
                  <span>
                    Bởi <strong>{thread.author?.display_name || 'Người dùng'}</strong>
                  </span>
                  {thread.author?.rank && RANK_BADGES[thread.author.rank] && (
                    <img 
                      src={RANK_BADGES[thread.author.rank]} 
                      alt={thread.author.rank} 
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        objectFit: 'contain',
                        backgroundColor: '#f8fafc',
                        borderRadius: '50%',
                        padding: '2px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        marginLeft: '2px'
                      }} 
                    />
                  )}
                  <span 
                    style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem', 
                      fontWeight: 600,
                      backgroundColor: RANK_COLORS[thread.author?.rank] || '#4b5563',
                      color: 'white'
                    }}
                  >
                    {thread.author?.rank || 'Kim Ngư'}
                  </span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    🪙 {thread.author?.gold_balance || 0} Gold
                  </span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <time dateTime={thread.created_at} style={{ color: 'var(--muted)' }}>{formatDate(thread.created_at)}</time>
                </span>
                
                <h2 className="blog-card__title" style={{ marginTop: '12px', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
                  {thread.title}
                  {thread.is_resolved && (
                    <span 
                      style={{ 
                        marginLeft: '8px', 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        backgroundColor: 'rgba(15, 118, 110, 0.1)', 
                        color: 'var(--accent)', 
                        borderRadius: '12px',
                        fontWeight: 500,
                        verticalAlign: 'middle'
                      }}
                    >
                      ✓ Đã giải đáp
                    </span>
                  )}
                </h2>
                <p className="blog-card__excerpt" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: 'var(--muted)',
                  marginTop: '8px',
                  marginBottom: '16px'
                }}>
                  {thread.content}
                </p>
                
                <span className="blog-card__readmore" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Xem câu trả lời ({thread.comments_count || 0}) →</span>
                </span>
              </a>
            </article>
          ))
        )}
      </div>

      {/* Modal Tạo Câu Hỏi */}
      {isQAOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setIsQAOpen(false)}
        >
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              padding: '32px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '600px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid var(--border)',
              color: 'var(--text)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem' }}>Đặt câu hỏi mới</h3>
            <form onSubmit={handleCreateThread}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Tiêu đề câu hỏi</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Làm sao để cấu hình RLS Supabase nâng cao?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontSize: '1rem',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)'
                  }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Nội dung chi tiết</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    resize: 'vertical',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsQAOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 600
                  }}
                >
                  {isSubmitting ? 'Đang đăng...' : 'Đăng câu hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
