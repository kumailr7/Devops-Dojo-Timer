export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
  CUSTOM = 'CUSTOM'
}

export type ResourceType = 'VIDEO' | 'BLOG' | 'DOCUMENTATION' | 'ARTICLE' | 'OTHER';

export interface Resource {
  id: string;
  url: string;
  title: string;
  type: ResourceType;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'ON_HOLD' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  text: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  startDate: number;
  targetDate?: string; // ISO Date string YYYY-MM-DD
  completed: boolean; // Kept for backward compatibility, mapped to status === 'DONE'
}

export interface SessionLog {
  id: string;
  timestamp: number;
  durationSeconds: number;
  mode: TimerMode;
  sessionLabel?: string; // Optional label for custom timers
  topic: string;
  tags: string[];
  resources?: Resource[];
  tasks?: Task[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface AIInsight {
  type: 'productivity' | 'topic' | 'schedule';
  message: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AppConfig {
  featureFlags: {
    experimentalAI: boolean;
    slackIntegration: boolean;
    plannerIntegration: boolean;
  };
  timers: {
    [key in TimerMode]: number; // in seconds
  };
}