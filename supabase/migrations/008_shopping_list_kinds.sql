-- Split shopping list into "to buy" (out of stock) vs "keep an eye" (low stock).

alter table public.shopping_list
  add column if not exists kind text not null default 'to_buy'
  check (kind in ('to_buy', 'keep_an_eye'));

-- Existing rows linked to inventory: reclassify from current item quantity
update public.shopping_list sl
set kind = case
  when i.quantity = 0 then 'to_buy'
  else 'keep_an_eye'
end
from public.items i
where sl.item_id = i.id
  and sl.item_id is not null;
