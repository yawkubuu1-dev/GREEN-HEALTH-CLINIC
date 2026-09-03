-- ============================================
-- UPDATE BLOG_POSTS TABLE FOR VIDEO SUPPORT
-- ============================================
-- This script updates the blog_posts table to match the YouTube video structure

-- Step 1: Drop existing blog_posts table and related items
DROP TABLE IF EXISTS public.blog_post_tags CASCADE;
DROP VIEW IF EXISTS public.blog_posts_full CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;

-- Step 2: Create simplified blog_posts table for video content
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,  -- ISO date string
  duration TEXT,       -- e.g. "5:42"
  excerpt TEXT,
  thumbnail TEXT,      -- YouTube thumbnail URL
  video_id TEXT NOT NULL, -- YouTube video ID
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 3: Create index
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON public.blog_posts(date);

-- Step 4: Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policy (Everyone can read published posts)
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON public.blog_posts;
CREATE POLICY "Published blog posts are viewable by everyone"
  ON public.blog_posts FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Step 6: Insert sample video blog posts
INSERT INTO public.blog_posts 
  (id, title, category, date, duration, excerpt, thumbnail, video_id, is_published)
VALUES
  (
    'b1',
    'Could Your Body Be Showing Signs of Insulin Resistance?',
    'Functional Medicine',
    '2024-01-15',
    '5:42',
    'Functional medicine looks beyond symptoms to uncover the root causes of chronic illness. Here''s how it differs from conventional care and why it matters for long-term wellness.',
    'https://img.youtube.com/vi/KJ6lhOPMCCE/maxresdefault.jpg',
    'KJ6lhOPMCCE',
    true
  ),
  (
    'b2',
    'Understanding Blood Sugar: What Your Doctor Isn''t Telling You',
    'Metabolic Health',
    '2024-01-10',
    '7:18',
    'Blood sugar fluctuations affect energy, mood, and weight — even in people without diabetes. Learn the markers to watch and simple lifestyle adjustments that make a real difference.',
    'https://img.youtube.com/vi/lPkEXfuoHL8/maxresdefault.jpg',
    'lPkEXfuoHL8',
    true
  ),
  (
    'b3',
    'The Gut-Brain Connection: Why Your Microbiome Matters',
    'Nutrition & Lifestyle',
    '2024-01-05',
    '6:05',
    'Emerging research confirms that gut microbiome diversity directly influences anxiety, cognition, and mood. Discover how to nourish your gut for better mental clarity.',
    'https://img.youtube.com/vi/1sISguPDlhY/maxresdefault.jpg',
    '1sISguPDlhY',
    true
  ),
  (
    'b4',
    'Inflammation Explained: The Silent Driver of Disease',
    'Chronic Disease Management',
    '2023-12-28',
    '8:33',
    'From heart disease to autoimmune conditions, low-grade chronic inflammation is a common thread. Find out what triggers it and how targeted interventions can calm it down.',
    'https://img.youtube.com/vi/zz4YVJ4aRfg/maxresdefault.jpg',
    'zz4YVJ4aRfg',
    true
  ),
  (
    'b5',
    'Lab Tests That Reveal What Standard Bloodwork Misses',
    'Diagnostics & Lab Services',
    '2023-12-20',
    '5:20',
    'Standard bloodwork misses a lot. We break down the advanced markers — hs-CRP, homocysteine, HOMA-IR — that give a fuller picture of your metabolic and cardiovascular risk.',
    'https://img.youtube.com/vi/7LEtFbVpMYo/maxresdefault.jpg',
    '7LEtFbVpMYo',
    true
  ),
  (
    'b6',
    'Sleep Optimisation: Why It''s the Foundation of Health',
    'Wellness',
    '2023-12-15',
    '6:51',
    'Poor sleep elevates cortisol, disrupts insulin sensitivity, and accelerates cellular ageing. Here''s the science behind sleep optimisation and practical protocols to get started tonight.',
    'https://img.youtube.com/vi/nm1TxQj9IsQ/maxresdefault.jpg',
    'nm1TxQj9IsQ',
    true
  ),
  (
    'b7',
    'Nutrition Myths: What Science Actually Says',
    'Nutrition & Lifestyle',
    '2023-12-10',
    '7:44',
    'From dietary fat being bad to eating six small meals a day — many common nutrition beliefs don''t hold up to scrutiny. We look at the evidence and set the record straight.',
    'https://img.youtube.com/vi/0bNdhM4vt4I/maxresdefault.jpg',
    '0bNdhM4vt4I',
    true
  ),
  (
    'b8',
    'Hormones and Ageing: What Changes and How to Adapt',
    'Wellness',
    '2023-12-05',
    '9:12',
    'Oestrogen, testosterone, thyroid and insulin all shift as we age. Understanding these changes and working with them — rather than against them — is the cornerstone of healthy ageing.',
    'https://img.youtube.com/vi/TmFKNTKfFTk/maxresdefault.jpg',
    'TmFKNTKfFTk',
    true
  ),
  (
    'b9',
    'Exercise as Medicine: Personalised Movement Strategies',
    'Chronic Disease Management',
    '2023-11-30',
    '5:09',
    'Exercise is the most evidence-backed intervention in preventive medicine. We explore how personalised movement prescriptions are transforming patient outcomes across chronic conditions.',
    'https://img.youtube.com/vi/aXItOY0sLRY/maxresdefault.jpg',
    'aXItOY0sLRY',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  date = EXCLUDED.date,
  duration = EXCLUDED.duration,
  excerpt = EXCLUDED.excerpt,
  thumbnail = EXCLUDED.thumbnail,
  video_id = EXCLUDED.video_id,
  is_published = EXCLUDED.is_published;

-- Step 7: Verify the data
SELECT 
  id,
  title,
  category,
  duration,
  is_published,
  date
FROM public.blog_posts
ORDER BY date DESC;
