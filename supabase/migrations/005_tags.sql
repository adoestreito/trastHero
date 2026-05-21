-- Tags and many-to-many link to items.

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  constraint tags_name_unique unique (name)
);

create table if not exists public.item_tags (
  item_id uuid not null references public.items (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (item_id, tag_id)
);

create index if not exists item_tags_tag_id_idx on public.item_tags (tag_id);

alter table public.tags enable row level security;
alter table public.item_tags enable row level security;

create policy "Authenticated users can read tags"
  on public.tags for select
  to authenticated
  using (true);

create policy "Authenticated users can insert tags"
  on public.tags for insert
  to authenticated
  with check (true);

create policy "Authenticated users can read item_tags"
  on public.item_tags for select
  to authenticated
  using (true);

create policy "Authenticated users can insert item_tags"
  on public.item_tags for insert
  to authenticated
  with check (true);

create policy "Authenticated users can delete item_tags"
  on public.item_tags for delete
  to authenticated
  using (true);
