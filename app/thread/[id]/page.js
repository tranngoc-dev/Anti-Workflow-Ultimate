'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { 
  getThreadById, 
  getComments, 
  createComment, 
  updateComment, 
  deleteComment, 
  deleteThread, 
  likeComment, 
  unlikeComment, 
  setBestAnswer, 
  RANK_BADGES, 
  RANK_COLORS 
} from '@/utils/qa-api';

export default function ThreadDetailPage({ params }) {
  const router = useRouter();
  // Unwrapping params using React.use() to comply with Next.js App Router patterns
  const resolvedParams = use(params);
  const threadId = resolvedParams.id;

  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State chỉnh sửa comment inline
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const isAdmin = currentUser?.user_metadata?.is_admin === true || currentUser?.email === 'vutrongvtv24@gmail.com';

  // Load initial data
  useEffect(() => {
    async function init() {
      // Get current user session
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user || null;
      setCurrentUser(user);

      // Fetch thread detail
      const threadData = await getThreadById(threadId);
      setThread(threadData);

      if (threadData) {
        // Fetch comments
        const commentsData = await getComments(threadId, user?.id);
        setComments(commentsData);
      }
      setLoading(false);
    }
    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [threadId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!currentUser || newComment.trim() === '' || submitting) return;

    setSubmitting(true);
    try {
      await createComment(threadId, newComment, currentUser.id);
      setNewComment('');
      
      // Reload comments
      const commentsData = await getComments(threadId, currentUser.id);
      setComments(commentsData);
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi bình luận. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingContent.trim()) {
      alert('Nội dung không được để trống.');
      return;
    }
    setEditLoading(true);
    try {
      await updateComment(commentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent('');
      
      // Reload comments
      const commentsData = await getComments(threadId, currentUser?.id);
      setComments(commentsData);
    } catch (err) {
      alert('Lỗi khi cập nhật câu trả lời: ' + (err.message || 'Thử lại sau.'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu trả lời này không?')) return;

    try {
      await deleteComment(commentId);
      // Reload comments
      const commentsData = await getComments(threadId, currentUser?.id);
      setComments(commentsData);
    } catch (err) {
      alert('Lỗi khi xóa câu trả lời: ' + (err.message || 'Thử lại sau.'));
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ câu hỏi này cùng các câu trả lời liên quan không?\n\nHành động này không thể hoàn tác.')) return;

    try {
      await deleteThread(threadId);
      alert('Đã xóa câu hỏi thành công.');
      router.push('/');
    } catch (err) {
      alert('Lỗi khi xóa câu hỏi: ' + (err.message || 'Thử lại sau.'));
    }
  };

  const handleLikeToggle = async (comment) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để thả tim!');
      return;
    }

    if (currentUser.id === comment.author_id) {
      alert('Bạn không thể tự thả tim bình luận của chính mình!');
      return;
    }

    try {
      if (comment.is_liked) {
        await unlikeComment(comment.id, currentUser.id);
      } else {
        await likeComment(comment.id, currentUser.id);
      }

      // Reload comments to sync state and scores
      const commentsData = await getComments(threadId, currentUser.id);
      setComments(commentsData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBestAnswer = async (comment) => {
    if (!currentUser || currentUser.id !== thread.author_id) return;

    try {
      await setBestAnswer(comment.id, threadId, comment.is_best_answer);
      
      // Reload comments to sync sorting and scores
      const commentsData = await getComments(threadId, currentUser.id);
      setComments(commentsData);
    } catch (err) {
      console.error(err);
    }
  };

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', textAlign: 'center', color: 'var(--muted)' }}>
        Đang tải câu hỏi...
      </div>
    );
  }

  if (!thread) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        <h2>Không tìm thấy chủ đề câu hỏi</h2>
        <p style={{ color: 'var(--muted)' }}>Chủ đề này có thể đã bị xóa hoặc không tồn tại.</p>
        <a href="/" style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-block', marginTop: '16px' }}>← Quay lại trang chủ</a>
      </div>
    );
  }

  const isOwner = currentUser?.id === thread.author_id;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', color: 'var(--text)' }}>
      {/* Back to Home & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          ← Quay lại trang chủ Q&A
        </a>

        {/* Nút xóa câu hỏi cho tác giả hoặc Admin */}
        {(isOwner || isAdmin) && (
          <button
            onClick={handleDeleteThread}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🗑️ Xóa câu hỏi {isAdmin && !isOwner && '(Admin)'}
          </button>
        )}
      </div>

      {/* Main Question Card */}
      <article style={{ backgroundColor: 'var(--surface)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <header style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            {thread.author?.avatar_url ? (
              <img 
                src={thread.author.avatar_url} 
                alt="avatar" 
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            ) : (
              <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'inline-block' }} />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a href={`/profile/${thread.author?.id}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>
                  {thread.author?.display_name || 'Người dùng'}
                </a>
                {thread.author?.rank && RANK_BADGES[thread.author.rank] && (
                  <img 
                    src={RANK_BADGES[thread.author.rank]} 
                    alt={thread.author.rank} 
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      objectFit: 'contain',
                      backgroundColor: '#f8fafc',
                      borderRadius: '50%',
                      padding: '3px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      marginLeft: '4px',
                      marginRight: '2px'
                    }} 
                  />
                )}
                <span 
                  style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    backgroundColor: RANK_COLORS[thread.author?.rank] || '#4b5563',
                    color: 'white'
                  }}
                >
                  {thread.author?.rank || 'Kim Ngư'}
                </span>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  🪙 {thread.author?.gold_balance || 0} Gold
                </span>
              </div>
              <time style={{ fontSize: '0.85rem', color: 'var(--muted)' }} dateTime={thread.created_at}>
                {formatDate(thread.created_at)}
              </time>
            </div>
          </div>
          <h1 style={{ fontSize: '1.75rem', lineHeight: '1.3', fontWeight: 800, margin: '16px 0 0 0' }}>{thread.title}</h1>
        </header>
        <section style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: '1.6' }}>
          {thread.content}
        </section>
      </article>

      {/* Answer/Comment Section */}
      <section>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Câu trả lời ({comments.length})</h3>

        {/* Post new comment form */}
        {currentUser ? (
          <form onSubmit={handlePostComment} style={{ marginBottom: '32px' }}>
            <textarea
              required
              rows={4}
              placeholder="Chia sẻ câu trả lời hoặc góp ý của bạn để giúp đỡ..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '1rem',
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                resize: 'vertical',
                marginBottom: '12px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {submitting ? 'Đang gửi...' : 'Đăng câu trả lời'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '20px', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center', marginBottom: '32px', backgroundColor: 'rgba(0,0,0,0.01)' }}>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem' }}>
              Bạn cần đăng nhập ở góc phải trang chủ để tham gia bình luận giải đáp.
            </p>
          </div>
        )}

        {/* Comment list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((comment) => {
            const isCommentAuthor = currentUser?.id === comment.author_id;
            const isEditing = editingCommentId === comment.id;

            return (
              <div 
                key={comment.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: comment.is_best_answer ? '2px solid var(--accent)' : '1px solid var(--border)',
                  boxShadow: comment.is_best_answer ? '0 4px 6px -1px rgba(15, 118, 110, 0.05)' : 'none',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {comment.is_best_answer && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '24px',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    🏆 HỮU ÍCH NHẤT (+10 Gold)
                  </div>
                )}

                {/* Comment Meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {comment.author?.avatar_url ? (
                      <img 
                        src={comment.author.avatar_url} 
                        alt="avatar" 
                        style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                      />
                    ) : (
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'inline-block' }} />
                    )}
                    <a href={`/profile/${comment.author?.id}`} style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', textDecoration: 'none' }}>
                      {comment.author?.display_name || 'Người dùng'}
                    </a>
                    {comment.author?.rank && RANK_BADGES[comment.author.rank] && (
                      <img 
                        src={RANK_BADGES[comment.author.rank]} 
                        alt={comment.author.rank} 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          objectFit: 'contain',
                          backgroundColor: '#f8fafc',
                          borderRadius: '50%',
                          padding: '3px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                          border: '1px solid rgba(0,0,0,0.06)',
                          marginLeft: '4px',
                          marginRight: '2px'
                        }} 
                      />
                    )}
                    <span 
                      style={{ 
                        padding: '1px 5px', 
                        borderRadius: '3px', 
                        fontSize: '0.7rem', 
                        fontWeight: 600,
                        backgroundColor: RANK_COLORS[comment.author?.rank] || '#4b5563',
                        color: 'white'
                      }}
                    >
                      {comment.author?.rank || 'Kim Ngư'}
                    </span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                      🪙 {comment.author?.gold_balance || 0} Gold
                    </span>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <time style={{ fontSize: '0.8rem', color: 'var(--muted)' }} dateTime={comment.created_at}>
                      {formatDate(comment.created_at)}
                    </time>
                  </div>

                  {/* Nút sửa / xóa comment */}
                  {!isEditing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isCommentAuthor && (
                        <button
                          onClick={() => handleStartEdit(comment)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          ✏️ Sửa
                        </button>
                      )}
                      {(isCommentAuthor || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          🗑️ Xóa {isAdmin && !isCommentAuthor && '(Admin)'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Comment Content or Inline Edit Form */}
                {isEditing ? (
                  <div style={{ marginBottom: '16px' }}>
                    <textarea
                      rows={3}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--accent)',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text)',
                        resize: 'vertical',
                        marginBottom: '8px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={editLoading}
                        style={{
                          padding: '6px 14px',
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={editLoading}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: 'var(--accent)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: editLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                    {comment.content}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '12px' }}>
                  {/* Likes button */}
                  <button
                    onClick={() => handleLikeToggle(comment)}
                    disabled={isCommentAuthor}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      cursor: isCommentAuthor ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      color: comment.is_liked ? '#ef4444' : 'var(--muted)',
                      fontWeight: comment.is_liked ? 600 : 500,
                      transition: 'all 0.1s ease',
                      opacity: isCommentAuthor ? 0.6 : 1
                    }}
                    title={isCommentAuthor ? 'Bạn không thể tự thích câu trả lời của mình' : ''}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{comment.is_liked ? '❤️' : '🤍'}</span>
                    <span>Thích ({comment.likes_count || 0})</span>
                  </button>

                  {/* Best Answer selection (only for thread owner) */}
                  {isOwner && !isCommentAuthor && (
                    <button
                      onClick={() => handleToggleBestAnswer(comment)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: comment.is_best_answer ? 'transparent' : 'rgba(15, 118, 110, 0.05)',
                        border: comment.is_best_answer ? '1px solid var(--border)' : 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        color: comment.is_best_answer ? 'var(--muted)' : 'var(--accent)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>🏆</span>
                      <span>{comment.is_best_answer ? 'Hủy chọn hữu ích' : 'Chọn hữu ích nhất'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

