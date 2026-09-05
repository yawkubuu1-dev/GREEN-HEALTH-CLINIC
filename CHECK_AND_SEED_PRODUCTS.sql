-- ============================================
-- CHECK AND SEED PHARMACY PRODUCTS
-- ============================================

-- Part 1: Check current products table structure
SELECT 'Current products table columns:' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;

-- Part 2: Check current products data
SELECT 'Current products in database:' as info;

SELECT 
  id,
  name,
  price,
  stock_quantity,
  form,
  dosage_strength,
  manufacturer
FROM public.products
LIMIT 10;

-- Part 3: Check current categories
SELECT 'Current categories:' as info;

SELECT 
  id,
  name,
  description
FROM public.categories
ORDER BY sort_order;

-- ============================================
-- NOW RUN THE SEED SCRIPT BELOW TO ADD MEDICINE PRODUCTS
-- ============================================

-- Clear existing products (CAUTION: This deletes all products)
-- Uncomment the lines below when ready to seed:

/*
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.products;
DELETE FROM public.categories;

-- Insert medicine categories
INSERT INTO public.categories (name, description, image_url, sort_order) VALUES
  ('Pain Relief', 'Over-the-counter pain relievers and fever reducers', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', 1),
  ('Antibiotics', 'Prescription antibiotics for bacterial infections', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80', 2),
  ('Vitamins & Supplements', 'Daily vitamins, minerals, and dietary supplements', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80', 3),
  ('Digestive Health', 'Antacids, laxatives, and digestive aids', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80', 4),
  ('Respiratory', 'Inhalers, cough syrups, and cold remedies', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80', 5);

-- Insert medicine products
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
FROM public.categories c WHERE c.name = 'Pain Relief' LIMIT 1;

INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Oral Rehydration Salts',
  'Electrolyte replacement for dehydration from diarrhea or vomiting.',
  2.50, 500, 'Best Seller',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80', 2,
  'sachet', '20.5g per sachet', ARRAY['10 sachets', '20 sachets'], 2.50, false,
  'Sodium Chloride, Potassium Chloride, Glucose', 'WHO Standard', 'Store at room temperature', true,
  c.id
FROM public.categories c WHERE c.name = 'Digestive Health' LIMIT 1;

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
  'Nausea, diarrhea, skin rash', 'Do not take if allergic to penicillin', false,
  c.id
FROM public.categories c WHERE c.name = 'Antibiotics' LIMIT 1;

INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Daily Multivitamin Complex',
  'Complete daily vitamin and mineral supplement for adults.',
  18.00, 300, 'Popular',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80', 4,
  'tablet', 'Multiple vitamins', ARRAY['30 tablets', '60 tablets', '90 tablets'], 18.00, false,
  'Vitamin A, B, C, D, E, Minerals', 'NutriHealth', 'Store below 25°C', true,
  c.id
FROM public.categories c WHERE c.name = 'Vitamins & Supplements' LIMIT 1;

-- Verify seeded data
SELECT 
  p.name,
  c.name as category,
  p.form,
  p.dosage_strength,
  p.price,
  p.stock_quantity,
  p.requires_prescription,
  p.is_featured
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
ORDER BY p.position;
*/
