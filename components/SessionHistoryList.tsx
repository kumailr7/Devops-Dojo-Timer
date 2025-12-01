import React, { useState } from 'react';
import { SessionLog, TimerMode, ResourceType } from '../types';
import { History, Clock, Tag, Calendar, Zap, Coffee, User as UserIcon, Star, Link, CheckSquare, ChevronDown, ChevronUp, ExternalLink, Video, BookOpen, FileText, Newspaper, MoreHorizontal } from 'lucide-react';

interface SessionHistoryListProps {
  logs: SessionLog[];
}

export const SessionHistoryList: React.FC<SessionHistoryListProps> = ({ logs }) => {
  // Sort by newest first
  const sortedLogs = [...logs]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);

  if (logs.length === 0) {
    return (
      <div className="text-center p-8 text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/30 transition-colors">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No completed sessions recorded.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-slate-600 transition-all duration-300">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-white dark:bg-slate-800">
        <History className="w-4 h-4 text-indigo-500" />
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Session History</h3>
      </div>
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {sortedLogs.map((log) => (
               <HistoryItem key={log.id} log={log} />
            ))}
        </div>
      </div>
    </div>
  );
};

const HistoryItem: React.FC<{ log: SessionLog }> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);

  const getModeIcon = (mode: TimerMode) => {
    switch (mode) {
      case TimerMode.FOCUS: return <Zap className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />;
      case TimerMode.SHORT_BREAK: return <Coffee className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />;
      case TimerMode.LONG_BREAK: return <UserIcon className="w-3 h-3 text-blue-500 dark:text-blue-400" />;
      case TimerMode.CUSTOM: return <Star className="w-3 h-3 text-pink-500 dark:text-pink-400" />;
    }
  };

  const getResourceTypeConfig = (t: ResourceType) => {
    switch (t) {
      case 'VIDEO': return { color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30', icon: <Video className="w-3 h-3" /> };
      case 'BLOG': return { color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30', icon: <BookOpen className="w-3 h-3" /> };
      case 'DOCUMENTATION': return { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30', icon: <FileText className="w-3 h-3" /> };
      case 'ARTICLE': return { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30', icon: <Newspaper className="w-3 h-3" /> };
      default: return { color: 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700', icon: <Link className="w-3 h-3" /> };
    }
  };

  const hasContent = (log.resources && log.resources.length > 0) || (log.tasks && log.tasks.length > 0);

  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
        <div className="flex justify-between items-start mb-2 cursor-pointer" onClick={() => hasContent && setExpanded(!expanded)}>
            <div className="flex flex-col overflow-hidden pr-4">
                <h4 className="font-medium text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate flex items-center gap-2">
                {log.topic}
                {hasContent && (
                    expanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />
                )}
                </h4>
                {log.sessionLabel && log.mode === TimerMode.CUSTOM && (
                <span className="text-[10px] text-pink-500 dark:text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <Star className="w-2.5 h-2.5" /> {log.sessionLabel}
                </span>
                )}
            </div>
            <span className={`shrink-0 text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                log.mode === TimerMode.CUSTOM ? 'bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' : 
                log.mode === TimerMode.SHORT_BREAK || log.mode === TimerMode.LONG_BREAK ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
            }`}>
                {getModeIcon(log.mode)}
                {Math.round(log.durationSeconds / 60)}m
            </span>
        </div>
        
        {/* Meta Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 mb-2">
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span>
                {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
            {log.tags && log.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                {log.tags.map(tag => (
                    <span key={tag} className="flex items-center bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        #{tag}
                    </span>
                ))}
                </div>
            )}
        </div>

        {/* Expanded Content: Resources & Tasks */}
        {expanded && hasContent && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 grid gap-3 animate-in slide-in-from-top-2 fade-in">
                {log.resources && log.resources.length > 0 && (
                    <div>
                        <h5 className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 mb-1 flex items-center gap-1">
                            <Link className="w-3 h-3" /> Resources
                        </h5>
                        <ul className="space-y-1">
                            {log.resources.map(res => {
                                const config = getResourceTypeConfig(res.type || 'OTHER');
                                return (
                                <li key={res.id}>
                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:underline group/link">
                                        <div className={`p-0.5 rounded ${config.color.split(' ').filter(c => c.startsWith('bg') || c.startsWith('text')).join(' ')}`}>
                                            {config.icon}
                                        </div>
                                        <span>{res.title}</span>
                                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            )})}
                        </ul>
                    </div>
                )}
                
                {log.tasks && log.tasks.length > 0 && (
                    <div>
                        <h5 className="text-[10px] uppercase font-bold text-emerald-500 dark:text-emerald-400 mb-1 flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" /> Tasks
                        </h5>
                        <ul className="space-y-1">
                            {log.tasks.map(task => (
                                <li key={task.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <span className={`w-3 h-3 flex items-center justify-center rounded-sm border ${task.completed ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : 'border-slate-300 dark:border-slate-600'}`}>
                                        {task.completed && <CheckSquare className="w-2 h-2" />}
                                    </span>
                                    <span className={task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>{task.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};