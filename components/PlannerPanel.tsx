import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Calendar, Tag, ArrowRight, Clock, FileText, CheckCircle2, Circle } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { TaskDetailModal } from './TaskDetailModal';

interface PlannerPanelProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onRemoveTask: (id: string) => void;
  isFullPage?: boolean;
}

export const PlannerPanel: React.FC<PlannerPanelProps> = ({ tasks, onAddTask, onUpdateTask, onRemoveTask, isFullPage = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // New Task State
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [targetDate, setTargetDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTask({
        id: Date.now().toString(),
        text: text.trim(),
        description: '',
        status: 'TODO',
        priority,
        tags,
        startDate: Date.now(),
        targetDate: targetDate || undefined,
        completed: false
      });
      // Reset
      setText('');
      setPriority('MEDIUM');
      setTargetDate('');
      setTags([]);
      setTagInput('');
      setIsAdding(false);
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'HIGH': return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
      case 'MEDIUM': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
      case 'LOW': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20';
    }
  };

  const RadialProgress = () => {
      const radius = 50;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (progressPercentage / 100) * circumference;
      
      return (
        <div className="relative flex items-center justify-center w-32 h-32">
             <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-700"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                />
             </svg>
             <div className="absolute flex flex-col items-center">
                 <span className="text-2xl font-bold text-slate-800 dark:text-white">{progressPercentage}%</span>
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Done</span>
             </div>
        </div>
      );
  };

  return (
    <>
      <div className={`flex flex-col h-full bg-white dark:bg-slate-800 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-xl hover:border-indigo-400 dark:hover:border-slate-600 transition-all duration-300`}>
        {/* Header Section with Overview */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800">
             <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        Task Progress
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {completedTasks} of {totalTasks} tasks completed
                    </p>
                 </div>
                 <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> New Task
                </button>
             </div>
             
             {/* Progress Card (Only show if there are tasks or full page) */}
             {(tasks.length > 0 || isFullPage) && (
                 <div className="mt-6 flex items-center gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                    <RadialProgress />
                    <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Done
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{completedTasks}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> In Progress
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> To Do
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{tasks.filter(t => t.status === 'TODO').length}</span>
                        </div>
                    </div>
                 </div>
             )}
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 outline-none mb-3 shadow-sm"
                    autoFocus
                />
                <div className="flex flex-wrap gap-2 mb-3">
                    <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                    >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="HIGH">High Priority</option>
                    </select>
                    <input 
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsAdding(false)} className="text-xs font-bold text-slate-500 px-3 py-2">Cancel</button>
                    <button type="submit" className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500">Add Task</button>
                </div>
            </form>
          </div>
        )}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-4 bg-slate-50/50 dark:bg-slate-900/20">
            {tasks.length === 0 && !isAdding && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <CheckSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium">Your agenda is clear.</p>
                </div>
            )}
            <div className="space-y-2">
                {tasks.map(task => (
                    <TaskItem 
                        key={task.id} 
                        task={task} 
                        onClick={() => setSelectedTask(task)}
                        onUpdate={onUpdateTask}
                        getPriorityColor={getPriorityColor}
                    />
                ))}
            </div>
        </div>
      </div>

      <TaskDetailModal 
        isOpen={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={onUpdateTask}
        onRemove={onRemoveTask}
      />
    </>
  );
};

const TaskItem: React.FC<{ 
    task: Task; 
    onClick: () => void;
    onUpdate: (t: Task) => void;
    getPriorityColor: (p: TaskPriority) => string;
}> = ({ task, onClick, onUpdate, getPriorityColor }) => {

    const toggleStatus = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        onUpdate({ ...task, status: newStatus, completed: newStatus === 'DONE' });
    };

    return (
        <div 
            onClick={onClick}
            className="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <button 
                    onClick={toggleStatus}
                    className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === 'DONE' 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                    }`}
                >
                    {task.status === 'DONE' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                
                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold truncate transition-colors ${task.status === 'DONE' ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.text}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        {task.targetDate && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                <Calendar className="w-3 h-3" /> {task.targetDate}
                            </span>
                        )}
                        {task.tags.map(t => (
                            <span key={t} className="text-[10px] text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 rounded font-bold">#{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 pl-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                    task.status === 'DONE' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    task.status === 'IN_PROGRESS' ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                    {task.status === 'DONE' ? 'Done' : task.status === 'IN_PROGRESS' ? 'Active' : 'Todo'}
                </span>
            </div>
        </div>
    );
};