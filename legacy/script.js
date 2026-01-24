/**
 * Focus Space - Productivity App
 * A clean workspace for managing tasks and staying focused
 */

// DOM Elements
const timerTime = document.getElementById('timerTime');
const startTimer = document.getElementById('startTimer');
const pauseTimer = document.getElementById('pauseTimer');
const resetTimer = document.getElementById('resetTimer');
const presetButtons = document.querySelectorAll('.preset-btn');
const focusInput = document.getElementById('focusInput');
const focusList = document.getElementById('focusList');
const todayMinutes = document.getElementById('todayMinutes');
const todaySessions = document.getElementById('todaySessions');
const currentDate = document.getElementById('currentDate');
const newTaskBtn = document.getElementById('newTaskBtn');
const tasksList = document.getElementById('tasksList');
const taskModal = document.getElementById('taskModal');
const closeModal = document.getElementById('closeModal');
const taskTitle = document.getElementById('taskTitle');
const taskNotes = document.getElementById('taskNotes');
const taskPriority = document.getElementById('taskPriority');
const saveTask = document.getElementById('saveTask');
const cancelTask = document.getElementById('cancelTask');
const deleteTask = document.getElementById('deleteTask');
const modalTitle = document.getElementById('modalTitle');
const clearDataBtn = document.getElementById('clearDataBtn');

// State
let timerInterval = null;
let timerSeconds = 25 * 60;
let isRunning = false;
let tasks = [];
let focusItems = [];
let editingTaskId = null;
let todayStats = {
    minutes: 0,
    sessions: 0,
    date: new Date().toDateString()
};

// Initialize
function init() {
    try {
        updateDate();
        loadData();
        setupEventListeners();
        renderTasks();
        renderFocusItems();
        updateStats();
        updateTimerDisplay();
        updateTaskCount();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Timer Functions
function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimerFunc() {
    if (timerSeconds === 0) {
        timerSeconds = 25 * 60;
    }
    
    isRunning = true;
    startTimer.classList.add('hidden');
    pauseTimer.classList.remove('hidden');
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            completeSession();
        }
    }, 1000);
}

function pauseTimerFunc() {
    isRunning = false;
    startTimer.classList.remove('hidden');
    pauseTimer.classList.add('hidden');
    clearInterval(timerInterval);
}

function resetTimerFunc() {
    pauseTimerFunc();
    timerSeconds = 25 * 60;
    updateTimerDisplay();
}

function setTimerPreset(minutes) {
    if (isRunning) {
        pauseTimerFunc();
    }
    timerSeconds = minutes * 60;
    updateTimerDisplay();
}

function completeSession() {
    pauseTimerFunc();
    
    // Update stats
    const today = new Date().toDateString();
    if (todayStats.date !== today) {
        todayStats = { minutes: 0, sessions: 0, date: today };
    }
    
    const sessionMinutes = Math.floor((25 * 60 - timerSeconds) / 60);
    todayStats.minutes += sessionMinutes;
    todayStats.sessions += 1;
    updateStats();
    saveData();
    
    // Notification
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('Focus session complete!', {
                body: 'Great work! Take a break.',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%232563eb"/></svg>'
            });
        } else if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    // Reset timer
    timerSeconds = 25 * 60;
    updateTimerDisplay();
}

// Focus Items
function addFocusItem() {
    const text = focusInput.value.trim();
    if (!text) {
        focusInput.focus();
        return;
    }
    
    const item = {
        id: Date.now(),
        text: text,
        completed: false
    };
    
    focusItems.push(item);
    focusInput.value = '';
    renderFocusItems();
    saveData();
}

function toggleFocusItem(id) {
    const item = focusItems.find(f => f.id === id);
    if (item) {
        item.completed = !item.completed;
        renderFocusItems();
        saveData();
    }
}

function renderFocusItems() {
    focusList.innerHTML = '';
    
    focusItems.forEach(item => {
        const div = document.createElement('div');
        div.className = `focus-item ${item.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <input type="checkbox" class="focus-checkbox" ${item.completed ? 'checked' : ''}>
            <span>${item.text}</span>
        `;
        
        div.querySelector('.focus-checkbox').addEventListener('change', () => {
            toggleFocusItem(item.id);
        });
        
        focusList.appendChild(div);
    });
}

// Tasks
function openTaskModal(taskId = null) {
    editingTaskId = taskId;
    
    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            modalTitle.textContent = 'edit task';
            taskTitle.value = task.title;
            taskNotes.value = task.notes || '';
            taskPriority.value = task.priority || 'normal';
            deleteTask.classList.remove('hidden');
        }
    } else {
        modalTitle.textContent = 'new task';
        taskTitle.value = '';
        taskNotes.value = '';
        taskPriority.value = 'normal';
        deleteTask.classList.add('hidden');
    }
    
    taskModal.classList.remove('hidden');
    taskTitle.focus();
}

