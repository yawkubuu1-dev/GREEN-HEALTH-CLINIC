-- ============================================
-- FINAL PHARMACY SETUP - ALL IN ONE
-- ============================================
-- Run this complete script in Supabase SQL Editor

-- Step 1: Verify products table structure (should show medicine fields)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products'
ORDER BY ordinal_position;

-- Step 2: Clear old data
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.products;
DELETE FROM public.categories;

-- Step 3: Insert medicine categories
INSERT INTO public.categories (name, description, image_url, sort_order) VALUES
  ('Pain Relief', 'Over-the-counter pain relievers and fever reducers', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', 1),
  ('Antibiotics', 'Prescription antibiotics for bacterial infections', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80', 2),
  ('Vitamins & Supplements', 'Daily vitamins, minerals, and dietary supplements', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80', 3),
  ('Digestive Health', 'Antacids, laxatives, and digestive aids', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80', 4),
  ('Respiratory', 'Inhalers, cough syrups, and cold remedies', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80', 5),
  ('Skin Care', 'Creams, ointments, and topical treatments', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80', 6);

-- Step 4: Insert medicine products
-- Product 1: Paracetamol
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Paracetamol 500mg Tablets',
  'Fast-acting pain relief and fever reducer. Suitable for adults and children over 12 years.',
  5.00, 200, 'Essential',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
  1, 'tablet', '500mg', ARRAY['24 tablets', '48 tablets'],
  false, 'Paracetamol', 'Kinapharma', 'Store below 30°C in a dry place', true, c.id
FROM public.categories c WHERE c.name = 'Pain Relief' LIMIT 1;

-- Product 2: Ibuprofen
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Ibuprofen 400mg Tablets',
  'Anti-inflammatory pain reliever for headaches, muscle pain, and fever.',
  6.50, 180, 'Popular',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
  2, 'tablet', '400mg', ARRAY['20 tablets', '40 tablets'],
  false, 'Ibuprofen', 'Kinapharma', 'Store below 30°C. Take with food.', true, c.id
FROM public.categories c WHERE c.name = 'Pain Relief' LIMIT 1;

-- Product 3: Amoxicillin
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, side_effects, contraindications, is_featured, category_id)
SELECT
  'Amoxicillin 500mg Capsules',
  'Broad-spectrum antibiotic for bacterial infections. Prescription required.',
  12.00, 150, 'Prescription',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80',
  3, 'capsule', '500mg', ARRAY['12 capsules', '21 capsules'],
  true, 'Amoxicillin', 'Pharmanova', 'Store in a cool, dry place',
  'Nausea, diarrhea, skin rash. Seek medical attention if severe allergic reaction occurs.',
  'Do not take if allergic to penicillin antibiotics.', false, c.id
FROM public.categories c WHERE c.name = 'Antibiotics' LIMIT 1;

-- Product 4: Multivitamin
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Daily Multivitamin Complex',
  'Complete daily vitamin and mineral supplement for adults. One tablet daily with food.',
  18.00, 300, 'Best Seller',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80',
  4, 'tablet', 'Multiple vitamins', ARRAY['30 tablets', '60 tablets', '90 tablets'],
  false, 'Vitamin A, B, C, D, E, Minerals', 'NutriHealth', 'Store below 25°C', true, c.id
FROM public.categories c WHERE c.name = 'Vitamins & Supplements' LIMIT 1;

-- Product 5: ORS
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Oral Rehydration Salts',
  'Electrolyte replacement for dehydration. WHO standard formulation.',
  2.50, 500, 'Essential',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80',
  5, 'sachet', '20.5g per sachet', ARRAY['10 sachets', '20 sachets'],
  false, 'Sodium Chloride, Potassium Chloride, Glucose', 'WHO Standard',
  'Store at room temperature', true, c.id
FROM public.categories c WHERE c.name = 'Digestive Health' LIMIT 1;

-- Product 6: Cough Syrup
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Cough Relief Syrup',
  'Soothing syrup for dry and productive coughs. Adults and children over 6 years.',
  8.00, 120, 'Popular',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80',
  6, 'syrup', '100ml bottle', ARRAY['100ml', '200ml'],
  false, 'Dextromethorphan, Guaifenesin', 'Pharmanova',
  'Store at room temperature, shake well before use', false, c.id
FROM public.categories c WHERE c.name = 'Respiratory' LIMIT 1;

-- Product 7: Antacid
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Antacid Tablets',
  'Fast relief from heartburn and acid indigestion.',
  4.00, 400, 'Best Seller',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80',
  7, 'tablet', '500mg', ARRAY['24 tablets', '50 tablets'],
  false, 'Calcium Carbonate', 'DigestiCare', 'Store in a dry place', true, c.id
FROM public.categories c WHERE c.name = 'Digestive Health' LIMIT 1;

-- Product 8: Skin Cream
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
SELECT
  'Hydrocortisone Cream 1%',
  'Topical cream for itching, redness, and minor skin irritations.',
  7.50, 150, 'New',
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
  8, 'cream', '1%', ARRAY['15g tube', '30g tube'],
  false, 'Hydrocortisone', 'DermaCare', 'Store at room temperature', false, c.id
FROM public.categories c WHERE c.name = 'Skin Care' LIMIT 1;

-- Step 5: Verify the results
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

-- Final check: Count products and categories
SELECT 
  (SELECT COUNT(*) FROM public.categories) as category_count,
  (SELECT COUNT(*) FROM public.products) as product_count;
