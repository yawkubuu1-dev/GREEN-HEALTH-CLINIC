-- Check blog_posts table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'blog_posts'
ORDER BY ordinal_position;

-- Check if there are any video-related entries
SELECT 
  title,
  category,
  date,
  duration,
  content
FROM public.blog_posts
WHERE content LIKE '%video%' 
   OR content LIKE '%youtube%'
   OR content LIKE '%vimeo%'
LIMIT 10;
