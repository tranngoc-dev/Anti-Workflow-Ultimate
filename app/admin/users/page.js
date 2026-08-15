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
  const [editStates, setEditStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rankFilter, setRankFilter] = useState('all');
  const [banFilter, setBanFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Stats
  const [totalCount, setTotalCount] = useState(0);
  const [bannedCount, setBannedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  // Auto hide toast message after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  async function loadUsers() {
    setLoading(true);
    try {
      // 1. Fetch via secure RPC first
      const { data, error } = await supabase.rpc('get_registered_users');
      
      let userList = [];
      if (!error && data) {
        userList = data;
      } else {
        // Fallback: Fetch directly from profiles table
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        userList = (profilesData || []).map(p => ({
          id: p.id,
          email: p.email || '',
          display_name: p.display_name || 'Thành viên',
          avatar_url: p.avatar_url,
          rank: p.rank || 'Kim Ngư',
          gold_balance: p.gold_balance !== null && p.gold_balance !== undefined ? Number(p.gold_balance) : 0,
          comment_banned_until: p.comment_banned_until,
          created_at: p.created_at,
          last_sign_in_at: null
        }));
      }

      setUsers(userList);
      
      // Initialize edit states for each user
      const initialEdits = {};
      userList.forEach(u => {
        initialEdits[u.id] = {
          rank: u.rank || 'Kim Ngư',
          gold_balance: u.gold_balance !== null && u.gold_balance !== undefined ? u.gold_balance : 0
        };
      });
      setEditStates(initialEdits);

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

  // Handle local Rank change in dropdown
  function handleLocalRankChange(userId, newRank) {
    setEditStates(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        rank: newRank
      }
    }));
  }

  // Handle local Gold change in input
  function handleLocalGoldChange(userId, val) {
    setEditStates(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        gold_balance: val === '' ? '' : Math.max(0, parseInt(val, 10) || 0)
      }
    }));
  }

  // Handle SAVE button click to persist changes on Supabase
  async function handleSaveUser(userId, userName) {
    const currentEdit = editStates[userId];
    if (!currentEdit) return;

    const finalGold = currentEdit.gold_balance === '' ? 0 : Number(currentEdit.gold_balance);

    setActionLoadingId(userId);
    try {
      await adminUpdateUserRank(userId, currentEdit.rank, finalGold);
      
      // Update local master user list
      setUsers(prev => prev.map(u => u.id === userId ? {
        ...u,
        rank: currentEdit.rank,
        gold_balance: finalGold
      } : u));

      setEditStates(prev => ({
        ...prev,
        [userId]: {
          rank: currentEdit.rank,
          gold_balance: finalGold
        }
      }));

      setToastMessage(`✅ Đã lưu thành công Cấp bậc (${currentEdit.rank}) & Điểm (${finalGold} Gold) cho "${userName}"!`);
    } catch (err) {
      alert('Lỗi khi lưu thay đổi: ' + (err.message || 'Thử lại sau.'));
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
      setToastMessage(`🚫 Đã khóa quyền bình luận 24h của "${userName}".`);
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
      setToastMessage(`✅ Đã mở khóa quyền bình luận cho "${userName}".`);
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
    const emailMatch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = (u.display_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchSearch = emailMatch || nameMatch;

    const matchRank = rankFilter === 'all' || (u.rank || 'Kim Ngư') === rankFilter;

    const isBanned = isUserCommentBanned(u.comment_banned_until);
    let matchBan = true;
    if (banFilter === 'banned') matchBan = isBanned;
    if (banFilter === 'normal') matchBan = !isBanned;

    return matchSearch && matchRank && matchBan;
  });

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#0f766e',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.9rem',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {toastMessage}
        </div>
      )}

      <div className="admin-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="admin-page__title" style={{ margin: 0 }}>Quản lý Thành viên & Cấp bậc Rank</h1>
          <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '0.95rem' }}>
            Chỉ định Cấp bậc Rank, cấp điểm Gold (kèm nút SAVE) và quản lý quyền bình luận của thành viên.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="admin-btn admin-btn--secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          🔄 Tải lại dữ liệu
        </button>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <span className="admin-stat-card__label">Tổng thành viên</span>
          <strong className="admin-stat-card__value">{totalCount}</strong>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__label">Hoạt động (30 ngày)</span>
          <strong className="admin-stat-card__value" style={{ color: 'var(--accent)' }}>{activeCount}</strong>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__label">Đang bị cấm bình luận</span>
          <strong className="admin-stat-card__value" style={{ color: bannedCount > 0 ? '#ef4444' : 'var(--muted)' }}>
            {bannedCount}
          </strong>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        backgroundColor: 'var(--surface)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px' }}>
          <input
            type="text"
            placeholder="🔍 Tìm theo Tên hoặc Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter by Rank */}
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Rank:</span>
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="all">Tất cả Cấp bậc</option>
            {RANKS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Filter by Ban Status */}
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Bình luận:</span>
          <select
            value={banFilter}
            onChange={(e) => setBanFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="normal">✅ Bình thường</option>
            <option value="banned">🚫 Đang bị cấm</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
          Đang tải dữ liệu thành viên...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{
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
                <th style={{ textAlign: 'center' }}>Lưu thay đổi</th>
                <th>Quyền Bình luận</th>
                <th>Ngày tham gia</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isBanned = isUserCommentBanned(user.comment_banned_until);
                const currentEdit = editStates[user.id] || { rank: user.rank || 'Kim Ngư', gold_balance: user.gold_balance || 0 };
                const isBusy = actionLoadingId === user.id;

                // Kiểm tra xem user có dữ liệu đang sửa đổi chưa lưu không
                const isDirty = (currentEdit.rank !== (user.rank || 'Kim Ngư')) || (Number(currentEdit.gold_balance) !== Number(user.gold_balance || 0));

                return (
                  <tr key={user.id} style={{ backgroundColor: isDirty ? 'rgba(15, 118, 110, 0.04)' : 'transparent' }}>
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
                        {RANK_BADGES[currentEdit.rank] && (
                          <img 
                            src={RANK_BADGES[currentEdit.rank]} 
                            alt={currentEdit.rank} 
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
                          value={currentEdit.rank}
                          onChange={(e) => handleLocalRankChange(user.id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            backgroundColor: RANK_COLORS[currentEdit.rank] || '#4b5563',
                            color: 'white',
                            border: isDirty ? '2px solid var(--accent)' : 'none',
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

                    {/* Điểm Gold Input */}
                    <td data-label="Điểm Gold">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1rem' }}>🪙</span>
                        <input
                          type="number"
                          min="0"
                          disabled={isBusy}
                          value={currentEdit.gold_balance}
                          onChange={(e) => handleLocalGoldChange(user.id, e.target.value)}
                          style={{
                            width: '90px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: isDirty ? '2px solid var(--accent)' : '1px solid var(--border)',
                            backgroundColor: 'var(--bg)',
                            color: '#d97706',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </td>

                    {/* Nút SAVE Lưu thay đổi */}
                    <td data-label="Lưu thay đổi" style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        disabled={isBusy || !isDirty}
                        onClick={() => handleSaveUser(user.id, user.display_name || user.email)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isDirty ? 'var(--accent)' : 'rgba(0,0,0,0.06)',
                          color: isDirty ? '#ffffff' : 'var(--muted)',
                          cursor: (isBusy || !isDirty) ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: isDirty ? '0 2px 6px rgba(15, 118, 110, 0.3)' : 'none',
                          transition: 'all 0.2s ease',
                          transform: isDirty ? 'scale(1.02)' : 'none'
                        }}
                      >
                        {isBusy ? '⏳ Đang lưu...' : isDirty ? '💾 LƯU NGAY' : '✓ Đã lưu'}
                      </button>
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
                          onClick={() => handleUnbanComments(user.id, user.display_name || user.email)}
                          className="admin-btn admin-btn--sm admin-btn--success"
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                        >
                          {isBusy ? '...' : '✅ Mở khóa'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleBanComments(user.id, user.display_name || user.email)}
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
