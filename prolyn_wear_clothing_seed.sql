-- =============================================================
-- PROLYN WEAR - Clothing & Apparel Database Setup & Seed
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard
--   2. Open your project → SQL Editor → New query
--   3. Paste this entire file and click "Run"
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. CATEGORIES TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null unique,
  description text,
  image_url   text,
  sort_order  int         not null default 0,
  created_at  timestamptz default now()
);

alter table public.categories enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
  on public.categories for select using (true);

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories"
  on public.categories for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- 2. PRODUCTS TABLE (Clothing sizes: S, M, L, XL, XXL)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.products (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  description    text,
  category_id    uuid        references public.categories(id) on delete set null,
  price          numeric(10,2) not null default 0.00,
  price_s        numeric(10,2) not null default 0.00,
  price_m        numeric(10,2) not null default 0.00,
  price_l        numeric(10,2) not null default 0.00,
  price_xl       numeric(10,2) not null default 0.00,
  price_xxl      numeric(10,2) not null default 0.00,
  has_sizes      boolean     not null default true,
  tag            text,
  image_url      text,
  stock_quantity int         not null default 0,
  position       int         not null default 0,
  created_at     timestamptz default now()
);

-- Add columns that may be missing from an older schema
alter table public.products add column if not exists price_s        numeric(10,2) not null default 0.00;
alter table public.products add column if not exists price_m        numeric(10,2) not null default 0.00;
alter table public.products add column if not exists price_l        numeric(10,2) not null default 0.00;
alter table public.products add column if not exists price_xl       numeric(10,2) not null default 0.00;
alter table public.products add column if not exists price_xxl      numeric(10,2) not null default 0.00;
alter table public.products add column if not exists has_sizes      boolean       not null default true;
alter table public.products add column if not exists tag            text;
alter table public.products add column if not exists stock_quantity int           not null default 0;
alter table public.products add column if not exists position       int           not null default 0;
alter table public.categories add column if not exists sort_order   int           not null default 0;

alter table public.products enable row level security;

drop policy if exists "public read products" on public.products;
create policy "public read products"
  on public.products for select using (true);

drop policy if exists "admin manage products" on public.products;
create policy "admin manage products"
  on public.products for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- 3. ORDERS TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete set null,
  total      numeric(10,2) not null default 0.00,
  status     text        not null default 'Pending',
  metadata   jsonb,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders"
  on public.orders for select
  using (auth.uid() = user_id or auth.role() = 'authenticated');

drop policy if exists "users insert orders" on public.orders;
create policy "users insert orders"
  on public.orders for insert with check (true);

drop policy if exists "admin manage orders" on public.orders;
create policy "admin manage orders"
  on public.orders for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- 4. ORDER ITEMS TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id              uuid        primary key default gen_random_uuid(),
  order_id        uuid        references public.orders(id) on delete cascade,
  product_id      uuid        references public.products(id) on delete set null,
  selected_size   text,
  unit_price      numeric(10,2) not null default 0.00,
  quantity        int         not null default 1,
  line_total      numeric(10,2) not null default 0.00,
  created_at      timestamptz default now()
);

alter table public.order_items enable row level security;

drop policy if exists "public manage order items" on public.order_items;
create policy "public manage order items"
  on public.order_items for all using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- 5. CAROUSEL ITEMS TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.carousel_items (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  description text,
  image_url   text        not null,
  link_url    text,
  is_active   boolean     not null default true,
  sort_order  int         not null default 0,
  created_at  timestamptz default now()
);

alter table public.carousel_items enable row level security;

drop policy if exists "public read carousel" on public.carousel_items;
create policy "public read carousel"
  on public.carousel_items for select using (true);

drop policy if exists "admin manage carousel" on public.carousel_items;
create policy "admin manage carousel"
  on public.carousel_items for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- 6. FOOTER SECTIONS TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.footer_sections (
  id          uuid        primary key default gen_random_uuid(),
  section_key text        not null unique,
  title       text        not null,
  sort_order  int         not null default 0,
  created_at  timestamptz default now()
);

alter table public.footer_sections enable row level security;

drop policy if exists "public read footer sections" on public.footer_sections;
create policy "public read footer sections"
  on public.footer_sections for select using (true);

-- ─────────────────────────────────────────────────────────────
-- 7. FOOTER ITEMS TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.footer_items (
  id           uuid        primary key default gen_random_uuid(),
  section_id   uuid        references public.footer_sections(id) on delete cascade,
  label        text        not null,
  action_type  text        not null default 'text',
  action_value text,
  icon_library text,
  icon_name    text,
  sort_order   int         not null default 0,
  created_at   timestamptz default now()
);

