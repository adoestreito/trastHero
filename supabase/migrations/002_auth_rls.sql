-- Run after 001_create_items.sql once you enable Email auth in Supabase.
-- Replaces open public policies with authenticated-only access.
-- All signed-in family members share the same inventory.

drop policy if exists "Allow public read on items" on public.items;
drop policy if exists "Allow public insert on items" on public.items;
drop policy if exists "Allow public update on items" on public.items;
drop policy if exists "Allow public delete on items" on public.items;

create policy "Authenticated users can read items"
  on public.items for select
  to authenticated
  using (true);

create policy "Authenticated users can insert items"
  on public.items for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update items"
  on public.items for update
  to authenticated
  using (true);

create policy "Authenticated users can delete items"
  on public.items for delete
  to authenticated
  using (true);
