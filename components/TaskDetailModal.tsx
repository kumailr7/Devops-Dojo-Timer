import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Clock, Trash2, Save, AlignLeft } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: (task: Task) => void;
  onRemove: (id: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task, onUpdate, onRemove }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!isOpen || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onUpdate(editedTask);
      onClose();
    }
  };

  const handleDelete = () => {
    if (editedTask) {
      onRemove(editedTask.id);
      onClose();
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!editedTask.tags.includes(newTag.trim())) {
        setEditedTask({
          ...editedTask,
          tags: [...editedTask.tags, newTag.trim()]
        });
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedTask({
      ...editedTask,
      tags: editedTask.tags.filter(t => t !== tagToRemove)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50">
          <div className="flex-1 mr-4">
             <input
               type="text"
               value={editedTask.text}
               onChange={(e) => setEditedTask({ ...editedTask, text: e.target.value })}
               className="w-full bg-transparent text-xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none border-b border-transparent focus:border-indigo-500 transition-colors"
               placeholder="Task Title"
             />
             <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Created: {new Date(editedTask.startDate).toLocaleDateString()}</span>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status & Priority */}
            <div className="space-y-4">
               <div>
                 <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Status</label>
                 <div className="grid grid-cols-2 gap-2">
                    {(['TODO', 'IN_PROGRESS', 'ON_HOLD', 'DONE'] as TaskStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => setEditedTask({ ...editedTask, status, completed: status === 'DONE' })}
                          className={`text-xs font-bold py-2 rounded-lg border transition-all ${
                            editedTask.status === status 
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                    ))}
                 </div>
               </div>

               <div>
                 <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Priority</label>
                 <div className="flex gap-2">
                    {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map(priority => (
                        <button
                          key={priority}
                          onClick={() => setEditedTask({ ...editedTask, priority })}
                          className={`flex-1 text-xs font-bold py-2 rounded-lg border transition-all ${
                            editedTask.priority === priority 
                              ? priority === 'HIGH' ? 'bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-500 text-red-600 dark:text-red-400' :
                                priority === 'MEDIUM' ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500 text-amber-600 dark:text-amber-400' :
                                'bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500'
                          }`}
                        >
                          {priority}
                        </button>
                    ))}
                 </div>
               </div>
            </div>

            {/* Dates & Tags */}
            <div className="space-y-4">
               <div>
                 <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Target Date</label>
                 <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                     type="date"
                     value={editedTask.targetDate || ''}
                     onChange={(e) => setEditedTask({ ...editedTask, targetDate: e.target.value })}
                     className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
                   />
                 </div>
               </div>

               <div>
                 <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Tags</label>
                 <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-2 transition-colors">
                    {editedTask.tags.map(tag => (
                        <span key={tag} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-1 rounded flex items-center gap-1">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-indigo-900 dark:hover:text-white">&times;</button>
                        </span>
                    ))}
                    <input 
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tag..."
                      className="bg-transparent text-xs text-slate-900 dark:text-white outline-none flex-1 min-w-[60px]"
                    />
                 </div>
               </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Description
            </label>
            <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Add details, notes, or acceptance criteria..."
                className="w-full h-32 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500 outline-none resize-none leading-relaxed transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <button 
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-400/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
                <Trash2 className="w-4 h-4" /> Delete Task
            </button>
            <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-transform active:scale-95"
                >
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};