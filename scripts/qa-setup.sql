-- =======================================================
-- SQL Setup Script for Q&A System with Gold & Rank Gamification
-- Run this script in the Supabase SQL Editor.
-- =======================================================

-- Enable pgcrypto for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    gold_balance INTEGER DEFAULT 0 CHECK (gold_balance >= 0) NOT NULL,
    rank TEXT DEFAULT 'Kim Ngư' CHECK (rank IN ('Kim Ngư', 'Linh Long', 'Đế Long', 'Hỏa Long', 'Thiên Long')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Threads table
CREATE TABLE IF NOT EXISTS public.threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for threads
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

-- 3. Create Thread Comments table (using thread_comments to avoid conflict with existing blog comments)
CREATE TABLE IF NOT EXISTS public.thread_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_best_answer BOOLEAN DEFAULT false NOT NULL,
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for thread_comments
ALTER TABLE public.thread_comments ENABLE ROW LEVEL SECURITY;

-- 4. Create Thread Comment Likes table (using thread_comment_likes to avoid conflict)
CREATE TABLE IF NOT EXISTS public.thread_comment_likes (
    comment_id UUID REFERENCES public.thread_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (comment_id, user_id)
);

-- Enable RLS for thread_comment_likes
ALTER TABLE public.thread_comment_likes ENABLE ROW LEVEL SECURITY;


-- =======================================================
-- RLS POLICIES
-- =======================================================

-- Profiles Policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile info" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Threads Policies
CREATE POLICY "Threads are viewable by everyone" ON public.threads
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON public.threads
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own threads" ON public.threads
    FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own threads" ON public.threads
    FOR DELETE USING (auth.uid() = author_id);

-- Thread Comments Policies
CREATE POLICY "Thread comments are viewable by everyone" ON public.thread_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert thread comments" ON public.thread_comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their thread comments or thread owners can select best answer" ON public.thread_comments
    FOR UPDATE USING (
        auth.uid() = author_id OR 
        auth.uid() = (SELECT author_id FROM public.threads WHERE id = thread_id)
    );

CREATE POLICY "Users can delete their own thread comments" ON public.thread_comments
    FOR DELETE USING (auth.uid() = author_id);

-- Thread Comment Likes Policies
CREATE POLICY "Thread comment likes are viewable by everyone" ON public.thread_comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like thread comments" ON public.thread_comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can unlike thread comments" ON public.thread_comment_likes
    FOR DELETE USING (auth.uid() = user_id);


-- =======================================================
-- FUNCTIONS & TRIGGERS
-- =======================================================

-- A. Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_qa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_threads_updated_at
    BEFORE UPDATE ON public.threads
    FOR EACH ROW EXECUTE PROCEDURE public.handle_qa_updated_at();

CREATE TRIGGER update_thread_comments_updated_at
    BEFORE UPDATE ON public.thread_comments
    FOR EACH ROW EXECUTE PROCEDURE public.handle_qa_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_qa_updated_at();


-- B. Auto-create Profile on User Signup (Google OAuth / Auth Signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    init_gold INTEGER := 0;
    init_rank TEXT := 'Kim Ngư';
BEGIN
    IF NEW.email = 'vutrongvtv24@gmail.com' THEN
        init_gold := 1000;
        init_rank := 'Thiên Long';
    END IF;

    INSERT INTO public.profiles (id, display_name, avatar_url, gold_balance, rank)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        init_gold,
        init_rank
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- C. Protect Profile Score (Gold/Rank) from direct Client manipulation
CREATE OR REPLACE FUNCTION public.protect_profile_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Reset score to old score if updated by authenticated client without system bypass
    IF auth.role() = 'authenticated' THEN
        NEW.gold_balance = OLD.gold_balance;
        NEW.rank = OLD.rank;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS z_protect_profile_score_trigger ON public.profiles;
CREATE TRIGGER z_protect_profile_score_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_score();


-- D. Auto-update Rank based on Gold balance
CREATE OR REPLACE FUNCTION public.update_user_rank()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

    IF user_email = 'vutrongvtv24@gmail.com' THEN
        NEW.rank := 'Thiên Long';
    ELSE
        NEW.rank = CASE
            WHEN NEW.gold_balance >= 1000 THEN 'Thiên Long'
            WHEN NEW.gold_balance >= 500 THEN 'Hỏa Long'
            WHEN NEW.gold_balance >= 200 THEN 'Đế Long'
            WHEN NEW.gold_balance >= 50 THEN 'Linh Long'
            ELSE 'Kim Ngư'
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS before_profile_gold_update ON public.profiles;
CREATE TRIGGER before_profile_gold_update
    BEFORE UPDATE OF gold_balance ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_user_rank();


-- E. Thread Commment Interaction Gold: +1 Gold on FIRST comment in a thread
CREATE OR REPLACE FUNCTION public.handle_thread_comment_gold()
RETURNS TRIGGER AS $$
DECLARE
    existing_comments_count INTEGER;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Count other comments from this user in the same thread
        SELECT COUNT(*) INTO existing_comments_count
        FROM public.thread_comments
        WHERE thread_id = NEW.thread_id
          AND author_id = NEW.author_id
          AND id <> NEW.id;

        -- If this is the user's first comment in this thread, award 1 Gold
        IF existing_comments_count = 0 THEN
            UPDATE public.profiles
            SET gold_balance = gold_balance + 1
            WHERE id = NEW.author_id;
        END IF;
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        -- Count remaining comments from this user in the same thread
        SELECT COUNT(*) INTO existing_comments_count
        FROM public.thread_comments
        WHERE thread_id = OLD.thread_id
          AND author_id = OLD.author_id;

        -- If no comments remain, revoke the 1 Gold
        IF existing_comments_count = 0 THEN
            UPDATE public.profiles
            SET gold_balance = GREATEST(0, gold_balance - 1)
            WHERE id = OLD.author_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_thread_comment_inserted_deleted ON public.thread_comments;
CREATE TRIGGER on_thread_comment_inserted_deleted
    AFTER INSERT OR DELETE ON public.thread_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_thread_comment_gold();


-- F. Thread Comment Likes Gold: +1 Gold when comment is liked, -1 when unliked (Anti-self-like)
CREATE OR REPLACE FUNCTION public.handle_thread_comment_like_gold()
RETURNS TRIGGER AS $$
DECLARE
    comment_author_id UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        SELECT author_id INTO comment_author_id FROM public.thread_comments WHERE id = NEW.comment_id;
        
        -- Prevent self-liking
        IF NEW.user_id = comment_author_id THEN
            RAISE EXCEPTION 'You cannot like your own comment.';
        END IF;

        -- Increment comment likes_count
        UPDATE public.thread_comments
        SET likes_count = likes_count + 1
        WHERE id = NEW.comment_id;

        -- Award 1 Gold to author of the comment
        UPDATE public.profiles
        SET gold_balance = gold_balance + 1
        WHERE id = comment_author_id;

        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        SELECT author_id INTO comment_author_id FROM public.thread_comments WHERE id = OLD.comment_id;

        -- Decrement comment likes_count
        UPDATE public.thread_comments
        SET likes_count = GREATEST(0, likes_count - 1)
        WHERE id = OLD.comment_id;

        -- Revoke 1 Gold from author of the comment
        UPDATE public.profiles
        SET gold_balance = GREATEST(0, gold_balance - 1)
        WHERE id = comment_author_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_thread_comment_like_inserted ON public.thread_comment_likes;
CREATE TRIGGER on_thread_comment_like_inserted
    BEFORE INSERT ON public.thread_comment_likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_thread_comment_like_gold();

DROP TRIGGER IF EXISTS on_thread_comment_like_deleted ON public.thread_comment_likes;
CREATE TRIGGER on_thread_comment_like_deleted
    AFTER DELETE ON public.thread_comment_likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_thread_comment_like_gold();


-- G. Best Answer Gold: +10 Gold when selected as Best Answer, -10 Gold when deselected
CREATE OR REPLACE FUNCTION public.handle_thread_best_answer_gold()
RETURNS TRIGGER AS $$
BEGIN
    -- When marked as Best Answer
    IF NEW.is_best_answer = true AND OLD.is_best_answer = false THEN
        -- Award 10 Gold to comment author
        UPDATE public.profiles
        SET gold_balance = gold_balance + 10
        WHERE id = NEW.author_id;

        -- Automatically reset all other comments in the same thread
        UPDATE public.thread_comments
        SET is_best_answer = false
        WHERE thread_id = NEW.thread_id
          AND id <> NEW.id
          AND is_best_answer = true;

    -- When unmarked as Best Answer
    ELSIF NEW.is_best_answer = false AND OLD.is_best_answer = true THEN
        -- Revoke 10 Gold from comment author
        UPDATE public.profiles
        SET gold_balance = GREATEST(0, gold_balance - 10)
        WHERE id = NEW.author_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_thread_comment_best_answer_updated ON public.thread_comments;
CREATE TRIGGER on_thread_comment_best_answer_updated
    AFTER UPDATE OF is_best_answer ON public.thread_comments
    FOR EACH ROW
    WHEN (OLD.is_best_answer IS DISTINCT FROM NEW.is_best_answer)
    EXECUTE FUNCTION public.handle_thread_best_answer_gold();


-- =======================================================
-- Retroactive profiles migration for existing users
-- =======================================================
INSERT INTO public.profiles (id, display_name, avatar_url, gold_balance, rank)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
    COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture'),
    0,
    'Kim Ngư'
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- =======================================================
-- H. Auto-assign Admin metadata to vutrongvtv24@gmail.com on user signup
-- =======================================================
CREATE OR REPLACE FUNCTION public.set_admin_metadata()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email = 'vutrongvtv24@gmail.com' THEN
        NEW.raw_user_meta_data := coalesce(NEW.raw_user_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_before_insert ON auth.users;
CREATE TRIGGER on_auth_user_before_insert
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.set_admin_metadata();
