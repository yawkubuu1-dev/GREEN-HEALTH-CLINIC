-- ============================================
-- ADD VIDEO SUPPORT TO EXISTING BLOG POSTS
-- ============================================
-- This script adds MP4 and video link support to blog_posts table

-- Step 1: Add video columns to existing blog_posts table
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'mp4' 
    CHECK (video_type IN ('mp4', 'youtube', 'vimeo', 'other')),
  ADD COLUMN IF NOT EXISTS video_duration TEXT DEFAULT 'N/A',
  ADD COLUMN IF NOT EXISTS has_video BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Update existing posts if needed (example)
-- UPDATE public.blog_posts 
-- SET 
--   video_url = 'https://yourdomain.com/videos/sample.mp4',
--   video_type = 'mp4',
--   video_duration = '5:30',
--   has_video = true
-- WHERE title = 'Your Post Title';

-- Step 3: Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'blog_posts'
  AND column_name IN ('video_url', 'video_type', 'video_duration', 'has_video')
ORDER BY ordinal_position;

-- Step 4: Sample query to check posts with videos
SELECT 
  title,
  video_url,
  video_type,
  video_duration,
  has_video
FROM public.blog_posts
WHERE has_video = true;
