-- ============================================
-- QUICK TEST: Check what's in your products table
-- ============================================
-- Run this in Supabase SQL Editor to see current data

-- 1. Check products table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;

-- 2. Check current products
SELECT 
  id,
  name,
  form,
  dosage_strength,
  price,
  stock_quantity
FROM public.products
LIMIT 10;

-- 3. Check categories
SELECT id, name FROM public.categories;
