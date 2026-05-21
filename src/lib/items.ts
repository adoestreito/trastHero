import { getSupabase } from "@/lib/supabase/client";
import type { StorageItem, StorageItemInput } from "@/types/item";

const itemSelect = "*, location:locations(id, name)";

type ItemRow = Omit<StorageItem, "location"> & {
  location: StorageItem["location"] | StorageItem["location"][] | null;
};

function normalizeItem(row: ItemRow): StorageItem {
  const loc = row.location;
  const location = Array.isArray(loc) ? (loc[0] ?? null) : loc;
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    description: row.description,
    expiration_date: row.expiration_date,
    location_id: row.location_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    location,
  };
}

function toDbPayload(input: StorageItemInput) {
  return {
    name: input.name.trim(),
    quantity: input.quantity,
    description: input.description?.trim() || null,
    expiration_date: input.expiration_date || null,
    location_id: input.location_id || null,
  };
}

export async function fetchItems(): Promise<StorageItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("items")
    .select(itemSelect)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => normalizeItem(row as ItemRow));
}

export async function createItem(input: StorageItemInput): Promise<StorageItem> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("items")
    .insert(toDbPayload(input))
    .select(itemSelect)
    .single();

  if (error) throw error;
  return normalizeItem(data as ItemRow);
}

export async function updateItem(
  id: string,
  input: StorageItemInput
): Promise<StorageItem> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("items")
    .update(toDbPayload(input))
    .eq("id", id)
    .select(itemSelect)
    .single();

  if (error) throw error;
  return normalizeItem(data as ItemRow);
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}
