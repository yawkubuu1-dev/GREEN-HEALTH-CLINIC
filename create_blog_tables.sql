-- ============================================
-- BLOG SYSTEM SQL SCRIPT FOR SUPABASE
-- ============================================
-- Complete blog management with categories, posts, authors, and tags

-- Step 1: Create blog_categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- emoji or icon name
  color TEXT DEFAULT '#3B82F6', -- hex color for category badge
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create blog_authors table
CREATE TABLE IF NOT EXISTS public.blog_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  title TEXT, -- e.g., "Pharmacist", "Health Writer"
  social_links JSONB DEFAULT '{}'::jsonb, -- {twitter, linkedin, website}
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 3: Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT, -- short summary
  content TEXT NOT NULL, -- full article content (markdown or HTML)
  featured_image_url TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.blog_authors(id) ON DELETE SET NULL,
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  -- Publishing
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT false, -- show on homepage
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 4: Create blog_tags table
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 5: Create blog_post_tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON public.blog_tags(slug);

-- Step 7: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Apply triggers
DROP TRIGGER IF EXISTS blog_categories_updated_at ON public.blog_categories;
CREATE TRIGGER blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();

DROP TRIGGER IF EXISTS blog_authors_updated_at ON public.blog_authors;
CREATE TRIGGER blog_authors_updated_at
  BEFORE UPDATE ON public.blog_authors
  FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();

DROP TRIGGER IF EXISTS blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();

-- Step 9: Enable Row Level Security (RLS)
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS Policies (Public read, Admin write)

-- Blog Categories: Everyone can read active categories
DROP POLICY IF EXISTS "Blog categories are viewable by everyone" ON public.blog_categories;
CREATE POLICY "Blog categories are viewable by everyone"
  ON public.blog_categories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage blog categories" ON public.blog_categories;
CREATE POLICY "Admins can manage blog categories"
  ON public.blog_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Blog Authors: Everyone can read active authors
DROP POLICY IF EXISTS "Blog authors are viewable by everyone" ON public.blog_authors;
CREATE POLICY "Blog authors are viewable by everyone"
  ON public.blog_authors FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage blog authors" ON public.blog_authors;
CREATE POLICY "Admins can manage blog authors"
  ON public.blog_authors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Blog Posts: Everyone can read published posts
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON public.blog_posts;
CREATE POLICY "Published blog posts are viewable by everyone"
  ON public.blog_posts FOR SELECT
  USING (status = 'published' AND published_at <= now());

DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Blog Tags: Everyone can read tags
DROP POLICY IF EXISTS "Blog tags are viewable by everyone" ON public.blog_tags;
CREATE POLICY "Blog tags are viewable by everyone"
  ON public.blog_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage blog tags" ON public.blog_tags;
CREATE POLICY "Admins can manage blog tags"
  ON public.blog_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Blog Post Tags: Everyone can read
DROP POLICY IF EXISTS "Blog post tags are viewable by everyone" ON public.blog_post_tags;
CREATE POLICY "Blog post tags are viewable by everyone"
  ON public.blog_post_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage blog post tags" ON public.blog_post_tags;
CREATE POLICY "Admins can manage blog post tags"
  ON public.blog_post_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Step 11: Insert sample blog categories
INSERT INTO public.blog_categories (name, slug, description, icon, color, sort_order) VALUES
  ('Health Tips', 'health-tips', 'General health and wellness advice', '💊', '#10B981', 1),
  ('Medicine Guide', 'medicine-guide', 'Information about medications and treatments', '📋', '#3B82F6', 2),
  ('Pharmacy News', 'pharmacy-news', 'Latest news from the pharmacy industry', '📰', '#F59E0B', 3),
  ('Disease Prevention', 'disease-prevention', 'Tips for preventing common illnesses', '🛡️', '#EF4444', 4),
  ('Nutrition', 'nutrition', 'Diet and nutrition information', '🥗', '#8B5CF6', 5),
  ('Mental Health', 'mental-health', 'Mental health awareness and support', '🧠', '#EC4899', 6)
ON CONFLICT (slug) DO NOTHING;

-- Step 12: Insert sample author
INSERT INTO public.blog_authors (name, email, bio, title, avatar_url, social_links) VALUES
  (
    'Dr. Sarah Johnson',
    'sarah@prolynwear.com',
    'Licensed pharmacist with 10 years of experience in community pharmacy and patient care.',
    'Chief Pharmacist',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
    '{"twitter": "drsarahjohnson", "linkedin": "drsarahjohnson"}'::jsonb
  ),
  (
    'James Mitchell',
    'james@prolynwear.com',
    'Health writer and nutritionist specializing in preventive medicine.',
    'Health Writer',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    '{"website": "jamesmitchell.health"}'::jsonb
  )
ON CONFLICT (email) DO NOTHING;

-- Step 13: Insert sample blog tags
INSERT INTO public.blog_tags (name, slug) VALUES
  ('Pain Relief', 'pain-relief'),
  ('Cold & Flu', 'cold-flu'),
  ('Vitamins', 'vitamins'),
  ('Diabetes', 'diabetes'),
  ('Heart Health', 'heart-health'),
  ('Children', 'children'),
  ('Elderly Care', 'elderly-care'),
  ('First Aid', 'first-aid')
