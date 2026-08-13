'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rpcError, setRpcError] = useState(false);

  // Stats
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setRpcError(false);
    try {
      const { data, error } = await supabase.rpc('get_registered_users');
      if (error) {
        // RPC might not exist yet
        if (error.code === 'PGRST202' || error.message?.includes('does not exist')) {
          setRpcError(true);
        }
        throw error;
      }

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

    // Active users: last sign in in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const active = userList.filter((u) => {
      if (!u.last_sign_in_at) return false;
      return new Date(u.last_sign_in_at) >= thirtyDaysAgo;
    });
    setActiveCount(active.length);

    // New today: registered today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const today = userList.filter((u) => {
      if (!u.created_at) return false;
      return new Date(u.created_at) >= startOfToday;
    });
    setTodayCount(today.length);
  }

  // Get dynamic background color for user avatar based on email characters
  function getAvatarColor(email) {
    if (!email) return '#0f766e';
    const colors = [
      '#0f766e', // teal
      '#0369a1', // blue
      '#15803d', // green
      '#b45309', // orange
      '#be185d', // pink
      '#6d28d9', // purple
      '#4338ca', // indigo
      '#c2410c', // deep orange
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash += email.charCodeAt(i);
    }
    return colors[hash % colors.length];
  }

  function formatDate(dateString) {
    if (!dateString) return 'Chưa có thông tin';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (err) {
      return dateString;
    }
  }

  function formatDateTime(dateString) {
    if (!dateString) return 'Chưa đăng nhập';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      const second = String(date.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} lúc ${hour}:${minute}:${second}`;
    } catch (err) {
      return dateString;
    }
  }

  // Filter users by email or name
  const filteredUsers = users.filter((u) => {
    const emailMatch = u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const metadata = u.raw_user_meta_data || {};
    const name = metadata.name || metadata.full_name || '';
    const nameMatch = name.toLowerCase().includes(searchQuery.toLowerCase());
    return emailMatch || nameMatch;
  });

  // DB Setup Script
  const sqlSetupCommand = `CREATE OR REPLACE FUNCTION public.get_registered_users()
RETURNS TABLE (
  id uuid,
  email varchar,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  raw_user_meta_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Quyền truy cập bị từ chối: Chỉ tài khoản Admin mới được thực thi hàm này.';
  END IF;

  RETURN QUERY
  SELECT u.id, u.email::varchar, u.created_at, u.last_sign_in_at, u.raw_user_meta_data
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_registered_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_registered_users() TO authenticated;`;

  return (
    <>
      <div className="admin-page__header">
        <h1 className="admin-page__title">Danh sách Người dùng Đăng ký</h1>
        <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '0.95rem' }}>
          Xem và tìm kiếm thông tin các thành viên đã đăng ký tài khoản trên website của bạn.
        </p>
      </div>

      {rpcError ? (
        /* Database configuration guide card */
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#b91c1c' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Cần Cấu hình Cơ sở dữ liệu</h2>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Trang này cần gọi một hàm Cơ sở dữ liệu bảo mật (`public.get_registered_users()`) để liệt kê tài khoản người dùng từ Supabase Authentication. 
            Vui lòng sao chép đoạn truy vấn SQL bên dưới, mở **Supabase Dashboard &rarr; SQL Editor &rarr; New Query**, dán vào và bấm **Run** để cài đặt.
          </p>
          
          <pre style={{
            background: '#0f172a',
            color: '#34d399',
            padding: '1.25rem',
            borderRadius: '8px',
            overflowX: 'auto',
            fontSize: '13px',
            fontFamily: 'monospace',
            lineHeight: 1.5,
            border: '1px solid #1e293b',
            maxHeight: '300px',
            marginBottom: '1.5rem'
          }}>
            <code>{sqlSetupCommand}</code>
          </pre>

          <button
            onClick={loadUsers}
            className="admin-btn admin-btn--primary"
            style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: '600' }}
          >
            🔄 Tôi đã cài đặt xong, tải lại trang
          </button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="admin-stats-grid">
            <div className="stat-card stat-card--accent">
              <div className="stat-card__title">Tổng thành viên</div>
              <div className="stat-card__value">{totalCount.toLocaleString('vi-VN')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__title">Hoạt động (30 ngày qua)</div>
              <div className="stat-card__value">{activeCount.toLocaleString('vi-VN')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__title">Thành viên mới hôm nay</div>
              <div className="stat-card__value">{todayCount.toLocaleString('vi-VN')}</div>
            </div>
          </div>

          {/* Search Box */}
          <div className="logs-toolbar" style={{ gap: '1rem', justifyContent: 'flex-start' }}>
            <div className="logs-search-wrapper" style={{ maxWidth: '420px' }}>
              <svg
                className="logs-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="logs-search-input"
                placeholder="Tìm kiếm thành viên theo Tên hoặc Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Tìm thấy <strong>{filteredUsers.length}</strong> kết quả
              </span>
            )}
          </div>

          {/* User Table content */}
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Đang tải danh sách người dùng...</p>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-empty" style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              color: 'var(--muted)'
            }}>
              <p>Không tìm thấy thành viên nào khớp với điều kiện tìm kiếm.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thành viên</th>
                    <th>ID Tài khoản</th>
                    <th>Ngày đăng ký</th>
                    <th>Lần đăng nhập cuối</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const metadata = user.raw_user_meta_data || {};
                    const name = metadata.name || metadata.full_name || 'Chưa cập nhật tên';
                    const initial = name.charAt(0).toUpperCase();
                    const color = getAvatarColor(user.email);

                    // Check active state
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    const isActive = user.last_sign_in_at && new Date(user.last_sign_in_at) >= thirtyDaysAgo;

                    return (
                      <tr key={user.id}>
                        <td data-label="Thành viên">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: color,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '14px',
                              flexShrink: 0
                            }}>
                              {initial}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <strong style={{ color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {name}
                              </strong>
                              <span style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td data-label="ID Tài khoản" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                          {user.id}
                        </td>
                        <td data-label="Ngày đăng ký">
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatDate(user.created_at)}</span>
                        </td>
                        <td data-label="Lần đăng nhập cuối">
                          <span style={{ fontSize: '13px', fontWeight: 500, color: user.last_sign_in_at ? '#0f766e' : '#64748b' }}>
                            {formatDateTime(user.last_sign_in_at)}
                          </span>
                        </td>
                        <td data-label="Trạng thái">
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            background: isActive ? '#ecfdf5' : '#f1f5f9',
                            color: isActive ? '#047857' : '#64748b',
                            border: isActive ? '1px solid #10b981' : '1px solid #cbd5e1'
                          }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: isActive ? '#10b981' : '#94a3b8'
                            }} />
                            {isActive ? 'Hoạt động' : 'Ngoại tuyến'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
