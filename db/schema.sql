-- DevOps Dojo AI Database Schema

-- Users table (for additional user data)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session logs table
CREATE TABLE IF NOT EXISTS session_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp BIGINT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  mode TEXT NOT NULL, -- 'focus', 'short_break', 'long_break', 'custom'
  session_label TEXT,
  topic TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_timestamp ON session_logs(user_id, timestamp DESC);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_log_id TEXT REFERENCES session_logs(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'video', 'article', 'course', 'doc'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL, -- 'todo', 'in_progress', 'done'
  priority TEXT, -- 'low', 'medium', 'high'
  due_date BIGINT,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_status ON tasks(user_id, status);

-- User config table
CREATE TABLE IF NOT EXISTS user_config (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  timers JSONB DEFAULT '{"focus": 1500, "short_break": 300, "long_break": 900, "custom": 1200}',
  feature_flags JSONB DEFAULT '{"experimentalAI": true, "slackIntegration": false, "plannerIntegration": true}',
  theme TEXT DEFAULT 'dark',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

