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
    comment_banned_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
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


-- E2. Thread Creation Reward: +10 Gold when user creates a thread, -10 Gold when deleted
CREATE OR REPLACE FUNCTION public.handle_thread_creation_gold()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles
        SET gold_balance = gold_balance + 10
        WHERE id = NEW.author_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles
        SET gold_balance = GREATEST(0, gold_balance - 10)
        WHERE id = OLD.author_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_thread_created_deleted ON public.threads;
CREATE TRIGGER on_thread_created_deleted
    AFTER INSERT OR DELETE ON public.threads
    FOR EACH ROW EXECUTE FUNCTION public.handle_thread_creation_gold();


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


-- =======================================================
-- Blog, Comments, Settings and Analytics Schema
-- Added for full feature parity on new Supabase databases
-- =======================================================

-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read site_settings" ON public.site_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admin modify site_settings" ON public.site_settings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.site_settings (key, value) VALUES
('site_name', 'Tulanh'),
('excluded_view_ips', '127.0.0.1'),
('predefined_tags', '["Frontend", "Design", "Devops"]')
ON CONFLICT (key) DO NOTHING;

-- 2. Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    draft BOOLEAN DEFAULT false NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    post_password TEXT,
    post_password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active posts" ON public.posts
    FOR SELECT USING (
        (draft = false AND is_visible = true) OR public.is_admin()
    );

CREATE POLICY "Allow admin modify posts" ON public.posts
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    post_slug TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read approved comments" ON public.comments
    FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Allow public insert comments" ON public.comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow author or admin update comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Allow author or admin delete comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- 4. Create visit_logs table
CREATE TABLE IF NOT EXISTS public.visit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    page_path TEXT NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.visit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert visit_logs" ON public.visit_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin view visit_logs" ON public.visit_logs
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Create page_views table
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_slug TEXT NOT NULL,
    visitor_ip TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert page_views" ON public.page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin view page_views" ON public.page_views
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Analytics and Helper functions
CREATE OR REPLACE FUNCTION public.get_view_summary(days integer DEFAULT 30)
RETURNS TABLE(views_today bigint, total_views bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*)::bigint FROM public.visit_logs WHERE created_at >= timezone('utc'::text, now() - interval '1 day')),
    (SELECT count(*)::bigint FROM public.visit_logs WHERE days IS NULL OR created_at >= timezone('utc'::text, now() - (days || ' days')::interval));
END;
$$;

CREATE OR REPLACE FUNCTION public.get_daily_views(days integer DEFAULT 30)
RETURNS TABLE(date date, views bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    created_at::date AS date,
    count(*)::bigint AS views
  FROM public.visit_logs
  WHERE days IS NULL OR created_at >= timezone('utc'::text, now() - (days || ' days')::interval)
  GROUP BY created_at::date
  ORDER BY date ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_top_posts(limit_count integer, days integer DEFAULT 30)
RETURNS TABLE(title text, views bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.title,
    count(v.id)::bigint AS views
  FROM public.page_views v
  JOIN public.posts p ON v.post_slug = p.slug
  WHERE days IS NULL OR v.created_at >= timezone('utc'::text, now() - (days || ' days')::interval)
  GROUP BY p.title
  ORDER BY views DESC
  LIMIT limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_post_view_counts()
RETURNS TABLE(slug text, views bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    post_slug AS slug,
    count(*)::bigint AS views
  FROM public.page_views
  GROUP BY post_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_visit_logs_stats()
RETURNS TABLE(total_hits bigint, hits_today bigint, unique_ips bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*)::bigint FROM public.visit_logs),
    (SELECT count(*)::bigint FROM public.visit_logs WHERE created_at >= timezone('utc'::text, now() - interval '1 day')),
    (SELECT count(DISTINCT ip_address)::bigint FROM public.visit_logs);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_view_summary(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_view_summary(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_daily_views(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_views(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_top_posts(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_posts(integer, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_post_view_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_post_view_counts() TO anon;
GRANT EXECUTE ON FUNCTION public.get_visit_logs_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_visit_logs_stats() TO anon;

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_visit_logs_created_at ON public.visit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_visit_logs_ip ON public.visit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_page_views_post_slug ON public.page_views(post_slug);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON public.comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);
