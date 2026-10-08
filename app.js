(() => {
  'use strict';

  const KEY = 'naik01';
  const THEME_KEY = 'naik01-theme';

  // ---------- State ----------
  const defaultState = () => ({
    date: todayStr(),
    currentTaskId: null,
    usedIds: [],
    streak: 0,
    total: 0,
    lastDoneDate: null,
    previousTaskId: null,
  });

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function yesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw);
      return Object.assign(defaultState(), s);
    } catch {
      return defaultState();
    }
  }

  function saveState(s) {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {
      showMsg('Gagal menyimpan data.');
    }
  }

  let S = loadState();

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const elTitle  = $('taskTitle');
  const elHint   = $('taskHint');
  const elStreak = $('streak');
  const elTotal  = $('total');
  const elLevel  = $('level');
  const elMsg    = $('msg');
  const taskCard = $('taskCard');

  // ---------- Helpers ----------
  function levelFor(total) {
    return Math.min(4, 1 + Math.floor(total / 7));
  }

  function isDoneToday() {
    return S.lastDoneDate === todayStr();
  }

  function pickTask(level, excludeId) {
    const pool = window.TASKS.filter(t => t.level === level && t.id !== excludeId);
    const fresh = pool.filter(t => !S.usedIds.includes(t.id));
    const arr = fresh.length ? fresh : pool;
    if (!arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function ensureTaskForToday() {
    // Hari berganti → reset daftar tugas harian
    if (S.date !== todayStr()) {
      S.date = todayStr();
      S.usedIds = [];
      S.currentTaskId = null;
    }

    // Kalau sudah selesai hari ini, jangan pilih tugas baru
    if (isDoneToday()) {
      S.currentTaskId = null;
      saveState(S);
      return;
    }

    // Pilih tugas kalau belum ada
    if (!S.currentTaskId) {
      const lvl = levelFor(S.total);
      const t = pickTask(lvl, null);
      if (t) {
        S.currentTaskId = t.id;
        if (!S.usedIds.includes(t.id)) S.usedIds.push(t.id);
      }
    }
    saveState(S);
  }

  function currentTask() {
    return window.TASKS.find(t => t.id === S.currentTaskId) || null;
  }

  // ---------- Render ----------
  function render() {
    const done = isDoneToday();
    const t = currentTask();

    if (done) {
      elTitle.textContent = 'Selesai untuk hari ini ✅';
      elHint.textContent = `Streak: ${S.streak} hari. Kembali besok untuk tugas berikutnya.`;
      taskCard.classList.add('is-done');
    } else if (!t) {
      elTitle.textContent = 'Tidak ada tugas tersedia';
      elHint.textContent = 'Coba reset atau tambah data.';
      taskCard.classList.remove('is-done');
    } else {
      elTitle.textContent = t.title;
      elHint.textContent = t.hint || '';
      taskCard.classList.remove('is-done');
    }

    elStreak.textContent = S.streak;
    elTotal.textContent = S.total;
    elLevel.textContent = levelFor(S.total);

    // Nonaktifkan tombol aksi kalau sudah selesai hari ini
    taskCard.querySelectorAll('[data-act]').forEach(btn => {
      btn.disabled = done;
    });
  }

  function showMsg(text) {
    elMsg.textContent = text;
    elMsg.classList.add('show');
    clearTimeout(showMsg._t);
    showMsg._t = setTimeout(() => elMsg.classList.remove('show'), 2200);
  }

  // ---------- Actions ----------
  function actDone() {
    if (isDoneToday()) {
      showMsg('Hari ini sudah selesai 👍');
      return;
    }
    if (!S.currentTaskId) return;

    S.streak = (S.lastDoneDate === yesterdayStr()) ? S.streak + 1 : 1;
    S.lastDoneDate = todayStr();
    S.total += 1;
    S.currentTaskId = null; // penting: bersihkan, jangan pilih tugas baru
    saveState(S);
    render();
    showMsg(`Mantap! Streak: ${S.streak} 🔥`);
  }

  function actSwap() {
    if (isDoneToday()) { showMsg('Hari ini sudah selesai 👍'); return; }
    const lvl = levelFor(S.total);
    const t = pickTask(lvl, S.currentTaskId);
    if (!t) { showMsg('Tidak ada tugas lain.'); return; }
    S.previousTaskId = S.currentTaskId;
    S.currentTaskId = t.id;
    if (!S.usedIds.includes(t.id)) S.usedIds.push(t.id);
    saveState(S);
    render();
    showMsg('Tugas diganti.');
  }

  function actHard() {
    if (isDoneToday()) { showMsg('Hari ini sudah selesai 👍'); return; }
    const lvl = Math.max(1, levelFor(S.total) - 1);
    const pool = window.TASKS.filter(t => t.level === lvl);
    if (!pool.length) return;
    const t = pool[Math.floor(Math.random() * pool.length)];
    S.currentTaskId = t.id;
    if (!S.usedIds.includes(t.id)) S.usedIds.push(t.id);
    saveState(S);
    render();
    showMsg('Level diturunkan sementara.');
  }

  taskCard.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn || btn.disabled) return;
    const act = btn.dataset.act;
    if (act === 'done') actDone();
    else if (act === 'swap') actSwap();
    else if (act === 'hard') actHard();
  });

  // ---------- Theme ----------
  const themeBtn = $('themeBtn');

  function applySavedTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.dataset.theme = saved;
    syncThemeIcon();
  }

  function isDark() {
    const t = document.documentElement.dataset.theme;
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function syncThemeIcon() {
    themeBtn.textContent = isDark() ? '☀️' : '🌙';
  }

  themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    syncThemeIcon();
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem(THEME_KEY)) syncThemeIcon();
  });

  // ---------- Export / Import / Reset ----------
  $('exportBtn').addEventListener('click', () => {
    const data = localStorage.getItem(KEY) || '{}';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naik01-backup-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showMsg('Data diekspor.');
  });

  $('importBtn').addEventListener('click', () => $('importFile').click());

  $('importFile').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (typeof parsed !== 'object' || parsed === null) throw new Error('bad');
        localStorage.setItem(KEY, JSON.stringify(parsed));
        showMsg('Data diimpor. Memuat ulang…');
        setTimeout(() => location.reload(), 500);
      } catch {
        showMsg('File tidak valid.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  $('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset semua data? Tindakan ini tidak bisa dibatalkan.')) return;
    localStorage.removeItem(KEY);
    location.reload();
  });

  // ---------- Init ----------
  applySavedTheme();
  ensureTaskForToday();
  render();

  // Refresh otomatis kalau lewat tengah malam
  setInterval(() => {
    if (S.date !== todayStr()) {
      ensureTaskForToday();
      render();
    }
  }, 60 * 1000);

  // ---------- Service Worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
