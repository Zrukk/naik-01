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
    longestStreak: 0,
    total: 0,
    lastDoneDate: null,
    previousTaskId: null,
    history: [],
    notes: {}, // { 'YYYY-MM-DD': 'text' }
  });

  function dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function todayStr() { return dateKey(new Date()); }

  function yesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return dateKey(d);
  }

  function migrate(s) {
    if (!Array.isArray(s.history)) s.history = [];
    if (typeof s.longestStreak !== 'number') s.longestStreak = s.streak || 0;
    if (s.lastDoneDate && !s.history.includes(s.lastDoneDate)) {
      s.history.push(s.lastDoneDate);
    }
    if (!s.notes || typeof s.notes !== 'object') s.notes = {};
    return s;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw);
      return migrate(Object.assign(defaultState(), s));
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
  const elTitle   = $('taskTitle');
  const elHint    = $('taskHint');
  const elStreak  = $('streak');
  const elTotal   = $('total');
  const elLevel   = $('level');
  const elMsg     = $('msg');
  const taskCard  = $('taskCard');
  const elHeat    = $('heatmap');
  const elHmTotal = $('hmTotal');
  const elHmLong  = $('hmLongest');
  const elNote    = $('noteInput');
  const elNoteSaved = $('noteSaved');
  const elNoteCount = $('noteCount');

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
    if (S.date !== todayStr()) {
      S.date = todayStr();
      S.usedIds = [];
      S.currentTaskId = null;
    }

    if (isDoneToday()) {
      S.currentTaskId = null;
      saveState(S);
      return;
    }

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

  // ---------- Notes ----------
  function pruneNotes() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffKey = dateKey(cutoff);
    Object.keys(S.notes).forEach(k => {
      if (k < cutoffKey) delete S.notes[k];
    });
  }

  function setNote(text) {
    if (!S.notes) S.notes = {};
    const key = todayStr();
    if (text.trim()) S.notes[key] = text;
    else delete S.notes[key];
    pruneNotes();
    saveState(S);
  }

  function loadNoteForToday() {
    if (!elNote) return;
    elNote.value = (S.notes && S.notes[todayStr()]) || '';
    updateNoteCount();
  }

  function updateNoteCount() {
    if (!elNoteCount || !elNote) return;
    elNoteCount.textContent = `${elNote.value.length}/500`;
  }

  let noteTimer = null;
  let savedTimer = null;

  function onNoteInput() {
    updateNoteCount();
    elNoteSaved.textContent = 'Menulis…';
    elNoteSaved.classList.remove('saved');

    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      setNote(elNote.value);
      elNoteSaved.textContent = 'Tersimpan ✓';
      elNoteSaved.classList.add('saved');
      clearTimeout(savedTimer);
      savedTimer = setTimeout(() => {
        elNoteSaved.textContent = 'Tersimpan otomatis';
        elNoteSaved.classList.remove('saved');
      }, 1400);
    }, 400);
  }

  if (elNote) elNote.addEventListener('input', onNoteInput);

  // ---------- Heatmap ----------
  function computeLongestStreak(history) {
    if (!history || !history.length) return 0;
    const sorted = [...history].sort();
    let longest = 1, cur = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i-1] + 'T00:00:00');
      const now  = new Date(sorted[i]   + 'T00:00:00');
      const diff = Math.round((now - prev) / 86400000);
      if (diff === 1) { cur += 1; if (cur > longest) longest = cur; }
      else if (diff > 1) { cur = 1; }
    }
    return longest;
  }

  function renderHeatmap() {
    if (!elHeat) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());

    const startDate = new Date(startOfThisWeek);
    startDate.setDate(startOfThisWeek.getDate() - 11 * 7);

    const historySet = new Set(S.history || []);
    const todayKey = todayStr();
    const frag = document.createDocumentFragment();

    for (let i = 0; i < 84; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = dateKey(d);

      const cell = document.createElement('div');
      cell.className = 'cell';

      const note = S.notes && S.notes[key];
      cell.title = note ? `${key}\n\n${note}` : key;

      if (key === todayKey) cell.classList.add('today');
      if (d > today) cell.classList.add('future');
      else if (historySet.has(key)) cell.classList.add('done');

      frag.appendChild(cell);
    }

    elHeat.innerHTML = '';
    elHeat.appendChild(frag);

    if (elHmTotal) elHmTotal.textContent = `${S.history.length} hari`;
    if (elHmLong) elHmLong.textContent = `Rekor: ${computeLongestStreak(S.history)}`;
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

    taskCard.querySelectorAll('[data-act]').forEach(btn => {
      btn.disabled = done;
    });

    renderHeatmap();
  }

  function showMsg(text) {
    elMsg.textContent = text;
    elMsg.classList.add('show');
    clearTimeout(showMsg._t);
    showMsg._t = setTimeout(() => elMsg.classList.remove('show'), 2200);
  }

  // ---------- Actions ----------
  function actDone() {
    if (isDoneToday()) { showMsg('Hari ini sudah selesai 👍'); return; }
    if (!S.currentTaskId) return;

    S.streak = (S.lastDoneDate === yesterdayStr()) ? S.streak + 1 : 1;
    if (S.streak > (S.longestStreak || 0)) S.longestStreak = S.streak;
    S.lastDoneDate = todayStr();
    S.total += 1;
    if (!S.history.includes(S.lastDoneDate)) S.history.push(S.lastDoneDate);
    S.currentTaskId = null;
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
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

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

  function setTheme(next) {
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    syncThemeIcon();
  }

  themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';

    if (!document.startViewTransition || prefersReducedMotion.matches) {
      setTheme(next);
      return;
    }

    const rect = themeBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => setTheme(next));

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 550,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
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
  loadNoteForToday();
  render();

  setInterval(() => {
    if (S.date !== todayStr()) {
      ensureTaskForToday();
      loadNoteForToday();
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
