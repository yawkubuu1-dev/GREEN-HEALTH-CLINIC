-- Quick diagnostic to check what data exists

-- 1. Check if products table has any data
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN form IS NOT NULL THEN 1 END) as medicine_products,
  COUNT(CASE WHEN form IS NULL THEN 1 END) as legacy_products
FROM public.products;

-- 2. Show all current products
SELECT 
  id,
  name,
  form,
  dosage_strength,
  price,
  stock_quantity,
  created_at
FROM public.products
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check categories
SELECT 
  COUNT(*) as total_categories,
  string_agg(name, ', ') as category_names
FROM public.categories;

-- 4. Show current categories
SELECT id, name, sort_order
FROM public.categories
ORDER BY sort_order;
