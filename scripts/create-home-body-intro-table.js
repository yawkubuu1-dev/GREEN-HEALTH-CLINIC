// Script to create the home_body_intro table in Supabase
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createTable() {
  console.log('🔄 Creating home_body_intro table...');
  
  // Using rpc to execute raw SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
    CREATE TABLE IF NOT EXISTS public.home_body_intro (
      id INTEGER PRIMARY KEY DEFAULT 1,
      heading TEXT NOT NULL DEFAULT 'YOUR HEALTH. OUR PRIORITY.',
      heading_color TEXT NOT NULL DEFAULT '#1B5E20',
      body_line TEXT NOT NULL DEFAULT 'We care about health and we don''t sugarcoat.',
      tagline TEXT NOT NULL DEFAULT 'Premium Service Healthcare.',
      tagline_color TEXT NOT NULL DEFAULT '#8BC34A',
      paragraph TEXT NOT NULL DEFAULT 'At K.E Green Health Clinic, we focus on finding the root cause of your health concerns and delivering personalized, evidence-based care that works.',
      is_active BOOLEAN NOT NULL DEFAULT true,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT single_row CHECK (id = 1)
    );

    INSERT INTO public.home_body_intro (id)
    VALUES (1)
    ON CONFLICT (id) DO NOTHING;

    ALTER TABLE public.home_body_intro ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can view home body intro" ON public.home_body_intro;
    CREATE POLICY "Anyone can view home body intro"
    ON public.home_body_intro
    FOR SELECT
    TO public
    USING (is_active = true);
    `
  });

  if (error) {
    console.error('❌ Error creating table:', error);
    
    // Try alternative approach - direct table operations
    console.log('🔄 Trying direct table operations...');
    
    // Try to insert default row (table might already exist)
    const { data: insertData, error: insertError } = await supabase
      .from('home_body_intro')
      .insert({
        id: 1,
        heading: 'YOUR HEALTH. OUR PRIORITY.',
        heading_color: '#1B5E20',
        body_line: 'We care about health and we don\'t sugarcoat.',
        tagline: 'Premium Service Healthcare.',
        tagline_color: '#8BC34A',
        paragraph: 'At K.E Green Health Clinic, we focus on finding the root cause of your health concerns and delivering personalized, evidence-based care that works.',
        is_active: true
      });
    
    if (insertError && !insertError.message.includes('duplicate key')) {
      console.error('❌ Error inserting default data:', insertError);
      return;
    }
  }
  
  // Test the table by fetching data
  const { data: testData, error: testError } = await supabase
    .from('home_body_intro')
    .select('*')
    .eq('id', 1)
    .single();
    
  if (testError) {
    console.error('❌ Error testing table:', testError);
    return;
  }
  
  console.log('✅ Table created and tested successfully!');
  console.log('📋 Default data:', JSON.stringify(testData, null, 2));
}

createTable();