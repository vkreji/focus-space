import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, Check, X, Clock, Target, Zap, Calendar } from 'lucide-react':

const FocusSpace = () => {
    const [time, setTime] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [focusItems, setFocusItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [stats, setStats] = useState({ minutes: 0, sessions: 0 });
    const [showRadialMenu, setShowRadialMenu] = useState(false);

    // Timer logic
    useEffect(() => {
        let interval;
        if (isRunning && time > 0) {
            interval = setInterval(() => {
                setTime(t => {
                    if (t <= 1) {
                        setIsRunning(false);
                        setStats(s => ({ minutes: s.minutes + 25, sessions: s.sessions + 1 }));
                        return 25 * 60;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, time]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const RadialMenu = ({ onClose }) => {
        const options = [
            { icon: Plus, label: 'New Task', angle: 0, action: () => { setShowModal(true); onClose(); } },
            { icon: Clock, label: '25m', angle: 60, action: () => { setTime(25 * 60); onClose(); } },
            { icon: Target, label: '45m', angle: 120, action: () => { setTime(45 * 60); onClose(); } },
            { icon: Zap, label: '60m', angle: 180, action: () => { setTime(60 * 60); onClose(); } },
            { icon: Trash2, label: 'Clear', angle: 240, action: () => { setTasks([]); setFocusItems([]); onClose(); } },
            { icon: X, label: 'Close', angle: 300, action: onClose }
        ];

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="relative w-80 h-80"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-0 rounded-full border border-zinc-800" />
                    {options.map((opt, i) => {
                        const rad = (opt.angle * Math.PI) / 180;
                        const Icon = opt.icon;
                        return (
                            <button
                                key={i}
                                className="absolute w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white shadow-none transition-all"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(-50%, -50%) translate(${Math.cos(rad) * 110}px, ${Math.sin(rad) * 110}px)`
                                }}
                                onClick={opt.action}
                            >
                                <Icon size={20} />
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {opt.label}
                                </span>
                            </button>
                        );
                    })}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase">Select</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-100 selection:text-zinc-900">
            {/* Background */}

            {/* FAB */}
            <button
                className="fixed bottom-10 right-10 w-14 h-14 rounded-full bg-white text-zinc-950 shadow-none hover:bg-zinc-200 transition-colors z-40 flex items-center justify-center"
                onClick={() => setShowRadialMenu(true)}
            >
                <Plus size={24} />
            </button>

            {showRadialMenu && (
                <RadialMenu
                    onClose={() => setShowRadialMenu(false)}
                />
            )}

            {/* Layout */}
            <div className="relative z-10 grid grid-cols-12 grid-rows-6 gap-6 p-10 h-full max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="col-span-12 row-span-1 border-b border-zinc-800 flex items-center justify-between py-4 mb-4">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-medium tracking-tight text-white uppercase italic">
                            focus_space
                        </h1>
                        <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                            <span className="opacity-50">/</span>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                    <div className="flex gap-10">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Total Sessions</span>
                            <div className="text-2xl font-light text-zinc-300 tabular-nums">{stats.sessions}</div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Focus Time</span>
                            <div className="text-2xl font-light text-zinc-300 tabular-nums">{stats.minutes}m</div>
                        </div>
                    </div>
                </div>

                {/* Timer */}
                <div className="col-span-5 row-span-5 border border-zinc-800 rounded-none p-12 flex flex-col items-center justify-center relative bg-zinc-950/50">
                    <div className="w-full flex flex-col items-center">
                        <div className="mb-12">
                            <div className="text-[140px] leading-none font-light tracking-tighter text-white tabular-nums">
                                {formatTime(time)}
                            </div>
                            <div className="text-center text-zinc-600 text-[10px] uppercase tracking-[0.3em] mt-4 font-mono">
                                {isRunning ? 'Running' : 'Standby'}
                            </div>
                        </div>

                        <div className="w-full max-w-[240px] space-y-4">
                            <button
                                onClick={() => setIsRunning(!isRunning)}
                                className={`w-full py-4 ${isRunning ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-950'} font-medium uppercase text-xs tracking-[0.2em] transition-colors flex items-center justify-center gap-3`}
                            >
                                {isRunning ? <Pause size={14} /> : <Play size={14} />}
                                {isRunning ? 'Pause' : 'Start'}
                            </button>

                            <button
                                onClick={() => { setTime(25 * 60); setIsRunning(false); }}
                                className="w-full py-3 bg-transparent hover:bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800 font-medium uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={12} />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className="col-span-7 row-span-3 border border-zinc-800 rounded-none p-8 flex flex-col overflow-hidden bg-zinc-950/50">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-mono">Objectives</h2>
                        <button
                            onClick={() => setShowModal(true)}
                            className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors flex items-center gap-1 border border-zinc-800 px-3 py-1.5"
                        >
                            <Plus size={12} />
                            Create
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-px pr-2 custom-scrollbar">
                        {tasks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                                <p className="text-[10px] uppercase tracking-widest">Queue Empty</p>
                            </div>
                        ) : (
                            tasks.map(task => (
                                <div
                                    key={task.id}
                                    className="group flex items-start gap-4 py-4 border-b border-zinc-900 hover:border-zinc-800 transition-colors cursor-pointer"
                                    onDoubleClick={() => { setEditingTask(task); setShowModal(true); }}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                                        }}
                                        className={`mt-0.5 w-5 h-5 border ${task.completed ? 'bg-zinc-200 border-zinc-200' : 'border-zinc-700'} flex items-center justify-center transition-colors`}
                                    >
                                        {task.completed && <Check size={12} className="text-zinc-900" />}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-medium ${task.completed ? 'line-through text-zinc-600' : 'text-zinc-200'} truncate`}>
                                            {task.title}
                                        </div>
                                        {task.notes && (
                                            <div className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{task.notes}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border ${task.priority === 'high' ? 'border-zinc-500 text-zinc-400' : 'border-zinc-800 text-zinc-600'}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Focus Input */}
                <div className="col-span-7 row-span-2 border border-zinc-800 rounded-none p-8 flex flex-col bg-zinc-950/50">
                    <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-mono mb-6">Focus</h3>

                    <input
                        type="text"
                        placeholder="Type point of focus..."
                        className="w-full bg-zinc-900 border-none px-4 py-4 text-sm text-zinc-200 placeholder:text-zinc-700 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em] focus:ring-1 focus:ring-zinc-700 transition-all mb-6 outline-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                                setFocusItems([...focusItems, { id: Date.now(), text: e.target.value, completed: false }]);
                                e.target.value = '';
                            }
                        }}
                    />

                    <div className="flex flex-wrap gap-2 overflow-y-auto flex-1">
                        {focusItems.map(item => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 px-4 py-2 text-[11px] font-medium border ${item.completed ? 'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50' : 'bg-transparent border-zinc-700 text-zinc-400'} transition-all`}
                                onClick={() => setFocusItems(focusItems.map(f => f.id === item.id ? { ...f, completed: !f.completed } : f))}
                            >
                                <span className={item.completed ? 'line-through' : ''}>
                                    {item.text}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFocusItems(focusItems.filter(f => f.id !== item.id));
                                    }}
                                    className="ml-2 hover:text-white"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-6">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md shadow-2xl">
                        <div className="p-8 pb-0 flex justify-between items-start">
                            <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-mono">{editingTask ? 'Edit' : 'New'} Entry</h3>
                            <button onClick={() => { setShowModal(false); setEditingTask(null); }} className="text-zinc-600 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] mb-3 text-zinc-600">Title</label>
                                <input
                                    type="text"
                                    defaultValue={editingTask?.title}
                                    id="taskTitle"
                                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm text-zinc-200 focus:ring-1 focus:ring-zinc-700 outline-none transition-all"
                                    placeholder="..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] mb-3 text-zinc-600">Notes</label>
                                <textarea
                                    defaultValue={editingTask?.notes}
                                    id="taskNotes"
                                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm text-zinc-200 focus:ring-1 focus:ring-zinc-700 outline-none transition-all resize-none"
                                    rows="3"
                                    placeholder="..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] mb-3 text-zinc-600">Priority</label>
                                    <select
                                        defaultValue={editingTask?.priority || 'normal'}
                                        id="taskPriority"
                                        className="w-full bg-zinc-950 border border-zinc-800 p-4 text-xs uppercase tracking-widest text-zinc-400 focus:ring-1 focus:ring-zinc-700 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-zinc-800 flex justify-between gap-4">
                            {editingTask && (
                                <button
                                    onClick={() => {
                                        setTasks(tasks.filter(t => t.id !== editingTask.id));
                                        setShowModal(false);
                                        setEditingTask(null);
                                    }}
                                    className="px-6 py-3 text-[10px] uppercase tracking-widest text-zinc-600 hover:text-red-400 hover:border-red-900 border border-transparent transition-all"
                                >
                                    Delete
                                </button>
                            )}
                            <div className="flex gap-4 ml-auto">
                                <button
                                    onClick={() => { setShowModal(false); setEditingTask(null); }}
                                    className="px-6 py-3 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const title = document.getElementById('taskTitle').value;
                                        const notes = document.getElementById('taskNotes').value;
                                        const priority = document.getElementById('taskPriority').value;

                                        if (editingTask) {
                                            setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, title, notes, priority } : t));
                                        } else {
                                            setTasks([...tasks, { id: Date.now(), title, notes, priority, completed: false }]);
                                        }
                                        setShowModal(false);
                                        setEditingTask(null);
                                    }}
                                    className="px-8 py-3 bg-white text-zinc-950 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FocusSpace;
