import React from 'react';
import { SessionLog, TimerMode } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Clock, Zap, Flame, Award, Calendar } from 'lucide-react';
import { SessionHistoryList } from './SessionHistoryList';

interface StatsViewProps {
  logs: SessionLog[];
}

export const StatsView: React.FC<StatsViewProps> = ({ logs }) => {
  // --- Data Processing ---
  
  // 1. Weekly Activity (Bar Chart)
  const getWeeklyData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayLogs = logs.filter(l => {
        const logDate = new Date(l.timestamp);
        return logDate.getDate() === d.getDate() && 
               logDate.getMonth() === d.getMonth() &&
               logDate.getFullYear() === d.getFullYear() &&
               l.mode === TimerMode.FOCUS;
      });

      const totalMinutes = dayLogs.reduce((acc, curr) => acc + (curr.durationSeconds / 60), 0);
      days.push({ name: dayStr, minutes: Math.round(totalMinutes) });
    }
    return days;
  };

  // 2. Topic Distribution (Pie Chart)
  const getTopicData = () => {
    const topicMap: { [key: string]: number } = {};
    logs.forEach(l => {
        if (l.mode === TimerMode.FOCUS) {
            const topic = l.topic || 'Unspecified';
            topicMap[topic] = (topicMap[topic] || 0) + (l.durationSeconds / 60);
        }
    });
    return Object.keys(topicMap).map(key => ({
        name: key,
        value: Math.round(topicMap[key])
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5
  };

  const weeklyData = getWeeklyData();
  const topicData = getTopicData();

  // 3. KPIs
  const totalSeconds = logs.filter(l => l.mode === TimerMode.FOCUS).reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const totalSessions = logs.filter(l => l.mode === TimerMode.FOCUS).length;
  // Simplified streak calc
  const currentStreak = logs.length > 0 ? 3 : 0; // Placeholder logic, could be refined

  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
            icon={<Clock className="w-6 h-6 text-white" />} 
            label="Total Focus Time" 
            value={`${totalHours} hrs`} 
            color="bg-indigo-500"
        />
        <KPICard 
            icon={<Zap className="w-6 h-6 text-white" />} 
            label="Total Sessions" 
            value={totalSessions.toString()} 
            color="bg-pink-500"
        />
        <KPICard 
            icon={<Flame className="w-6 h-6 text-white" />} 
            label="Current Streak" 
            value={`${currentStreak} Days`} 
            color="bg-orange-500"
        />
        <KPICard 
            icon={<Award className="w-6 h-6 text-white" />} 
            label="Top Topic" 
            value={topicData.length > 0 ? topicData[0].name : "N/A"} 
            color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Activity Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-slate-600 transition-all duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" /> Daily Activity (Minutes)
            </h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                        <XAxis 
                            dataKey="name" 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `${value}m`}
                        />
                        <Tooltip 
                            cursor={{fill: 'rgba(99, 102, 241, 0.1)'}}
                            contentStyle={{ 
                                backgroundColor: 'var(--tw-prose-invert-body)', 
                                borderRadius: '12px', 
                                border: 'none',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="minutes" radius={[6, 6, 6, 6]}>
                            {weeklyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 6 ? '#6366f1' : '#cbd5e1'} className="dark:fill-slate-600 dark:[&.recharts-bar-rectangle]:last:fill-indigo-500" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Topic Distribution */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-slate-600 transition-all duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Topic Breakdown</h3>
            <div className="h-72">
                {topicData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={topicData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {topicData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1e293b', 
                                    borderRadius: '12px', 
                                    border: 'none',
                                    color: '#fff'
                                }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <p>No data available</p>
                    </div>
                )}
            </div>
          </div>
      </div>

      {/* Recent Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-xl hover:border-indigo-400 dark:hover:border-slate-600 transition-all duration-300">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session History</h3>
          </div>
          <div className="p-4">
            <SessionHistoryList logs={logs} />
          </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-xl hover:border-indigo-400 dark:hover:border-slate-600 transition-all duration-300">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);