'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('');
  const [excludedIps, setExcludedIps] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['site_name', 'excluded_view_ips']);

        if (error) throw error;

        const settings = Object.fromEntries((data || []).map((item) => [item.key, item.value]));
        if (settings.site_name) {
          setSiteName(settings.site_name);
        }
        setExcludedIps(settings.excluded_view_ips || '');
      } catch (err) {
        console.error('[AdminSettings] Lỗi tải cài đặt:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setStatusMsg({ text: '', type: '' });

    const cleanSiteName = siteName.trim();
    const cleanExcludedIps = excludedIps
      .split(/\r?\n|,/)
      .map((ip) => ip.trim())
      .filter(Boolean)
      .join('\n');

    try {
      const { error } = await supabase.from('site_settings').upsert([
        { key: 'site_name', value: cleanSiteName, updated_at: new Date().toISOString() },
        { key: 'excluded_view_ips', value: cleanExcludedIps, updated_at: new Date().toISOString() },
      ]);

      if (error) throw error;

      // Xóa lập tức các IP này khỏi Nhật ký IP (visit_logs)
      const ipList = cleanExcludedIps.split('\n').map(ip => ip.trim()).filter(Boolean);
      if (ipList.length > 0) {
        const { error: deleteError } = await supabase
          .from('visit_logs')
          .delete()
          .in('ip_address', ipList);
        if (deleteError) {
          console.error('[AdminSettings] Lỗi xóa IP khỏi Nhật ký IP:', deleteError);
        }
      }

      // Lưu cache local để cập nhật tức thì
      localStorage.setItem('site_name', cleanSiteName);

      setStatusMsg({ text: 'Đã lưu thay đổi thành công!', type: 'success' });
      
      // Kích hoạt reload nhẹ để layout đọc lại site name mới
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('[AdminSettings] Lỗi lưu cài đặt:', err);
      setStatusMsg({ text: 'Lỗi: Không thể lưu. ' + err.message, type: 'error' });
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Đang tải cài đặt...</p>;
  }

  return (
    <>
      <div className="admin-page__header">
        <h1 className="admin-page__title">Cài đặt website</h1>
      </div>

      {statusMsg.text && (
        <div
          className="admin-alert"
          style={{
            display: 'block',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            fontWeight: '500',
            backgroundColor: statusMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: statusMsg.type === 'success' ? '#047857' : '#b91c1c',
            border: statusMsg.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
          }}
        >
          {statusMsg.text}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">Thông tin cơ bản</h2>
        </div>
        <div className="admin-card__body">
          <form id="settingsForm" className="admin-form" onSubmit={handleSave}>
            <div className="admin-form__field comment-section__field">
              <label htmlFor="site_name">Tên website</label>
              <input
                type="text"
                id="site_name"
                placeholder="Ví dụ: Tủ lạnh"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                disabled={saveLoading}
              />
              <span style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', display: 'inline-block' }}>
                Tên này sẽ hiển thị ở Header, Footer và Title của các trang ngoài.
              </span>
            </div>

            <div className="admin-form__field comment-section__field" style={{ marginTop: '1.5rem' }}>
              <label htmlFor="excluded_view_ips">IP loại trừ khỏi bộ đếm lượt xem</label>
              <textarea
                id="excluded_view_ips"
                rows="5"
                placeholder="Mỗi dòng một IP, ví dụ:&#10;113.161.1.2&#10;2001:db8::1"
                value={excludedIps}
                onChange={(e) => setExcludedIps(e.target.value)}
                disabled={saveLoading}
              ></textarea>
              <span style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', display: 'inline-block' }}>
                Các IP trong danh sách này sẽ không được tính lượt xem bài viết mới.
              </span>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                id="saveBtn"
                className="admin-btn admin-btn--primary comment-section__submit"
                disabled={saveLoading}
              >
                {saveLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
