-- ============================================
-- COMPLETE PHARMACY SETUP SCRIPT
-- ============================================
-- Run this entire script in Supabase SQL Editor

-- Step 1: Clear existing data (respecting foreign keys)
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.products;
DELETE FROM public.categories;

-- Step 2: Ensure categories table exists with correct schema
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 3: Ensure products table has medicine columns
-- First, add any missing medicine columns
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS form TEXT DEFAULT 'tablet'
    CHECK (form IN ('tablet','capsule','sachet','syrup','injection','cream','drops','inhaler','powder','other'));

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS dosage_strength TEXT;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS pack_sizes TEXT[];

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS price_per_pack NUMERIC(10,2) DEFAULT 0;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS requires_prescription BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS active_ingredient TEXT;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS manufacturer TEXT;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS expiry_date DATE;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS storage_info TEXT DEFAULT 'Store below 30°C in a dry place';

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS side_effects TEXT;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS contraindications TEXT;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Step 4: Drop old clothing-specific columns if they exist
ALTER TABLE public.products DROP COLUMN IF EXISTS price_s;
ALTER TABLE public.products DROP COLUMN IF EXISTS price_m;
ALTER TABLE public.products DROP COLUMN IF EXISTS price_l;
ALTER TABLE public.products DROP COLUMN IF EXISTS price_xl;
ALTER TABLE public.products DROP COLUMN IF EXISTS price_xxl;
ALTER TABLE public.products DROP COLUMN IF EXISTS price_250g;
ALTER TABLE public.products DROP COLUMN IF EXISTS price_500g;
ALTER TABLE public.products DROP COLUMN IF EXISTS price_1kg;
ALTER TABLE public.products DROP COLUMN IF EXISTS has_sizes;
ALTER TABLE public.products DROP COLUMN IF EXISTS has_weights;
ALTER TABLE public.products DROP COLUMN IF EXISTS stock_s;
ALTER TABLE public.products DROP COLUMN IF EXISTS stock_m;
ALTER TABLE public.products DROP COLUMN IF EXISTS stock_l;
ALTER TABLE public.products DROP COLUMN IF EXISTS stock_xl;
ALTER TABLE public.products DROP COLUMN IF EXISTS stock_xxl;

