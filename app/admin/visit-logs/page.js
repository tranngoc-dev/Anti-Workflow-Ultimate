'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';

const PAGE_SIZE = 20;

export default function AdminVisitLogsPage() {
  const [logs, setLogs] = useState([]);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [excludedIps, setExcludedIps] = useState([]);

  // Stats
  const [totalHits, setTotalHits] = useState(0);
  const [hitsToday, setHitsToday] = useState(0);
  const [uniqueIps, setUniqueIps] = useState(0);

  // Modals / Loading actions
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Copy IP feedback state
  const [copiedIp, setCopiedIp] = useState('');

  // 1. Load initial metadata
  useEffect(() => {
    async function loadExclusions() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'excluded_view_ips')
          .single();
        if (data?.value) {
          const ips = data.value
            .split(/\r?\n|,/)
            .map((ip) => ip.trim())
            .filter(Boolean);
          setExcludedIps(ips);
        }
      } catch (err) {
        console.warn('Không tải được danh sách IP loại trừ', err);
      }
    }
    loadExclusions();
  }, []);

  // 2. Load stats & logs when page/query/exclusions change
  useEffect(() => {
    loadStats();
    loadLogs();
  }, [currentPage, searchQuery, excludedIps]);

  async function loadStats() {
    try {
      const { data, error } = await supabase.rpc('get_visit_logs_stats');
      if (error) throw error;

      const stats = Array.isArray(data) ? data[0] : data;
      if (stats) {
        setTotalHits(Number(stats.total_hits || 0));
        setHitsToday(Number(stats.hits_today || 0));
        setUniqueIps(Number(stats.unique_ips || 0));
      }
    } catch (err) {
      console.warn('Lỗi khi gọi RPC get_visit_logs_stats, thử đếm client-side:', err);
      // Fallback
      try {
        const { count: totalCount } = await supabase.from('visit_logs').select('*', { count: 'exact', head: true });
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const { count: todayCount } = await supabase
          .from('visit_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfToday.toISOString());

        setTotalHits(totalCount || 0);
        setHitsToday(todayCount || 0);
        setUniqueIps('N/A');
      } catch (fallbackErr) {
        console.error('Không thể load stats:', fallbackErr);
      }
    }
  }

  async function loadLogs() {
    setLoading(true);
    try {
      let query = supabase
        .from('visit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchQuery.trim()) {
        query = query.or(`ip_address.ilike.%${searchQuery.trim()}%,page_path.ilike.%${searchQuery.trim()}%`);
      }

      if (excludedIps.length > 0) {
        query = query.not('ip_address', 'in', `(${excludedIps.join(',')})`);
      }

      // Pagination
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      setLogs(data || []);
      setTotalLogsCount(count || 0);
    } catch (err) {
      console.error('[VisitLogs] Lỗi tải nhật ký:', err);
    } finally {
      setLoading(false);
    }
  }

  // ── Xuất CSV ──
  async function handleExportCSV() {
    setExportLoading(true);
    try {
      let query = supabase
        .from('visit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000);

      if (searchQuery.trim()) {
        query = query.or(`ip_address.ilike.%${searchQuery.trim()}%,page_path.ilike.%${searchQuery.trim()}%`);
      }

      if (excludedIps.length > 0) {
        query = query.not('ip_address', 'in', `(${excludedIps.join(',')})`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        alert('Không có dữ liệu để xuất.');
        return;
      }

      const headers = ['Thời gian', 'IP', 'Trang truy cập', 'HĐH', 'Trình duyệt', 'Referrer'];
      const csvRows = [headers.join(',')];

      for (const log of data) {
        const uaParsed = parseUserAgent(log.user_agent);
        const date = formatVisitTime(log.created_at);
        const cleanReferrer = log.referrer || 'Trực tiếp';
        const row = [
          `"${date}"`,
          `"${log.ip_address || ''}"`,
          `"${log.page_path || ''}"`,
          `"${uaParsed.os}"`,
          `"${uaParsed.browser}"`,
          `"${cleanReferrer.replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nhat-ky-ip-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Lỗi xuất CSV: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  }

  // ── Xóa toàn bộ logs ──
  async function handleConfirmClear() {
    setClearLoading(true);
    try {
      const { error } = await supabase
        .from('visit_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all logs

      if (error) throw error;
      setShowConfirmModal(false);
      setCurrentPage(1);
      loadStats();
      loadLogs();
    } catch (err) {
      alert('Không thể dọn dẹp nhật ký: ' + err.message);
    } finally {
      setClearLoading(false);
    }
  }

  // ── Copy IP ──
  const handleCopyIp = (ip) => {
    navigator.clipboard.writeText(ip)
      .then(() => {
        setCopiedIp(ip);
        setTimeout(() => setCopiedIp(''), 1000);
      });
  };

  // ── Helpers Phân tích UA ──
  function parseUserAgent(ua) {
    if (!ua) return { os: 'Không rõ', osClass: 'khac', browser: 'Không rõ', browserClass: 'khac' };

    let os = 'Khác';
    let osClass = 'khac';

    if (ua.includes('Windows')) {
      os = 'Windows';
      osClass = 'windows';
    } else if (ua.includes('Macintosh') || ua.includes('Mac OS')) {
      os = 'macOS';
      osClass = 'macos';
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      os = 'iOS';
      osClass = 'ios';
    } else if (ua.includes('Android')) {
      os = 'Android';
      osClass = 'android';
    } else if (ua.includes('Linux')) {
      os = 'Linux';
      osClass = 'linux';
    }

    let browser = 'Khác';
    let browserClass = 'khac';

    if (ua.includes('Firefox')) {
      browser = 'Firefox';
      browserClass = 'firefox';
    } else if (ua.includes('Edge') || ua.includes('Edg')) {
      browser = 'Edge';
      browserClass = 'edge';
    } else if (ua.includes('Chrome')) {
      browser = 'Chrome';
      browserClass = 'chrome';
    } else if (ua.includes('Safari')) {
      browser = 'Safari';
      browserClass = 'safari';
    } else if (ua.includes('Opera') || ua.includes('OPR')) {
      browser = 'Opera';
      browserClass = 'opera';
    }

    return { os, osClass, browser, browserClass };
  }

  function formatVisitTime(dateString) {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      const second = String(date.getSeconds()).padStart(2, '0');

      return `${day}/${month}/${year} lúc ${hour}:${minute}:${second}`;
    } catch (err) {
      return dateString;
    }
  }

  return (
    <>
      <div className="admin-page__header">
        <h1 className="admin-page__title">Nhật ký IP Truy cập</h1>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="stat-card stat-card--accent">
          <div className="stat-card__title">Tổng lượt truy cập (Hits)</div>
          <div className="stat-card__value">{totalHits.toLocaleString('vi-VN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__title">Lượt truy cập hôm nay</div>
          <div className="stat-card__value">{hitsToday.toLocaleString('vi-VN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__title">Số địa chỉ IP duy nhất (Unique)</div>
          <div className="stat-card__value">{uniqueIps.toLocaleString('vi-VN')}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="logs-toolbar" style={{ gap: '1rem' }}>
        <div className="logs-search-wrapper">
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
            placeholder="Tìm theo địa chỉ IP hoặc đường dẫn trang..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleExportCSV}
            className="admin-btn admin-btn--ghost"
            style={{ margin: 0, padding: '8px 16px' }}
            disabled={exportLoading}
          >
            {exportLoading ? 'Đang xuất...' : '📥 Xuất CSV'}
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="admin-btn admin-btn--danger"
            style={{ margin: 0, padding: '8px 16px' }}
          >
            🗑 Dọn dẹp nhật ký
          </button>
        </div>
      </div>

      {/* Table content */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Đang tải nhật ký IP...</p>
      ) : logs.length === 0 ? (
        <div className="admin-empty">
          <p>Không tìm thấy nhật ký IP truy cập nào khớp với tìm kiếm.</p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Địa chỉ IP</th>
                  <th>Trang truy cập</th>
                  <th>Thiết bị / Hệ điều hành</th>
                  <th>Trình duyệt</th>
                  <th>Nguồn giới thiệu</th>
                  <th>Thời gian truy cập</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const uaParsed = parseUserAgent(log.user_agent);
                  const dateFormatted = formatVisitTime(log.created_at);
                  const cleanReferrer = log.referrer === 'Trực tiếp' ? 'Trực tiếp' : log.referrer;
                  const referrerDisplay =
                    cleanReferrer.length > 30 ? cleanReferrer.substring(0, 30) + '...' : cleanReferrer;

                  return (
                    <tr key={log.id}>
                      <td data-label="Địa chỉ IP">
                        <div className="ip-address-col">
                          <strong>{log.ip_address}</strong>
                          <button
                            className="btn-copy-ip"
                            title="Sao chép IP"
                            onClick={() => handleCopyIp(log.ip_address)}
                            style={{ color: copiedIp === log.ip_address ? '#15803d' : '' }}
                          >
                            {copiedIp === log.ip_address ? (
                              '✓'
                            ) : (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            )}
                          </button>
                          <a
                            href={`https://ipinfo.io/${log.ip_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Xem thông tin chi tiết IP"
                            style={{ color: 'var(--muted)', fontSize: '11px' }}
                          >
                            🛈
                          </a>
                        </div>
                      </td>
                      <td data-label="Trang truy cập" style={{ wordBreak: 'break-all' }}>
                        <a
                          href={log.page_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="page-link-badge"
                          title={log.page_path}
                        >
                          {log.page_path}
                        </a>
                      </td>
                      <td data-label="Thiết bị / HĐH">
                        <span className={`badge-os os-${uaParsed.osClass}`}>{uaParsed.os}</span>
                      </td>
                      <td data-label="Trình duyệt">
                        <span className={`badge-browser browser-${uaParsed.browserClass}`}>{uaParsed.browser}</span>
                      </td>
                      <td data-label="Nguồn giới thiệu" style={{ wordBreak: 'break-all' }}>
                        <div className="referrer-cell" title={log.referrer}>
                          {referrerDisplay}
                        </div>
                      </td>
                      <td data-label="Thời gian truy cập" style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{dateFormatted}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="pagination-bar">
            <div className="pagination-info">
              Hiển thị{' '}
              <strong>
                {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, totalLogsCount)}
              </strong>{' '}
              trong tổng số <strong>{totalLogsCount}</strong> nhật ký
            </div>
            <div className="pagination-controls">
              <button
                className="admin-btn admin-btn--sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{ margin: 0 }}
              >
                ◀ Trước
              </button>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                Trang {currentPage} / {Math.ceil(totalLogsCount / PAGE_SIZE) || 1}
              </span>
              <button
                className="admin-btn admin-btn--sm"
                disabled={currentPage * PAGE_SIZE >= totalLogsCount}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{ margin: 0 }}
              >
                Sau ▶
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirm Clear Logs Modal */}
      {showConfirmModal && (
        <div
          className="admin-modal-overlay active"
          id="confirm-modal-overlay"
          onClick={(e) => e.target.id === 'confirm-modal-overlay' && setShowConfirmModal(false)}
        >
          <div className="admin-modal">
            <h3 className="admin-modal__title" style={{ color: '#b91c1c' }}>
              ⚠️ Xác nhận dọn dẹp nhật ký
            </h3>
            <p className="admin-modal__text">
              Bạn có chắc chắn muốn xóa toàn bộ lịch sử nhật ký IP truy cập website không? Hành động này sẽ giải phóng
              dung lượng cơ sở dữ liệu và <b>không thể phục hồi</b>.
            </p>
            <div className="admin-modal__footer">
              <button
                className="admin-btn admin-btn--ghost"
                onClick={() => setShowConfirmModal(false)}
                style={{ padding: '8px 16px' }}
                disabled={clearLoading}
              >
                Hủy bỏ
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleConfirmClear}
                style={{ padding: '8px 16px' }}
                disabled={clearLoading}
              >
                {clearLoading ? 'Đang xóa...' : 'Đồng ý xóa hết'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
