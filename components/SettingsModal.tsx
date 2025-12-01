import React, { useState, useEffect } from 'react';
import { TimerMode } from '../types';
import { X, Save, Clock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimers: { [key in TimerMode]: number };
  onSave: (newTimers: { [key in TimerMode]: number }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentTimers, onSave }) => {
  const [timers, setTimers] = useState<{ [key in TimerMode]: number }>({
    [TimerMode.FOCUS]: currentTimers[TimerMode.FOCUS] / 60,
    [TimerMode.SHORT_BREAK]: currentTimers[TimerMode.SHORT_BREAK] / 60,
    [TimerMode.LONG_BREAK]: currentTimers[TimerMode.LONG_BREAK] / 60,
    [TimerMode.CUSTOM]: currentTimers[TimerMode.CUSTOM] / 60,
  });

  useEffect(() => {
    if (isOpen) {
        setTimers({
            [TimerMode.FOCUS]: currentTimers[TimerMode.FOCUS] / 60,
            [TimerMode.SHORT_BREAK]: currentTimers[TimerMode.SHORT_BREAK] / 60,
            [TimerMode.LONG_BREAK]: currentTimers[TimerMode.LONG_BREAK] / 60,
            [TimerMode.CUSTOM]: currentTimers[TimerMode.CUSTOM] / 60,
        });
    }
  }, [isOpen, currentTimers]);

  if (!isOpen) return null;

  const handleChange = (mode: TimerMode, minutes: number) => {
    setTimers(prev => ({ ...prev, [mode]: minutes }));
  };

  const handleSave = () => {
    onSave({
      [TimerMode.FOCUS]: timers[TimerMode.FOCUS] * 60,
      [TimerMode.SHORT_BREAK]: timers[TimerMode.SHORT_BREAK] * 60,
      [TimerMode.LONG_BREAK]: timers[TimerMode.LONG_BREAK] * 60,
      [TimerMode.CUSTOM]: timers[TimerMode.CUSTOM] * 60,
    });
    onClose();
  };

  const applyPreset = (focus: number, short: number, long: number) => {
    setTimers(prev => ({
      ...prev,
      [TimerMode.FOCUS]: focus,
      [TimerMode.SHORT_BREAK]: short,
      [TimerMode.LONG_BREAK]: long,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Timer Settings
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Quick Presets</label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => applyPreset(25, 5, 15)} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-white rounded-lg text-sm transition-colors text-center border border-slate-200 dark:border-slate-600">
                Standard<br/><span className="text-[10px] opacity-70">25 / 5</span>
              </button>
              <button onClick={() => applyPreset(15, 5, 10)} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-white rounded-lg text-sm transition-colors text-center border border-slate-200 dark:border-slate-600">
                Short<br/><span className="text-[10px] opacity-70">15 / 5</span>
              </button>
              <button onClick={() => applyPreset(50, 10, 30)} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-white rounded-lg text-sm transition-colors text-center border border-slate-200 dark:border-slate-600">
                Deep Work<br/><span className="text-[10px] opacity-70">50 / 10</span>
              </button>
            </div>
          </div>

          {/* Custom Inputs */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Custom Duration (Minutes)</label>
            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 text-sm">Focus Session</span>
                <input 
                  type="number"
                  min="1"
                  max="120"
                  value={timers[TimerMode.FOCUS]}
                  onChange={(e) => handleChange(TimerMode.FOCUS, parseInt(e.target.value) || 0)}
                  className="w-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none text-right font-mono"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 text-sm">Short Break</span>
                <input 
                  type="number"
                  min="1"
                  max="60"
                  value={timers[TimerMode.SHORT_BREAK]}
                  onChange={(e) => handleChange(TimerMode.SHORT_BREAK, parseInt(e.target.value) || 0)}
                  className="w-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none text-right font-mono"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 text-sm">Long Break</span>
                <input 
                  type="number"
                  min="1"
                  max="60"
                  value={timers[TimerMode.LONG_BREAK]}
                  onChange={(e) => handleChange(TimerMode.LONG_BREAK, parseInt(e.target.value) || 0)}
                  className="w-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none text-right font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Save className="w-5 h-5" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};