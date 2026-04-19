-- Create the manuals table to store shared router manuals
create table if not exists public.manuals (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  image_url text not null,
  image_pathname text not null,
  pdf_url text not null,
  pdf_pathname text not null,
  pdf_filename text not null,
  pdf_size bigint not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.manuals enable row level security;

-- Drop existing policies if re-running the script
drop policy if exists "manuals_public_select" on public.manuals;
drop policy if exists "manuals_public_insert" on public.manuals;
drop policy if exists "manuals_public_delete" on public.manuals;

-- Permissive policies: anyone (including anonymous visitors) can read, add, and remove.
-- This matches the product decision to let any visitor manage manuals without login.
create policy "manuals_public_select"
  on public.manuals
  for select
  to anon, authenticated
  using (true);

create policy "manuals_public_insert"
  on public.manuals
  for insert
  to anon, authenticated
  with check (true);

create policy "manuals_public_delete"
  on public.manuals
  for delete
  to anon, authenticated
  using (true);

-- Helpful index for sorting by most recent
create index if not exists manuals_created_at_idx on public.manuals (created_at desc);
