import React, { useState } from 'react';
import { Link, Plus, Trash2, ExternalLink, Video, BookOpen, FileText, Newspaper, MoreHorizontal } from 'lucide-react';
import { Resource, ResourceType } from '../types';

interface ResourcesPanelProps {
  resources: Resource[];
  onAddResource: (resource: Resource) => void;
  onRemoveResource: (id: string) => void;
}

export const ResourcesPanel: React.FC<ResourcesPanelProps> = ({ resources, onAddResource, onRemoveResource }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('DOCUMENTATION');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAddResource({
        id: Date.now().toString(),
        url: url.startsWith('http') ? url : `https://${url}`,
        title: title.trim() || url,
        type: type
      });
      setUrl('');
      setTitle('');
      setType('DOCUMENTATION');
    }
  };

  const getTypeConfig = (t: ResourceType) => {
    switch (t) {
      case 'VIDEO': return { color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30', icon: <Video className="w-3 h-3" />, label: 'Video' };
      case 'BLOG': return { color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30', icon: <BookOpen className="w-3 h-3" />, label: 'Blog' };
      case 'DOCUMENTATION': return { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30', icon: <FileText className="w-3 h-3" />, label: 'Docs' };
      case 'ARTICLE': return { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30', icon: <Newspaper className="w-3 h-3" />, label: 'Article' };
      default: return { color: 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700', icon: <MoreHorizontal className="w-3 h-3" />, label: 'Other' };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-slate-600 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
        <Link className="w-5 h-5 text-indigo-500" />
        Session Resources
      </h3>
      
      <form onSubmit={handleAdd} className="space-y-3 mb-6">
        <div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste URL (docs, blog, video)..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link Title (optional)"
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ResourceType)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="DOCUMENTATION">Docs</option>
            <option value="VIDEO">Video</option>
            <option value="BLOG">Blog</option>
            <option value="ARTICLE">Article</option>
            <option value="OTHER">Other</option>
          </select>
          <button 
            type="submit"
            disabled={!url.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white p-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {resources.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center italic py-2">No resources added yet.</p>
        )}
        {resources.map(res => {
            const config = getTypeConfig(res.type || 'OTHER');
            return (
              <div key={res.id} className="group flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:border-indigo-500/30 transition-all">
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${config.color}`}>
                     {config.icon}
                  </div>
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-slate-700 dark:text-slate-200 truncate font-medium">{res.title}</div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border ${config.color.replace('w-8 h-8', '')}`}>
                            {config.label}
                        </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                        <ExternalLink className="w-2.5 h-2.5" /> {res.url}
                    </div>
                  </div>
                </a>
                <button 
                  onClick={() => onRemoveResource(res.id)}
                  className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
        })}
      </div>
    </div>
  );
};