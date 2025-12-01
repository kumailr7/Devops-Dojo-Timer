// Database queries for Vercel Postgres
import { SessionLog, Task, Resource, AppConfig } from '../types';

const API_BASE = '/api';

export const dbQueries = {
  // User operations
  async createUser(userId: string, email: string) {
    const res = await fetch(`${API_BASE}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email })
    });
    return res.json();
  },

  // Session logs
  async getSessionLogs(userId: string): Promise<SessionLog[]> {
    const res = await fetch(`${API_BASE}/sessions?userId=${userId}`);
    return res.json();
  },

  async createSessionLog(userId: string, session: SessionLog) {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, session })
    });
    return res.json();
  },

  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks?userId=${userId}`);
    return res.json();
  },

  async createTask(userId: string, task: Task) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, task })
    });
    return res.json();
  },

  async updateTask(userId: string, task: Task) {
    const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, task })
    });
    return res.json();
  },

  async deleteTask(userId: string, taskId: string) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}?userId=${userId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Resources
  async getResources(userId: string): Promise<Resource[]> {
    const res = await fetch(`${API_BASE}/resources?userId=${userId}`);
    return res.json();
  },

  async createResource(userId: string, resource: Resource) {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, resource })
    });
    return res.json();
  },

  // User config
  async getUserConfig(userId: string): Promise<AppConfig> {
    const res = await fetch(`${API_BASE}/config?userId=${userId}`);
    return res.json();
  },

  async updateUserConfig(userId: string, config: AppConfig) {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, config })
    });
    return res.json();
  },
};

