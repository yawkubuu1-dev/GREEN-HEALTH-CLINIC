-- Add brand_text column to hero_slides for the small uppercase text
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS brand_text TEXT;

-- Update existing slides with brand text
UPDATE public.hero_slides
SET brand_text = 'GREEN HEALTH CLINIC'
WHERE brand_text IS NULL;

-- Verify the change
SELECT 
  id,
  brand_text,
  caption,
  type,
  url,
  position,
  is_active
FROM public.hero_slides
ORDER BY position;
