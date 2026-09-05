-- ============================================
-- ADD VIDEO SUPPORT TO BLOG POSTS
-- ============================================

-- Step 1: Add video-related columns to blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'article'
    CHECK (content_type IN ('article', 'video')),
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_id TEXT, -- YouTube video ID
  ADD COLUMN IF NOT EXISTS video_platform TEXT DEFAULT 'youtube'
    CHECK (video_platform IN ('youtube', 'vimeo', 'other')),
  ADD COLUMN IF NOT EXISTS video_duration TEXT, -- e.g., "5:23"
  ADD COLUMN IF NOT EXISTS video_thumbnail TEXT; -- custom thumbnail if different from featured_image

-- Step 2: Create an index on content_type for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_content_type ON public.blog_posts(content_type);

-- Step 3: Insert sample video posts
INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, video_thumbnail, video_id, video_url, video_duration,
   content_type, category_id, author_id, status, is_featured, published_at)
SELECT
  'How to Properly Take Medication',
  'how-to-properly-take-medication-video',
  'Watch this essential guide on proper medication administration and timing.',
  'Learn the correct way to take your medications for maximum effectiveness and safety.',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'dQw4w9WgXcQ', -- Replace with actual YouTube video ID
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '4:32',
  'video',
  (SELECT id FROM public.blog_categories WHERE slug = 'medicine-guide' LIMIT 1),
  (SELECT id FROM public.blog_authors WHERE email = 'sarah@prolynwear.com' LIMIT 1),
  'published',
  true,
  now() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'how-to-properly-take-medication-video');

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, video_thumbnail, video_id, video_url, video_duration,
   content_type, category_id, author_id, status, is_featured, published_at)
SELECT
  'Understanding Your Prescription Label',
  'understanding-prescription-label-video',
  'A quick guide to reading and understanding prescription labels.',
  'Learn what all those numbers and codes on your prescription label mean.',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'dQw4w9WgXcQ', -- Replace with actual YouTube video ID
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '3:45',
  'video',
  (SELECT id FROM public.blog_categories WHERE slug = 'health-tips' LIMIT 1),
  (SELECT id FROM public.blog_authors WHERE email = 'sarah@prolynwear.com' LIMIT 1),
  'published',
  true,
  now() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'understanding-prescription-label-video');

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, video_thumbnail, video_id, video_url, video_duration,
   content_type, category_id, author_id, status, published_at)
SELECT
  'Immune-Boosting Foods for Better Health',
  'immune-boosting-foods-video',
  'Discover foods that naturally strengthen your immune system.',
  'Nutritionist James Mitchell shares his top picks for immune-boosting foods you should include in your diet.',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'dQw4w9WgXcQ', -- Replace with actual YouTube video ID
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '6:18',
  'video',
  (SELECT id FROM public.blog_categories WHERE slug = 'nutrition' LIMIT 1),
  (SELECT id FROM public.blog_authors WHERE email = 'james@prolynwear.com' LIMIT 1),
  'published',
  now() - INTERVAL '4 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'immune-boosting-foods-video');

-- Step 4: Update the view to include video fields
CREATE OR REPLACE VIEW public.blog_posts_full AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  c.color as category_color,
  a.name as author_name,
  a.title as author_title,
  a.avatar_url as author_avatar,
  ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
  ARRAY_AGG(DISTINCT t.slug) FILTER (WHERE t.slug IS NOT NULL) as tag_slugs
FROM public.blog_posts p
LEFT JOIN public.blog_categories c ON p.category_id = c.id
LEFT JOIN public.blog_authors a ON p.author_id = a.id
LEFT JOIN public.blog_post_tags pt ON p.id = pt.post_id
LEFT JOIN public.blog_tags t ON pt.tag_id = t.id
GROUP BY p.id, c.name, c.slug, c.color, a.name, a.title, a.avatar_url;

-- Step 5: Verify the updates
SELECT 
  title,
  content_type,
  video_id,
  video_duration,
  category_name,
  published_at
FROM public.blog_posts_full
WHERE content_type = 'video'
ORDER BY published_at DESC;