ON CONFLICT (slug) DO NOTHING;

-- Step 14: Insert sample blog posts
INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, category_id, author_id, 
   meta_title, meta_description, status, is_featured, published_at)
SELECT
  'Understanding Paracetamol: Uses and Safety',
  'understanding-paracetamol-uses-safety',
  'Learn everything you need to know about paracetamol, one of the most commonly used pain relievers.',
  E'# Understanding Paracetamol: Uses and Safety\n\nParacetamol (also known as acetaminophen) is one of the most widely used over-the-counter pain relievers and fever reducers in the world.\n\n## What is Paracetamol?\n\nParacetamol is an analgesic (pain reliever) and antipyretic (fever reducer). It works by blocking pain signals in the brain and helping to regulate body temperature.\n\n## Common Uses\n\n- Headaches and migraines\n- Muscle aches\n- Toothaches\n- Period pain\n- Cold and flu symptoms\n- Post-vaccination fever\n\n## Dosage Guidelines\n\n**Adults:** 500mg-1000mg every 4-6 hours as needed. Maximum: 4000mg in 24 hours.\n\n**Children:** Dosage based on weight. Always consult product label or pharmacist.\n\n## Safety Tips\n\n1. **Never exceed the recommended dose** - Overdosing can cause serious liver damage\n2. **Check other medications** - Many cold/flu remedies contain paracetamol\n3. **Avoid with alcohol** - Increases risk of liver damage\n4. **Storage** - Keep below 30°C in a dry place\n\n## When to Seek Medical Advice\n\n- Pain persists for more than 3 days\n- Fever lasts more than 3 days\n- Symptoms worsen\n- Signs of allergic reaction (rash, swelling, difficulty breathing)\n\n## Conclusion\n\nParacetamol is safe and effective when used correctly. Always read the label and follow dosage instructions carefully.\n\n---\n*Disclaimer: This article is for informational purposes only. Always consult a healthcare professional for medical advice.*',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
  (SELECT id FROM public.blog_categories WHERE slug = 'medicine-guide' LIMIT 1),
  (SELECT id FROM public.blog_authors WHERE email = 'sarah@prolynwear.com' LIMIT 1),
  'Paracetamol Uses, Dosage & Safety Guide',
  'Complete guide to paracetamol: uses, dosage, safety tips, and when to seek medical advice. Expert information from licensed pharmacists.',
  'published',
  true,
  now() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'understanding-paracetamol-uses-safety');

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, category_id, author_id, 
   meta_title, meta_description, status, is_featured, published_at)
SELECT
  '5 Essential Vitamins for Immune Support',
  '5-essential-vitamins-immune-support',
  'Discover the top 5 vitamins that can help strengthen your immune system naturally.',
  E'# 5 Essential Vitamins for Immune Support\n\nA strong immune system is your body\'s first line of defense against illness. Here are 5 essential vitamins that play crucial roles in immune function.\n\n## 1. Vitamin C\n\n**Why it matters:** Powerful antioxidant that supports immune cell function.\n\n**Food sources:** Citrus fruits, strawberries, bell peppers, broccoli\n\n**Supplement dose:** 500-1000mg daily\n\n## 2. Vitamin D\n\n**Why it matters:** Regulates immune response and helps fight infections.\n\n**Food sources:** Fatty fish, egg yolks, fortified milk\n\n**Supplement dose:** 1000-2000 IU daily (or as recommended by doctor)\n\n## 3. Vitamin A\n\n**Why it matters:** Maintains integrity of skin and mucous membranes (first barriers against infection).\n\n**Food sources:** Sweet potatoes, carrots, spinach, liver\n\n**Supplement dose:** Usually sufficient from diet\n\n## 4. Vitamin E\n\n**Why it matters:** Antioxidant that enhances immune function, especially in older adults.\n\n**Food sources:** Nuts, seeds, vegetable oils, leafy greens\n\n**Supplement dose:** 15mg (22 IU) daily\n\n## 5. B Vitamins (especially B6 and B12)\n\n**Why it matters:** Support production of immune cells and antibodies.\n\n**Food sources:** Whole grains, meat, fish, legumes\n\n**Supplement dose:** B-complex supplement as directed\n\n## Getting Started\n\n1. **Focus on diet first** - Whole foods provide vitamins plus other beneficial nutrients\n2. **Consider supplements** - Especially if dietary intake is limited\n3. **Consult a professional** - Talk to your pharmacist or doctor about your specific needs\n\n## Important Notes\n\n- More is not always better - excess vitamins can be harmful\n- Vitamin D levels should be checked before high-dose supplementation\n- Some vitamins interact with medications\n\n---\n*Always consult with a healthcare provider before starting new supplements, especially if you have health conditions or take medications.*',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
  (SELECT id FROM public.blog_categories WHERE slug = 'health-tips' LIMIT 1),
  (SELECT id FROM public.blog_authors WHERE email = 'james@prolynwear.com' LIMIT 1),
  '5 Essential Vitamins for Immune Support | Health Guide',
  'Learn about the top 5 vitamins for immune support including Vitamin C, D, A, E, and B vitamins. Plus dosage recommendations and food sources.',
  'published',
  true,
  now() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = '5-essential-vitamins-immune-support');

