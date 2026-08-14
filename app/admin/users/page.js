'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  RANK_BADGES, 
  RANK_COLORS, 
  adminUpdateUserRank, 
  adminBanUserComments, 
  adminUnbanUserComments 
} from '@/utils/qa-api';

const RANKS = ['Kim Ngư', 'Linh Long', 'Đế Long', 'Hỏa Long', 'Thiên Long'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rankFilter, setRankFilter] = useState('all');
  const [banFilter, setBanFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Stats
  const [totalCount, setTotalCount] = useState(0);
  const [bannedCount, setBannedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_registered_users');
      if (error) throw error;

      const userList = data || [];
      setUsers(userList);
      calculateStats(userList);
    } catch (err) {
      console.error('[AdminUsers] Lỗi tải danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(userList) {
    setTotalCount(userList.length);

    const now = new Date();
    const banned = userList.filter((u) => u.comment_banned_until && new Date(u.comment_banned_until) > now);
    setBannedCount(banned.length);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const active = userList.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= thirtyDaysAgo);
    setActiveCount(active.length);
  }

  // Handle update rank
  async function handleRankChange(userId, newRank) {
    setActionLoadingId(userId);
    try {
      await adminUpdateUserRank(userId, newRank);
      // Cập nhật state local
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, rank: newRank } : u));
    } catch (err) {
      alert('Lỗi cập nhật Cấp bậc Rank: ' + (err.message || 'Thử lại sau.'));
    } finally {
      setActionLoadingId(null);
    }
  }

  // Handle adjust gold
  async function handleGoldChange(userId, currentGold) {
    const promptValue = prompt('Nhập số dư điểm Gold mới cho thành viên:', currentGold || 0);
    if (promptValue === null) return;
    
    const parsedGold = parseInt(promptValue, 10);
    if (isNaN(parsedGold) || parsedGold < 0) {
      alert('Số điểm Gold phải là một số nguyên dương hợp lệ.');
      return;
    }

    setActionLoadingId(userId);
    try {
      const currentRank = users.find(u => u.id === userId)?.rank || 'Kim Ngư';
      await adminUpdateUserRank(userId, currentRank, parsedGold);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, gold_balance: parsedGold } : u));
    } catch (err) {
      alert('Lỗi cập nhật điểm Gold: ' + (err.message || 'Thử lại sau.'));
    } finally {
      setActionLoadingId(null);
    }
  }

  // Handle ban comments (24h)
  async function handleBanComments(userId, userName) {
    if (!confirm(`Bạn có chắc chắn muốn CẤM bình luận thành viên "${userName}" trong vòng 24 giờ (1 ngày)?`)) return;

    setActionLoadingId(userId);
    try {
      const updated = await adminBanUserComments(userId, 24);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, comment_banned_until: updated.comment_banned_until } : u));
      calculateStats(users);
    } catch (err) {
      alert('Lỗi khi cấm bình luận: ' + (err.message || 'Thử lại sau.'));
    } finally {
      setActionLoadingId(null);
    }
  }

  // Handle unban comments
  async function handleUnbanComments(userId, userName) {
    if (!confirm(`Mở khóa quyền bình luận ngay cho thành viên "${userName}"?`)) return;

    setActionLoadingId(userId);
    try {
      await adminUnbanUserComments(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, comment_banned_until: null } : u));
      calculateStats(users);
    } catch (err) {
      alert('Lỗi khi mở khóa bình luận: ' + (err.message || 'Thử lại sau.'));
    } finally {
      setActionLoadingId(null);
    }
  }

  function formatDateTime(dateString) {
    if (!dateString) return 'Chưa có';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
  }

  function isUserCommentBanned(bannedUntil) {
    if (!bannedUntil) return false;
    return new Date(bannedUntil) > new Date();
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    // Search query
    const emailMatch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = (u.display_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchSearch = emailMatch || nameMatch;

    // Rank filter
    const matchRank = rankFilter === 'all' || (u.rank || 'Kim Ngư') === rankFilter;

    // Ban filter
    const isBanned = isUserCommentBanned(u.comment_banned_until);
    let matchBan = true;
    if (banFilter === 'banned') matchBan = isBanned;
    if (banFilter === 'normal') matchBan = !isBanned;

    return matchSearch && matchRank && matchBan;
  });

  return (
    <>
      <div className="admin-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="admin-page__title" style={{ margin: 0 }}>Quản lý Thành viên & Cấp bậc Rank</h1>
          <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '0.95rem' }}>
            Phân cấp bậc Rank, cấp điểm Gold và quản lý quyền bình luận của thành viên trên toàn hệ thống.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="admin-btn admin-btn--secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card stat-card--accent">
          <div className="stat-card__title">Tổng thành viên</div>
          <div className="stat-card__value">{totalCount.toLocaleString('vi-VN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__title">Đang bị cấm bình luận</div>
          <div className="stat-card__value" style={{ color: bannedCount > 0 ? '#ef4444' : 'inherit' }}>
            {bannedCount.toLocaleString('vi-VN')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__title">Hoạt động (30 ngày qua)</div>
          <div className="stat-card__value">{activeCount.toLocaleString('vi-VN')}</div>
        </div>
      </div>

      {/* Toolbar & Search & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1 }}>
          {/* Search Box */}
          <input
            type="text"
            className="logs-search-input"
            placeholder="Tìm kiếm thành viên theo Tên hoặc Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '0.9rem',
              minWidth: '280px'
            }}
          />

          {/* Filter Rank */}
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          >
            <option value="all">Tất cả Cấp bậc Rank</option>
            {RANKS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Filter Ban status */}
          <select
            value={banFilter}
            onChange={(e) => setBanFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="normal">Bình thường</option>
            <option value="banned">🚫 Đang bị cấm bình luận</option>
          </select>
        </div>

        {searchQuery && (
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Tìm thấy <strong>{filteredUsers.length}</strong> thành viên
          </span>
        )}
      </div>

      {/* User Table content */}
      {loading ? (
        <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Đang tải danh sách thành viên...</p>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-empty" style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          background: 'var(--surface)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          color: 'var(--muted)'
        }}>
          <p>Không tìm thấy thành viên nào khớp với điều kiện lọc.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Thành viên</th>
                <th>Cấp bậc Rank (Set Level)</th>
                <th>Điểm Gold</th>
                <th>Quyền Bình luận</th>
                <th>Ngày tham gia</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isBanned = isUserCommentBanned(user.comment_banned_until);
                const userRank = user.rank || 'Kim Ngư';
                const isBusy = actionLoadingId === user.id;

                return (
                  <tr key={user.id}>
                    {/* Thành viên */}
                    <td data-label="Thành viên">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt="avatar" 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }} 
                          />
                        ) : (
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#0f766e',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '14px',
                            flexShrink: 0
                          }}>
                            {(user.display_name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <strong style={{ color: 'var(--text)', fontSize: '14px' }}>
                            {user.display_name || 'Chưa đặt tên'}
                          </strong>
                          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cấp bậc Rank Dropdown */}
                    <td data-label="Cấp bậc Rank">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {RANK_BADGES[userRank] && (
                          <img 
                            src={RANK_BADGES[userRank]} 
                            alt={userRank} 
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              objectFit: 'contain',
                              backgroundColor: '#f8fafc',
                              borderRadius: '50%',
                              padding: '2px',
                              border: '1px solid rgba(0,0,0,0.06)'
                            }} 
                          />
                        )}
                        <select
                          disabled={isBusy}
                          value={userRank}
                          onChange={(e) => handleRankChange(user.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            backgroundColor: RANK_COLORS[userRank] || '#4b5563',
                            color: 'white',
                            border: 'none',
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            outline: 'none'
                          }}
                        >
                          {RANKS.map(r => (
                            <option key={r} value={r} style={{ backgroundColor: '#ffffff', color: '#1e293b' }}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Điểm Gold */}
                    <td data-label="Điểm Gold">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#d97706', fontSize: '0.95rem' }}>
                          🪙 {user.gold_balance || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleGoldChange(user.id, user.gold_balance)}
                          disabled={isBusy}
                          style={{
                            padding: '2px 6px',
                            fontSize: '0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            background: 'none',
                            cursor: 'pointer',
                            color: 'var(--muted)'
                          }}
                          title="Chỉnh sửa số Gold"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>

                    {/* Quyền Bình luận */}
                    <td data-label="Quyền Bình luận">
                      {isBanned ? (
                        <div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fca5a5'
                          }}>
                            🚫 Bị cấm đến:
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px', fontWeight: 600 }}>
                            {formatDateTime(user.comment_banned_until)}
                          </div>
                        </div>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0'
                        }}>
                          ✅ Bình thường
                        </span>
                      )}
                    </td>

                    {/* Ngày tham gia */}
                    <td data-label="Ngày tham gia" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {formatDateTime(user.created_at)}
                    </td>

                    {/* Thao tác cấm / mở khóa */}
                    <td data-label="Thao tác">
                      {isBanned ? (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUnbanComments(user.id, user.display_name)}
                          className="admin-btn admin-btn--sm admin-btn--success"
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                        >
                          {isBusy ? '...' : '✅ Mở khóa'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleBanComments(user.id, user.display_name)}
                          className="admin-btn admin-btn--sm admin-btn--warning"
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                        >
                          {isBusy ? '...' : '🚫 Cấm 1 ngày'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

