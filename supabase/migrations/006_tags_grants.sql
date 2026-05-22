-- Ensure authenticated users can read/write tags and item_tags via the API.
-- RLS policies alone are not always enough for custom tables.

grant select, insert on table public.tags to authenticated;
grant select, insert, delete on table public.item_tags to authenticated;

-- If tags/item_tags stay empty after saving, also run in SQL Editor:
-- select * from public.tags;
-- select * from public.item_tags;
