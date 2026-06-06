-- ── Site-wide key-value settings ──────────────────────────────────
create table if not exists site_settings (
  key        text primary key,
  value      text        not null default '',
  label      text        not null default '',
  sort_order int         not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on site_settings;
create trigger site_settings_updated_at
  before update on site_settings for each row execute function update_updated_at();

alter table site_settings enable row level security;

-- Public can read (frontend fetches footer values)
create policy "Public read site_settings"
  on site_settings for select using (true);

-- Only admins can write
create policy "Admin manage site_settings"
  on site_settings for all using (is_admin());

-- ── Default footer values ──────────────────────────────────────────
insert into site_settings (key, label, sort_order, value) values
  ('footer_address',       'Address',            1,  'ELCS Embedded Labs'|| chr(10) ||'Engineering Sector 7'),
  ('footer_whatsapp',      'WhatsApp Number',    2,  '+00 0000 000 000'),
  ('footer_whatsapp_url',  'WhatsApp Link (URL)',3,  '#'),
  ('footer_linkedin_url',  'LinkedIn URL',       4,  '#'),
  ('footer_instagram_url', 'Instagram URL',      5,  '#'),
  ('footer_tagline',       'Tagline',            6,  '#ConnectTogether'),
  ('footer_copyright',     'Copyright Text',     7,  'ELCS — ALL SYSTEMS NOMINAL')
on conflict (key) do nothing;
