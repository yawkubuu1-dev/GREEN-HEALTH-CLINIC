-- ============================================
-- FIX BLOG POST VIDEOS
-- ============================================
-- This script updates blog posts with proper YouTube video IDs

-- Update each post with its video_id from the title match
UPDATE public.blog_posts
SET 
  video_id = 'KJ6lhOPMCCE',
  video_thumbnail = 'https://img.youtube.com/vi/KJ6lhOPMCCE/maxresdefault.jpg',
  video_duration = '12:45'
WHERE title LIKE '%Could Your Body Be Showing Signs of Insulin Resistance%';

UPDATE public.blog_posts
SET 
  video_id = 'lPkEXfuoHL8',
  video_thumbnail = 'https://img.youtube.com/vi/lPkEXfuoHL8/maxresdefault.jpg',
  video_duration = '15:30'
WHERE title LIKE '%Blood Sugar Balance%' OR category = 'Functional Medicine';

UPDATE public.blog_posts
SET 
  video_id = '1sISguPDlhY',
  video_thumbnail = 'https://img.youtube.com/vi/1sISguPDlhY/maxresdefault.jpg',
  video_duration = '18:20'
WHERE title LIKE '%Gut Health%' OR title LIKE '%Microbiome%';

UPDATE public.blog_posts
SET 
  video_id = 'zz4YVJ4aRfg',
  video_thumbnail = 'https://img.youtube.com/vi/zz4YVJ4aRfg/maxresdefault.jpg',
  video_duration = '14:15'
WHERE title LIKE '%Inflammation%' OR title LIKE '%chronic inflammation%';

UPDATE public.blog_posts
SET 
  video_id = '7LEtFbVpMYo',
  video_thumbnail = 'https://img.youtube.com/vi/7LEtFbVpMYo/maxresdefault.jpg',
  video_duration = '16:50'
WHERE title LIKE '%Lab Results%' OR title LIKE '%lab results%';

UPDATE public.blog_posts
SET 
  video_id = 'nm1TxQj9IsQ',
  video_thumbnail = 'https://img.youtube.com/vi/nm1TxQj9IsQ/maxresdefault.jpg',
  video_duration = '20:10'
WHERE title LIKE '%Sleep%' OR title LIKE '%sleep%';

UPDATE public.blog_posts
SET 
  video_id = '0bNdhM4vt4I',
  video_thumbnail = 'https://img.youtube.com/vi/0bNdhM4vt4I/maxresdefault.jpg',
  video_duration = '13:40'
WHERE title LIKE '%Nutrition Myths%' OR title LIKE '%CAKE%' OR title LIKE '%cake%';

UPDATE public.blog_posts
SET 
  video_id = 'TmFKNTKfFTk',
  video_thumbnail = 'https://img.youtube.com/vi/TmFKNTKfFTk/maxresdefault.jpg',
  video_duration = '17:25'
WHERE title LIKE '%Hormones%' OR title LIKE '%Ageing%';

UPDATE public.blog_posts
SET 
  video_id = 'aXItOY0sLRY',
  video_thumbnail = 'https://img.youtube.com/vi/aXItOY0sLRY/maxresdefault.jpg',
  video_duration = '19:30'
WHERE title LIKE '%Exercise%' OR title LIKE '%Movement%';

-- Verify the updates
SELECT 
  title,
  category,
  video_id,
  video_duration,
  CASE 
    WHEN video_id IS NOT NULL AND video_id != '' THEN '✓ Has video'
    ELSE '✗ Missing video'
  END as status
FROM public.blog_posts
ORDER BY date DESC
LIMIT 15;
