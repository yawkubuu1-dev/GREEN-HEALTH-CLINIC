-- Full Supabase-controlled Hero Slider Migration
-- Run this in Supabase SQL Editor

-- Per-slide duration control (in milliseconds)
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS duration_ms INTEGER DEFAULT 5000;

-- CTA button controls
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS cta_primary_text TEXT DEFAULT 'SHOP NOW';
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS cta_primary_link TEXT;
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS cta_secondary_text TEXT DEFAULT 'VIEW CART';
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS cta_secondary_link TEXT;

-- Per-slide autoplay override
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS autoplay BOOLEAN DEFAULT true;

-- Global hero slider settings (cycle count, loop behavior, defaults)
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  loop_infinite BOOLEAN DEFAULT true,
  max_cycles INTEGER DEFAULT 3,
  default_duration_ms INTEGER DEFAULT 5000,
  transition_duration_ms INTEGER DEFAULT 400,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.hero_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Open read access, no auth required
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active hero slides" ON public.hero_slides;
CREATE POLICY "Anyone can view active hero slides"
ON public.hero_slides
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view hero settings" ON public.hero_settings;
CREATE POLICY "Anyone can view hero settings"
ON public.hero_settings
FOR SELECT
TO public
USING (true);

-- Update existing slides with default values
UPDATE public.hero_slides
SET 
  duration_ms = COALESCE(duration, 5000),
  cta_primary_text = 'SHOP NOW',
  cta_secondary_text = 'VIEW CART',
  autoplay = true
WHERE duration_ms IS NULL;

-- Verify the migration
SELECT 
  id,
  type,
  url,
  caption,
  brand_text,
  duration_ms,
  cta_primary_text,
  cta_secondary_text,
  autoplay,
  position,
  is_active
FROM public.hero_slides
ORDER BY position;

SELECT * FROM public.hero_settings;
