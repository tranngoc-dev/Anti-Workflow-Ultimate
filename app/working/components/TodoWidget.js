'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, Target, AlertCircle } from 'lucide-react';

export default function TodoWidget({ 
  activeTodo, 
  setActiveTodo, 
  todos = [], 
  onAddTodo, 
  onToggleTodo, 
  onDeleteTodo 
}) {
  // Local state phục vụ form thêm mới
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDeadline, setNewDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    if (onAddTodo) {
      onAddTodo({
        title: newTitle.trim(),
        priority: newPriority,
        deadline: newDeadline || null
      });
    }
    
    // Reset form
    setNewTitle('');
    setNewPriority('medium');
    setNewDeadline('');
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-badge high';
      case 'low': return 'priority-badge low';
      default: return 'priority-badge medium';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'low': return 'Thấp';
      default: return 'Trung bình';
    }
  };

  // Định dạng ngày deadline ngắn gọn để hiển thị (ví dụ: "Hạn: 19 Jun")
  const formatDeadlineDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="todo-widget-container">
      {/* Form thêm mới công việc */}
      <form onSubmit={handleSubmit} className="todo-form">
        <div className="todo-input-row">
          <input
            type="text"
            placeholder="Thêm công việc mới..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="todo-input-text"
            maxLength={150}
          />
          <button type="submit" className="todo-btn-submit" title="Thêm công việc">
            <Plus size={18} />
          </button>
        </div>
        
        <div className="todo-options-row">
          {/* Chọn độ ưu tiên */}
          <div className="todo-option-select">
            <label htmlFor="priority-select">Ưu tiên:</label>
            <select
              id="priority-select"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="todo-select"
            >
              <option value="high">Cao 🔥</option>
              <option value="medium">Trung bình ⚡</option>
              <option value="low">Thấp 💤</option>
            </select>
          </div>

          {/* Chọn deadline */}
          <div className="todo-option-date">
            <label htmlFor="deadline-input">Hạn chót:</label>
            <input
              id="deadline-input"
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="todo-input-date"
            />
          </div>
        </div>
      </form>

      {/* Danh sách công việc */}
      <div className="todo-list-wrapper">
        {todos.length === 0 ? (
          <div className="todo-empty-state">
            <AlertCircle size={32} color="var(--muted)" style={{ opacity: 0.5, marginBottom: '8px' }} />
            <p>Hôm nay anh muốn làm gì nào?</p>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Lên danh sách việc cần làm để bắt đầu tập trung nhé.</span>
          </div>
        ) : (
          <ul className="todo-ul">
            <AnimatePresence initial={false}>
              {todos.map((todo) => {
                const isActive = activeTodo && activeTodo.id === todo.id;
                return (
                  <motion.li
                    key={todo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2 }}
                    className={`todo-li-item ${isActive ? 'active-focus' : ''} ${todo.is_completed ? 'completed' : ''}`}
                  >
                    {/* Checkbox hoàn thành */}
                    <div className="todo-item-left">
                      <input
                        type="checkbox"
                        checked={todo.is_completed}
                        onChange={() => onToggleTodo && onToggleTodo(todo.id, todo.is_completed)}
                        className="todo-checkbox"
                        aria-label={`Đánh dấu hoàn thành: ${todo.title}`}
                      />
                      <span className="todo-item-title">{todo.title}</span>
                    </div>

                    {/* Meta & Actions */}
                    <div className="todo-item-right">
                      {todo.deadline && !todo.is_completed && (
                        <span className="todo-deadline-badge" title="Hạn hoàn thành">
                          <Calendar size={12} />
                          {formatDeadlineDisplay(todo.deadline)}
                        </span>
                      )}
                      
                      <span className={getPriorityBadgeClass(todo.priority)}>
                        {getPriorityLabel(todo.priority)}
                      </span>

                      {/* Nút Focus cho Pomodoro */}
                      {!todo.is_completed && (
                        <button
                          type="button"
                          onClick={() => setActiveTodo && setActiveTodo(isActive ? null : todo)}
                          className={`todo-btn-focus ${isActive ? 'active' : ''}`}
                          title={isActive ? "Bỏ chọn tập trung" : "Chọn làm mục tiêu tập trung"}
                        >
                          <Target size={14} />
                        </button>
                      )}

                      {/* Thống kê cà chua nhỏ bên cạnh task */}
                      {todo.pomodoros_completed > 0 && (
                        <span className="todo-pomo-count" title={`${todo.pomodoros_completed} phiên Pomodoro đã hoàn thành`}>
                          🍅 {todo.pomodoros_completed}
                        </span>
                      )}

                      {/* Nút Xóa */}
                      <button
                        type="button"
                        onClick={() => onDeleteTodo && onDeleteTodo(todo.id)}
                        className="todo-btn-delete"
                        title="Xóa công việc"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
