-- Remove duplicate / unwanted "armario derecha" location variants.
-- Items using these locations get location_id set to null (FK on delete set null).

delete from public.locations
where lower(trim(name)) in ('armario derecha', 'armario-derecha');
