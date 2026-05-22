import { getSupabase } from "@/lib/supabase/client";
import { syncItemTags } from "@/lib/tags";
import type { StorageItem, StorageItemInput } from "@/types/item";
import type { StorageTag } from "@/types/tag";

const itemSelect =
  "*, location:locations(id, name), item_tags(tags(id, name))";

type ItemTagLink = {
  tag?: StorageTag | StorageTag[] | null;
  tags?: StorageTag | StorageTag[] | null;
};

type ItemRow = Omit<StorageItem, "location" | "tags"> & {
  location: StorageItem["location"] | StorageItem["location"][] | null;
  item_tags: ItemTagLink[] | null;
};

function normalizeRelation<T extends { id: string; name: string }>(
  value: T | T[] | null | undefined | (T | null)[]
): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return (value[0] ?? null) as T | null;
  return value;
}

function tagFromLink(link: ItemTagLink): Pick<StorageTag, "id" | "name"> | null {
  return normalizeRelation(link.tags ?? link.tag);
}

function normalizeItem(row: ItemRow): StorageItem {
  const location = normalizeRelation(row.location);
  const tags = (row.item_tags ?? [])
    .map(tagFromLink)
    .filter((t): t is Pick<StorageTag, "id" | "name"> => t !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

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
    tags,
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
  const payload = toDbPayload(input);
  const tagIds = input.tag_ids ?? [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("items")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;

  await syncItemTags(data.id, tagIds);

  return fetchItemById(data.id);
}

export async function updateItem(
  id: string,
  input: StorageItemInput
): Promise<StorageItem> {
  const payload = toDbPayload(input);
  const tagIds = input.tag_ids ?? [];

  const supabase = getSupabase();
  const { error } = await supabase
    .from("items")
    .update(payload)
    .eq("id", id);

  if (error) throw error;

  await syncItemTags(id, tagIds);
  return fetchItemById(id);
}

async function fetchItemById(id: string): Promise<StorageItem> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("items")
    .select(itemSelect)
    .eq("id", id)
    .single();

  if (error) throw error;
  return normalizeItem(data as ItemRow);
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}
