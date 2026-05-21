import { getSupabase } from "@/lib/supabase/client";
import type { StorageTag } from "@/types/tag";

export async function fetchTags(): Promise<StorageTag[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createTag(name: string): Promise<StorageTag> {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) throw new Error("Tag name is required");

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("tags")
    .select("*")
    .ilike("name", trimmed)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("tags")
    .insert({ name: trimmed })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: dup } = await supabase
        .from("tags")
        .select("*")
        .eq("name", trimmed)
        .single();
      if (dup) return dup;
    }
    throw error;
  }

  return data;
}

export async function syncItemTags(
  itemId: string,
  tagIds: string[]
): Promise<void> {
  const supabase = getSupabase();
  const uniqueIds = [...new Set(tagIds.filter(Boolean))];

  const { error: deleteError } = await supabase
    .from("item_tags")
    .delete()
    .eq("item_id", itemId);

  if (deleteError) {
    throw new Error(`Failed to update tags: ${deleteError.message}`);
  }

  if (uniqueIds.length === 0) return;

  const { data, error: insertError } = await supabase
    .from("item_tags")
    .insert(uniqueIds.map((tag_id) => ({ item_id: itemId, tag_id })))
    .select();

  if (insertError) {
    throw new Error(`Failed to save tags on item: ${insertError.message}`);
  }

  if (!data?.length) {
    throw new Error("Tags were not linked to the item. Check database permissions.");
  }
}
