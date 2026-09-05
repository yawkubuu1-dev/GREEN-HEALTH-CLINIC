-- ============================================
-- FIX PRODUCTS TABLE RLS POLICIES
-- ============================================
-- This enables public read access to products

-- Step 1: Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'products';

-- Step 2: Enable RLS (if not already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;

-- Step 4: Create new policy for public read access
CREATE POLICY "Allow public read access to products"
  ON public.products
  FOR SELECT
  USING (true);

-- Step 5: Verify policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'products';

-- Step 6: Test query (this should return products)
SELECT COUNT(*) as total_products FROM public.products;
SELECT id, name, price, stock_quantity FROM public.products LIMIT 5;
