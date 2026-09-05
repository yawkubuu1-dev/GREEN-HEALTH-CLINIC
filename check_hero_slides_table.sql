-- Check if hero_slides table exists and what data it has

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'hero_slides';

-- If table exists, check its structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hero_slides';

-- Check what data is in the table
SELECT * FROM public.hero_slides;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'hero_slides';
