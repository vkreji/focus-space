import './index.css';

// ── Utilities ──────────────────────────────────────────

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const $ = (id) => document.getElementById(id);

// ── Icons ──────────────────────────────────────────────

const ICONS = {
    home:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    play:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    pause:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    reset:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
    trash:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    plus:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    workspace: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    pen:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
    book:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    sun:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
};

// Inject all icons into their placeholder spans
const injectIcons = () => {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const name = el.getAttribute('data-icon');
        if (name === 'theme') {
            el.innerHTML = state.theme === 'dark' ? ICONS.sun : ICONS.moon;
        } else if (ICONS[name]) {
            el.innerHTML = ICONS[name];
        }
    });
};

// ── Local Storage ──────────────────────────────────────

const STORAGE_KEY = 'focusSpaceVanilla';

const loadFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        const today = new Date().toDateString();
        const stats = data.stats && data.stats.date === today
            ? data.stats
            : { minutes: 0, sessions: 0, date: today };
        return {
            tasks: Array.isArray(data.tasks) ? data.tasks : [],
            stats,
            time: typeof data.time === 'number' ? data.time : 25 * 60,
            whiteboard: data.whiteboard || '',
            journal: data.journal || '',
            theme: data.theme || 'light'
        };
    } catch {
        return null;
    }
};

const saveToStorage = () => {
    try {
        const today = new Date().toDateString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            tasks: state.tasks,
            stats: { ...state.stats, date: today },
            time: state.time,
            whiteboard: state.whiteboard,
            journal: state.journal,
            theme: state.theme
        }));
    } catch (e) {
        console.error('Failed to save:', e);
    }
};

// ── State ──────────────────────────────────────────────

let state = {
    view: 'dashboard',
    time: 25 * 60,
    isRunning: false,
    tasks: [],
    stats: { minutes: 0, sessions: 0, date: new Date().toDateString() },
    whiteboard: '',
    journal: '',
    theme: 'light'
};

const saved = loadFromStorage();
if (saved) {
    state.time = saved.time;
    state.tasks = saved.tasks;
    state.stats = saved.stats;
    state.whiteboard = saved.whiteboard;
    state.journal = saved.journal;
    state.theme = saved.theme;
}

// ── Theme ──────────────────────────────────────────────

const applyTheme = () => {
    const isDark = state.theme === 'dark';
    document.body.classList.toggle('dark', isDark);
    const themeIcon = document.querySelector('[data-icon="theme"]');
    if (themeIcon) themeIcon.innerHTML = isDark ? ICONS.sun : ICONS.moon;
};

// ── Timer ──────────────────────────────────────────────

let timerInterval = null;

const updateTimerUI = () => {
    $('timer-display').innerText = formatTime(state.time);
    const iconSpan = $('btn-toggle-timer').querySelector('[data-icon]');
    iconSpan.innerHTML = state.isRunning ? ICONS.pause : ICONS.play;
    $('timer-btn-label').innerText = state.isRunning ? 'Pause' : 'Start';
};

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        state.time -= 1;
        if (state.time <= 0) {
            stopTimer();
            state.isRunning = false;
            state.time = 25 * 60;
            state.stats.minutes += 25;
            state.stats.sessions += 1;
            $('stat-minutes').innerText = state.stats.minutes;
            $('stat-sessions').innerText = state.stats.sessions;
            updateTimerUI();
            saveToStorage();
        } else {
            $('timer-display').innerText = formatTime(state.time);
        }
    }, 1000);
};

const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    saveToStorage();
};

// ── Tasks ──────────────────────────────────────────────

