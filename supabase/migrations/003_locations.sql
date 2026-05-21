-- Storage locations lookup + link items to locations.

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint locations_name_unique unique (name)
);

insert into public.locations (name, sort_order) values
  ('armario izquierda', 1),
  ('armario ezquina derecha', 2),
  ('congelador', 3)
on conflict (name) do nothing;

-- Migrate existing free-text locations into the lookup table
insert into public.locations (name, sort_order)
select distinct trim(location), 100
from public.items
where location is not null
  and trim(location) <> ''
on conflict (name) do nothing;

alter table public.items
  add column if not exists location_id uuid references public.locations (id) on delete set null;

update public.items i
set location_id = l.id
from public.locations l
where i.location is not null
  and trim(i.location) = l.name;

alter table public.items drop column if exists location;

create index if not exists items_location_id_idx on public.items (location_id);

alter table public.locations enable row level security;

create policy "Authenticated users can read locations"
  on public.locations for select
  to authenticated
  using (true);

create policy "Authenticated users can insert locations"
  on public.locations for insert
  to authenticated
  with check (true);
