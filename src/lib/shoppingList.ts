import { getSupabase } from "@/lib/supabase/client";
import type { StorageItem } from "@/types/item";
import type {
  InventorySuggestion,
  ShoppingListEntry,
  ShoppingListEntryInput,
  ShoppingListKind,
} from "@/types/shoppingList";

const listSelect = "*, item:items(quantity)";

type ShoppingListRow = Omit<ShoppingListEntry, "inventory_quantity"> & {
  item: { quantity: number } | { quantity: number }[] | null;
};

function normalizeEntry(row: ShoppingListRow): ShoppingListEntry {
  const item = row.item;
  const inventory_quantity = Array.isArray(item)
    ? (item[0]?.quantity ?? null)
    : (item?.quantity ?? null);

  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    kind: row.kind,
    item_id: row.item_id,
    purchased: row.purchased,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    inventory_quantity,
  };
}

export function getShoppingListKind(
  quantity: number,
  onShoppingList: boolean
): ShoppingListKind | null {
  if (!onShoppingList) return null;
  return quantity === 0 ? "to_buy" : "keep_an_eye";
}

export async function syncShoppingListFromItem(item: StorageItem): Promise<void> {
  const supabase = getSupabase();
  const kind = getShoppingListKind(item.quantity, item.on_shopping_list);

  if (!kind) {
    const { error } = await supabase
      .from("shopping_list")
      .delete()
      .eq("item_id", item.id);
    if (error) throw new Error(`Failed to update shopping list: ${error.message}`);
    return;
  }

  const { data: existing, error: fetchError } = await supabase
    .from("shopping_list")
    .select("id")
    .eq("item_id", item.id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to read shopping list: ${fetchError.message}`);
  }

  const payload = {
    name: item.name,
    kind,
    purchased: false,
    quantity: kind === "to_buy" ? 1 : item.quantity,
  };

  if (existing) {
    const { error } = await supabase
      .from("shopping_list")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw new Error(`Failed to update shopping list: ${error.message}`);
    return;
  }

  const { error: insertError } = await supabase.from("shopping_list").insert({
    ...payload,
    item_id: item.id,
  });

  if (insertError) {
    throw new Error(`Failed to add to shopping list: ${insertError.message}`);
  }
}

export async function fetchShoppingList(): Promise<ShoppingListEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shopping_list")
    .select(listSelect)
    .order("kind", { ascending: true })
    .order("purchased", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load shopping list: ${error.message}`);
  return (data ?? []).map((row) => normalizeEntry(row as ShoppingListRow));
}

export async function fetchInventorySuggestions(): Promise<
  InventorySuggestion[]
> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("items")
    .select("id, name, quantity")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load suggestions: ${error.message}`);
  return data ?? [];
}

export async function createShoppingListEntry(
  input: ShoppingListEntryInput
): Promise<ShoppingListEntry> {
  const supabase = getSupabase();
  const name = input.name.trim();
  if (!name) throw new Error("Name is required");

  const kind = input.kind ?? "to_buy";

  if (input.item_id) {
    const { data: existing } = await supabase
      .from("shopping_list")
      .select("id")
      .eq("item_id", input.item_id)
      .maybeSingle();

    if (existing) {
      throw new Error("This inventory item is already on the shopping list");
    }

    const { data: invItem } = await supabase
      .from("items")
      .select("quantity, on_shopping_list")
      .eq("id", input.item_id)
      .single();

    if (invItem) {
      await supabase
        .from("items")
        .update({ on_shopping_list: true })
        .eq("id", input.item_id);
    }
  }

  const { data, error } = await supabase
    .from("shopping_list")
    .insert({
      name,
      quantity: Math.max(1, input.quantity),
      kind,
      item_id: input.item_id ?? null,
      notes: input.notes?.trim() || null,
      purchased: false,
    })
    .select(listSelect)
    .single();

  if (error) throw new Error(`Failed to add item: ${error.message}`);
  return normalizeEntry(data as ShoppingListRow);
}

export async function setShoppingListPurchased(
  id: string,
  purchased: boolean
): Promise<ShoppingListEntry> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shopping_list")
    .update({ purchased })
    .eq("id", id)
    .eq("kind", "to_buy")
    .select(listSelect)
    .single();

  if (error) throw new Error(`Failed to update item: ${error.message}`);
  return normalizeEntry(data as ShoppingListRow);
}

export async function deleteShoppingListEntry(id: string): Promise<void> {
  const supabase = getSupabase();

  const { data: entry } = await supabase
    .from("shopping_list")
    .select("item_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("shopping_list").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete item: ${error.message}`);

  if (entry?.item_id) {
    await supabase
      .from("items")
      .update({ on_shopping_list: false })
      .eq("id", entry.item_id);
  }
}
