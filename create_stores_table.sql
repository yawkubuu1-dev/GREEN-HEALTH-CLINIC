-- ================================================
-- STORES TABLE FOR CONTACT PAGE "LOCATE US"
-- Run this in the Supabase SQL Editor
-- ================================================

CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_sort_order ON public.stores(sort_order);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read stores" ON public.stores;
CREATE POLICY "Anyone can read stores"
ON public.stores FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT ON public.stores TO anon, authenticated;

-- Ghana office: Roman Ridge, Accra
INSERT INTO public.stores (name, address, latitude, longitude, sort_order)
SELECT
    'Accra Office',
    'Roman Ridge, Accra, Ghana',
    5.6027166,
    -0.2004655,
    10
WHERE NOT EXISTS (
    SELECT 1 FROM public.stores
    WHERE ABS(latitude - 5.6027166) < 0.00001
      AND ABS(longitude - (-0.2004655)) < 0.00001
);

SELECT id, name, address, latitude, longitude, sort_order
FROM public.stores
ORDER BY sort_order, name;
