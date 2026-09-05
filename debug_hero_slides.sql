-- Check hero_slides data to debug why images aren't showing

-- 1. Check what's in the table
SELECT 
  id,
  type,
  url,
  caption,
  brand_text,
  duration,
  position,
  is_active,
  created_at
FROM public.hero_slides
ORDER BY position;

-- 2. Check if URLs are accessible (look for NULL or empty)
SELECT 
  position,
  CASE 
    WHEN url IS NULL THEN '❌ URL is NULL'
    WHEN url = '' THEN '❌ URL is empty'
    WHEN url LIKE 'http%' THEN '✅ URL looks valid'
    ELSE '⚠️ URL format unclear'
  END as url_status,
  LEFT(url, 80) as url_preview
FROM public.hero_slides
ORDER BY position;

-- 3. Check if any slides are inactive
SELECT 
  COUNT(*) as total_slides,
  COUNT(*) FILTER (WHERE is_active = true) as active_slides,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_slides
FROM public.hero_slides;
