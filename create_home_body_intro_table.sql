-- Create home_body_intro table for HealthPrioritySection content
CREATE TABLE IF NOT EXISTS public.home_body_intro (
    id SERIAL PRIMARY KEY,
    heading TEXT NOT NULL DEFAULT 'YOUR HEALTH. OUR PRIORITY.',
    heading_color TEXT NOT NULL DEFAULT '#1B5E20',
    body_line TEXT NOT NULL DEFAULT 'We care about health and we don''t sugarcoat.',
    tagline TEXT NOT NULL DEFAULT 'Premium Service Healthcare.',
    tagline_color TEXT NOT NULL DEFAULT '#8BC34A',
    paragraph TEXT NOT NULL DEFAULT 'At K.E Green Health Clinic, we focus on finding the root cause of your health concerns and delivering personalized, evidence-based care that works.',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default content
INSERT INTO public.home_body_intro (
    id,
    heading,
    heading_color,
    body_line,
    tagline,
    tagline_color,
    paragraph,
    is_active
) VALUES (
    1,
    'YOUR HEALTH. OUR PRIORITY.',
    '#1B5E20',
    'We care about health and we don''t sugarcoat.',
    'Premium Service Healthcare.',
    '#8BC34A',
    'At K.E Green Health Clinic, we focus on finding the root cause of your health concerns and delivering personalized, evidence-based care that works.',
    true
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.home_body_intro ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY IF NOT EXISTS "Allow public read access" 
ON public.home_body_intro FOR SELECT 
TO public 
USING (is_active = true);

-- Create policy for authenticated users to update
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update" 
ON public.home_body_intro FOR UPDATE 
TO authenticated 
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_home_body_intro_updated_at 
    BEFORE UPDATE ON public.home_body_intro 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();