function closeTaskModal() {
    taskModal.classList.add('hidden');
    editingTaskId = null;
}

function saveTaskFunc() {
    const title = taskTitle.value.trim();
    if (!title) {
        taskTitle.focus();
        return;
    }
    
    if (editingTaskId) {
        const task = tasks.find(t => t.id === editingTaskId);
        if (task) {
            task.title = title;
            task.notes = taskNotes.value.trim();
            task.priority = taskPriority.value;
            task.updatedAt = Date.now();
        }
    } else {
        const task = {
            id: Date.now(),
            title: title,
            notes: taskNotes.value.trim(),
            priority: taskPriority.value,
            completed: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        tasks.push(task);
    }
    
    renderTasks();
    updateTaskCount();
    saveData();
    closeTaskModal();
}

function deleteTaskFunc() {
    if (!editingTaskId) return;
    
    if (confirm('delete this task?')) {
        tasks = tasks.filter(t => t.id !== editingTaskId);
        renderTasks();
        saveData();
        closeTaskModal();
    }
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        task.updatedAt = Date.now();
        renderTasks();
        updateTaskCount();
        saveData();
    }
}

function renderTasks() {
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <p>no tasks yet</p>
                <p class="empty-hint">click "new task" to get started</p>
            </div>
        `;
        updateTaskCount();
        return;
    }
    
    // Sort: incomplete first, then by priority, then by date
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.createdAt - a.createdAt;
    });
    
    tasksList.innerHTML = sortedTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.notes ? `<div class="task-notes-preview">${escapeHtml(task.notes)}</div>` : ''}
                <div class="task-meta-preview">
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    tasksList.querySelectorAll('.task-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        
        item.querySelector('.task-checkbox').addEventListener('change', () => {
            toggleTask(id);
        });
        
        item.addEventListener('dblclick', () => {
            openTaskModal(id);
        });
    });
    
    updateTaskCount();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Stats
function updateStats() {
    const today = new Date().toDateString();
    if (todayStats.date !== today) {
        todayStats = { minutes: 0, sessions: 0, date: today };
    }
    
    todayMinutes.textContent = todayStats.minutes;
    todaySessions.textContent = todayStats.sessions;
}

// Update task count in header
function updateTaskCount() {
    const incompleteCount = tasks.filter(t => !t.completed).length;
    const countBadge = document.getElementById('taskCountBadge');
    if (countBadge) {
        countBadge.textContent = incompleteCount > 0 ? `(${incompleteCount})` : '';
    }
}

// Storage
function saveData() {
    try {
        const data = {
            tasks: tasks,
            focusItems: focusItems,
            stats: todayStats
        };
        localStorage.setItem('focusSpace', JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save:', e);
    }
}

function loadData() {
    try {
        const data = localStorage.getItem('focusSpace');
        if (!data) return;
        
        const parsed = JSON.parse(data);
        tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
        focusItems = Array.isArray(parsed.focusItems) ? parsed.focusItems : [];
        
        if (parsed.stats) {
            const today = new Date().toDateString();
            if (parsed.stats.date === today) {
                todayStats = parsed.stats;
            }
        }
    } catch (e) {
        console.error('Failed to load:', e);
        // Clear corrupted data
        localStorage.removeItem('focusSpace');
    }
}

// Event Listeners
function setupEventListeners() {
    // Timer
    startTimer.addEventListener('click', startTimerFunc);
    pauseTimer.addEventListener('click', pauseTimerFunc);
    resetTimer.addEventListener('click', resetTimerFunc);
    
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.dataset.minutes);
            setTimerPreset(minutes);
        });
    });
    
    // Focus
    focusInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addFocusItem();
        }
    });
    
    // Tasks
    newTaskBtn.addEventListener('click', () => openTaskModal());
    closeModal.addEventListener('click', closeTaskModal);
    cancelTask.addEventListener('click', closeTaskModal);
    saveTask.addEventListener('click', saveTaskFunc);
    deleteTask.addEventListener('click', deleteTaskFunc);
    
    taskTitle.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveTaskFunc();
        }
    });
    
    // Close modal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !taskModal.classList.contains('hidden')) {
            closeTaskModal();
        }
    });
    
    // Close modal on backdrop click
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeTaskModal();
        }
    });
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Clear data button
    clearDataBtn.addEventListener('click', () => {
        if (confirm('clear all data? this will delete all tasks, focus items, and stats. this cannot be undone.')) {
            localStorage.removeItem('focusSpace');
            tasks = [];
            focusItems = [];
            todayStats = { minutes: 0, sessions: 0, date: new Date().toDateString() };
            timerSeconds = 25 * 60;
            if (isRunning) pauseTimerFunc();
            updateTimerDisplay();
            renderTasks();
            renderFocusItems();
            updateStats();
            updateTaskCount();
            alert('all data cleared');
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
