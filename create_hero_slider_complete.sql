-- Complete Hero Slider Setup for Supabase
-- Run this if hero_slides table doesn't exist yet

-- Create hero_slides table
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'video'
  url TEXT NOT NULL, -- Image or video URL
  caption TEXT, -- Main heading text
  brand_text TEXT, -- Small uppercase text at top
  position INTEGER NOT NULL DEFAULT 1, -- Display order
  is_active BOOLEAN DEFAULT true, -- Show/hide slide
  duration_ms INTEGER DEFAULT 5000, -- How long to display (milliseconds)
  cta_primary_text TEXT DEFAULT 'SHOP NOW', -- Primary button text
  cta_primary_link TEXT, -- Primary button URL
  cta_secondary_text TEXT DEFAULT 'VIEW CART', -- Secondary button text
  cta_secondary_link TEXT, -- Secondary button URL
  autoplay BOOLEAN DEFAULT true, -- Enable/disable auto-advance
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hero_settings table (global configuration)
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  loop_infinite BOOLEAN DEFAULT true, -- Loop forever or stop after max_cycles
  max_cycles INTEGER DEFAULT 3, -- Number of full cycles before stopping
  default_duration_ms INTEGER DEFAULT 5000, -- Fallback duration if slide.duration_ms is null
  transition_duration_ms INTEGER DEFAULT 400, -- Fade animation duration
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO public.hero_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
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

-- Insert sample hero slides
INSERT INTO public.hero_slides (type, url, caption, brand_text, position, is_active, duration_ms, cta_primary_text, cta_secondary_text, autoplay)
VALUES 
  (
    'image',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    'Welcome to Green Health Clinic',
    'GREEN HEALTH CLINIC',
    1,
    true,
    5000,
    'SHOP NOW',
    'VIEW CART',
    true
  ),
  (
    'image',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1200&q=80',
    'Quality Healthcare Products',
    'GREEN HEALTH CLINIC',
    2,
    true,
    5000,
    'SHOP NOW',
    'VIEW CART',
    true
  ),
  (
    'image',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    'Expert Medical Guidance',
    'GREEN HEALTH CLINIC',
    3,
    true,
    5000,
    'SHOP NOW',
    'VIEW CART',
    true
  ),
  (
    'image',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    'Shop Online - Delivery to Your Door',
    'GREEN HEALTH CLINIC',
    4,
    true,
    5000,
    'SHOP NOW',
    'VIEW CART',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Verify the setup
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

-- Success message
SELECT 'Hero Slider tables created successfully! Check the results above.' AS status;
