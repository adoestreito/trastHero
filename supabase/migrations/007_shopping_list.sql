-- Shopping list + inventory flag

alter table public.items
  add column if not exists on_shopping_list boolean not null default false;

create table if not exists public.shopping_list (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  item_id uuid references public.items (id) on delete cascade,
  purchased boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists shopping_list_item_id_unique
  on public.shopping_list (item_id)
  where item_id is not null;

create index if not exists shopping_list_purchased_idx
  on public.shopping_list (purchased);

drop trigger if exists shopping_list_set_updated_at on public.shopping_list;
create trigger shopping_list_set_updated_at
  before update on public.shopping_list
  for each row
  execute function public.set_updated_at();

alter table public.shopping_list enable row level security;

create policy "Authenticated users can read shopping_list"
  on public.shopping_list for select
  to authenticated
  using (true);

create policy "Authenticated users can insert shopping_list"
  on public.shopping_list for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update shopping_list"
  on public.shopping_list for update
  to authenticated
  using (true);

create policy "Authenticated users can delete shopping_list"
  on public.shopping_list for delete
  to authenticated
  using (true);

grant select, insert, update, delete on table public.shopping_list to authenticated;