const renderTasks = () => {
    const list = $('task-list');
    list.innerHTML = '';

    state.tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item${task.completed ? ' completed' : ''}`;

        item.innerHTML = `
            <div class="checkbox-wrapper"><div class="checkbox"></div></div>
            <div class="task-content">
                <div class="task-title" contenteditable="true" data-placeholder="Untitled">${task.title}</div>
            </div>
            <div class="task-actions">
                <button class="action-btn delete-btn">${ICONS.trash}</button>
            </div>
        `;

        item.querySelector('.checkbox').addEventListener('click', (e) => {
            e.stopPropagation();
            task.completed = !task.completed;
            renderTasks();
            saveToStorage();
        });

        const titleEl = item.querySelector('.task-title');
        titleEl.addEventListener('blur', () => {
            task.title = titleEl.innerText.trim();
            if (task.title === '') {
                state.tasks = state.tasks.filter(t => t.id !== task.id);
                renderTasks();
            }
            saveToStorage();
        });
        titleEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
        });

        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            state.tasks = state.tasks.filter(t => t.id !== task.id);
            renderTasks();
            saveToStorage();
        });

        list.appendChild(item);
    });
};

// ── Navigation ─────────────────────────────────────────

const switchView = (viewName) => {
    state.view = viewName;

    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        const isActive = item.getAttribute('data-view') === viewName;
        item.classList.toggle('active', isActive);
        if (isActive) $('page-title').innerText = item.querySelector('span:last-child').innerText;
    });

    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    if (viewName === 'whiteboard') resizeCanvas();
};

// ── Whiteboard ─────────────────────────────────────────

let canvas, ctx, drawing = false;

const initWhiteboard = () => {
    canvas = $('whiteboard-canvas');
    ctx = canvas.getContext('2d');

    window.addEventListener('resize', () => {
        if (state.view === 'whiteboard') resizeCanvas(false);
    });

    const startDrawing = (e) => {
        drawing = true;
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = state.theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#37352f';
        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(
            (e.clientX || e.touches?.[0].clientX) - rect.left,
            (e.clientY || e.touches?.[0].clientY) - rect.top
        );
    };

    const stopDrawing = () => {
        if (!drawing) return;
        drawing = false;
        ctx.beginPath();
        state.whiteboard = canvas.toDataURL();
        saveToStorage();
    };

    const draw = (e) => {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(
            (e.clientX || e.touches?.[0].clientX) - rect.left,
            (e.clientY || e.touches?.[0].clientY) - rect.top
        );
        ctx.stroke();
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    $('btn-clear-canvas').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        state.whiteboard = '';
        saveToStorage();
    });
};

const resizeCanvas = (loadSaved = true) => {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    if (loadSaved && state.whiteboard) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = state.whiteboard;
    }
};

// ── Journal ────────────────────────────────────────────

const initJournal = () => {
    const input = $('journal-input');
    input.value = state.journal;
    input.addEventListener('input', () => {
        state.journal = input.value;
        saveToStorage();
    });
};

// ── Boot ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Inject SVG icons into placeholder spans
    injectIcons();

    // Apply saved theme
    applyTheme();

    // Hydrate saved data into static HTML
    $('timer-display').innerText = formatTime(state.time);
    $('stat-sessions').innerText = state.stats.sessions;
    $('stat-minutes').innerText = state.stats.minutes;

    // Render dynamic content
    renderTasks();
    initWhiteboard();
    initJournal();

    // Timer controls
    $('btn-toggle-timer').addEventListener('click', () => {
        state.isRunning = !state.isRunning;
        updateTimerUI();
        state.isRunning ? startTimer() : stopTimer();
    });

    $('btn-reset-timer').addEventListener('click', () => {
        state.isRunning = false;
        state.time = 25 * 60;
        updateTimerUI();
        stopTimer();
        saveToStorage();
    });

    // Add task
    $('btn-create-task').addEventListener('click', () => {
        const newTask = { id: Date.now(), title: '', completed: false };
        state.tasks.push(newTask);
        renderTasks();
        saveToStorage();
        const el = $('task-list').lastElementChild?.querySelector('.task-title');
        if (el) el.focus();
    });

    // Theme toggle
    $('btn-toggle-theme').addEventListener('click', (e) => {
        e.preventDefault();
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme();
        saveToStorage();
    });

    // Sidebar navigation
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(e.currentTarget.getAttribute('data-view'));
        });
    });
});
