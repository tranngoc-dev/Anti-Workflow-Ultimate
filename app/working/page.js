'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { Sparkles, LogOut, Trash2, CheckCircle2, Circle, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from './utils/format';
import './working.css';

export default function WorkingPage() {
  // 1. Quản lý trạng thái Auth
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // 2. State chính của Focus Timer
  const [mode, setMode] = useState('work'); // 'work' | 'short'
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  // 4. Quản lý Tasks
  const [todos, setTodos] = useState([]);
  const [activeTodo, setActiveTodo] = useState(null);
  const [taskInput, setTaskInput] = useState('');

  // 5. Thống kê (Stats)
  const [stats, setStats] = useState({
    sessionsToday: 0,
    focusMinutes: 0,
    tasksDone: 0
  });

  // 6. Ambient Sound & Âm báo
  const [sound, setSound] = useState('none'); // 'none' | 'rain' | 'forest' | 'cafe' | 'wave' | 'wind' | 'lofi' | 'white' | 'chanh-niem'
  const [isMuted, setIsMuted] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.5);

  // 7. Session Log & Toast
  const [logs, setLogs] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [syncStatus, setSyncStatus] = useState('saved'); // 'saved' | 'saving' | 'error'

  // Ref lưu trữ Web Audio API nodes để kiểm soát phát/dừng
  const audioCtxRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const lfoNodeRef = useRef(null);
  const lfoGainRef = useRef(null);
  const lofiIntervalRef = useRef(null);
  const activeOscsRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const chanhNiemAudioRef = useRef(null);
  const masterGainRef = useRef(null);

  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = ambientVolume;
    if (chanhNiemAudioRef.current) chanhNiemAudioRef.current.volume = ambientVolume;
  }, [ambientVolume]);

  // === AUTHENTICATION ===
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session);
      setLoadingAuth(false);
    }).catch((err) => {
      console.error('[Auth] Lỗi lấy session:', err);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoadingAuth(false);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Xin quyền thông báo trình duyệt
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Tải Logs từ localStorage
  useEffect(() => {
    const localLogs = localStorage.getItem('focus_timer_logs');
    if (localLogs) {
      try {
        setLogs(JSON.parse(localLogs));
      } catch (err) {
        console.error('[LocalStorage] Lỗi tải logs:', err);
      }
    }
  }, []);

  // Tải dữ liệu ban đầu từ Supabase khi đăng nhập thành công
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      setSyncStatus('saving');
      try {
        // Tải Todos
        const { data: todosRes, error: todosErr } = await supabase
          .from('workspace_todos')
          .select('*')
          .order('created_at', { ascending: false });

        if (todosErr) throw todosErr;
        setTodos(todosRes || []);

        // Tính toán số Tasks đã xong
        const completedTasksCount = todosRes?.filter(t => t.is_completed).length || 0;

        // Tải số lượng Pomodoro hoàn thành hôm nay để tính stats
        const todayStr = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
        const { data: pomoRes, error: pomoErr } = await supabase
          .from('workspace_pomodoro_history')
          .select('duration_minutes')
          .gte('completed_at', todayStr);

        if (pomoErr) throw pomoErr;

        const sessionsCount = pomoRes?.length || 0;
        const totalMinutes = pomoRes?.reduce((sum, item) => sum + item.duration_minutes, 0) || 0;

        setStats({
          sessionsToday: sessionsCount,
          focusMinutes: totalMinutes,
          tasksDone: completedTasksCount
        });

        setSyncStatus('saved');
      } catch (err) {
        console.error('[Supabase] Lỗi tải dữ liệu:', err);
        setSyncStatus('error');
      }
    };

    fetchData();
  }, [session]);

  // Cập nhật timeLeft khi thay đổi tab/chế độ
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'work') setTimeLeft(25 * 60);
      else if (mode === 'short') setTimeLeft(5 * 60);
    }
  }, [mode, isRunning]);

  // === WEB AUDIO API — AMBIENT SOUND GENERATOR ===
  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = ambientVolume;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
  };

  const createNoiseBuffer = (ctx) => {
    const bufferSize = ctx.sampleRate * 4; // 4 giây
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.6; // White noise
      }
    }
    return buffer;
  };

  const playLofiLoop = (ctx) => {
    // Vòng hợp âm Lofi Rhodes Piano ấm áp (Fmaj7 -> G6 -> Em7 -> Am7)
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // F3, A3, C4, E4
      [196.00, 246.94, 293.66, 329.63], // G3, B3, D4, E4
      [164.81, 196.00, 246.94, 293.66], // E3, G3, B3, D4
      [220.00, 261.63, 329.63, 392.00]  // A3, C4, E4, G4
    ];

    let chordIdx = 0;

    const triggerChord = (time) => {
      const freqs = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle'; // Sóng triangle êm dịu
        osc.frequency.setValueAtTime(freq, time);

        // Muffled lowpass filter đặc trưng lofi
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, time);

        // Envelope: Fade-in 0.5s, ngân 3s, fade-out chậm
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.20, time + 0.5); // Tăng mức tối đa cho Lofi
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 3.8);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGainRef.current);

        osc.start(time);
        osc.stop(time + 4.0);

        activeOscsRef.current.push(osc);

        setTimeout(() => {
          activeOscsRef.current = activeOscsRef.current.filter(o => o !== osc);
          try { osc.disconnect(); filter.disconnect(); gainNode.disconnect(); } catch(e){}
        }, 4500);
      });
    };

    // Phát ngay lập tức
    const now = ctx.currentTime;
    triggerChord(now);

    // Kích hoạt hợp âm mới mỗi 4 giây
    lofiIntervalRef.current = setInterval(() => {
      triggerChord(ctx.currentTime);
    }, 4000);
  };

  const startAmbientSound = (soundType) => {
    try {
      initAudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Dừng âm thanh đang phát trước đó
      stopAmbientSound();

      if (soundType === 'none') return;

      if (soundType === 'chanh-niem') {
        if (!chanhNiemAudioRef.current) {
          chanhNiemAudioRef.current = new Audio('/sounds/chuong-chanh-niem.mp3');
          chanhNiemAudioRef.current.loop = true;
        }
        chanhNiemAudioRef.current.volume = ambientVolume;
        chanhNiemAudioRef.current.play().catch(e => console.error('[Audio] Lỗi phát chánh niệm:', e));
        return;
      }

      // Xử lý riêng nhạc Lofi
      if (soundType === 'lofi') {
        playLofiLoop(ctx);
        return;
      }

      const source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer(ctx);
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      let targetVolume = 1.0; // Tăng âm lượng gốc lên mức 1.0 theo yêu cầu

      // Cấu hình filter theo đặc tả
      if (soundType === 'rain') {
        filter.type = 'bandpass';
        filter.frequency.value = 1400;
        filter.Q.value = 0.5;
        targetVolume = 1.0;
      } else if (soundType === 'forest') {
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        targetVolume = 1.0;
      } else if (soundType === 'cafe') {
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1.2;
        targetVolume = 1.0;
      } else if (soundType === 'white') {
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        targetVolume = 1.0;
      } else if (soundType === 'wave') {
        // Sóng biển: Lọc lowpass + điều biến âm lượng (volume) tuần hoàn
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        targetVolume = 1.0;
      } else if (soundType === 'wind') {
        // Gió thổi: Lọc bandpass + điều biến tần số cắt (frequency)
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 2.0;
        targetVolume = 1.0;
      }

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      // Fade in 1.5 giây
      gainNode.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 1.5);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGainRef.current);

      source.start();

      sourceNodeRef.current = source;
      gainNodeRef.current = gainNode;

      // Thiết lập Low Frequency Oscillator (LFO) điều biến cho Sóng biển và Gió thổi
      if (soundType === 'wave') {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12; // chu kỳ vỗ khoảng 8 giây

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.07; // dao động gain +/- 0.07

        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain); // Nối vào gain chính

        lfo.start();
        lfoNodeRef.current = lfo;
        lfoGainRef.current = lfoGain;
      } else if (soundType === 'wind') {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08; // chu kỳ rít khoảng 12 giây

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 200; // dao động tần số cắt +/- 200Hz

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency); // Nối vào filter frequency

        lfo.start();
        lfoNodeRef.current = lfo;
        lfoGainRef.current = lfoGain;
      }
    } catch (err) {
      console.error('[WebAudioAPI] Lỗi phát âm thanh nền:', err);
    }
  };

  const stopAmbientSound = () => {
    try {
      if (chanhNiemAudioRef.current) {
        chanhNiemAudioRef.current.pause();
      }

      // Dừng LFO
      if (lfoNodeRef.current) {
        lfoNodeRef.current.stop();
        lfoNodeRef.current.disconnect();
        lfoNodeRef.current = null;
      }
      if (lfoGainRef.current) {
        lfoGainRef.current.disconnect();
        lfoGainRef.current = null;
      }

      // Dừng Lofi Loop
      if (lofiIntervalRef.current) {
        clearInterval(lofiIntervalRef.current);
        lofiIntervalRef.current = null;
      }
      activeOscsRef.current.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch(e){}
      });
      activeOscsRef.current = [];

      // Dừng Noise Buffer
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch (err) {
      console.error('[WebAudioAPI] Lỗi dừng âm thanh nền:', err);
    }
  };

  // Phát tiếng chuông chánh niệm Zen Bell (OscillatorNode)
  const playZenBell = () => {
    if (isMuted) return;
    try {
      initAudioCtx();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Hàm phụ phát 1 hồi chuông ngân vang
      const ringBell = (startTime) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, startTime); // Tần số La chuẩn (A4)
        
        // Ngân vang và giảm dần âm lượng
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(1.0, startTime + 0.05); // Âm lượng max
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 3);
      };

      // Kêu 3 lần liên tiếp cách nhau 1.5 giây
      ringBell(now);
      ringBell(now + 1.5);
      ringBell(now + 3.0);
    } catch (err) {
      console.error('[WebAudioAPI] Lỗi phát chuông Zen:', err);
    }
  };

  // Phát tiếng bíp báo thức Alarm
  const playAlarmBeep = () => {
    if (isMuted) return;
    try {
      initAudioCtx();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const beep = (startTime) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, startTime); // Tần số cao hơn (A5)

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.9, startTime + 0.02); // Tăng mức báo thức
        gain.gain.setValueAtTime(0.9, startTime + 0.18);
        gain.gain.linearRampToValueAtTime(0, startTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      };

      // Kêu 2 lần ngắn
      beep(now);
      beep(now + 0.3);
    } catch (err) {
      console.error('[WebAudioAPI] Lỗi phát chuông Alarm:', err);
    }
  };

  // === TIMER CONTROL LOGIC ===
  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    // Nếu chọn âm thanh nền, phát luôn
    if (sound !== 'none') {
      startAmbientSound(sound);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    stopAmbientSound();
  };

  const resetTimer = () => {
    setIsRunning(false);
    stopAmbientSound();
    if (mode === 'work') setTimeLeft(25 * 60);
    else if (mode === 'short') setTimeLeft(5 * 60);
  };

  const handleSwitchMode = (newMode) => {
    if (isRunning) return; // Khóa không cho chuyển chế độ khi timer đang chạy
    setMode(newMode);
  };

  // Đếm ngược mỗi giây
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, mode, sound]);

  // Xử lý tự động khi timeLeft về 0
  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      handleTimerComplete();
    }
  }, [timeLeft, isRunning]);

  // Xử lý khi hoàn thành phiên
  const handleTimerComplete = async () => {
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    let newLog = null;

    if (mode === 'work') {
      // Hết phiên làm việc
      playZenBell();
      triggerToast('Phiên xong! Nghỉ ngơi đi anh nhé 🎉');
      sendBrowserNotification('Phiên xong! 🎉', activeTodo ? `Hoàn thành 25 phút tập trung cho: "${activeTodo.title}". Nghỉ ngơi tí anh nhé!` : 'Hoàn thành 25 phút tập trung. Nghỉ ngơi tí anh nhé!');
      
      newLog = {
        id: Math.random().toString(36).substr(2, 9),
        isWork: true,
        label: `25 phút làm việc`,
        time: timestamp
      };

      // Ghi Supabase
      if (session) {
        setSyncStatus('saving');
        try {
          // 1. Thêm lịch sử pomodoro
          const { error: histErr } = await supabase
            .from('workspace_pomodoro_history')
            .insert({
              user_id: session.user.id,
              todo_id: activeTodo ? activeTodo.id : null,
              duration_minutes: 25
            });

          if (histErr) throw histErr;

          // 2. Tăng số cà chua tích lũy của active task
          if (activeTodo) {
            const { error: rpcErr } = await supabase.rpc('increment_todo_pomodoro', { todo_id_arg: activeTodo.id });
            if (rpcErr) throw rpcErr;

            // Cập nhật UI local
            setTodos(prev => prev.map(t => t.id === activeTodo.id ? { ...t, pomodoros_completed: t.pomodoros_completed + 1 } : t));
            setActiveTodo(prev => prev ? { ...prev, pomodoros_completed: prev.pomodoros_completed + 1 } : null);
          }

          setStats(prev => ({
            ...prev,
            sessionsToday: prev.sessionsToday + 1,
            focusMinutes: prev.focusMinutes + 25
          }));
          setSyncStatus('saved');
        } catch (err) {
          console.error('[Supabase] Lỗi lưu lịch sử:', err);
          setSyncStatus('error');
        }
      }
    } else {
      // Hết phiên nghỉ ngơi
      playAlarmBeep();
      triggerToast('Xong nghỉ! Sẵn sàng làm tiếp chưa? 💪');
      sendBrowserNotification('Xong nghỉ! 💪', 'Quay lại công việc thôi anh em mình ơi!');

      newLog = {
        id: Math.random().toString(36).substr(2, 9),
        isWork: false,
        label: `5 phút nghỉ ngơi`,
        time: timestamp
      };
    }

    // Cập nhật logs local
    if (newLog) {
      setLogs((prev) => {
        const nextLogs = [newLog, ...prev].slice(0, 10);
        localStorage.setItem('focus_timer_logs', JSON.stringify(nextLogs));
        return nextLogs;
      });
    }

    // Lặp lại liên tục: Chuyển mode và thiết lập lại thời gian
    if (mode === 'work') {
      setMode('short');
      setTimeLeft(5 * 60);
    } else {
      setMode('work');
      setTimeLeft(25 * 60);
    }
  };

  // Toast helper
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Browser Notification helper
  const sendBrowserNotification = (title, body) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/images/fridge-logo.png' });
      } catch (err) {
        console.error('[NotificationAPI] Lỗi gửi thông báo:', err);
      }
    }
  };

  // === TASKS CRUD & SYNC ===
  const handleAddTask = async (e) => {
    if (e) e.preventDefault();
    if (!taskInput.trim() || taskInput.length > 60 || !session) return;

    setSyncStatus('saving');
    const newTodoPayload = {
      title: taskInput.trim(),
      user_id: session.user.id,
      is_completed: false,
      pomodoros_completed: 0,
      priority: 'med'
    };

    try {
      const { data, error } = await supabase
        .from('workspace_todos')
        .insert(newTodoPayload)
        .select()
        .single();

      if (error) throw error;
      setTodos([data, ...todos]);
      setTaskInput('');
      setSyncStatus('saved');
    } catch (err) {
      console.error('[Supabase] Lỗi thêm task:', err);
      setSyncStatus('error');
    }
  };

  const handleToggleTodo = async (todoId, currentStatus) => {
    if (!session) return;

    setSyncStatus('saving');
    const nextStatus = !currentStatus;

    // Optimistic Update
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, is_completed: nextStatus } : t));
    setStats(prev => ({ ...prev, tasksDone: prev.tasksDone + (nextStatus ? 1 : -1) }));
    if (nextStatus && activeTodo && activeTodo.id === todoId) {
      setActiveTodo(null);
    }

    try {
      const { error } = await supabase
        .from('workspace_todos')
        .update({ is_completed: nextStatus })
        .eq('id', todoId);

      if (error) throw error;
      setSyncStatus('saved');
    } catch (err) {
      console.error('[Supabase] Lỗi cập nhật task:', err);
      // Rollback
      setTodos(prev => prev.map(t => t.id === todoId ? { ...t, is_completed: currentStatus } : t));
      setStats(prev => ({ ...prev, tasksDone: prev.tasksDone + (currentStatus ? 1 : -1) }));
      setSyncStatus('error');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (!session) return;

    setSyncStatus('saving');
    const originalTodos = [...todos];
    const isCompleted = originalTodos.find(t => t.id === todoId)?.is_completed;

    setTodos(prev => prev.filter(t => t.id !== todoId));
    if (isCompleted) {
      setStats(prev => ({ ...prev, tasksDone: Math.max(0, prev.tasksDone - 1) }));
    }
    if (activeTodo && activeTodo.id === todoId) {
      setActiveTodo(null);
    }

    try {
      const { error } = await supabase
        .from('workspace_todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;
      setSyncStatus('saved');
    } catch (err) {
      console.error('[Supabase] Lỗi xóa task:', err);
      setTodos(originalTodos);
      if (isCompleted) {
        setStats(prev => ({ ...prev, tasksDone: originalTodos.filter(t => t.is_completed).length }));
      }
      setSyncStatus('error');
    }
  };

  const handleSelectTodo = (todo) => {
    if (todo.is_completed) return;
    if (activeTodo && activeTodo.id === todo.id) {
      setActiveTodo(null); // Bỏ chọn nếu click lại
    } else {
      setActiveTodo(todo);
    }
  };

  // Thay đổi loại nhạc nền
  const handleToggleSound = (type) => {
    setSound(type);
    if (isRunning) {
      startAmbientSound(type);
    }
  };

  // Google Sign In
  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/working` : undefined,
        },
      });
    } catch (err) {
      console.error('[Auth] Lỗi đăng nhập Google:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Auth] Lỗi đăng xuất:', err);
    }
  };

  // Tĩnh toán % SVG Ring
  const totalSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const pct = timeLeft / totalSeconds;
  const strokeDashoffset = 326.7 * (1 - pct);

  // Dọn dẹp ref khi unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Trạng thái LOADING AUTH
  if (loadingAuth) {
    return (
      <div className="flex h-screen bg-[#FAFAF7] text-gray-600 items-center justify-center font-mono text-sm">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '3px solid #3B6D11', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'working-spin 0.8s linear infinite' 
          }}></div>
          <style>{`@keyframes working-spin { to { transform: rotate(360deg); } }`}</style>
          <span>Đang kết nối không gian làm việc...</span>
        </div>
      </div>
    );
  }

  // Trạng thái CHƯA ĐĂNG NHẬP (Render màn hình Google Auth tối giản)
  if (!session) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', left: '15%', width: '300px', height: '300px', background: 'rgba(59, 109, 17, 0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '24px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #3B6D11 0%, #2E560D 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(59, 109, 17, 0.15)',
            marginBottom: '24px'
          }}>
            <Sparkles width="28" height="28" color="#ffffff" strokeWidth={2.5} />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1C1C1E', marginBottom: '8px', letterSpacing: '-0.02em' }}>Ngăn Đá Focus Timer</h1>
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#3B6D11', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px' }}>Tập trung • Trực quan • Hiệu quả</p>

          <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.06)', marginBottom: '24px' }} />

          <p style={{ fontSize: '14px', color: '#8E8E93', lineHeight: 1.6, marginBottom: '32px' }}>
            Không gian đếm giờ Pomodoro tối giản với âm thanh mưa rừng, danh sách việc cần làm đồng bộ trực tuyến và nhật ký phiên hôm nay.
          </p>

          <button
            onClick={handleSignIn}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#1C1C1E',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '15px',
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#000000'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#1C1C1E'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Đăng nhập bằng Google
          </button>

          <a href="/" style={{ marginTop: '24px', fontSize: '13px', color: '#3B6D11', textDecoration: 'none', fontWeight: 600 }}>
            🏠 Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  // Trạng thái ĐÃ ĐĂNG NHẬP
  return (
    <main className={`working-container theme-${mode}`}>
      {/* Toast Notification */}
      <div className={`toast-container ${showToast ? 'show' : ''}`}>
        {toastMsg}
      </div>

      <div className="working-inner">
        {/* Status Bar */}
        <div className="working-top-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
          <span className="sync-status" style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: syncStatus === 'saved' ? '#3B6D11' : (syncStatus === 'saving' ? '#F59E0B' : '#EF4444')
            }}></span>
            {syncStatus === 'saved' ? 'Đã đồng bộ đám mây' : (syncStatus === 'saving' ? 'Đang lưu...' : 'Lỗi đồng bộ')}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Xin chào, <strong>{session.user.user_metadata?.full_name || session.user.email}</strong>
          </span>
        </div>

        <div className="working-grid">
          <div className="working-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Thẻ đếm giờ Pomodoro */}
            <section className="focus-card">
              {/* Nhãn chế độ hiện tại */}
              <div style={{ textAlign: 'center', fontSize: '15px', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {mode === 'work' ? 'Phiên Làm Việc (25p)' : 'Phiên Nghỉ Ngơi (5p)'}
              </div>

              {/* Vòng tròn Timer */}
              <div className="timer-ring-container">
                <svg viewBox="0 0 120 120" className="timer-ring-svg">
                  <circle cx="60" cy="60" r="52" strokeWidth="5" fill="none" className="timer-ring-bg" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="52" 
                    strokeWidth="5" 
                    fill="none" 
                    strokeLinecap="round"
                    strokeDasharray="326.7"
                    strokeDashoffset={strokeDashoffset}
                    className="timer-ring-progress"
                  />
                </svg>
                <div className="timer-time-text">
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="current-task-row" style={{ fontSize: '14px' }}>
                <span>Đang làm:</span>
                <span className="current-task-name">
                  {activeTodo ? activeTodo.title : 'Chưa chọn việc'}
                </span>
              </div>

              {/* Stats Row */}
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-label">Phiên hôm nay</span>
                  <span className="stat-value">{stats.sessionsToday}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Phút tập trung</span>
                  <span className="stat-value">{stats.focusMinutes}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Việc xong</span>
                  <span className="stat-value">{stats.tasksDone}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="controls-row">
                {isRunning ? (
                  <button onClick={pauseTimer} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pause size={18} fill="#ffffff" /> Tạm dừng
                  </button>
                ) : (
                  <button onClick={startTimer} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={18} fill="#ffffff" /> Bắt đầu
                  </button>
                )}
                <button onClick={resetTimer} className="btn-secondary" title="Thiết lập lại">
                  <RotateCcw size={18} />
                </button>
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="btn-secondary" 
                  title={isMuted ? 'Bật chuông báo' : 'Tắt chuông báo'}
                  style={{ padding: '12px' }}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            </section>

            {/* Ambient Sound */}
            <section className="focus-card">
              <div className="sound-section">
                <span className="sound-title">Âm thanh nền</span>
                <div className="sound-row">
                  <button onClick={() => handleToggleSound('none')} className={`sound-btn ${sound === 'none' ? 'active' : ''}`}>Tắt</button>
                  <button onClick={() => handleToggleSound('chanh-niem')} className={`sound-btn ${sound === 'chanh-niem' ? 'active' : ''}`}>🔔 Chánh Niệm</button>
                  <button onClick={() => handleToggleSound('rain')} className={`sound-btn ${sound === 'rain' ? 'active' : ''}`}>🌧 Mưa</button>
                  <button onClick={() => handleToggleSound('forest')} className={`sound-btn ${sound === 'forest' ? 'active' : ''}`}>🌿 Rừng</button>
                  <button onClick={() => handleToggleSound('cafe')} className={`sound-btn ${sound === 'cafe' ? 'active' : ''}`}>☕ Cà phê</button>
                  <button onClick={() => handleToggleSound('wave')} className={`sound-btn ${sound === 'wave' ? 'active' : ''}`}>🌊 Sóng biển</button>
                  <button onClick={() => handleToggleSound('wind')} className={`sound-btn ${sound === 'wind' ? 'active' : ''}`}>🍃 Gió thổi</button>
                  <button onClick={() => handleToggleSound('lofi')} className={`sound-btn ${sound === 'lofi' ? 'active' : ''}`}>🎹 Nhạc Lofi</button>
                  <button onClick={() => handleToggleSound('white')} className={`sound-btn ${sound === 'white' ? 'active' : ''}`}>〰 Noise</button>
                </div>
                {sound !== 'none' && (
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
                    <span style={{ fontSize: '13px', color: '#8E8E93', fontWeight: 500 }}>Âm lượng:</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05" 
                      value={ambientVolume}
                      onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                      style={{ flex: 1, accentColor: '#3B6D11' }}
                    />
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="working-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Danh sách Tasks */}
            <section className="focus-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="task-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <form onSubmit={handleAddTask} className="task-input-row">
                  <input 
                    type="text" 
                    value={taskInput} 
                    onChange={(e) => setTaskInput(e.target.value)} 
                    placeholder="Thêm việc cần làm..." 
                    maxLength="60"
                    className="task-input"
                  />
                  <button type="submit" className="btn-add-task">+</button>
                </form>

                <div className="task-list-container" style={{ flex: 1, maxHeight: 'none' }}>
                  {todos.length === 0 ? (
                    <div className="empty-log" style={{ padding: '24px 0', fontSize: '13px' }}>Chưa có nhiệm vụ nào. Thêm việc ở trên anh nhé!</div>
                  ) : (
                    todos.map((todo) => (
                      <div 
                        key={todo.id} 
                        onClick={() => handleSelectTodo(todo)}
                        className={`task-item ${activeTodo && activeTodo.id === todo.id ? 'active' : ''} ${todo.is_completed ? 'done' : ''}`}
                      >
                        <div className="task-item-left">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTodo(todo.id, todo.is_completed);
                            }}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            {todo.is_completed ? (
                              <CheckCircle2 size={20} color="var(--accent-color)" />
                            ) : (
                              <Circle size={20} color="var(--text-muted)" />
                            )}
                          </button>
                          <span className="task-title" title={todo.title}>{todo.title}</span>
                          {todo.pomodoros_completed > 0 && (
                            <span className="task-pomo-count">🍅 {todo.pomodoros_completed}</span>
                          )}
                        </div>
                        <div className="task-actions">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTodo(todo.id);
                            }}
                            className="btn-task-action delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Nhật ký phiên (Session Log) */}
            <section className="focus-card">
              <div className="log-section">
                <span className="sound-title">Nhật ký hôm nay</span>
                <div className="log-list">
                  {logs.length === 0 ? (
                    <div className="empty-log" style={{ fontSize: '13px' }}>Chưa có phiên nào hôm nay.</div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="log-item" style={{ fontSize: '13px' }}>
                        <span className={`log-dot ${log.isWork ? 'work' : 'break'}`}></span>
                        <span className="log-time">{log.time}</span>
                        <span className="log-desc">{log.label}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
