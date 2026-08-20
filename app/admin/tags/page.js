'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminTagsPage() {
  const [predefinedTags, setPredefinedTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // Status message
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' }); // type: 'success' | 'error'

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'predefined_tags')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.value) {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setPredefinedTags(parsed || {});
      } else {
        setPredefinedTags({});
      }
    } catch (err) {
      console.error('[AdminTags] Lỗi tải tags:', err);
    } finally {
      setLoading(false);
    }
  }

  // ── Thêm Nhóm Tag Mới (Parent Tag) ──
  const handleAddParentGroup = () => {
    const newName = `Nhóm Tag Mới ${Object.keys(predefinedTags).length + 1}`;
    if (predefinedTags[newName]) {
      alert('Nhóm tag này đã tồn tại!');
      return;
    }
    setPredefinedTags((prev) => ({
      ...prev,
      [newName]: [],
    }));
  };

  // ── Đổi tên Nhóm Tag ──
  const handleRenameParent = (oldName, newName) => {
    const name = newName.trim();
    if (!name || name === oldName) return;

    if (predefinedTags[name]) {
      alert('Tên nhóm tag này đã tồn tại!');
      return;
    }

    setPredefinedTags((prev) => {
      const next = { ...prev };
      next[name] = next[oldName];
      delete next[oldName];
      return next;
    });
  };

  // ── Xóa nhóm tag ──
  const handleDeleteParent = (parent) => {
    if (!confirm('Bạn có chắc muốn xóa nhóm tag này?')) return;
    setPredefinedTags((prev) => {
      const next = { ...prev };
      delete next[parent];
      return next;
    });
  };

  // ── Xóa tag con ──
  const handleRemoveChild = (parent, childToRemove) => {
    setPredefinedTags((prev) => {
      const next = { ...prev };
      next[parent] = next[parent].filter((c) => c !== childToRemove);
      return next;
    });
  };

  // ── Thêm tag con ──
  const handleAddChild = (e, parent) => {
    e.preventDefault();
    const form = e.target;
    const input = form.elements[`childInput_${parent}`];
    const newChild = input.value.trim();

    if (!newChild) return;

    if (predefinedTags[parent].includes(newChild)) {
      alert('Tag con này đã tồn tại trong nhóm!');
      input.value = '';
      return;
    }

    setPredefinedTags((prev) => {
      const next = { ...prev };
      next[parent] = [...next[parent], newChild];
      return next;
    });

    input.value = '';
  };

  // ── Lưu cấu hình ──
  async function handleSave() {
    setSaveLoading(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const { error } = await supabase.from('site_settings').upsert([
        {
          key: 'predefined_tags',
          value: JSON.stringify(predefinedTags),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      showStatus('Đã lưu cấu hình Tags thành công!', 'success');
    } catch (err) {
      console.error('[AdminTags] Lỗi khi lưu tags:', err);
      showStatus('Lỗi: Không thể lưu. ' + err.message, 'error');
    } finally {
      setSaveLoading(false);
    }
  }

  // ── Dọn dẹp tag rác ──
  async function handleCleanup() {
    if (!confirm('Bạn có chắc muốn dọn dẹp? Các tag nằm ngoài cấu hình sẽ bị XÓA VĨNH VIỄN khỏi bài viết.')) return;

    setCleanupLoading(true);
    setStatusMsg({ text: '', type: '' });

    try {
      // Build set of valid tags
      const validTags = new Set();
      for (const parent of Object.keys(predefinedTags)) {
        validTags.add(parent);
        const children = predefinedTags[parent] || [];
        for (const child of children) {
          validTags.add(`${parent}/${child}`);
        }
      }

      // Fetch all posts
      const { data: posts, error: fetchError } = await supabase.from('posts').select('id, tags');
      if (fetchError) throw fetchError;

      let updatedCount = 0;

      for (const post of posts) {
        if (!post.tags || !Array.isArray(post.tags)) continue;

        const oldTags = post.tags;
        const newTags = oldTags.filter((t) => validTags.has(t));

        if (oldTags.length !== newTags.length) {
          const { error: updateError } = await supabase
            .from('posts')
            .update({ tags: newTags })
            .eq('id', post.id);

          if (updateError) {
            console.error(`[AdminTags] Lỗi cập nhật bài ${post.id}`, updateError);
          } else {
            updatedCount++;
          }
        }
      }

      showStatus(`Dọn dẹp hoàn tất! Đã tháo tag rác ở ${updatedCount} bài viết.`, 'success');
    } catch (err) {
      console.error('[AdminTags] Lỗi dọn dẹp tag:', err);
      showStatus('Lỗi dọn dẹp: ' + err.message, 'error');
    } finally {
      setCleanupLoading(false);
    }
  }

  function showStatus(text, type) {
    setStatusMsg({ text, type });
    setTimeout(() => {
      setStatusMsg({ text: '', type: '' });
    }, 4000);
  }

  return (
    <>
      <div className="admin-page__header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="admin-page__title" style={{ marginBottom: '4px' }}>Quản lý Tags</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
            Cấu hình sẵn danh sách Tag cha & Tag con để tiện chọn khi đăng bài.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn"
            style={{ background: 'white', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}
            disabled={cleanupLoading || saveLoading}
            onClick={handleCleanup}
          >
            {cleanupLoading ? 'Đang dọn dẹp...' : 'Dọn dẹp tag rác'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}
            disabled={saveLoading || cleanupLoading}
            onClick={handleSave}
          >
            {saveLoading ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </div>

      {/* Alert Status */}
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

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Đang tải danh sách tags...</p>
      ) : (
        <div className="tags-manager">
          {Object.keys(predefinedTags).map((parent) => {
            const children = predefinedTags[parent] || [];
            return (
              <div className="parent-tag-group" key={parent}>
                {/* Parent Tag Header */}
                <div className="parent-tag-header">
                  <div className="parent-tag-title-wrapper">
                    <svg className="parent-tag-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    <input
                      type="text"
                      defaultValue={parent}
                      className="parent-tag-input"
                      onBlur={(e) => handleRenameParent(parent, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur();
                        }
                      }}
                      title="Bấm để đổi tên nhóm"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-delete-parent"
                    onClick={() => handleDeleteParent(parent)}
                    title="Xóa nhóm này"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>

                {/* Child Tags List */}
                <div className="child-tags-list">
                  {children.map((child) => (
                    <span className="child-tag-pill" key={child}>
                      {child}
                      <button
                        type="button"
                        className="btn-remove-child"
                        onClick={() => handleRemoveChild(parent, child)}
                        title="Xóa tag này"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Child Tag Form */}
                <form className="add-child-form" onSubmit={(e) => handleAddChild(e, parent)}>
                  <div className="add-child-input-wrapper">
                    <svg className="add-child-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <input
                      name={`childInput_${parent}`}
                      type="text"
                      placeholder="Nhập tag con và bấm Enter..."
                      className="add-child-input"
                      autoComplete="off"
                    />
                  </div>
                </form>
              </div>
            );
          })}

          {/* Dotted Add Card inside the Grid */}
          <button
            type="button"
            className="btn-add-parent"
            onClick={handleAddParentGroup}
            disabled={loading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm Nhóm Tag Mới
          </button>
        </div>
      )}
    </>
  );
}
