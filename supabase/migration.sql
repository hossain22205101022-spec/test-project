-- StyleFeed Database Schema
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CREATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  follower_count INTEGER DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  image_url TEXT,
  video_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  hashtags TEXT[] DEFAULT '{}',
  engagement JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0}',
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_creator_id ON posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  retailer TEXT NOT NULL,
  price TEXT,
  affiliate_url TEXT NOT NULL,
  image_url TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_post_id ON products(post_id);

-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS follows (
  user_id UUID NOT NULL,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, creator_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_unique ON follows(user_id, creator_id);

-- ============================================
-- SAVES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saves (
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_saves_unique ON saves(user_id, post_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own follows"
  ON follows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own follows"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follows"
  ON follows FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on saves
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own saves"
  ON saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saves"
  ON saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves"
  ON saves FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access for creators and posts
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read creators"
  ON creators FOR SELECT
  USING (true);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Safely increment/decrement follower count
CREATE OR REPLACE FUNCTION increment_follower_count(
  creator_id_input UUID,
  increment_value INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE creators
  SET follower_count = GREATEST(0, follower_count + increment_value)
  WHERE id = creator_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Run this separately or via Supabase dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true);
-- Create Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  image_url text,
  author_id uuid REFERENCES auth.users(id),
  published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published blogs
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blogs' AND policyname = 'Public can read published blogs'
    ) THEN
        CREATE POLICY "Public can read published blogs" 
        ON public.blogs FOR SELECT 
        USING (published = true);
    END IF;
END $$;

-- Allow authenticated admins to do everything
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blogs' AND policyname = 'Admins can do everything on blogs'
    ) THEN
        CREATE POLICY "Admins can do everything on blogs" 
        ON public.blogs 
        FOR ALL 
        TO authenticated 
        USING (
          EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
          )
        );
    END IF;
END $$;
