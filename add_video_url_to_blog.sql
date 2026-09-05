-- Add video_url column to blog_posts for universal video support
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS video_url text;

-- Add a comment explaining the column
COMMENT ON COLUMN public.blog_posts.video_url IS 'Universal video URL - supports YouTube, Vimeo, direct MP4/WebM URLs, or any iframe-embeddable video';

-- Update existing records to use full YouTube URLs (optional, for consistency)
-- This converts video_id to full YouTube URLs
UPDATE public.blog_posts
SET video_url = 'https://www.youtube.com/watch?v=' || video_id
WHERE video_id IS NOT NULL 
  AND video_id != '' 
  AND (video_url IS NULL OR video_url = '');

-- Check the result
SELECT 
  title,
  category,
  video_id,
  video_url,
  date
FROM public.blog_posts
ORDER BY date DESC
LIMIT 10;
