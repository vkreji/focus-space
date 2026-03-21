import './index.css';

// Utilities
const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

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
        const tasks = Array.isArray(data.tasks) ? data.tasks : [];
        return {
            tasks,
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

const saveToStorage = (state) => {
    try {
        const today = new Date().toDateString();
        const statsToSave = { ...state.stats, date: today };
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            tasks: state.tasks,
            stats: statsToSave,
            time: state.time,
            whiteboard: state.whiteboard, // data URL
            journal: state.journal,
            theme: state.theme
        }));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
};

// State
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

const savedDate = loadFromStorage();
if (savedDate) {
    state.time = savedDate.time;
    state.tasks = savedDate.tasks;
    state.stats = savedDate.stats;
    state.whiteboard = savedDate.whiteboard;
    state.journal = savedDate.journal;
    state.theme = savedDate.theme;
}

if (state.theme === 'dark') {
    document.body.classList.add('dark');
}

let timerInterval = null;

// Icons
const ICONS = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
    reset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    workspace: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    pen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
};

const appDiv = document.getElementById('app');

const renderApp = () => {
    appDiv.innerHTML = `
        <div class="layout-container">
            <aside class="sidebar">
                <div class="sidebar-header">
                    ${ICONS.workspace}
                    <span>Focus Space</span>
                </div>
                <nav class="sidebar-nav" id="sidebar-nav">
                    <a href="#" class="nav-item active" data-view="dashboard">
                        ${ICONS.home}
                        <span>Dashboard</span>
                    </a>
                    <a href="#" class="nav-item" data-view="whiteboard">
                        ${ICONS.pen}
                        <span>Whiteboard</span>
                    </a>
                    <a href="#" class="nav-item" data-view="journal">
                        ${ICONS.book}
                        <span>Journal</span>
                    </a>
                </nav>
                <div style="margin-top: auto; padding: 0 8px 16px;">
                    <a href="#" class="nav-item" id="btn-toggle-theme">
                        ${state.theme === 'dark' ? ICONS.sun : ICONS.moon}
                        <span id="theme-label">Theme</span>
                    </a>
                </div>
            </aside>
            <main class="main-content">
                <header class="topbar">
                    <h1 class="page-title" id="page-title">Dashboard</h1>
                    <div class="topbar-actions">
                        <div class="stats-container">
                            <span>Sessions: <span id="stat-sessions">${state.stats.sessions}</span></span>
                            <span>Focus: <span id="stat-minutes">${state.stats.minutes}</span>m</span>
                        </div>
                    </div>
                </header>
                <div class="content-body" id="content-body">
                    
                    <!-- View: Dashboard -->
                    <div id="view-dashboard" class="view-container active">
                        <div class="timer-block">
                            <div class="timer-display" id="timer-display">${formatTime(state.time)}</div>
                            <div class="timer-controls">
                                <button class="btn" id="btn-toggle-timer">
                                    ${state.isRunning ? ICONS.pause : ICONS.play}
                                    <span>${state.isRunning ? 'Pause' : 'Start'}</span>
                                </button>
                                <button class="btn btn-icon" id="btn-reset-timer">
                                    ${ICONS.reset}
                                </button>
                            </div>
                        </div>

                        <div class="divider"></div>

                        <div class="tasks-container">
                            <div class="tasks-header">
                                <h2>Objectives</h2>
                            </div>
                            <div class="task-list" id="task-list">
                                <!-- Tasks injected here -->
                            </div>
                            <button class="add-task-btn" id="btn-create-task">
                                ${ICONS.plus}
                                <span>New Objective</span>
                            </button>
                        </div>
                    </div>

                    <!-- View: Whiteboard -->
                    <div id="view-whiteboard" class="view-container">
                        <div class="whiteboard-wrapper">
                            <canvas id="whiteboard-canvas" class="whiteboard-canvas"></canvas>
                            <div class="whiteboard-toolbar">
                                <button class="btn" id="btn-clear-canvas" style="font-size: 12px; padding: 4px 8px;">Clear</button>
                            </div>
                        </div>
                    </div>

                    <!-- View: Journal -->
                    <div id="view-journal" class="view-container">
                        <textarea id="journal-input" placeholder="Start typing... Everything is auto-saved." style="width: 100%; flex: 1; min-height: 400px; resize: none; border: none; outline: none; background: transparent; font-family: inherit; font-size: 16px; color: var(--text-primary); line-height: 1.6;"></textarea>
                    </div>

                </div>
            </main>
        </div>
    `;

    renderTasks();
    attachGlobalListeners();
    initWhiteboard();
    initJournal();
};

