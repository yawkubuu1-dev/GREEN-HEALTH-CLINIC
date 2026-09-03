-- Clear any Mux video references from blog_posts
-- (No video_url column exists, only video_id)

-- Step 1: Check what video IDs currently exist
SELECT 
  id, 
  title, 
  video_id,
  video_type,
  has_video
FROM public.blog_posts 
WHERE video_id IS NOT NULL
ORDER BY created_at DESC;

-- Step 2: Find any Mux videos
SELECT 
  id, 
  title, 
  video_id
FROM public.blog_posts 
WHERE video_id LIKE '%JhlBbhLYPiX_tkPv%' 
   OR video_id LIKE '%mux%';

-- Step 3: Clear Mux video references (run this if Step 2 finds any)
UPDATE public.blog_posts
SET 
  video_id = NULL,
  video_type = NULL,
  has_video = false
WHERE video_id LIKE '%JhlBbhLYPiX_tkPv%' 
   OR video_id LIKE '%mux%';

-- Step 4: Verify cleanup
SELECT COUNT(*) as remaining_videos
FROM public.blog_posts 
WHERE video_id IS NOT NULL;
