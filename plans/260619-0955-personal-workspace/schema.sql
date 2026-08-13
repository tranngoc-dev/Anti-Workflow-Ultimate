-- ==========================================
-- SQL Script for Personal Workspace tables
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create workspace_todos table
CREATE TABLE IF NOT EXISTS public.workspace_todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    deadline TIMESTAMP WITH TIME ZONE,
    pomodoros_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for workspace_todos
ALTER TABLE public.workspace_todos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_todos
CREATE POLICY "Users can create their own todos" ON public.workspace_todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own todos" ON public.workspace_todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON public.workspace_todos
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON public.workspace_todos
    FOR DELETE USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_workspace_todos_user ON public.workspace_todos(user_id);


-- 2. Create workspace_notes table
CREATE TABLE IF NOT EXISTS public.workspace_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Ghi chú mới',
    content TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for workspace_notes
ALTER TABLE public.workspace_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_notes
CREATE POLICY "Users can create their own notes" ON public.workspace_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notes" ON public.workspace_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.workspace_notes
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.workspace_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_workspace_notes_user ON public.workspace_notes(user_id);


-- 3. Create workspace_pomodoro_history table
CREATE TABLE IF NOT EXISTS public.workspace_pomodoro_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    todo_id UUID REFERENCES public.workspace_todos(id) ON DELETE SET NULL,
    duration_minutes INTEGER DEFAULT 25 NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for workspace_pomodoro_history
ALTER TABLE public.workspace_pomodoro_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_pomodoro_history
CREATE POLICY "Users can insert their own pomodoro records" ON public.workspace_pomodoro_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own pomodoro history" ON public.workspace_pomodoro_history
    FOR SELECT USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_workspace_pomodoro_user ON public.workspace_pomodoro_history(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_pomodoro_completed_at ON public.workspace_pomodoro_history(completed_at);


-- 4. Create trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workspace_todos_updated_at
    BEFORE UPDATE ON public.workspace_todos
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_workspace_notes_updated_at
    BEFORE UPDATE ON public.workspace_notes
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();


-- 5. Create RPC function to increment pomodoro count safely
CREATE OR REPLACE FUNCTION public.increment_todo_pomodoro(todo_id_arg UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.workspace_todos
    SET pomodoros_completed = pomodoros_completed + 1
    WHERE id = todo_id_arg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
