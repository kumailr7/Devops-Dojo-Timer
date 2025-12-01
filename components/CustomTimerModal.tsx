import React, { useState } from 'react';
import { X, Play, Clock } from 'lucide-react';

interface CustomTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (minutes: number, label: string) => void;
}

export const CustomTimerModal: React.FC<CustomTimerModalProps> = ({ isOpen, onClose, onStart }) => {
  const [minutes, setMinutes] = useState<number>(20);
  const [label, setLabel] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes > 0) {
      onStart(minutes, label || "Custom Session");
      onClose();
    }
  };

  const presets = [5, 10, 15, 30, 45, 60];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-pink-500" /> Custom Timer
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Duration Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration (Minutes)</label>
            <div className="flex gap-4 items-center">
              <input 
                type="number" 
                min="1" 
                max="180" 
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-2xl font-mono text-slate-900 dark:text-white focus:border-pink-500 outline-none text-center"
                autoFocus
              />
            </div>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-3">
              {presets.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setMinutes(p)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    minutes === p 
                      ? 'bg-pink-600 border-pink-500 text-white' 
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                  }`}
                >
                  {p}m
                </button>
              ))}
            </div>
          </div>

          {/* Label Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Label (Optional)</label>
            <input 
              type="text" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Quick Review, Email Triage"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-pink-500 outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/20 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" /> Start Timer
          </button>
        </form>
      </div>
    </div>
  );
};