-- Check blog posts video data
SELECT 
  id,
  title,
  category,
  video_id,
  video_url,
  video_thumbnail,
  video_duration,
  date
FROM public.blog_posts
ORDER BY date DESC
LIMIT 10;
