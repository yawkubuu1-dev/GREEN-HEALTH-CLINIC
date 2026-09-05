-- Update all blog posts with N/A duration to have actual video durations
-- You should replace these with the actual video durations from your video files

UPDATE public.blog_posts
SET duration = '2:30'
WHERE category = 'Functional Medicine' AND duration = 'N/A';

UPDATE public.blog_posts
SET duration = '3:15'
WHERE category = 'True Green Foods' AND duration = 'N/A';

UPDATE public.blog_posts
SET duration = '2:45'
WHERE category = 'Green Health Clinic' AND duration = 'N/A';

UPDATE public.blog_posts
SET duration = '1:50'
WHERE category = 'Health & Wellness' AND duration = 'N/A';

-- If you want to set a default duration for all N/A entries:
-- UPDATE public.blog_posts
-- SET duration = '2:00'
-- WHERE duration = 'N/A' OR duration IS NULL;

-- Verify the update
SELECT title, category, duration, video_url
FROM public.blog_posts
WHERE video_url IS NOT NULL
ORDER BY date DESC
LIMIT 10;
