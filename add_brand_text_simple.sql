-- Add brand_text column to hero_slides
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS brand_text TEXT;

-- Update all slides with default brand text
UPDATE public.hero_slides
SET brand_text = 'GREEN HEALTH CLINIC'
WHERE brand_text IS NULL;
