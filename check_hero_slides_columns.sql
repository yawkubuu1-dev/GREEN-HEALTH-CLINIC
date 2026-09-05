-- Check actual column names in hero_slides table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hero_slides' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Then check the data
SELECT * FROM public.hero_slides ORDER BY position LIMIT 5;
