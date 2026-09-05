-- ============================================
-- QUICK PHARMACY SEED (Run with "No limit")
-- ============================================

-- Step 1: Clear existing data
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.products;
DELETE FROM public.categories;

-- Step 2: Insert medicine categories
INSERT INTO public.categories (name, description, image_url, sort_order) VALUES
  ('Pain Relief', 'Over-the-counter pain relievers and fever reducers', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', 1),
  ('Antibiotics', 'Prescription antibiotics for bacterial infections', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80', 2),
  ('Vitamins & Supplements', 'Daily vitamins, minerals, and dietary supplements', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80', 3),
  ('Digestive Health', 'Antacids, laxatives, and digestive aids', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80', 4),
  ('Respiratory', 'Inhalers, cough syrups, and cold remedies', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80', 5);

-- Step 3: Insert products (using WITH clause to avoid subquery issues)
WITH cat_pain AS (
  SELECT id FROM public.categories WHERE name = 'Pain Relief' LIMIT 1
),
cat_digest AS (
  SELECT id FROM public.categories WHERE name = 'Digestive Health' LIMIT 1
),
cat_anti AS (
  SELECT id FROM public.categories WHERE name = 'Antibiotics' LIMIT 1
),
cat_vit AS (
  SELECT id FROM public.categories WHERE name = 'Vitamins & Supplements' LIMIT 1
),
cat_resp AS (
  SELECT id FROM public.categories WHERE name = 'Respiratory' LIMIT 1
)
INSERT INTO public.products
  (name, description, price, stock_quantity, tag, image_url, position,
   form, dosage_strength, pack_sizes, price_per_pack, requires_prescription,
   active_ingredient, manufacturer, storage_info, is_featured, category_id)
VALUES
  -- Product 1: Paracetamol
  ('Paracetamol 500mg Tablets',
   'Fast-acting pain relief and fever reducer. Suitable for adults and children over 12 years.',
   5.00, 200, 'Essential',
   'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', 1,
   'tablet', '500mg', ARRAY['24 tablets', '48 tablets'], 5.00, false,
   'Paracetamol', 'Kinapharma', 'Store below 30°C in a dry place', true,
   (SELECT id FROM cat_pain)),
   
  -- Product 2: ORS
  ('Oral Rehydration Salts',
   'Electrolyte replacement for dehydration from diarrhea or vomiting.',
   2.50, 500, 'Best Seller',
   'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80', 2,
   'sachet', '20.5g per sachet', ARRAY['10 sachets', '20 sachets'], 2.50, false,
   'Sodium Chloride, Potassium Chloride, Glucose', 'WHO Standard',
   'Store at room temperature', true,
   (SELECT id FROM cat_digest)),
   
  -- Product 3: Amoxicillin
  ('Amoxicillin 500mg Capsules',
   'Broad-spectrum antibiotic for bacterial infections. Prescription required.',
   12.00, 150, 'Prescription',
   'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80', 3,
   'capsule', '500mg', ARRAY['12 capsules', '21 capsules'], 12.00, true,
   'Amoxicillin', 'Pharmanova', 'Store in a cool, dry place away from light', false,
   (SELECT id FROM cat_anti)),
   
  -- Product 4: Multivitamin
  ('Daily Multivitamin Complex',
   'Complete daily vitamin and mineral supplement for adults.',
   18.00, 300, 'Popular',
   'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80', 4,
   'tablet', 'Multiple vitamins', ARRAY['30 tablets', '60 tablets', '90 tablets'], 18.00, false,
   'Vitamin A, B, C, D, E, Minerals', 'NutriHealth',
   'Store below 25°C in original container', true,
   (SELECT id FROM cat_vit)),
   
  -- Product 5: Ibuprofen
  ('Ibuprofen 400mg Tablets',
   'Anti-inflammatory pain reliever for headaches, muscle pain, and fever.',
   6.50, 180, 'Popular',
   'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', 5,
   'tablet', '400mg', ARRAY['20 tablets', '40 tablets'], 6.50, false,
   'Ibuprofen', 'Kinapharma', 'Store below 30°C in a dry place', true,
   (SELECT id FROM cat_pain)),
   
  -- Product 6: Cough Syrup
  ('Cough Relief Syrup',
   'Soothing syrup for dry and productive coughs.',
   8.00, 120, 'Essential',
   'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80', 6,
   'syrup', '100ml bottle', ARRAY['100ml', '200ml'], 8.00, false,
   'Dextromethorphan, Guaifenesin', 'Pharmanova',
   'Store at room temperature, shake well before use', true,
   (SELECT id FROM cat_resp)),
   
  -- Product 7: Antacid
  ('Antacid Tablets',
   'Fast relief from heartburn, acid indigestion, and upset stomach.',
   4.00, 400, 'Best Seller',
   'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80', 7,
   'tablet', '500mg', ARRAY['24 tablets', '50 tablets'], 4.00, false,
   'Calcium Carbonate', 'DigestiCare', 'Store in a dry place', true,
   (SELECT id FROM cat_digest)),
   
  -- Product 8: Vitamin C
  ('Vitamin C 1000mg Tablets',
   'High-strength vitamin C for immune support.',
   12.00, 250, 'New',
   'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80', 8,
   'tablet', '1000mg', ARRAY['30 tablets', '60 tablets'], 12.00, false,
   'Ascorbic Acid', 'NutriHealth', 'Store in a cool, dry place', false,
   (SELECT id FROM cat_vit));
