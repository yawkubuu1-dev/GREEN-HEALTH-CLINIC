-- Create about_sections table for K.E Green Health Clinic
-- This table will store different sections of the About page

CREATE TABLE IF NOT EXISTS public.about_sections (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    short_desc TEXT,
    full_desc TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some sample data for about sections
INSERT INTO public.about_sections (slug, title, short_desc, full_desc, sort_order) VALUES
(
    'our-story',
    'Our Story',
    'Discover how K.E Green Health Clinic was founded on the principles of functional and metabolic medicine.',
    'At K.E Green Health Clinic, our journey began with a simple yet powerful vision: to revolutionize healthcare by addressing the root causes of illness rather than merely treating symptoms. Founded by Dr. K.E Green, our clinic emerged from years of experience in traditional medicine and a growing recognition that patients deserved more comprehensive, personalized care.

Our approach centers on functional medicine - a science-based methodology that views the body as an interconnected system. We believe that optimal health is achieved when we understand and address the underlying imbalances that contribute to disease. This philosophy guides everything we do, from our initial consultations to our ongoing patient relationships.

What sets us apart is our commitment to spending time with each patient, listening to their complete health story, and developing personalized treatment plans that address their unique needs. We combine the best of modern medical science with evidence-based natural therapies, creating a truly integrative approach to healthcare.',
    1
),
(
    'our-team',
    'Our Team',
    'Meet our dedicated team of healthcare professionals committed to your optimal health.',
    'Our multidisciplinary team brings together experts in functional medicine, nutrition, metabolic health, and chronic disease management. Each member of our team is carefully selected for their expertise, compassion, and commitment to our patient-centered approach.

Dr. K.E Green, our founder and lead physician, brings over 15 years of experience in functional medicine. With advanced training in metabolic disorders, chronic disease management, and nutritional therapy, Dr. Green has helped thousands of patients achieve lasting health improvements.

Our team also includes certified nutritionists, health coaches, and specialized nurses who work collaboratively to ensure every aspect of your health journey is supported. We believe in continuous education and regularly attend conferences and training to stay at the forefront of functional medicine advances.

Together, we are united by a common goal: helping you achieve your highest level of health and vitality through personalized, evidence-based care.',
    2
),
(
    'patient-story',
    'Patient Stories',
    'Real stories from real patients who have transformed their health with our comprehensive approach.',
    'Nothing speaks to the effectiveness of our approach more than the experiences of our patients. Over the years, we have had the privilege of witnessing remarkable health transformations that continue to inspire our work.

Sarah, a 45-year-old mother of two, came to us struggling with chronic fatigue, digestive issues, and hormone imbalances that had persisted for years. Through our comprehensive functional medicine approach, we identified underlying nutrient deficiencies, food sensitivities, and adrenal dysfunction. Within six months of following her personalized treatment plan, Sarah reported having more energy than she had felt in decades.

Michael, a 52-year-old executive, sought our help for metabolic syndrome and pre-diabetes. Traditional medicine offered him only medication management, but he wanted to address the root causes. Through our metabolic health program, including personalized nutrition plans and lifestyle modifications, Michael not only reversed his pre-diabetic condition but also lost 35 pounds and significantly improved his cardiovascular markers.

These stories represent just a fraction of the transformations we witness daily. Each patient''s journey is unique, but they all share a common thread: the power of addressing health from a root-cause perspective.',
    3
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active about sections
CREATE POLICY "Allow public read access to active about sections" ON public.about_sections
    FOR SELECT USING (is_active = true);

-- Allow authenticated users to read all about sections
CREATE POLICY "Allow authenticated read access to all about sections" ON public.about_sections
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access to about sections" ON public.about_sections
    FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_about_sections_slug ON public.about_sections(slug);
CREATE INDEX IF NOT EXISTS idx_about_sections_sort_order ON public.about_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_about_sections_active ON public.about_sections(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_about_sections_updated_at
    BEFORE UPDATE ON public.about_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT ON public.about_sections TO anon;
GRANT SELECT ON public.about_sections TO authenticated;
GRANT ALL ON public.about_sections TO service_role;

-- Display success message
SELECT 'about_sections table created successfully with sample data!' as message;