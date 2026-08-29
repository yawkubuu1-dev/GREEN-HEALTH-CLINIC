-- ============================================
-- PHARMACY MIGRATION SCRIPT
-- ============================================
-- This script converts the clothing e-commerce schema to pharmacy/medicine

-- Step 1: Drop clothing-specific columns
ALTER TABLE public.products
  DROP COLUMN IF EXISTS price_s,
  DROP COLUMN IF EXISTS price_m,
  DROP COLUMN IF EXISTS price_l,
  DROP COLUMN IF EXISTS price_xl,
  DROP COLUMN IF EXISTS price_xxl,
  DROP COLUMN IF EXISTS price_250g,
  DROP COLUMN IF EXISTS price_500g,
  DROP COLUMN IF EXISTS price_1kg,
  DROP COLUMN IF EXISTS has_sizes,
  DROP COLUMN IF EXISTS has_weights,
  DROP COLUMN IF EXISTS stock_s,
  DROP COLUMN IF EXISTS stock_m,
  DROP COLUMN IF EXISTS stock_l,
  DROP COLUMN IF EXISTS stock_xl,
  DROP COLUMN IF EXISTS stock_xxl;

-- Step 2: Add medicine-specific columns
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS form text,
  ADD COLUMN IF NOT EXISTS dosage_strength text,
  ADD COLUMN IF NOT EXISTS pack_sizes text[],
  ADD COLUMN IF NOT EXISTS requires_prescription boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS active_ingredient text,
  ADD COLUMN IF NOT EXISTS manufacturer text,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS storage_info text,
  ADD COLUMN IF NOT EXISTS side_effects text,
  ADD COLUMN IF NOT EXISTS contraindications text,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Step 3: Clear existing data
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.products;
DELETE FROM public.categories;

-- Step 4: Insert medicine categories
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

-- Step 5: Insert sample medicine products
-- Product 1: Paracetamol
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Paracetamol 500mg Tablets',
  'Fast-acting pain relief and fever reducer. Suitable for adults and children over 12 years.',
  5.00,
  200,
  'Essential',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
  1,
  'Tablet',
  '500mg',
  ARRAY['24 tablets', '48 tablets'],
  false,
  'Paracetamol',
  'Kinapharma',
  'Store below 30°C in a dry place',
  true,
  c.id
FROM public.categories c
WHERE c.name = 'Pain Relief'
LIMIT 1;

-- Product 2: ORS
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Oral Rehydration Salts',
  'Electrolyte replacement for dehydration from diarrhea or vomiting.',
  2.50,
  500,
  'Best Seller',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80',
  2,
  'Sachet',
  '20.5g per sachet',
  ARRAY['10 sachets', '20 sachets'],
  false,
  'Sodium Chloride, Potassium Chloride, Glucose',
  'WHO Standard',
  'Store at room temperature',
  true,
  c.id
FROM public.categories c
WHERE c.name = 'Digestive Health'
LIMIT 1;

-- Product 3: Amoxicillin
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Amoxicillin 500mg Capsules',
  'Broad-spectrum antibiotic for bacterial infections. Prescription required.',
  12.00,
  150,
  'Prescription',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80',
  3,
  'Capsule',
  '500mg',
  ARRAY['12 capsules', '21 capsules'],
  true,
  'Amoxicillin',
  'Pharmanova',
  'Store in a cool, dry place away from light',
  false,
  c.id
FROM public.categories c
WHERE c.name = 'Antibiotics'
LIMIT 1;

-- Product 4: Multivitamin
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Daily Multivitamin Complex',
  'Complete daily vitamin and mineral supplement for adults.',
  18.00,
  300,
  'Popular',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80',
  4,
  'Tablet',
  'Multiple vitamins',
  ARRAY['30 tablets', '60 tablets', '90 tablets'],
  false,
  'Vitamin A, B, C, D, E, Minerals',
  'NutriHealth',
  'Store below 25°C in original container',
  true,
  c.id
FROM public.categories c
WHERE c.name = 'Vitamins & Supplements'
LIMIT 1;

-- Step 6: Verify the migration
SELECT 
  p.name,
  p.form,
  p.dosage_strength,
  p.pack_sizes,
  p.requires_prescription,
  p.manufacturer,
  c.name as category,
  p.price,
  p.stock_quantity
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
ORDER BY p.position;
