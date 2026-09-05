-- ============================================
-- ADD VIDEO SUPPORT TO BLOG POSTS
-- ============================================
-- Adds fields to support video content (YouTube embeds) in blog posts

-- Add video-related columns
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'article' 
    CHECK (content_type IN ('article', 'video')),
  ADD COLUMN IF NOT EXISTS video_id TEXT, -- YouTube video ID
  ADD COLUMN IF NOT EXISTS video_thumbnail TEXT, -- YouTube thumbnail URL
  ADD COLUMN IF NOT EXISTS video_duration TEXT, -- e.g., "5:42", "12:30"
  ADD COLUMN IF NOT EXISTS video_platform TEXT DEFAULT 'youtube'
    CHECK (video_platform IN ('youtube', 'vimeo', 'other'));

-- Create index for video posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_content_type ON public.blog_posts(content_type);

-- Add comment for documentation
COMMENT ON COLUMN public.blog_posts.video_id IS 'YouTube video ID (e.g., "dQw4w9WgXcQ" from https://www.youtube.com/watch?v=dQw4w9WgXcQ)';

-- Insert sample video posts
INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, category_id, author_id,
   content_type, video_id, video_thumbnail, video_duration,
   meta_title, meta_description, status, is_featured, published_at)
SELECT
  'How to Take Medication Safely',
  'how-to-take-medication-safely-video',
  'Watch this essential guide on proper medication administration and safety tips.',
  'Watch our comprehensive video guide on medication safety, proper dosage, and common mistakes to avoid.',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  (SELECT id FROM public.blog_categories WHERE slug = 'medicine-guide' LIMIT 1),
  (SELECT id FROM public.blog_authors WHERE email = 'sarah@prolynwear.com' LIMIT 1),
  'video',
  'dQw4w9WgXcQ', -- Replace with actual YouTube video ID
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  '5:42',
  'How to Take Medication Safely | Video Guide',
  'Watch our video guide on medication safety, proper dosage, storage, and common mistakes to avoid.',
  'published',
  true,
  now() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'how-to-take-medication-safely-video');

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, category_id, author_id,
   content_type, video_id, video_thumbnail, video_duration,
   meta_title, meta_description, status, is_featured, published_at)
SELECT
  'Understanding Your Prescription',
  'understanding-your-prescription-video',
  'Learn how to read and understand your prescription labels and medication instructions.',
  'In this video, we explain prescription labels, dosage instructions, and when to ask your pharmacist questions.',
  'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
  (SELECT id FROM public.blog_categories WHERE slug = 'health-tips' LIMIT 1),
  (SELECT id FROM public.blog_authors WHERE email = 'sarah@prolynwear.com' LIMIT 1),
  'video',
  'jNQXAC9IVRw', -- Replace with actual YouTube video ID
  'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
  '8:15',
  'Understanding Your Prescription | Video Tutorial',
  'Video guide to reading prescription labels, understanding dosage instructions, and communicating with your pharmacist.',
  'published',
  false,
  now() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'understanding-your-prescription-video');

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, category_id, author_id,
   content_type, video_id, video_thumbnail, video_duration,
   meta_title, meta_description, status, published_at)
SELECT
  'Vitamin C Benefits Explained',
  'vitamin-c-benefits-explained-video',
  'Discover the powerful benefits of Vitamin C for your immune system and overall health.',
  'Watch to learn about Vitamin C benefits, recommended daily intake, food sources, and supplementation tips.',
  'https://img.youtube.com/vi/me2H7Zzgsd0/maxresdefault.jpg',
  (SELECT id FROM public.blog_categories WHERE slug = 'nutrition' LIMIT 1),
  (SELECT id FROM public.blog_authors WHERE email = 'james@prolynwear.com' LIMIT 1),
  'video',
  'me2H7Zzgsd0', -- Replace with actual YouTube video ID
  'https://img.youtube.com/vi/me2H7Zzgsd0/maxresdefault.jpg',
  '6:30',
  'Vitamin C Benefits | Health Video',
  'Learn about Vitamin C benefits, sources, dosage recommendations, and how it supports your immune system.',
  'published',
  now() - INTERVAL '4 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'vitamin-c-benefits-explained-video');

-- Update the helper view to include video fields
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

-- Verification
SELECT 
  title,
  content_type,
  video_id,
  video_duration,
  status,
  published_at
FROM public.blog_posts
WHERE content_type = 'video'
ORDER BY published_at DESC;
