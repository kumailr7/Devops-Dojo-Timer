import React from 'react';
import { TimerMode } from '../types';

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  mode: TimerMode;
  customLabel?: string;
  isActive: boolean;
  onToggle: () => void;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({ 
  timeLeft, 
  totalTime, 
  mode, 
  customLabel,
  isActive, 
  onToggle 
}) => {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const dashoffset = circumference * (1 - progress);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    switch (mode) {
      case TimerMode.FOCUS: return 'text-indigo-600 dark:text-indigo-500';
      case TimerMode.SHORT_BREAK: return 'text-emerald-500 dark:text-emerald-500';
      case TimerMode.LONG_BREAK: return 'text-blue-500 dark:text-blue-500';
      case TimerMode.CUSTOM: return 'text-pink-500 dark:text-pink-500';
      default: return 'text-indigo-500';
    }
  };

  const getLabel = () => {
    if (mode === TimerMode.CUSTOM && customLabel) {
      return customLabel;
    }
    return mode.replace('_', ' ');
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-72 h-72 md:w-96 md:h-96">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-200 dark:text-slate-800 transition-colors"
        />
        {/* Progress Circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-linear ${getColor()} ${isActive ? 'drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]' : ''}`}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute flex flex-col items-center justify-center text-center max-w-[180px] md:max-w-[240px]">
        <div className="text-5xl md:text-6xl font-bold font-mono tracking-tight text-slate-800 dark:text-white mb-4 transition-colors">
          {formatTime(timeLeft)}
        </div>
        <button
          onClick={onToggle}
          className={`px-8 py-3 rounded-full font-semibold text-lg transition-all transform active:scale-95 whitespace-nowrap ${
            isActive 
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600' 
              : `${mode === TimerMode.CUSTOM ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-500/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'} text-white shadow-lg`
          }`}
        >
          {isActive ? 'PAUSE' : 'START'}
        </button>
        <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide uppercase truncate w-full px-2">
          {getLabel()}
        </div>
      </div>
    </div>
  );
};