-- Create manual_images table to store multiple images per manual
create table if not exists public.manual_images (
  id uuid primary key default gen_random_uuid(),
  manual_id uuid not null references public.manuals(id) on delete cascade,
  image_url text not null,
  image_pathname text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security for manual_images
alter table public.manual_images enable row level security;

-- Permissive policies for manual_images
create policy "manual_images_public_select"
  on public.manual_images
  for select
  to anon, authenticated
  using (true);

create policy "manual_images_public_insert"
  on public.manual_images
  for insert
  to anon, authenticated
  with check (true);

create policy "manual_images_public_delete"
  on public.manual_images
  for delete
  to anon, authenticated
  using (true);

-- Index for fetching images by manual
create index if not exists manual_images_manual_id_idx on public.manual_images (manual_id, sort_order);

-- Create the ONUs table to store ONU devices
create table if not exists public.onus (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security for ONUs
alter table public.onus enable row level security;

-- Permissive policies for ONUs
create policy "onus_public_select"
  on public.onus
  for select
  to anon, authenticated
  using (true);

create policy "onus_public_insert"
  on public.onus
  for insert
  to anon, authenticated
  with check (true);

create policy "onus_public_delete"
  on public.onus
  for delete
  to anon, authenticated
  using (true);

-- Index for sorting by most recent
create index if not exists onus_created_at_idx on public.onus (created_at desc);

-- Create onu_images table to store multiple images per ONU
create table if not exists public.onu_images (
  id uuid primary key default gen_random_uuid(),
  onu_id uuid not null references public.onus(id) on delete cascade,
  image_url text not null,
  image_pathname text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security for onu_images
alter table public.onu_images enable row level security;

-- Permissive policies for onu_images
create policy "onu_images_public_select"
  on public.onu_images
  for select
  to anon, authenticated
  using (true);

create policy "onu_images_public_insert"
  on public.onu_images
  for insert
  to anon, authenticated
  with check (true);

create policy "onu_images_public_delete"
  on public.onu_images
  for delete
  to anon, authenticated
  using (true);

-- Index for fetching images by ONU
create index if not exists onu_images_onu_id_idx on public.onu_images (onu_id, sort_order);
