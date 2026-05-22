import { getSupabase } from "@/lib/supabase/client";
import type { StorageTag } from "@/types/tag";

export async function fetchTags(): Promise<StorageTag[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load tags: ${error.message}`);
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
    throw new Error(`Failed to create tag: ${error.message}`);
  }

  return data;
}

export async function syncItemTags(
  itemId: string,
  tagIds: string[]
): Promise<void> {
  const supabase = getSupabase();
  const uniqueIds = [...new Set(tagIds.filter(Boolean))];

  const { data: existing, error: fetchError } = await supabase
    .from("item_tags")
    .select("tag_id")
    .eq("item_id", itemId);

  if (fetchError) {
    throw new Error(`Failed to load item tags: ${fetchError.message}`);
  }

  const existingIds = new Set((existing ?? []).map((row) => row.tag_id));
  const toAdd = uniqueIds.filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !uniqueIds.includes(id));

  if (toRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from("item_tags")
      .delete()
      .eq("item_id", itemId)
      .in("tag_id", toRemove);

    if (deleteError) {
      throw new Error(`Failed to remove tags: ${deleteError.message}`);
    }
  }

  if (toAdd.length === 0) return;

  const { error: insertError } = await supabase.from("item_tags").insert(
    toAdd.map((tag_id) => ({ item_id: itemId, tag_id }))
  );

  if (insertError) {
    throw new Error(
      `Failed to link tags to item: ${insertError.message}. Run supabase/migrations/006_tags_grants.sql in the SQL Editor.`
    );
  }
}
