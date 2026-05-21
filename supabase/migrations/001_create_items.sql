-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity integer not null default 1 check (quantity >= 0),
  description text,
  expiration_date date,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_name_idx on public.items (name);
create index if not exists items_expiration_date_idx on public.items (expiration_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row
  execute function public.set_updated_at();

alter table public.items enable row level security;

-- Personal app: allow all operations with the anon key.
-- Tighten this if you add Supabase Auth later.
create policy "Allow public read on items"
  on public.items for select
  using (true);

create policy "Allow public insert on items"
  on public.items for insert
  with check (true);

create policy "Allow public update on items"
  on public.items for update
  using (true);

create policy "Allow public delete on items"
  on public.items for delete
  using (true);
