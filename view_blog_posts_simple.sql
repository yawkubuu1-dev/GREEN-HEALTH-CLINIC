-- Check if blog_posts table exists and view its structure
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'blog_posts'
ORDER BY ordinal_position;

-- If blog_posts exists, view all posts
SELECT 
  id,
  title,
  category_id,
  status,
  published_at,
  created_at
FROM public.blog_posts
ORDER BY created_at DESC;
