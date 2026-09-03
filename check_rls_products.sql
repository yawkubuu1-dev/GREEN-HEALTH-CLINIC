-- Check if RLS is enabled on products table
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'products';

-- Check existing policies on products table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products';

-- Quick fix: Enable read access for everyone
-- (Run this if RLS is blocking reads)
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;

CREATE POLICY "Allow public read access to products"
ON public.products
FOR SELECT
TO public
USING (true);
