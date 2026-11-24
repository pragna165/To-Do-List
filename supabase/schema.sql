-- TaskFlow Supabase Database Schema & Row Level Security (RLS)
-- Run this script in your Supabase project's SQL Editor.

-- 1. Enable cryptographic UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 120),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create an index on user_id and created_at for fast task retrieval
CREATE INDEX IF NOT EXISTS tasks_user_id_created_at_idx
  ON public.tasks (user_id, created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy: SELECT - Users can read only their own tasks
CREATE POLICY "Users can view their own tasks"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. RLS Policy: INSERT - Users can create tasks only for themselves
CREATE POLICY "Users can create their own tasks"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. RLS Policy: UPDATE - Users can update only their own tasks
CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. RLS Policy: DELETE - Users can delete only their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
