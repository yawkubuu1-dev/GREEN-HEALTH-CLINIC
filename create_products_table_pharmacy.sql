-- ============================================
-- CREATE PHARMACY PRODUCTS TABLE
-- ============================================

-- Drop existing table if needed (WARNING: This will delete all data)
-- DROP TABLE IF EXISTS public.products CASCADE;

-- Create or upgrade the products table for the clinic pharmacy catalogue.
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock_quantity integer NOT NULL DEFAULT 0,
  tag text,
  image_url text,
  position integer,
  category_id uuid REFERENCES public.categories(id),
  form text NOT NULL DEFAULT 'tablet'
    CONSTRAINT products_form_check
    CHECK (form IN ('tablet','capsule','sachet','syrup','injection','cream','drops','inhaler','powder','other')),
  dosage_strength text,
  pack_sizes text[] NOT NULL DEFAULT '{}',
  price_per_pack numeric(10,2) NOT NULL DEFAULT 0,
  requires_prescription boolean NOT NULL DEFAULT false,
  active_ingredient text,
  manufacturer text,
  expiry_date date,
  storage_info text DEFAULT 'Store below 30°C in a dry place',
  side_effects text,
  contraindications text,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Also upgrade an existing products table without dropping products or orders.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tag text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS position integer,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS form text DEFAULT 'tablet',
  ADD COLUMN IF NOT EXISTS dosage_strength text,
  ADD COLUMN IF NOT EXISTS pack_sizes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_per_pack numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requires_prescription boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS active_ingredient text,
  ADD COLUMN IF NOT EXISTS manufacturer text,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS storage_info text DEFAULT 'Store below 30°C in a dry place',
  ADD COLUMN IF NOT EXISTS side_effects text,
  ADD COLUMN IF NOT EXISTS contraindications text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

UPDATE public.products
SET form = CASE
  WHEN lower(trim(form)) IN ('tablet','capsule','sachet','syrup','injection','cream','drops','inhaler','powder','other')
    THEN lower(trim(form))
  ELSE 'other'
END
WHERE form IS NULL
   OR form <> lower(trim(form))
   OR lower(trim(form)) NOT IN ('tablet','capsule','sachet','syrup','injection','cream','drops','inhaler','powder','other');

UPDATE public.products
SET price_per_pack = COALESCE(NULLIF(price_per_pack, 0), price, 0)
WHERE price_per_pack IS NULL OR price_per_pack = 0;

ALTER TABLE public.products
  ALTER COLUMN form SET DEFAULT 'tablet',
  ALTER COLUMN form SET NOT NULL,
  ALTER COLUMN pack_sizes SET DEFAULT '{}',
  ALTER COLUMN pack_sizes SET NOT NULL,
  ALTER COLUMN price_per_pack SET DEFAULT 0,
  ALTER COLUMN price_per_pack SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.products'::regclass
      AND conname = 'products_form_check'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_form_check
      CHECK (form IN ('tablet','capsule','sachet','syrup','injection','cream','drops','inhaler','powder','other'));
  END IF;
END;
$$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_requires_prescription ON public.products(requires_prescription);
CREATE INDEX IF NOT EXISTS idx_products_position ON public.products(position);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON public.products;

CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert products"
  ON public.products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update products"
  ON public.products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete products"
  ON public.products FOR DELETE
  USING (auth.role() = 'authenticated');
