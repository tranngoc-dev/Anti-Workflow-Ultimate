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
  RANK_COLORS,
  formatCompactDate 
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

  // State phản hồi (reply)
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

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
      alert(err.message || 'Có lỗi xảy ra khi gửi bình luận. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartReply = (commentId) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập ở góc phải để gửi phản hồi!');
      return;
    }
    setReplyingToCommentId(commentId);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyContent('');
  };

  const handlePostReply = async (parentId) => {
    if (!currentUser || !replyContent.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      await createComment(threadId, replyContent.trim(), currentUser.id, parentId);
      setReplyContent('');
      setReplyingToCommentId(null);

      // Reload comments
      const commentsData = await getComments(threadId, currentUser.id);
      setComments(commentsData);
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại!');
    } finally {
      setSubmittingReply(false);
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
    <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 16px', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }}>
      {/* Back to Home & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', width: '100%' }}>
        <a href="/" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
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
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🗑️ Xóa câu hỏi {isAdmin && !isOwner && '(Admin)'}
          </button>
        )}
      </div>

      {/* Main Question Card */}
      <article style={{ backgroundColor: 'var(--surface)', padding: '24px 20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '28px', width: '100%', boxSizing: 'border-box' }}>
        <header style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {thread.author?.avatar_url ? (
              <img 
                src={thread.author.avatar_url} 
                alt="avatar" 
                style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }}
              />
            ) : (
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'inline-block', flexShrink: 0 }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <a href={`/profile/${thread.author?.id}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {thread.author?.display_name || 'Người dùng'}
              </a>
              {thread.author?.rank && RANK_BADGES[thread.author.rank] && (
                <img 
                  src={RANK_BADGES[thread.author.rank]} 
                  alt={thread.author.rank} 
                  style={{ 
                    width: '22px', 
                    height: '22px', 
                    objectFit: 'contain',
                    backgroundColor: '#f8fafc',
                    borderRadius: '50%',
                    padding: '2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    marginLeft: '2px',
                    marginRight: '1px'
                  }} 
                />
              )}
              <span 
                style={{ 
                  padding: '1px 6px', 
                  borderRadius: '4px', 
                  fontSize: '0.7rem', 
                  fontWeight: 600,
                  backgroundColor: RANK_COLORS[thread.author?.rank] || '#4b5563',
                  color: 'white'
                }}
              >
                {thread.author?.rank || 'Kim Ngư'}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                🪙 {thread.author?.gold_balance || 0} Gold
              </span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <time style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 }} dateTime={thread.created_at}>
                {formatCompactDate(thread.created_at)}
              </time>
            </div>
          </div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.75rem)', lineHeight: '1.3', fontWeight: 800, margin: '12px 0 0 0' }}>{thread.title}</h1>
        </header>
        <section style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: '1.6' }}>
          {thread.content}
        </section>
      </article>

      {/* Answer/Comment Section */}
      <section>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>
          Câu trả lời ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h3>

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
                marginBottom: '12px',
                boxSizing: 'border-box'
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {comments.map((comment) => {
            const isCommentAuthor = currentUser?.id === comment.author_id;
            const isEditing = editingCommentId === comment.id;

            return (
              <div 
                key={comment.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: comment.is_best_answer ? '2px solid var(--accent)' : '1px solid var(--border)',
                  boxShadow: comment.is_best_answer ? '0 4px 6px -1px rgba(15, 118, 110, 0.05)' : 'none',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
              >
                {comment.is_best_answer && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '20px',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    🏆 HỮU ÍCH NHẤT (+10 Gold)
                  </div>
                )}

                {/* Comment Meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {comment.author?.avatar_url ? (
                      <img 
                        src={comment.author.avatar_url} 
                        alt="avatar" 
                        style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0 }}
                      />
                    ) : (
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'inline-block', flexShrink: 0 }} />
                    )}
                    <a href={`/profile/${comment.author?.id}`} style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.92rem', textDecoration: 'none' }}>
                      {comment.author?.display_name || 'Người dùng'}
                    </a>
                    {comment.author?.rank && RANK_BADGES[comment.author.rank] && (
                      <img 
                        src={RANK_BADGES[comment.author.rank]} 
                        alt={comment.author.rank} 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          objectFit: 'contain',
                          backgroundColor: '#f8fafc',
                          borderRadius: '50%',
                          padding: '2px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(0,0,0,0.06)',
                          marginLeft: '2px',
                          marginRight: '1px'
                        }} 
                      />
                    )}
                    <span 
                      style={{ 
                        padding: '1px 5px', 
                        borderRadius: '3px', 
                        fontSize: '0.68rem', 
                        fontWeight: 600,
                        backgroundColor: RANK_COLORS[comment.author?.rank] || '#4b5563',
                        color: 'white'
                      }}
                    >
                      {comment.author?.rank || 'Kim Ngư'}
                    </span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
                      🪙 {comment.author?.gold_balance || 0} Gold
                    </span>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <time style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 500 }} dateTime={comment.created_at}>
                      {formatCompactDate(comment.created_at)}
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
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '3px 6px',
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
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '3px 6px',
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
                  <div style={{ marginBottom: '14px' }}>
                    <textarea
                      rows={3}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--accent)',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text)',
                        resize: 'vertical',
                        marginBottom: '8px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={editLoading}
                        style={{
                          padding: '6px 12px',
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
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
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: editLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.98rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '14px' }}>
                    {comment.content}
                  </div>
                )}

                {/* Actions Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Likes button */}
                    <button
                      onClick={() => handleLikeToggle(comment)}
                      disabled={isCommentAuthor}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'none',
                        border: 'none',
                        cursor: isCommentAuthor ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        color: comment.is_liked ? '#ef4444' : 'var(--muted)',
                        fontWeight: comment.is_liked ? 600 : 500,
                        transition: 'all 0.1s ease',
                        opacity: isCommentAuthor ? 0.6 : 1,
                        padding: 0
                      }}
                      title={isCommentAuthor ? 'Bạn không thể tự thích câu trả lời của mình' : ''}
                    >
                      <span style={{ fontSize: '1rem' }}>{comment.is_liked ? '❤️' : '🤍'}</span>
                      <span>Thích ({comment.likes_count || 0})</span>
                    </button>

                    {/* Reply button */}
                    <button
                      onClick={() => {
                        if (replyingToCommentId === comment.id) {
                          handleCancelReply();
                        } else {
                          handleStartReply(comment.id);
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: replyingToCommentId === comment.id ? 'var(--accent)' : 'var(--muted)',
                        fontWeight: 600,
                        padding: 0,
                        transition: 'color 0.15s ease'
                      }}
                    >
                      <span>💬</span>
                      <span>Trả lời {comment.replies?.length > 0 ? `(${comment.replies.length})` : ''}</span>
                    </button>
                  </div>

                  {/* Best Answer selection (only for thread owner) */}
                  {isOwner && !isCommentAuthor && (
                    <button
                      onClick={() => handleToggleBestAnswer(comment)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: comment.is_best_answer ? 'transparent' : 'rgba(15, 118, 110, 0.05)',
                        border: comment.is_best_answer ? '1px solid var(--border)' : 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        color: comment.is_best_answer ? 'var(--muted)' : 'var(--accent)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>🏆</span>
                      <span>{comment.is_best_answer ? 'Hủy chọn hữu ích' : 'Chọn hữu ích nhất'}</span>
                    </button>
                  )}
                </div>

                {/* Reply Input Form */}
                {replyingToCommentId === comment.id && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      {currentUser?.user_metadata?.avatar_url ? (
                        <img src={currentUser.user_metadata.avatar_url} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'inline-block', flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <textarea
                          autoFocus
                          rows={2}
                          placeholder={`Viết phản hồi cho ${comment.author?.display_name || 'thành viên'}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--accent)',
                            outline: 'none',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            backgroundColor: 'var(--bg)',
                            color: 'var(--text)',
                            resize: 'vertical',
                            boxSizing: 'border-box'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={handleCancelReply}
                            disabled={submittingReply}
                            style={{
                              padding: '5px 12px',
                              background: 'none',
                              border: '1px solid var(--border)',
                              borderRadius: '5px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              color: 'var(--muted)'
                            }}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePostReply(comment.id)}
                            disabled={submittingReply || !replyContent.trim()}
                            style={{
                              padding: '5px 14px',
                              backgroundColor: 'var(--accent)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: (submittingReply || !replyContent.trim()) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nested Replies List */}
                {comment.replies && comment.replies.length > 0 && (
                  <div style={{ 
                    marginTop: '14px', 
                    marginLeft: '8px',
                    paddingLeft: '12px', 
                    borderLeft: '2px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {comment.replies.map((reply) => {
                      const isReplyAuthor = currentUser?.id === reply.author_id;
                      const isEditingReply = editingCommentId === reply.id;

                      return (
                        <div 
                          key={reply.id} 
                          style={{ 
                            backgroundColor: 'rgba(0,0,0,0.02)', 
                            padding: '10px 12px', 
                            borderRadius: '8px',
                            border: '1px solid rgba(0,0,0,0.04)',
                            boxSizing: 'border-box'
                          }}
                        >
                          {/* Reply Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                              {reply.author?.avatar_url ? (
                                <img src={reply.author.avatar_url} alt="avatar" style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0 }} />
                              ) : (
                                <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'inline-block', flexShrink: 0 }} />
                              )}
                              <a href={`/profile/${reply.author?.id}`} style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.85rem', textDecoration: 'none' }}>
                                {reply.author?.display_name || 'Người dùng'}
                              </a>
                              {reply.author?.rank && RANK_BADGES[reply.author.rank] && (
                                <img 
                                  src={RANK_BADGES[reply.author.rank]} 
                                  alt={reply.author.rank} 
                                  style={{ width: '16px', height: '16px', objectFit: 'contain', backgroundColor: '#f8fafc', borderRadius: '50%', padding: '1px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} 
                                />
                              )}
                              <span style={{ padding: '1px 4px', borderRadius: '3px', fontSize: '0.62rem', fontWeight: 600, backgroundColor: RANK_COLORS[reply.author?.rank] || '#4b5563', color: 'white' }}>
                                {reply.author?.rank || 'Kim Ngư'}
                              </span>
                              <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>🪙 {reply.author?.gold_balance || 0}</span>
                              <span style={{ color: 'var(--border)' }}>·</span>
                              <time style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500 }} dateTime={reply.created_at}>
                                {formatCompactDate(reply.created_at)}
                              </time>
                            </div>

                            {/* Actions sửa / xóa reply */}
                            {!isEditingReply && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isReplyAuthor && (
                                  <button
                                    onClick={() => handleStartEdit(reply)}
                                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '1px 4px' }}
                                  >
                                    ✏️ Sửa
                                  </button>
                                )}
                                {(isReplyAuthor || isAdmin) && (
                                  <button
                                    onClick={() => handleDeleteComment(reply.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '1px 4px' }}
                                  >
                                    🗑️ Xóa {isAdmin && !isReplyAuthor && '(Admin)'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Reply Content or Edit Inline */}
                          {isEditingReply ? (
                            <div style={{ marginBottom: '6px' }}>
                              <textarea
                                rows={2}
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--accent)',
                                  outline: 'none',
                                  fontFamily: 'inherit',
                                  fontSize: '0.85rem',
                                  backgroundColor: 'var(--surface)',
                                  color: 'var(--text)',
                                  resize: 'vertical',
                                  boxSizing: 'border-box'
                                }}
                              />
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  disabled={editLoading}
                                  style={{ padding: '3px 8px', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(reply.id)}
                                  disabled={editLoading}
                                  style={{ padding: '3px 10px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: editLoading ? 'not-allowed' : 'pointer' }}
                                >
                                  {editLoading ? 'Đang lưu...' : 'Lưu'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                              {reply.content}
                            </div>
                          )}

                          {/* Like action for reply */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: '6px' }}>
                            <button
                              onClick={() => handleLikeToggle(reply)}
                              disabled={isReplyAuthor}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: isReplyAuthor ? 'not-allowed' : 'pointer',
                                fontSize: '0.78rem',
                                color: reply.is_liked ? '#ef4444' : 'var(--muted)',
                                fontWeight: reply.is_liked ? 600 : 500,
                                opacity: isReplyAuthor ? 0.6 : 1,
                                padding: 0
                              }}
                            >
                              <span>{reply.is_liked ? '❤️' : '🤍'}</span>
                              <span>Thích ({reply.likes_count || 0})</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

