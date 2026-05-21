import { getSupabase } from "@/lib/supabase/client";
import type { StorageItem, StorageItemInput } from "@/types/item";

function toDbPayload(input: StorageItemInput) {
  return {
    name: input.name.trim(),
    quantity: input.quantity,
    description: input.description?.trim() || null,
    expiration_date: input.expiration_date || null,
    location: input.location?.trim() || null,
  };
}

export async function fetchItems(): Promise<StorageItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createItem(input: StorageItemInput): Promise<StorageItem> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("items")
    .insert(toDbPayload(input))
    .select()
    .single();

  if (error) throw error;
  return data;
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
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}
