'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Plus, Trash2, Bold, Italic, List, AlertCircle, FileText } from 'lucide-react';

export default function NotesWidget({
  notes = [],
  activeNoteId,
  setActiveNoteId,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  saveStatus = 'saved'
}) {
  const editorRef = useRef(null);
  const activeNote = notes.find(n => n.id === activeNoteId);
  const [localTitle, setLocalTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Đồng bộ editor và trạng thái isEditing khi activeNoteId thay đổi
  useEffect(() => {
    if (activeNote) {
      setLocalTitle(activeNote.title || '');
      if (editorRef.current && editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content || '';
      }
      setIsEditing(true);
    } else {
      setLocalTitle('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      setIsEditing(false);
    }
  }, [activeNoteId, activeNote]);

  // Xử lý gõ văn bản
  const handleEditorInput = () => {
    if (!activeNote || !onUpdateNote) return;
    const content = editorRef.current.innerHTML;
    onUpdateNote(activeNote.id, {
      title: localTitle,
      content: content
    });
  };

  // Xử lý đổi tiêu đề
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    if (!activeNote || !onUpdateNote) return;
    onUpdateNote(activeNote.id, {
      title: newTitle,
      content: editorRef.current.innerHTML
    });
  };

  // Định dạng text
  const applyFormat = (command) => {
    if (typeof document === 'undefined') return;
    document.execCommand(command, false, null);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleEditorInput();
  };

  const getSaveStatusLabel = () => {
    switch (saveStatus) {
      case 'saving': return 'Đang lưu...';
      case 'error': return 'Lỗi mạng ⚠️';
      case 'unsaved': return 'Chờ lưu...';
      default: return 'Đã lưu ✓';
    }
  };

  return (
    <div className="notes-widget-container">
      {isEditing && activeNote ? (
        /* 1. CHẾ ĐỘ SOẠN THẢO (EDITOR VIEW) - Chiếm 100% chiều rộng widget */
        <div className="notes-editor-area">
          {/* Header: Input Title & Save Status & Nút Hoàn tất */}
          <div className="notes-editor-header">
            <input
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Gọi lưu ngay lập tức và đóng
                  if (onUpdateNote && activeNote) {
                    onUpdateNote(activeNote.id, {
                      title: e.target.value,
                      content: editorRef.current.innerHTML
                    }, true);
                  }
                  setActiveNoteId(null);
                  setIsEditing(false);
                }
              }}
              placeholder="Tiêu đề ghi chú..."
              className="notes-title-input"
              maxLength={80}
            />
            <div className="notes-editor-actions-top">
              <span className={`notes-save-badge ${saveStatus}`}>
                {getSaveStatusLabel()}
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveNoteId(null);
                  setIsEditing(false);
                }}
                className="notes-btn-done"
                title="Quay lại danh sách ghi chú"
              >
                Hoàn tất
              </button>
            </div>
          </div>

          {/* Toolbar định dạng */}
          <div className="notes-toolbar">
            <button 
              type="button" 
              onClick={() => applyFormat('bold')} 
              className="notes-tool-btn" 
              title="In đậm (Ctrl+B)"
            >
              <Bold size={14} />
            </button>
            <button 
              type="button" 
              onClick={() => applyFormat('italic')} 
              className="notes-tool-btn" 
              title="In nghiêng (Ctrl+I)"
            >
              <Italic size={14} />
            </button>
            <button 
              type="button" 
              onClick={() => applyFormat('insertUnorderedList')} 
              className="notes-tool-btn" 
              title="Danh sách gạch đầu dòng"
            >
              <List size={14} />
            </button>
          </div>

          {/* Vùng soạn thảo Rich Text */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // Gọi lưu ngay lập tức và đóng
                if (onUpdateNote && activeNote) {
                  onUpdateNote(activeNote.id, {
                    title: localTitle,
                    content: editorRef.current.innerHTML
                  }, true);
                }
                setActiveNoteId(null);
                setIsEditing(false);
              }
            }}
            className="notes-content-editable"
            placeholder="Soạn thảo ghi chú... (Nhấn Enter để lưu và hoàn tất, Shift+Enter để xuống dòng)"
          />
        </div>
      ) : (
        /* 2. CHẾ ĐỘ XEM DANH SÁCH (LIST VIEW) - Hiển thị card tiêu đề + nội dung */
        <div className="notes-list-view">
          {/* Nút thêm ghi chú lớn ở trên cùng */}
          <button 
            onClick={onAddNote} 
            className="notes-btn-add-main"
            title="Tạo ghi chú mới"
          >
            <Plus size={15} />
            <span>Thêm ghi chú mới</span>
          </button>

          {/* Danh sách các card ghi chú */}
          <div className="notes-cards-scroll">
            {notes.length === 0 ? (
              <div className="notes-empty-list-vertical">
                <span>Chưa có ghi chú nào. Hãy thêm mới để bắt đầu!</span>
              </div>
            ) : (
              notes.map((note) => (
                <div 
                  key={note.id} 
                  className="notes-card"
                  onClick={() => {
                    setActiveNoteId(note.id);
                    setIsEditing(true);
                  }}
                  title="Nhấp để chỉnh sửa"
                >
                  <div className="notes-card-header">
                    <span className="notes-card-title">{note.title || 'Ghi chú mới'}</span>
                    <div className="notes-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setActiveNoteId(note.id);
                          setIsEditing(true);
                        }}
                        className="notes-card-btn edit"
                        title="Sửa ghi chú"
                      >
                        <FileText size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (onDeleteNote) onDeleteNote(note.id);
                        }}
                        className="notes-card-btn delete"
                        title="Xóa ghi chú"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview nội dung HTML */}
                  <div className="notes-card-body">
                    {note.content && note.content.trim() !== '' && note.content !== '<br>' ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: note.content }} 
                        className="notes-card-html-content"
                      />
                    ) : (
                      <span className="notes-card-body-empty">Không có nội dung soạn thảo</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
