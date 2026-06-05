-- ============================================================
-- ELCS — Initial Schema
-- Run this in your Supabase project: SQL Editor → New query
-- ============================================================

-- Categories
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  sort_order  int  default 0,
  created_at  timestamptz default now()
);

-- Products
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  name              text    not null,
  slug              text    not null unique,
  short_description text,
  description       text,
  category_id       uuid    references categories(id) on delete set null,
  price             numeric(10,2),          -- null = "Contact for price"
  image_url         text,
  manual_url        text,                   -- PDF datasheet
  specs             jsonb   default '{}',   -- { "Interface": "SPI", ... }
  tags              text[]  default '{}',
  is_published      boolean default true,
  is_featured       boolean default false,
  sort_order        int     default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Admin users (linked to Supabase Auth)
create table if not exists admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text,
  created_at timestamptz default now()
);

-- Enquiries (B2B contact / quote requests)
create table if not exists enquiries (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  customer_email text not null,
  customer_phone text,
  company        text,
  message        text,
  -- [{product_id, product_name, quantity}]
  items          jsonb not null default '[]',
  status         text  not null default 'new',  -- new | reviewing | replied | closed
  admin_notes    text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── updated_at trigger ──────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_updated_at
  before update on products for each row execute function update_updated_at();
create trigger enquiries_updated_at
  before update on enquiries for each row execute function update_updated_at();

-- ── Row-Level Security ──────────────────────────────────────
alter table categories   enable row level security;
alter table products     enable row level security;
alter table admin_users  enable row level security;
alter table enquiries    enable row level security;

-- Public read
create policy "Public read categories"
  on categories for select using (true);
create policy "Public read published products"
  on products   for select using (is_published = true);

-- Admin helper function
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$;

-- Admin full access
create policy "Admin all categories"  on categories  for all using (is_admin());
create policy "Admin all products"    on products    for all using (is_admin());
create policy "Admin read admins"     on admin_users for select using (is_admin());
create policy "Admin all enquiries"   on enquiries   for all using (is_admin());

-- Public can submit enquiries
create policy "Public insert enquiries"
  on enquiries for insert with check (true);

-- ── Seed categories ─────────────────────────────────────────
insert into categories (name, slug, description, sort_order) values
  ('Core Modules',       'core-modules',       'Compact processing & embedded system modules',       1),
  ('Custom PCBs',        'custom-pcbs',        'High-density multi-layer PCB design & fabrication', 2),
  ('IoT Devices',        'iot-devices',        'Connected hardware for IoT applications',            3),
  ('Control Systems',    'control-systems',    'Industrial automation & control hardware',           4),
  ('Firmware Solutions', 'firmware-solutions', 'Embedded firmware & RTOS packages',                 5),
  ('Power Systems',      'power-systems',      'Power management & supply modules',                  6)
on conflict (slug) do nothing;

-- ── To create first admin ────────────────────────────────────
-- 1. Sign up via Supabase Auth (Dashboard → Auth → Users → Invite)
-- 2. Then run:
--    insert into admin_users (id, email, name)
--    values ('<paste-user-uuid>', 'your@email.com', 'Your Name');