alter table public.footer_items enable row level security;

drop policy if exists "public read footer items" on public.footer_items;
create policy "public read footer items"
  on public.footer_items for select using (true);

-- ─────────────────────────────────────────────────────────────
-- 8. PROFILES TABLE (for user roles)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE 
            WHEN NEW.email = 'admin@prolynwear.com' THEN 'admin'
            ELSE 'customer'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- SEED DATA - CLOTHING & APPAREL
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- Categories (Clothing-focused)
-- ─────────────────────────────────────────────────────────────
insert into public.categories (name, description, image_url, sort_order) values
  ('T-Shirts',   'Casual and comfortable t-shirts for everyday wear',           'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', 1),
  ('Jeans',      'Stylish denim jeans for men and women',                      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80', 2),
  ('Dresses',    'Beautiful dresses for every occasion',                        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80', 3),
  ('Jackets',    'Trendy jackets and coats for all seasons',                   'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80', 4),
  ('Hoodies',    'Cozy hoodies and sweatshirts for comfort',                    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80', 5),
  ('Shorts',     'Comfortable shorts for warm weather',                        'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=80', 6),
  ('Sweaters',   'Warm sweaters and cardigans for layering',                    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80', 7),
  ('Activewear', 'Performance athletic wear for sports and fitness',           'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', 8),
  ('Formal Wear','Professional suits and formal attire',                         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80', 9),
  ('Accessories','Belts, hats, scarves and fashion accessories',                'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80', 10)
on conflict (name) do update set
  description = excluded.description,
  image_url   = excluded.image_url,
  sort_order  = excluded.sort_order;

-- ─────────────────────────────────────────────────────────────
-- Products (Clothing items with size-based pricing)
-- ─────────────────────────────────────────────────────────────
insert into public.products
  (name, description, category_id, price_s, price_m, price_l, price_xl, price_xxl, price, has_sizes, tag, image_url, stock_quantity, position)
select
  p.name, p.description,
  (select id from public.categories where name = p.cat limit 1),
  p.ps, p.pm, p.pl, p.pxl, p.pxxl, p.pl, true, p.tag, p.img, p.stock, p.pos
from (values
  -- T-Shirts
  ('Classic Cotton T-Shirt',       '100% cotton comfortable t-shirt for everyday wear',                 'T-Shirts',   25.00, 28.00, 30.00, 32.00, 35.00, 'Best Seller',  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', 80, 1),
  ('Premium V-Neck Tee',          'Soft modal fabric v-neck t-shirt with modern fit',                  'T-Shirts',   30.00, 33.00, 35.00, 37.00, 40.00, 'New Arrival',  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80', 60, 2),
  ('Graphic Print T-Shirt',       'Bold graphic print t-shirt for street style',                       'T-Shirts',   28.00, 31.00, 33.00, 35.00, 38.00, 'Trending',     'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80', 45, 3),
  
  -- Jeans
  ('Slim Fit Denim Jeans',        'Modern slim fit jeans with stretch comfort',                         'Jeans',      55.00, 58.00, 60.00, 62.00, 65.00, 'Popular',      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80', 50, 4),
  ('Classic Straight Jeans',      'Timeless straight leg jeans for casual wear',                       'Jeans',      50.00, 53.00, 55.00, 57.00, 60.00, 'Classic',      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80', 40, 5),
  ('High-Waisted Skinny Jeans',   'Figure-flattering high-waisted skinny jeans',                       'Jeans',      58.00, 61.00, 63.00, 65.00, 68.00, 'Essential',    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=900&q=80', 35, 6),
  
  -- Dresses
  ('Floral Summer Dress',         'Lightweight floral print dress perfect for summer',                  'Dresses',    65.00, 68.00, 70.00, 72.00, 75.00, 'Seasonal',     'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80', 30, 7),
  ('Elegant Evening Gown',        'Sophisticated evening gown for special occasions',                   'Dresses',   120.00, 125.00, 130.00, 135.00, 140.00, 'Designer',     'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80', 15, 8),
  ('Casual Wrap Dress',          'Versatile wrap dress that flatters all body types',                  'Dresses',    55.00, 58.00, 60.00, 62.00, 65.00, 'Comfort',      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', 25, 9),
  
  -- Jackets
  ('Denim Jacket',                'Classic denim jacket with vintage wash',                            'Jackets',    75.00, 78.00, 80.00, 82.00, 85.00, 'Iconic',       'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80', 35, 10),
  ('Leather Biker Jacket',        'Genuine leather biker jacket with edgy style',                      'Jackets',   150.00, 155.00, 160.00, 165.00, 170.00, 'Premium',      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80', 20, 11),
  ('Lightweight Windbreaker',     'Packable windbreaker perfect for travel',                           'Jackets',    45.00, 48.00, 50.00, 52.00, 55.00, 'Travel',       'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80', 40, 12),
  
  -- Hoodies
  ('Essential Pullover Hoodie',   'Classic pullover hoodie with kangaroo pocket',                       'Hoodies',    45.00, 48.00, 50.00, 52.00, 55.00, 'Bestseller',   'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80', 60, 13),
  ('Zip-Up Hoodie',               'Full-zip hoodie for easy layering',                                 'Hoodies',    50.00, 53.00, 55.00, 57.00, 60.00, 'Comfort',      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=900&q=80', 45, 14),
  ('Oversized Hoodie',            'Trendy oversized hoodie for relaxed fit',                           'Hoodies',    55.00, 58.00, 60.00, 62.00, 65.00, 'Trending',     'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80', 35, 15),
  
  -- Shorts
  ('Chino Shorts',                'Classic chino shorts for casual summer wear',                        'Shorts',     35.00, 38.00, 40.00, 42.00, 45.00, 'Essential',    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=80', 55, 16),
  ('Athletic Performance Shorts', 'Moisture-wicking shorts for sports and activities',                  'Shorts',     30.00, 33.00, 35.00, 37.00, 40.00, 'Performance',  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', 70, 17),
  ('Denim Shorts',                'Classic denim shorts with rolled hem',                               'Shorts',     32.00, 35.00, 37.00, 39.00, 42.00, 'Casual',       'https://images.unsplash.com/photo-1521093820065-9f1cae60f876?auto=format&fit=crop&w=900&q=80', 40, 18),
  
  -- Sweaters
  ('Cable Knit Sweater',          'Classic cable knit sweater for cozy warmth',                         'Sweaters',   55.00, 58.00, 60.00, 62.00, 65.00, 'Classic',      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80', 30, 19),
  ('Lightweight Cardigan',        'Versatile cardigan perfect for layering',                           'Sweaters',   45.00, 48.00, 50.00, 52.00, 55.00, 'Essential',    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80', 35, 20),
  ('Turtleneck Sweater',         'Elegant turtleneck sweater for sophisticated look',                  'Sweaters',   60.00, 63.00, 65.00, 67.00, 70.00, 'Elegant',      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80', 25, 21),
  
  -- Activewear
  ('Performance Leggings',        'High-waisted leggings with compression support',                     'Activewear', 40.00, 43.00, 45.00, 47.00, 50.00, 'Best Seller',  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=80', 65, 22),
  ('Sports Bra',                  'Medium-impact sports bra for workouts',                              'Activewear', 25.00, 28.00, 30.00, 32.00, 35.00, 'Essential',    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', 80, 23),
  ('Athletic Tank Top',          'Breathable tank top for training and running',                      'Activewear', 22.00, 25.00, 27.00, 29.00, 32.00, 'Performance',  'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=80', 75, 24),
  
  -- Formal Wear
  ('Classic Navy Suit',          'Tailored navy suit for professional occasions',                      'Formal Wear',180.00, 185.00, 190.00, 195.00, 200.00, 'Premium',      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80', 15, 25),
  ('Formal Dress Shirt',          'Crisp cotton dress shirt with spread collar',                       'Formal Wear', 45.00, 48.00, 50.00, 52.00, 55.00, 'Essential',    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80', 50, 26),
  ('Business Casual Blazer',      'Versatile blazer for business casual settings',                      'Formal Wear', 85.00, 88.00, 90.00, 92.00, 95.00, 'Professional', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80', 25, 27),
  
  -- Accessories
  ('Leather Belt',                'Genuine leather belt with classic buckle',                           'Accessories', 25.00, 25.00, 25.00, 25.00, 25.00, 'Essential',    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', 100, 28),
  ('Baseball Cap',                'Classic adjustable baseball cap',                                    'Accessories', 20.00, 20.00, 20.00, 20.00, 20.00, 'Casual',       'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80', 90, 29),
  ('Wool Scarf',                  'Soft wool scarf for winter warmth',                                 'Accessories', 30.00, 30.00, 30.00, 30.00, 30.00, 'Seasonal',     'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80', 40, 30)
) as p(name, description, cat, ps, pm, pl, pxl, pxxl, tag, img, stock, pos)
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Carousel Items (Clothing-focused)
-- ─────────────────────────────────────────────────────────────
insert into public.carousel_items (title, description, image_url, is_active, sort_order) values
  ('New Season Collection',       'Fresh styles for the upcoming season',                              'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80', true, 1),
  ('Summer Sale Event',           'Up to 40% off selected summer items',                                'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80', true, 2),
  ('Premium Denim Collection',    'Quality denim jeans and jackets',                                   'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80', true, 3),
  ('Activewear Special',          'Performance gear for your active lifestyle',                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', true, 4)
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Footer Sections & Items (Updated for Prolyn Wear)
-- ─────────────────────────────────────────────────────────────
insert into public.footer_sections (section_key, title, sort_order) values
  ('aboutUs',  'ABOUT PROLYN WEAR', 1),
  ('mainMenu', 'MAIN MENU',         2),
  ('links',    'LINKS',             3),
  ('contact',  'CONTACT',           4)
on conflict (section_key) do update set title = excluded.title, sort_order = excluded.sort_order;

-- About Us items
insert into public.footer_items (section_id, label, action_type, sort_order) values
  ((select id from public.footer_sections where section_key = 'aboutUs'),
   'We specialize in quality clothing and apparel, proudly made for the modern lifestyle.', 'text', 10),
  ((select id from public.footer_sections where section_key = 'aboutUs'),
   'From casual everyday wear to professional attire, we offer premium fashion for every occasion.', 'text', 20)
on conflict do nothing;

-- Main Menu items
insert into public.footer_items (section_id, label, action_type, action_value, sort_order) values
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'Home',           'navigate', 'shop',                      10),
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'About Us',       'alert',    'About Prolyn Wear coming soon', 20),
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'Prolyn Wear Shop','navigate', 'shop',                      30),
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'Contact Us',     'alert',    'Contact Us coming soon',      40)
on conflict do nothing;

-- Links items
insert into public.footer_items (section_id, label, action_type, action_value, sort_order) values
  ((select id from public.footer_sections where section_key = 'links'), 'Cart',                 'navigate', 'cart',                              10),
  ((select id from public.footer_sections where section_key = 'links'), 'Checkout',             'checkout', null,                                20),
  ((select id from public.footer_sections where section_key = 'links'), 'Wishlist',             'alert',    'Wishlist coming soon',              30),
  ((select id from public.footer_sections where section_key = 'links'), 'Terms And Conditions', 'alert',    'Terms & Conditions coming soon',    40)
on conflict do nothing;

-- Contact items
insert into public.footer_items (section_id, label, action_type, action_value, icon_library, icon_name, sort_order) values
  ((select id from public.footer_sections where section_key = 'contact'), 'Accra Mall, Spintex Road, Accra, Ghana', 'text', null,                          null,           null,          10),
  ((select id from public.footer_sections where section_key = 'contact'), 'For Business, call: +233 XX XXX XXXX',   'link', 'tel:+233590000000',           'FontAwesome',  'phone',       20),
  ((select id from public.footer_sections where section_key = 'contact'), 'Click here to order on WhatsApp',     'link', 'https://wa.me/233590000000',  'FontAwesome',  'whatsapp',    30),
  ((select id from public.footer_sections where section_key = 'contact'), 'Facebook',  'link', 'https://facebook.com',             'FontAwesome5', 'facebook-f',  40),
  ((select id from public.footer_sections where section_key = 'contact'), 'Instagram', 'link', 'https://instagram.com',            'FontAwesome5', 'instagram',   50),
  ((select id from public.footer_sections where section_key = 'contact'), 'WhatsApp',  'link', 'https://wa.me/233590000000',       'FontAwesome5', 'whatsapp',    60),
  ((select id from public.footer_sections where section_key = 'contact'), 'Twitter',   'link', 'https://twitter.com',              'FontAwesome5', 'twitter',     70),
  ((select id from public.footer_sections where section_key = 'contact'), 'TikTok',    'link', 'https://tiktok.com',               'FontAwesome5', 'tiktok',      80)
on conflict do nothing;

-- =============================================================
-- VERIFICATION
-- =============================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Prolyn Wear database setup complete!';
    RAISE NOTICE '📦 Categories: 10 clothing categories';
    RAISE NOTICE '👕 Products: 30 clothing items with size-based pricing';
    RAISE NOTICE '🎠 Carousel: 4 promotional banners';
    RAISE NOTICE '📋 Footer: Updated with Prolyn Wear branding';
    RAISE NOTICE '👤 Admin email: admin@prolynwear.com will get admin role';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to run your clothing app!';
END $$;
