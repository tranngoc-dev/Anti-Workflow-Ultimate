'use client';

import { useState, useEffect, use } from 'react';
import { getProfile, getUserThreads, getTopUsers, RANK_BADGES, RANK_COLORS } from '@/utils/qa-api';

export default function ProfilePage({ params }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const [profile, setProfile] = useState(null);
  const [threads, setThreads] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Load user profile info
      const profileData = await getProfile(userId);
      setProfile(profileData);

      if (profileData) {
        // Load user threads
        const threadsData = await getUserThreads(userId);
        setThreads(threadsData);
      }

      // Load top users for leaderboard
      const topUsers = await getTopUsers(5);
      setLeaderboard(topUsers);

      setLoading(false);
    }
    loadData();
  }, [userId]);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', textAlign: 'center', color: 'var(--muted)' }}>
        Đang tải thông tin hồ sơ...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        <h2>Không tìm thấy hồ sơ người dùng</h2>
        <p style={{ color: 'var(--muted)' }}>Hồ sơ này không tồn tại hoặc đã bị xóa.</p>
        <a href="/" style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-block', marginTop: '16px' }}>← Quay lại trang chủ</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', color: 'var(--text)' }}>
      {/* Back to Home */}
      <a href="/" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
        ← Quay lại trang chủ Q&A
      </a>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Responsive Grid for Profile info & Leaderboard */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          <style jsx>{`
            @media (min-width: 768px) {
              .profile-grid-cols {
                grid-template-columns: 2fr 1fr !important;
              }
            }
          `}</style>
          
          <div className="profile-grid-cols" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            {/* Left: User details & Threads */}
            <div>
              {/* Profile Card */}
              <div style={{
                backgroundColor: 'var(--surface)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap'
              }}>
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.display_name} 
                    style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--border)' }}
                  />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'inline-block' }} />
                )}
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0' }}>{profile.display_name || 'Người dùng'}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span 
                      style={{ 
                        padding: '4px 12px', 
                        borderRadius: '6px', 
                        fontSize: '0.85rem', 
                        fontWeight: 700,
                        backgroundColor: RANK_COLORS[profile.rank] || '#4b5563',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {profile.rank && RANK_BADGES[profile.rank] && (
                        <img 
                          src={RANK_BADGES[profile.rank]} 
                          alt={profile.rank} 
                          style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
                        />
                      )}
                      Rank: {profile.rank || 'Kim Ngư'}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent)' }}>
                      🪙 {profile.gold_balance || 0} Gold
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      Tham gia từ: {formatDate(profile.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Threads List */}
              <section>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '20px' }}>Câu hỏi đã đăng ({threads.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {threads.length === 0 ? (
                    <div style={{ padding: '40px', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', backgroundColor: 'var(--surface)' }}>
                      <p style={{ margin: 0, color: 'var(--muted)' }}>Chưa đăng câu hỏi thảo luận nào.</p>
                    </div>
                  ) : (
                    threads.map((thread) => (
                      <article 
                        key={thread.id}
                        style={{
                          backgroundColor: 'var(--surface)',
                          padding: '24px',
                          borderRadius: '12px',
                          border: '1px solid var(--border)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <a href={`/thread/${thread.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>
                            Đăng ngày {formatDate(thread.created_at)}
                          </span>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text)' }}>
                            {thread.title}
                            {thread.is_resolved && (
                              <span style={{
                                marginLeft: '8px',
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                backgroundColor: 'rgba(15, 118, 110, 0.1)',
                                color: 'var(--accent)',
                                borderRadius: '12px',
                                fontWeight: 500
                              }}>
                                ✓ Đã giải đáp
                              </span>
                            )}
                          </h3>
                          <p style={{
                            fontSize: '0.95rem',
                            color: 'var(--muted)',
                            margin: '0 0 12px 0',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {thread.content}
                          </p>
                          <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
                            Xem câu trả lời ({thread.comments_count || 0}) →
                          </span>
                        </a>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Right: Leaderboard (Top Users) */}
            <div>
              <div style={{
                backgroundColor: 'var(--surface)',
                padding: '28px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                position: 'sticky',
                top: '24px'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--accent)', paddingBottom: '8px', color: 'var(--accent)' }}>
                  🏆 Bảng Xếp Hạng Top Gold
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {leaderboard.map((user, index) => {
                    const isCurrentUser = user.id === userId;
                    return (
                      <div 
                        key={user.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: isCurrentUser ? 'rgba(15, 118, 110, 0.05)' : 'transparent',
                          border: isCurrentUser ? '1px solid rgba(15, 118, 110, 0.2)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Rank Number / Medal */}
                          <span style={{
                            width: '24px',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            color: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#b45309' : 'var(--muted)'
                          }}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                          </span>
                          
                          {/* User Avatar & Name */}
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt="avatar" 
                              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                            />
                          ) : (
                            <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'inline-block' }} />
                          )}
                          <div>
                            <a href={`/profile/${user.id}`} style={{ fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', color: 'var(--text)' }}>
                              {user.display_name || 'Người dùng'}
                            </a>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: RANK_COLORS[user.rank] || '#4b5563'
                            }}>
                              {user.rank && RANK_BADGES[user.rank] && (
                                <img 
                                  src={RANK_BADGES[user.rank]} 
                                  alt={user.rank} 
                                  style={{ width: '12px', height: '12px', objectFit: 'contain' }} 
                                />
                              )}
                              {user.rank}
                            </span>
                          </div>
                        </div>

                        {/* Gold count */}
                        <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.95rem' }}>
                          🪙 {user.gold_balance}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