const renderTasks = () => {
    const taskListDiv = document.getElementById('task-list');
    taskListDiv.innerHTML = '';

    state.tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-item';
        if (task.completed) item.classList.add('completed');
        
        item.innerHTML = `
            <div class="checkbox-wrapper">
                <div class="checkbox" data-id="${task.id}"></div>
            </div>
            <div class="task-content">
                <div class="task-title" contenteditable="true" data-id="${task.id}" data-placeholder="Untitled">${task.title}</div>
            </div>
            <div class="task-actions">
                <button class="action-btn delete-btn" data-id="${task.id}">
                    ${ICONS.trash}
                </button>
            </div>
        `;

        taskListDiv.appendChild(item);
        
        const titleEl = item.querySelector('.task-title');
        titleEl.addEventListener('blur', (e) => {
            task.title = e.target.innerText.trim();
            saveToStorage(state);
            if (task.title === "") {
                state.tasks = state.tasks.filter(t => t.id !== task.id);
                renderTasks();
                saveToStorage(state);
            }
        });
        
        titleEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                titleEl.blur();
            }
        });
    });

    attachListListeners();
};

const attachListListeners = () => {
    document.querySelectorAll('.checkbox').forEach(cb => {
        cb.addEventListener('click', (e) => {
            const taskId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                renderTasks();
                saveToStorage(state);
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
            state.tasks = state.tasks.filter(t => t.id !== taskId);
            renderTasks();
            saveToStorage(state);
        });
    });
};

const attachGlobalListeners = () => {
    // Timer 
    document.getElementById('btn-toggle-timer').addEventListener('click', () => {
        state.isRunning = !state.isRunning;
        updateTimerUI();
        if (state.isRunning) {
            startTimer();
        } else {
            stopTimer();
        }
    });

    document.getElementById('btn-reset-timer').addEventListener('click', () => {
        state.isRunning = false;
        state.time = 25 * 60;
        updateTimerUI();
        stopTimer();
        saveToStorage(state);
    });

    // Add New Task
    document.getElementById('btn-create-task').addEventListener('click', () => {
        const newTask = {
            id: Date.now(),
            title: '',
            notes: '',
            priority: 'normal',
            completed: false
        };
        state.tasks.push(newTask);
        renderTasks();
        saveToStorage(state);
        
        const newTaskEl = document.querySelector(`.task-title[data-id="${newTask.id}"]`);
        if (newTaskEl) {
            newTaskEl.focus();
        }
    });

    // Theme Toggle
    document.getElementById('btn-toggle-theme').addEventListener('click', (e) => {
        e.preventDefault();
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        if (state.theme === 'dark') {
            document.body.classList.add('dark');
            e.currentTarget.innerHTML = `
                ${ICONS.sun}
                <span id="theme-label">Theme</span>
            `;
        } else {
            document.body.classList.remove('dark');
            e.currentTarget.innerHTML = `
                ${ICONS.moon}
                <span id="theme-label">Theme</span>
            `;
        }
        saveToStorage(state);
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id === 'btn-toggle-theme') return;
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.getAttribute('data-view');
            switchView(view);
        });
    });
};

const switchView = (viewName) => {
    state.view = viewName;
    
    // Update active nav class
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
            document.getElementById('page-title').innerText = item.querySelector('span').innerText;
        } else {
            item.classList.remove('active');
        }
    });

    // Update view visibility
    document.querySelectorAll('.view-container').forEach(view => {
        if (view.id === `view-${viewName}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Specific logic when view is active
    if (viewName === 'whiteboard') {
        resizeCanvas();
    }
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
            document.getElementById('stat-minutes').innerText = state.stats.minutes;
            document.getElementById('stat-sessions').innerText = state.stats.sessions;
            updateTimerUI();
            saveToStorage(state);
        } else {
            document.getElementById('timer-display').innerText = formatTime(state.time);
        }
    }, 1000);
};

const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    saveToStorage(state);
};

const updateTimerUI = () => {
    const btn = document.getElementById('btn-toggle-timer');
    const display = document.getElementById('timer-display');
    
    display.innerText = formatTime(state.time);
    
    if (state.isRunning) {
        btn.innerHTML = `
            ${ICONS.pause}
            <span>Pause</span>
        `;
    } else {
        btn.innerHTML = `
            ${ICONS.play}
            <span>Start</span>
        `;
    }
};

// --- Whiteboard Integration ---
let canvas, ctx;
let drawing = false;

const initWhiteboard = () => {
    canvas = document.getElementById('whiteboard-canvas');
    ctx = canvas.getContext('2d');

    // Resize properly
    window.addEventListener('resize', () => {
        if (state.view === 'whiteboard') resizeCanvas(false);
    });

    // Handle drawing
    const startDrawing = (e) => {
        drawing = true;
        ctx.beginPath();
        
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : '#37352f';
        
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
        ctx.moveTo(x, y);
        draw(e);
    };

    const stopDrawing = () => {
        if (!drawing) return;
        drawing = false;
        ctx.beginPath();
        // Save drawing when finished stroke
        if (state.view === 'whiteboard') {
            state.whiteboard = canvas.toDataURL();
            saveToStorage(state);
        }
    };

    const draw = (e) => {
        if (!drawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    document.getElementById('btn-clear-canvas').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        state.whiteboard = '';
        saveToStorage(state);
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

// --- Journal Integration ---
const initJournal = () => {
    const journalInput = document.getElementById('journal-input');
    journalInput.value = state.journal;

    journalInput.addEventListener('input', (e) => {
        state.journal = e.target.value;
        saveToStorage(state);
    });
};

// Application Boot
document.addEventListener('DOMContentLoaded', renderApp);
