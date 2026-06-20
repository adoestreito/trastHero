-- Allow renaming storage locations (updates name for all linked items via FK).

create policy "Authenticated users can update locations"
  on public.locations for update
  to authenticated
  using (true)
  with check (true);
