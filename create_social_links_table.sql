-- Create public social links for the floating social icon stack.
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  icon_name text,
  sort_order integer default 0,
  is_active boolean default true
);

alter table public.social_links enable row level security;

drop policy if exists "Public can read active social links" on public.social_links;

create policy "Public can read active social links"
  on public.social_links
  for select
  using (is_active = true);

grant select on public.social_links to anon, authenticated;

-- Add your clinic's real profile URLs after confirming them:
-- insert into public.social_links (platform, url, icon_name, sort_order) values
--   ('facebook', 'https://facebook.com/yourpage', 'facebook', 1),
--   ('instagram', 'https://instagram.com/yourhandle', 'instagram', 2),
--   ('twitter', 'https://x.com/yourhandle', 'twitter', 3),
--   ('linkedin', 'https://linkedin.com/company/yourcompany', 'linkedin', 4),
--   ('youtube', 'https://youtube.com/@yourchannel', 'youtube', 5),
--   ('tiktok', 'https://tiktok.com/@yourhandle', 'music', 6),
--   ('whatsapp', 'https://wa.me/233XXXXXXXXX', 'whatsapp', 7),
--   ('telegram', 'https://t.me/yourusername', 'telegram', 8);
