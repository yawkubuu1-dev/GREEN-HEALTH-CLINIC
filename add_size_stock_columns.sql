-- Add individual stock columns for each clothing size
-- This allows tracking stock per size instead of a single stock_quantity

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_s INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_m INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_l INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_xl INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_xxl INT NOT NULL DEFAULT 0;

-- Comment explaining the new columns
COMMENT ON COLUMN public.products.stock_s IS 'Stock quantity for size S';
COMMENT ON COLUMN public.products.stock_m IS 'Stock quantity for size M';
COMMENT ON COLUMN public.products.stock_l IS 'Stock quantity for size L';
COMMENT ON COLUMN public.products.stock_xl IS 'Stock quantity for size XL';
COMMENT ON COLUMN public.products.stock_xxl IS 'Stock quantity for size XXL';
