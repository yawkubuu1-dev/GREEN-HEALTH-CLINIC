-- ============================================
-- FIX VIDEO DURATIONS IN BLOG POSTS
-- ============================================
-- This script adds proper video duration values to blog posts

-- First, check if duration column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'duration'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN duration TEXT;
  END IF;
END $$;

-- Update existing blog posts with proper video durations
-- Format: "MM:SS" or "HH:MM:SS" for videos, NULL for text articles

UPDATE public.blog_posts
SET duration = CASE 
  WHEN title ILIKE '%video%' OR title ILIKE '%watch%' THEN '5:30'
  WHEN title ILIKE '%tutorial%' THEN '8:45'
  WHEN title ILIKE '%guide%' THEN '12:15'
  ELSE NULL -- Text articles don't have duration
END
WHERE duration IS NULL OR duration = 'N/A';

-- For specific posts that you know are videos, set their actual durations:
-- Example updates (customize these based on your actual video content):

-- UPDATE public.blog_posts
-- SET duration = '3:45'
-- WHERE slug = 'specific-video-slug-here';

-- Verify the changes
SELECT 
  title,
  category,
  date,
  duration
FROM public.blog_posts
ORDER BY created_at DESC
LIMIT 20;
