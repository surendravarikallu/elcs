-- ── Carousel slides ────────────────────────────────────────────
create table if not exists carousel_slides (
  id           uuid        primary key default gen_random_uuid(),
  badge        text,                              -- e.g. "WHAT'S NEW"
  title        text        not null default '',
  description  text,
  image_url    text,
  cta_label    text,                              -- button text (optional)
  cta_url      text,                              -- button href (optional)
  sort_order   int         not null default 0,
  is_published boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists carousel_slides_updated_at on carousel_slides;
create trigger carousel_slides_updated_at
  before update on carousel_slides for each row execute function update_updated_at();

alter table carousel_slides enable row level security;

-- Anyone can read published slides (frontend)
create policy "Public read carousel_slides"
  on carousel_slides for select using (is_published = true);

-- Admins can do everything
create policy "Admin manage carousel_slides"
  on carousel_slides for all using (is_admin());

-- Seed one starter slide so the section isn't empty
insert into carousel_slides (badge, title, description, sort_order, is_published) values
  ('WHAT''S NEW',
   'Embedded Solutions for Connected Systems',
   'ELCS delivers robust, low-latency modules for real-time data acquisition, device control, and intelligent automation — built for mission-critical applications.',
   1, true);
