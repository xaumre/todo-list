-- Migration: Create tasks table
-- Description: Creates the tasks table with user ownership and task isolation

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast task retrieval by user
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Composite index for filtering tasks by user and completion status
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, completed);

-- Add comments for documentation
COMMENT ON TABLE tasks IS 'Stores user tasks with ownership isolation';
COMMENT ON COLUMN tasks.id IS 'Unique task identifier (UUID)';
COMMENT ON COLUMN tasks.user_id IS 'Owner user ID (foreign key to users table)';
COMMENT ON COLUMN tasks.description IS 'Task description text';
COMMENT ON COLUMN tasks.completed IS 'Task completion status';
