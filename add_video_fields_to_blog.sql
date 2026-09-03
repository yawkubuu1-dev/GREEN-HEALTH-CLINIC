-- ============================================
-- ADD VIDEO FIELDS TO BLOG_POSTS TABLE
-- ============================================
-- This adds support for video blog posts (YouTube embeds)

-- Step 1: Add video-specific columns
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS video_id TEXT,
  ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS video_duration TEXT,
  ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'article'
    CHECK (content_type IN ('article', 'video'));

-- Step 2: Add index for video posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_content_type ON public.blog_posts(content_type);

-- Step 3: Insert sample video blog posts
INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, video_id, video_thumbnail, video_duration,
   content_type, category_id, author_id, meta_title, meta_description, status, is_featured, published_at)
SELECT
  'Understanding Functional Medicine: A Holistic Approach to Health',
  'understanding-functional-medicine-holistic-health',
  'Functional medicine looks beyond symptoms to uncover the root causes of chronic illness. Here''s how it differs from conventional care and why it matters for long-term wellness.',
  'Video content about functional medicine approach to healthcare.',
  'https://img.youtube.com/vi/KJ6lhOPMCCE/maxresdefault.jpg',
  'KJ6lhOPMCCE',
  'https://img.youtube.com/vi/KJ6lhOPMCCE/maxresdefault.jpg',
  '5:42',
  'video',
  (SELECT id FROM public.blog_categories WHERE slug = 'health-tips' LIMIT 1),
  (SELECT id FROM public.blog_authors LIMIT 1),
  'Understanding Functional Medicine | Health Video',
  'Learn about functional medicine and how it differs from conventional healthcare. Expert video guide.',
  'published',
  true,
  now() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'understanding-functional-medicine-holistic-health');

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, video_id, video_thumbnail, video_duration,
   content_type, category_id, author_id, status, is_featured, published_at)
SELECT
  'Metabolic Health 101: What Your Blood Sugar Is Really Telling You',
  'metabolic-health-blood-sugar-guide',
  'Blood sugar fluctuations affect energy, mood, and weight — even in people without diabetes. Learn the markers to watch and simple lifestyle adjustments that make a real difference.',
  'Video about understanding blood sugar and metabolic health.',
  'https://img.youtube.com/vi/lPkEXfuoHL8/maxresdefault.jpg',
  'lPkEXfuoHL8',
  'https://img.youtube.com/vi/lPkEXfuoHL8/maxresdefault.jpg',
  '7:18',
  'video',
  (SELECT id FROM public.blog_categories WHERE slug = 'health-tips' LIMIT 1),
  (SELECT id FROM public.blog_authors LIMIT 1),
  'published',
  true,
  now() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'metabolic-health-blood-sugar-guide');

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, video_id, video_thumbnail, video_duration,
   content_type, category_id, author_id, status, is_featured, published_at)
SELECT
  'The Gut–Brain Connection: How Your Digestive Health Shapes Your Mind',
  'gut-brain-connection-digestive-health',
  'Emerging research confirms that gut microbiome diversity directly influences anxiety, cognition, and mood. Discover how to nourish your gut for better mental clarity.',
  'Video exploring the gut-brain connection and mental health.',
  'https://img.youtube.com/vi/1sISguPDlhY/maxresdefault.jpg',
  '1sISguPDlhY',
  'https://img.youtube.com/vi/1sISguPDlhY/maxresdefault.jpg',
  '6:05',
  'video',
  (SELECT id FROM public.blog_categories WHERE slug = 'nutrition' LIMIT 1),
  (SELECT id FROM public.blog_authors LIMIT 1),
  'published',
  true,
  now() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'gut-brain-connection-digestive-health');

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, video_id, video_thumbnail, video_duration,
   content_type, category_id, author_id, status, published_at)
SELECT
  'Chronic Inflammation: The Silent Driver Behind Most Modern Diseases',
  'chronic-inflammation-modern-diseases',
  'From heart disease to autoimmune conditions, low-grade chronic inflammation is a common thread. Find out what triggers it and how targeted interventions can calm it down.',
  'Video about chronic inflammation and its impact on health.',
  'https://img.youtube.com/vi/zz4YVJ4aRfg/maxresdefault.jpg',
  'zz4YVJ4aRfg',
  'https://img.youtube.com/vi/zz4YVJ4aRfg/maxresdefault.jpg',
  '8:33',
  'video',
  (SELECT id FROM public.blog_categories WHERE slug = 'disease-prevention' LIMIT 1),
  (SELECT id FROM public.blog_authors LIMIT 1),
  'published',
  now() - INTERVAL '7 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'chronic-inflammation-modern-diseases');

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, video_id, video_thumbnail, video_duration,
   content_type, category_id, author_id, status, published_at)
SELECT
  'Lab Tests That Actually Matter: Beyond the Standard Panel',
  'lab-tests-beyond-standard-panel',
  'Standard bloodwork misses a lot. We break down the advanced markers — hs-CRP, homocysteine, HOMA-IR — that give a fuller picture of your metabolic and cardiovascular risk.',
  'Video guide to important lab tests for comprehensive health assessment.',
  'https://img.youtube.com/vi/7LEtFbVpMYo/maxresdefault.jpg',
  '7LEtFbVpMYo',
  'https://img.youtube.com/vi/7LEtFbVpMYo/maxresdefault.jpg',
  '5:20',
  'video',
  (SELECT id FROM public.blog_categories WHERE slug = 'health-tips' LIMIT 1),
  (SELECT id FROM public.blog_authors LIMIT 1),
  'published',
  now() - INTERVAL '9 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'lab-tests-beyond-standard-panel');

-- Step 4: Verify video posts
SELECT 
  title,
  content_type,
  video_id,
  video_duration,
  category_id,
  status,
  is_featured,
  published_at
FROM public.blog_posts
WHERE content_type = 'video'
ORDER BY published_at DESC;
