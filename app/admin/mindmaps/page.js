'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminMindmapsPage() {
  const [users, setUsers] = useState([]);
  const [mindmaps, setMindmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbSetupError, setDbSetupError] = useState(false);
  const [selectedMapIds, setSelectedMapIds] = useState([]);

  // Stats
  const [totalCount, setTotalCount] = useState(0);
  const [sharedCount, setSharedCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setDbSetupError(false);
    try {
      // 1. Fetch users from RPC get_registered_users
      const { data: usersData, error: usersError } = await supabase.rpc('get_registered_users');
      if (usersError) throw usersError;

      // 2. Fetch all mindmaps
      const { data: mindmapsData, error: mindmapsError } = await supabase.from('mindmaps').select('*');
      if (mindmapsError) {
        if (mindmapsError.message?.includes('does not exist') || mindmapsError.code === 'PGRST202') {
          setDbSetupError(true);
        }
        throw mindmapsError;
      }

      const userList = usersData || [];
      const mapList = mindmapsData || [];

      setUsers(userList);
      setMindmaps(mapList);
      setSelectedMapIds([]);

      // Stats
      setTotalCount(mapList.length);
      setSharedCount(mapList.filter(m => m.is_shared).length);
      setUserCount(new Set(mapList.map(m => m.user_id)).size);
    } catch (err) {
      console.error('[AdminMindmaps] Lỗi tải dữ liệu quản trị:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMapIds(filteredMindmaps.map(map => map.id));
    } else {
      setSelectedMapIds([]);
    }
  };

  const handleSelectMap = (id) => {
    setSelectedMapIds(prev => 
      prev.includes(id) ? prev.filter(mapId => mapId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedMapIds.length) return;
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedMapIds.length} sơ đồ tư duy đã chọn?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('mindmaps').delete().in('id', selectedMapIds);
      if (error) throw error;
      
      loadData();
    } catch (err) {
      console.error('[Bulk Delete] Error:', err);
      alert('Đã xảy ra lỗi khi xóa sơ đồ: ' + err.message);
    }
  };

  // Get User details helper
  function getUserInfo(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return { name: 'Thành viên vô danh', email: 'unknown@user.com' };
    const metadata = user.raw_user_meta_data || {};
    return {
      name: metadata.name || metadata.full_name || 'Chưa cập nhật tên',
      email: user.email || 'no-email@user.com'
    };
  }

  function formatDate(dateString) {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} lúc ${hour}:${minute}`;
    } catch (err) {
      return dateString;
    }
  }

  // Export Mindmap to standlone HTML (Admin Audit tool)
  const handleExportHTML = (map) => {
    const nodes = map.nodes || [];
    const edges = map.edges || [];
    const rootNodes = nodes.filter(n => !edges.some(e => e.target === n.id));
    
    const renderNodeTree = (node, depth = 0) => {
      const children = edges
        .filter(e => e.source === node.id)
        .map(e => nodes.find(n => n.id === e.target))
        .filter(Boolean);
        
      const indent = '  '.repeat(depth * 2);
      
      let htmlString = `${indent}<li class="tree-item" style="--node-color: ${node.data?.color || '#0f766e'}">\n`;
      htmlString += `${indent}  <div class="node-box">\n`;
      htmlString += `${indent}    <h3 class="node-title">${node.data?.label || 'Ý tưởng'}</h3>\n`;
      if (node.data?.content) {
        htmlString += `${indent}    <p class="node-desc">${node.data.content}</p>\n`;
      }
      htmlString += `${indent}  </div>\n`;
      
      if (children.length > 0) {
        htmlString += `${indent}  <ul class="tree-branch">\n`;
        children.forEach(child => {
          htmlString += renderNodeTree(child, depth + 1);
        });
        htmlString += `${indent}  </ul>\n`;
      }
      
      htmlString += `${indent}</li>\n`;
      return htmlString;
    };

    let treeHTML = '<ul class="tree-root">\n';
    if (rootNodes.length > 0) {
      rootNodes.forEach(rn => {
        treeHTML += renderNodeTree(rn);
      });
    } else if (nodes.length > 0) {
      nodes.forEach(n => {
        treeHTML += `  <li class="tree-item" style="--node-color: ${n.data?.color || '#0f766e'}">
    <div class="node-box">
      <h3 class="node-title">${n.data?.label || 'Ý tưởng'}</h3>
      <p class="node-desc">${n.data?.content || ''}</p>
    </div>
  </li>\n`;
      });
    }
    treeHTML += '</ul>';

    const owner = getUserInfo(map.user_id);
    const fullHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bản kiểm duyệt Sơ đồ tư duy - ${map.label}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #fafafa;
      --panel-dark: #ffffff;
      --border-glow: rgba(15, 118, 110, 0.1);
      --font-family: 'Outfit', sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: #1f2937;
      font-family: var(--font-family);
      min-height: 100vh;
      overflow-x: hidden;
      padding: 4rem 2rem;
      position: relative;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: var(--panel-dark);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.02), 0 0 40px rgba(15, 118, 110, 0.04);
    }

    header {
      text-align: center;
      margin-bottom: 4rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      padding-bottom: 2rem;
    }

    .header-logo {
      font-weight: 800;
      letter-spacing: 0.15em;
      background: linear-gradient(135deg, #0f766e 0%, #0d6d66 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }

    h1 {
      font-size: 2.8rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
      color: #1f2937;
    }

    .subtitle {
      color: #6b7280;
      font-size: 1.1rem;
      font-weight: 300;
    }

    .meta-audit {
      margin-top: 1rem;
      font-size: 0.85rem;
      color: #94a3b8;
    }

    ul {
      list-style-type: none;
    }

    .tree-root > .tree-item {
      padding-left: 0;
    }

    .tree-item {
      padding-left: 2rem;
      position: relative;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }

    .tree-item::before {
      content: '';
      position: absolute;
      left: 0rem;
      top: -0.5rem;
      height: calc(100% + 1rem);
      width: 1px;
      background: rgba(0, 0, 0, 0.08);
    }

    .tree-item:last-child::before {
      height: 2.2rem;
    }

    .tree-item::after {
      content: '';
      position: absolute;
      left: 0rem;
      top: 1.7rem;
      width: 1.5rem;
      height: 1px;
      background: rgba(0, 0, 0, 0.08);
    }

    .node-box {
      background: #ffffff;
      border-left: 4px solid var(--node-color);
      border-radius: 12px;
      padding: 1.2rem 1.8rem;
      border-top: 1px solid rgba(0, 0, 0, 0.04);
      border-right: 1px solid rgba(0, 0, 0, 0.04);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-block;
      min-width: 280px;
      max-width: 100%;
    }

    .node-box:hover {
      background: #f9fafb;
      transform: translateX(5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
    }

    .node-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.3rem;
    }

    .node-desc {
      font-size: 0.9rem;
      color: #4b5563;
      line-height: 1.5;
      font-weight: 300;
    }

    .tree-branch {
      margin-top: 0.5rem;
      margin-left: 0.5rem;
    }

    footer.credits {
      text-align: center;
      margin-top: 4rem;
      color: rgba(0, 0, 0, 0.3);
      font-size: 0.8rem;
      font-weight: 300;
    }
  </style>
</head>
<body>

  <div class="container">
    <header>
      <div class="header-logo">Cổng kiểm duyệt Admin</div>
      <h1>Dàn Ý Sơ Đồ Tư Duy</h1>
      <p class="subtitle"><strong>Sơ đồ:</strong> ${map.label} • <strong>Mã số:</strong> ${map.id}</p>
      <div class="meta-audit">
        Thành viên sở hữu: <strong>${owner.name}</strong> (${owner.email}) <br/>
        Cập nhật lần cuối: ${formatDate(map.updated_at)}
      </div>
    </header>

    <main>
      ${treeHTML}
    </main>

    <footer class="credits">
      © ${new Date().getFullYear()} Tủ Lạnh Simple Admin • Dành riêng cho Ban quản trị
    </footer>
  </div>

</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-mindmap-${map.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter mindmaps by Title or Owner Name/Email
  const filteredMindmaps = mindmaps.filter((map) => {
    const titleMatch = map.label.toLowerCase().includes(searchQuery.toLowerCase());
    const owner = getUserInfo(map.user_id);
    const ownerNameMatch = owner.name.toLowerCase().includes(searchQuery.toLowerCase());
    const ownerEmailMatch = owner.email.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || ownerNameMatch || ownerEmailMatch;
  });

  const sqlSetupCommand = `CREATE TABLE IF NOT EXISTS public.mindmaps (
  id text NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_shared boolean NOT NULL DEFAULT false,
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mindmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can insert their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can update their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can delete their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Anyone can view shared mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Admins can do everything" ON public.mindmaps;

CREATE POLICY "Users can view their own mindmaps" ON public.mindmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mindmaps" ON public.mindmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mindmaps" ON public.mindmaps
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mindmaps" ON public.mindmaps
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view shared mindmaps" ON public.mindmaps
  FOR SELECT USING (is_shared = true);

CREATE POLICY "Admins can do everything" ON public.mindmaps
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Create or update the registered users RPC endpoint for the Admin Mindmap control panel
DROP FUNCTION IF EXISTS public.get_registered_users();
CREATE OR REPLACE FUNCTION public.get_registered_users()
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
        <h1 className="admin-page__title">Quản lý Sơ đồ Tư duy (Mindmap)</h1>
        <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '0.95rem' }}>
          Theo dõi, quản trị và duyệt xuất bản sơ đồ tư duy của tất cả thành viên trên website.
        </p>
      </div>

      {dbSetupError ? (
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Cần Cấu hình Bảng dữ liệu Mindmaps</h2>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Bảng `mindmaps` chưa được khởi tạo trong cơ sở dữ liệu Supabase của bạn. 
            Vui lòng sao chép đoạn mã SQL bên dưới, dán vào **SQL Editor &rarr; New Query &rarr; Run** trong Supabase Dashboard để cài đặt bảng và thiết lập quyền bảo mật (RLS) cho Admin.
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
            onClick={loadData}
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
              <div className="stat-card__title">Tổng sơ đồ tư duy</div>
              <div className="stat-card__value">{totalCount.toLocaleString('vi-VN')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__title">Sơ đồ đang chia sẻ</div>
              <div className="stat-card__value">{sharedCount.toLocaleString('vi-VN')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__title">Thành viên thiết kế</div>
              <div className="stat-card__value">{userCount.toLocaleString('vi-VN')}</div>
            </div>
          </div>

          {/* Search Box */}
          <div className="logs-toolbar" style={{ gap: '1rem', justifyContent: 'flex-start' }}>
            <div className="logs-search-wrapper" style={{ maxWidth: '450px' }}>
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
                placeholder="Tìm theo Tên sơ đồ, Tên tác giả hoặc Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
              {searchQuery && (
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  Tìm thấy <strong>{filteredMindmaps.length}</strong> sơ đồ
                </span>
              )}
              {selectedMapIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  Xóa ({selectedMapIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Mindmaps Table Content */}
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Đang tải danh sách sơ đồ tư duy...</p>
          ) : filteredMindmaps.length === 0 ? (
            <div className="admin-empty" style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              color: 'var(--muted)'
            }}>
              <p>Không tìm thấy sơ đồ tư duy nào trong hệ thống.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={filteredMindmaps.length > 0 && selectedMapIds.length === filteredMindmaps.length}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Sơ đồ</th>
                    <th>Tác giả / Sở hữu</th>
                    <th>Ngày cập nhật</th>
                    <th>Trạng thái</th>
                    <th>Tác vụ quản trị</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMindmaps.map((map) => {
                    const owner = getUserInfo(map.user_id);
                    
                    return (
                      <tr key={map.id} style={{ background: selectedMapIds.includes(map.id) ? '#f8fafc' : 'transparent' }}>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedMapIds.includes(map.id)}
                            onChange={() => handleSelectMap(map.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td data-label="Sơ đồ">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>📁</div>
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <strong style={{ color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {map.label}
                              </strong>
                              <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}>
                                ID: {map.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td data-label="Tác giả / Sở hữu">
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <strong style={{ color: '#475569', fontSize: '13.5px' }}>{owner.name}</strong>
                            <span style={{ color: '#64748b', fontSize: '12px' }}>{owner.email}</span>
                          </div>
                        </td>
                        <td data-label="Ngày cập nhật">
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatDate(map.updated_at)}</span>
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
                            background: map.is_shared ? '#ecfdf5' : '#f8fafc',
                            color: map.is_shared ? '#047857' : '#64748b',
                            border: map.is_shared ? '1px solid #10b981' : '1px solid #cbd5e1'
                          }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: map.is_shared ? '#10b981' : '#94a3b8'
                            }} />
                            {map.is_shared ? 'Đang chia sẻ' : 'Riêng tư'}
                          </span>
                        </td>
                        <td data-label="Tác vụ quản trị">
                          <button
                            onClick={() => handleExportHTML(map)}
                            className="admin-btn admin-btn--primary"
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Xuất File .HTML
                          </button>
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
