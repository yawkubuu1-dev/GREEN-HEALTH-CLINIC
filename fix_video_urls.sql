-- ============================================
-- FIX VIDEO URLs - Replace Mux with YouTube
-- ============================================

-- First, let's see what video URLs we have
SELECT 
  id,
  title,
  video_id,
  video_url,
  LEFT(video_url, 50) as url_preview
FROM public.blog_posts
WHERE video_url IS NOT NULL OR video_id IS NOT NULL
ORDER BY created_at DESC;

-- If you have Mux videos, replace them with YouTube videos
-- Example: Update specific posts with working YouTube videos

-- Update posts that have Mux/broken video URLs
-- Replace with relevant health/medicine/pharmacy YouTube videos

UPDATE public.blog_posts
SET 
  video_id = 'dQw4w9WgXcQ',  -- Replace with actual YouTube video ID
  video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'  -- Replace with actual YouTube URL
WHERE video_url LIKE '%mux.com%' OR video_url LIKE '%stream.mux%';

-- Or clear broken video URLs entirely
-- UPDATE public.blog_posts
-- SET video_id = NULL, video_url = NULL
-- WHERE video_url LIKE '%mux.com%' OR video_url LIKE '%stream.mux%';

-- Verify the changes
SELECT 
  id,
  title,
  video_id,
  video_url
FROM public.blog_posts
WHERE video_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
