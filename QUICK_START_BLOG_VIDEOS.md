# Quick Start: Enable Blog Videos from Supabase

## ✅ What's Done
- App code updated to fetch from Supabase
- Video fields ready in the schema
- Sample video data prepared

## 🚀 Run This Now

### Step 1: Add Video Support to Database
Copy and paste this into your **Supabase SQL Editor** and click "Run":

```sql
-- Add video fields to blog_posts table
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS video_id TEXT,
  ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS video_duration TEXT,
  ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'article'
    CHECK (content_type IN ('article', 'video'));

CREATE INDEX IF NOT EXISTS idx_blog_posts_content_type ON public.blog_posts(content_type);

-- Insert 5 sample video posts
INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, video_id, video_thumbnail, video_duration,
   content_type, category_id, author_id, status, is_featured, published_at)
SELECT
  'Understanding Functional Medicine',
  'understanding-functional-medicine-' || gen_random_uuid()::text,
  'Functional medicine looks beyond symptoms to uncover root causes.',
  'Video about functional medicine.',
  'KJ6lhOPMCCE',
  'https://img.youtube.com/vi/KJ6lhOPMCCE/maxresdefault.jpg',
  '5:42',
  'video',
  (SELECT id FROM public.blog_categories LIMIT 1),
  (SELECT id FROM public.blog_authors LIMIT 1),
  'published',
  true,
  now() - INTERVAL '1 day'
WHERE (SELECT COUNT(*) FROM public.blog_posts WHERE content_type = 'video') = 0;

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, video_id, video_thumbnail, video_duration,
   content_type, category_id, author_id, status, is_featured, published_at)
SELECT
  'Metabolic Health 101',
  'metabolic-health-101-' || gen_random_uuid()::text,
  'Learn about blood sugar and metabolic health.',
  'Video about metabolic health.',
  'lPkEXfuoHL8',
  'https://img.youtube.com/vi/lPkEXfuoHL8/maxresdefault.jpg',
  '7:18',
  'video',
  (SELECT id FROM public.blog_categories LIMIT 1),
  (SELECT id FROM public.blog_authors LIMIT 1),
  'published',
  true,
  now() - INTERVAL '3 days'
WHERE (SELECT COUNT(*) FROM public.blog_posts WHERE content_type = 'video') < 2;

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, video_id, video_thumbnail, video_duration,
   content_type, category_id, author_id, status, is_featured, published_at)
SELECT
  'The Gut-Brain Connection',
  'gut-brain-connection-' || gen_random_uuid()::text,
  'How your digestive health shapes your mind.',
  'Video about gut-brain connection.',
  '1sISguPDlhY',
  'https://img.youtube.com/vi/1sISguPDlhY/maxresdefault.jpg',
  '6:05',
  'video',
  (SELECT id FROM public.blog_categories LIMIT 1),
  (SELECT id FROM public.blog_authors LIMIT 1),
  'published',
  false,
  now() - INTERVAL '5 days'
WHERE (SELECT COUNT(*) FROM public.blog_posts WHERE content_type = 'video') < 3;

-- Verify
SELECT title, video_duration, content_type, status 
FROM public.blog_posts 
WHERE content_type = 'video'
ORDER BY published_at DESC;
```

### Step 2: Refresh Your App
In your terminal:
```bash
# If using Expo
npm start
# or
yarn start

# Press 'r' to reload the app
```

### Step 3: Test
1. Open your app
2. Navigate to "Blog" page
3. You should see video cards with thumbnails
4. Click a video to play it

## 🎥 Add Your Own Videos

To add a YouTube video to your blog:

```sql
INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, video_id, video_thumbnail, video_duration,
   content_type, category_id, author_id, status, is_featured, published_at)
VALUES (
  'Your Video Title',
  'your-video-slug',
  'Brief description for the card...',
  'Full video description.',
  'YOUR_YOUTUBE_VIDEO_ID',  -- e.g., 'dQw4w9WgXcQ' from youtube.com/watch?v=dQw4w9WgXcQ
  'https://img.youtube.com/vi/YOUR_YOUTUBE_VIDEO_ID/maxresdefault.jpg',
  '12:34',  -- Duration displayed on thumbnail
  'video',
  (SELECT id FROM public.blog_categories WHERE slug = 'health-tips' LIMIT 1),
  (SELECT id FROM public.blog_authors LIMIT 1),
  'published',
  true,  -- Set to true to feature on homepage
  now()
);
```

## 📋 YouTube Video ID
Find the video ID in the YouTube URL:
- URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Video ID: `dQw4w9WgXcQ`

## 🔍 Filter Only Videos
If you want to show only videos (not articles):

```sql
-- In supabaseService.js, update blogService.getAll():
const { data, error } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('is_published', true)
  .eq('content_type', 'video')  // ← Add this line
  .order('published_at', { ascending: false });
```

## ✨ That's It!
Your blog videos should now be loading from Supabase. The app will automatically:
- Display video thumbnails with play buttons
- Show duration badges
- Open YouTube player when clicked
- Display category and publication date
