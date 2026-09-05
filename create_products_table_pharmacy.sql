-- ============================================
-- CREATE PHARMACY PRODUCTS TABLE
-- ============================================

-- Drop existing table if needed (WARNING: This will delete all data)
-- DROP TABLE IF EXISTS public.products CASCADE;

-- Create products table with pharmacy/medicine schema
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
    CHECK (form IN ('tablet','capsule','sachet','syrup','injection','cream','drops','inhaler','powder','other')),
  dosage_strength text,
  pack_sizes text[],
  price_per_pack numeric(10,2) DEFAULT 0,
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_requires_prescription ON public.products(requires_prescription);
CREATE INDEX IF NOT EXISTS idx_products_position ON public.products(position);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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
