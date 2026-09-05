-- Check current blog posts
SELECT 
  title,
  category_id,
  status,
  published_at,
  video_url,
  video_type,
  video_duration,
  has_video,
  view_count,
  is_featured
FROM public.blog_posts
ORDER BY created_at DESC;

-- Check blog categories
SELECT 
  name,
  slug,
  description,
  icon,
  color,
  is_active
FROM public.blog_categories
ORDER BY sort_order;

-- Check blog authors
SELECT 
  name,
  email,
  title,
  bio,
  is_active
FROM public.blog_authors;

-- Count posts by category
SELECT 
  c.name as category,
  COUNT(p.id) as post_count
FROM public.blog_categories c
LEFT JOIN public.blog_posts p ON c.id = p.category_id
GROUP BY c.name
ORDER BY post_count DESC;
