-- Update hero_slides with working image URLs for Green Health Clinic

-- Update slide 1
UPDATE public.hero_slides
SET 
  name = 'Welcome to Green Health Clinic',
  type = 'image',
  url = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
  caption = 'Your trusted partner in functional & holistic medicine'
WHERE position = 1;

-- Update slide 2
UPDATE public.hero_slides
SET 
  name = 'Quality Healthcare Products',
  type = 'image',
  url = 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1200&q=80',
  caption = 'Browse our selection of vitamins, supplements & medicines'
WHERE position = 2;

-- Update slide 3
UPDATE public.hero_slides
SET 
  name = 'Expert Medical Guidance',
  type = 'image',
  url = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
  caption = 'Personalized care from experienced healthcare professionals'
WHERE position = 3;

-- Update slide 4
UPDATE public.hero_slides
SET 
  name = 'Shop Online',
  type = 'image',
  url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
  caption = 'Convenient delivery right to your door'
WHERE position = 4;

-- Verify the updates
SELECT 
  position,
  name,
  type,
  url,
  caption,
  is_active
FROM public.hero_slides
ORDER BY position;
