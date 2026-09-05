-- Quick check: What's currently in products table?
SELECT COUNT(*) as total_products FROM public.products;

-- Show first 5 products
SELECT 
  name,
  price,
  category_id,
  created_at
FROM public.products
ORDER BY created_at DESC
LIMIT 5;

-- Check if medicine columns exist
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'products' 
  AND column_name IN ('form', 'dosage_strength', 'pack_sizes', 'requires_prescription', 'manufacturer')
ORDER BY column_name;
