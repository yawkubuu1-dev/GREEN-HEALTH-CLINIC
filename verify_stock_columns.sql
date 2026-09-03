-- Verify stock columns exist and check data

-- 1. Check if columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE 'stock_%';

-- 2. Check current stock values in products
SELECT id, name, has_sizes, stock_s, stock_m, stock_l, stock_xl, stock_xxl 
FROM products 
WHERE has_sizes = true 
LIMIT 10;

-- 3. Update stock values if columns exist
UPDATE products 
SET stock_s = 10, stock_m = 15, stock_l = 8, stock_xl = 5, stock_xxl = 3 
WHERE has_sizes = true;

-- 4. Verify the update
SELECT id, name, has_sizes, stock_s, stock_m, stock_l, stock_xl, stock_xxl 
FROM products 
WHERE has_sizes = true 
LIMIT 10;
