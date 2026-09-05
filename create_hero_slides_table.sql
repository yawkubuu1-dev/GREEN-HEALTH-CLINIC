-- ============================================
-- CREATE HERO SLIDES TABLE FOR HOMEPAGE CAROUSEL
-- ============================================

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  duration INTEGER DEFAULT 4000, -- Duration in milliseconds
  button_text TEXT,
  button_link TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to hero_slides"
  ON public.hero_slides
  FOR SELECT
  USING (is_active = true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_hero_slides_active_sort 
  ON public.hero_slides(is_active, sort_order);

-- Insert sample hero slides
INSERT INTO public.hero_slides (title, subtitle, type, media_url, duration, sort_order, is_active) VALUES
  (
    'Welcome to Green Health Clinic',
    'Your trusted partner in functional & holistic medicine',
    'image',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    4000,
    1,
    true
  ),
  (
    'Quality Healthcare Products',
    'Browse our selection of vitamins, supplements & medicines',
    'image',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=1200&q=80',
    4000,
    2,
    true
  ),
  (
    'Expert Medical Guidance',
    'Personalized care from experienced healthcare professionals',
    'image',
    'https://images.unsplash.com/photo-1543163521-1bf539e0cf6d?auto=format&fit=crop&w=1200&q=80',
    4000,
    3,
    true
  ),
  (
    'Shop Online',
    'Convenient delivery right to your door',
    'image',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
    4000,
    4,
    true
  );

-- Verify the data
SELECT 
  id,
  title,
  type,
  media_url,
  duration,
  is_active,
  sort_order
FROM public.hero_slides
WHERE is_active = true
ORDER BY sort_order;