-- Step 5: Insert medicine categories
INSERT INTO public.categories (name, description, image_url, sort_order) VALUES
  ('Pain Relief', 'Over-the-counter pain relievers and fever reducers', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', 1),
  ('Antibiotics', 'Prescription antibiotics for bacterial infections', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80', 2),
  ('Vitamins & Supplements', 'Daily vitamins, minerals, and dietary supplements', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80', 3),
  ('Diabetes Care', 'Insulin, test strips, and diabetes management products', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80', 4),
  ('Cardiovascular', 'Heart and blood pressure medications', 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80', 5),
  ('Digestive Health', 'Antacids, laxatives, and digestive aids', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80', 6),
  ('Respiratory', 'Inhalers, cough syrups, and cold remedies', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80', 7),
  ('Skin & Topical', 'Creams, ointments, and dermatological products', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80', 8),
  ('Women''s Health', 'Prenatal vitamins, contraceptives, and women''s wellness', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80', 9),
  ('Children''s Medicine', 'Pediatric formulations and children''s health products', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', 10)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order;

-- Step 6: Insert sample medicine products

-- Paracetamol
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Paracetamol 500mg Tablets',
  'Fast-acting pain relief and fever reducer. Suitable for adults and children over 12 years.',
  5.00, 200, 'Essential',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', 1,
  'tablet', '500mg', ARRAY['24 tablets', '48 tablets'], 5.00, false,
  'Paracetamol', 'Kinapharma', 'Store below 30°C in a dry place', true,
  c.id
FROM public.categories c
WHERE c.name = 'Pain Relief' LIMIT 1;

-- ORS
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Oral Rehydration Salts',
  'Electrolyte replacement for dehydration from diarrhea or vomiting. WHO standard formulation.',
  2.50, 500, 'Best Seller',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80', 2,
  'sachet', '20.5g per sachet', ARRAY['10 sachets', '20 sachets'], 2.50, false,
  'Sodium Chloride, Potassium Chloride, Glucose', 'WHO Standard', 'Store at room temperature', true,
  c.id
FROM public.categories c
WHERE c.name = 'Digestive Health' LIMIT 1;

-- Amoxicillin
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, side_effects, contraindications, is_featured, category_id)
SELECT
  'Amoxicillin 500mg Capsules',
  'Broad-spectrum antibiotic for bacterial infections. Prescription required.',
  12.00, 150, 'Prescription',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80', 3,
  'capsule', '500mg', ARRAY['12 capsules', '21 capsules'], 12.00, true,
  'Amoxicillin', 'Pharmanova', 'Store in a cool, dry place away from light',
  'Nausea, diarrhea, skin rash. Seek medical attention if severe allergic reaction occurs.',
  'Do not take if allergic to penicillin or cephalosporin antibiotics.', false,
  c.id
FROM public.categories c
WHERE c.name = 'Antibiotics' LIMIT 1;

-- Multivitamin
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Daily Multivitamin Complex',
  'Complete daily vitamin and mineral supplement for adults. One tablet daily with food.',
  18.00, 300, 'Popular',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80', 4,
  'tablet', 'Multiple vitamins', ARRAY['30 tablets', '60 tablets', '90 tablets'], 18.00, false,
  'Vitamin A, B, C, D, E, Minerals', 'NutriHealth', 'Store below 25°C in original container', true,
  c.id
FROM public.categories c
WHERE c.name = 'Vitamins & Supplements' LIMIT 1;

-- Ibuprofen
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, side_effects, is_featured, category_id)
SELECT
  'Ibuprofen 400mg Tablets',
  'Anti-inflammatory pain reliever for headaches, muscle pain, and fever.',
  6.50, 180, 'Popular',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', 5,
  'tablet', '400mg', ARRAY['20 tablets', '40 tablets'], 6.50, false,
  'Ibuprofen', 'Kinapharma', 'Store below 30°C in a dry place',
  'May cause stomach upset. Take with food or milk.', true,
  c.id
FROM public.categories c
WHERE c.name = 'Pain Relief' LIMIT 1;

-- Vitamin C
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Vitamin C 1000mg Tablets',
  'High-strength vitamin C for immune support and antioxidant protection.',
  12.00, 250, 'New',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80', 6,
  'tablet', '1000mg', ARRAY['30 tablets', '60 tablets'], 12.00, false,
  'Ascorbic Acid', 'NutriHealth', 'Store in a cool, dry place', false,
  c.id
FROM public.categories c
WHERE c.name = 'Vitamins & Supplements' LIMIT 1;

-- Cough Syrup
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Cough Relief Syrup',
  'Soothing syrup for dry and productive coughs. Suitable for adults and children over 6 years.',
  8.00, 120, 'Essential',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80', 7,
  'syrup', '100ml bottle', ARRAY['100ml', '200ml'], 8.00, false,
  'Dextromethorphan, Guaifenesin', 'Pharmanova', 'Store at room temperature, shake well before use', true,
  c.id
FROM public.categories c
WHERE c.name = 'Respiratory' LIMIT 1;

-- Antacid
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Antacid Tablets',
  'Fast relief from heartburn, acid indigestion, and upset stomach.',
  4.00, 400, 'Best Seller',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80', 8,
  'tablet', '500mg', ARRAY['24 tablets', '50 tablets'], 4.00, false,
  'Calcium Carbonate', 'DigestiCare', 'Store in a dry place', true,
  c.id
FROM public.categories c
WHERE c.name = 'Digestive Health' LIMIT 1;

-- Step 7: Verify the setup
SELECT 
  p.name,
  c.name as category,
  p.form,
  p.dosage_strength,
  p.pack_sizes,
  p.price,
  p.requires_prescription,
  p.manufacturer,
  p.stock_quantity,
  p.is_featured
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
ORDER BY p.position;

-- Success message
SELECT 
  'Pharmacy setup complete!' as status,
  (SELECT COUNT(*) FROM public.categories) as categories_count,
  (SELECT COUNT(*) FROM public.products) as products_count;
