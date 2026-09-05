-- Check current hero_slides data
SELECT 
  id,
  name,
  type,
  url,
  duration,
  position,
  is_active,
  caption
FROM public.hero_slides
ORDER BY position;
