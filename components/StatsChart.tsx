import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SessionLog, TimerMode } from '../types';

interface StatsChartProps {
  logs: SessionLog[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ logs }) => {
  // Process logs into last 7 days data
  const getLast7DaysData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Filter logs for this day and mode = FOCUS
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

  const data = getLast7DaysData();

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
              border: 'none', 
              borderRadius: '12px', 
              color: '#fff',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: '#fff' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar dataKey="minutes" radius={[6, 6, 6, 6]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 6 ? '#6366f1' : '#cbd5e1'} className="dark:fill-slate-600 dark:[&.recharts-bar-rectangle]:last:fill-indigo-500" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};