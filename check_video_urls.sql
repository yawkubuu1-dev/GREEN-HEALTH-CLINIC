-- Check all video URLs in blog_posts to find Mux videos
SELECT 
  id,
  title,
  video_id,
  video_url,
  category
FROM public.blog_posts
WHERE video_url IS NOT NULL OR video_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 50;