INSERT INTO public.blog_posts 
  (title, slug, excerpt, content, featured_image_url, category_id, author_id, 
   meta_title, meta_description, status, published_at)
SELECT
  'When to Use Antibiotics: A Complete Guide',
  'when-to-use-antibiotics-guide',
  'Understanding when antibiotics are necessary and the importance of proper usage.',
  E'# When to Use Antibiotics: A Complete Guide\n\nAntibiotics are powerful medications that fight bacterial infections. However, they\'re often misused or overused, leading to antibiotic resistance.\n\n## What Are Antibiotics?\n\nAntibiotics are medicines that kill or stop the growth of bacteria. They do NOT work against viruses like colds or flu.\n\n## When Antibiotics Are Needed\n\n### Bacterial Infections That May Require Antibiotics:\n\n- Strep throat\n- Urinary tract infections (UTIs)\n- Bacterial pneumonia\n- Certain skin infections\n- Bacterial ear infections\n- Some sinus infections\n\n### When Antibiotics Are NOT Needed:\n\n- Common cold\n- Flu (influenza)\n- Most sore throats\n- Most coughs and bronchitis\n- Many sinus infections\n- Stomach flu\n\n## Why Proper Use Matters\n\n### Antibiotic Resistance\n\nOveruse of antibiotics has led to antibiotic-resistant bacteria, making infections harder to treat.\n\n### Side Effects\n\n- Diarrhea\n- Nausea\n- Yeast infections\n- Allergic reactions\n\n## Best Practices\n\n1. **Only take when prescribed** - Don\'t use leftover antibiotics\n2. **Complete the full course** - Even if you feel better\n3. **Take as directed** - Right dose, right times\n4. **Don\'t share** - Your prescription is specific to you\n5. **Report side effects** - Contact your doctor or pharmacist\n\n## Questions to Ask Your Doctor\n\n- Is this infection bacterial or viral?\n- Do I really need an antibiotic?\n- What are the benefits and risks?\n- Are there alternatives?\n\n## Storage and Disposal\n\n- Store as directed (usually room temperature)\n- Check expiration dates\n- Dispose of unused antibiotics properly (return to pharmacy)\n\n## Conclusion\n\nAntibiotics save lives when used appropriately. Work with your healthcare provider to ensure you\'re using them correctly.\n\n---\n*This information is educational. Always follow your doctor\'s prescription and consult healthcare professionals for medical advice.*',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
  (SELECT id FROM public.blog_categories WHERE slug = 'medicine-guide' LIMIT 1),
  (SELECT id FROM public.blog_authors WHERE email = 'sarah@prolynwear.com' LIMIT 1),
  'When to Use Antibiotics: Complete Guide | Proper Usage',
  'Learn when antibiotics are needed, why proper usage matters, and how to avoid antibiotic resistance. Expert guide from licensed pharmacists.',
  'published',
  now() - INTERVAL '7 days'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'when-to-use-antibiotics-guide');

-- Step 15: Link tags to posts
INSERT INTO public.blog_post_tags (post_id, tag_id)
SELECT 
  p.id,
  t.id
FROM public.blog_posts p
CROSS JOIN public.blog_tags t
WHERE 
  (p.slug = 'understanding-paracetamol-uses-safety' AND t.slug IN ('pain-relief', 'first-aid'))
  OR (p.slug = '5-essential-vitamins-immune-support' AND t.slug IN ('vitamins', 'elderly-care'))
  OR (p.slug = 'when-to-use-antibiotics-guide' AND t.slug IN ('cold-flu', 'children'))
ON CONFLICT DO NOTHING;

-- Step 16: Create helper view for published posts with full details
CREATE OR REPLACE VIEW public.blog_posts_full AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  c.color as category_color,
  a.name as author_name,
  a.title as author_title,
  a.avatar_url as author_avatar,
  ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
  ARRAY_AGG(DISTINCT t.slug) FILTER (WHERE t.slug IS NOT NULL) as tag_slugs
FROM public.blog_posts p
LEFT JOIN public.blog_categories c ON p.category_id = c.id
LEFT JOIN public.blog_authors a ON p.author_id = a.id
LEFT JOIN public.blog_post_tags pt ON p.id = pt.post_id
LEFT JOIN public.blog_tags t ON pt.tag_id = t.id
GROUP BY p.id, c.name, c.slug, c.color, a.name, a.title, a.avatar_url;

-- Step 17: Verification query
SELECT 
  'Blog system setup complete!' as message,
  (SELECT COUNT(*) FROM public.blog_categories) as categories_count,
  (SELECT COUNT(*) FROM public.blog_authors) as authors_count,
  (SELECT COUNT(*) FROM public.blog_posts) as posts_count,
  (SELECT COUNT(*) FROM public.blog_tags) as tags_count;
