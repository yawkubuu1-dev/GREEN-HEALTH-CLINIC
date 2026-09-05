-- ============================================
-- HOME HERO TABLE - COMPLETELY SEPARATE FROM SHOP HERO SLIDER
-- This table is ONLY for the homepage hero (single static image)
-- DO NOT use hero_slides or hero_settings - this is independent
-- ============================================

-- Create home_hero table (single row configuration)
CREATE TABLE IF NOT EXISTS public.home_hero (
  id INTEGER PRIMARY KEY DEFAULT 1,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  primary_button_text TEXT DEFAULT 'EXPLORE SERVICES',
  primary_button_link TEXT,
  secondary_button_text TEXT,
  secondary_button_link TEXT,
  overlay_opacity NUMERIC DEFAULT 0.3, -- Dark overlay opacity (0-1)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default homepage hero content
INSERT INTO public.home_hero (
  id,
  image_url,
  title,
  subtitle,
  primary_button_text,
  primary_button_link,
  overlay_opacity,
  is_active
)
VALUES (
  1,
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
  'K.E GREEN HEALTH CLINIC',
  'Center for Functional & Metabolic Medicine',
  'EXPLORE SERVICES',
  'shop',
  0.3,
  true
)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  primary_button_text = EXCLUDED.primary_button_text,
  primary_button_link = EXCLUDED.primary_button_link,
  overlay_opacity = EXCLUDED.overlay_opacity,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Enable Row Level Security
ALTER TABLE public.home_hero ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no authentication required)
DROP POLICY IF EXISTS "Anyone can view active home hero" ON public.home_hero;
CREATE POLICY "Anyone can view active home hero"
ON public.home_hero
FOR SELECT
TO public
USING (is_active = true);

-- Verify the setup
SELECT 
  id,
  image_url,
  title,
  subtitle,
  primary_button_text,
  primary_button_link,
  secondary_button_text,
  secondary_button_link,
  overlay_opacity,
  is_active,
  created_at
FROM public.home_hero;

-- Success message
SELECT '✅ home_hero table created successfully! This is completely separate from hero_slides and hero_settings.' AS status;
