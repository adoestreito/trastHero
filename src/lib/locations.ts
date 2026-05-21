import { getSupabase } from "@/lib/supabase/client";
import type { StorageLocation } from "@/types/location";

export async function fetchLocations(): Promise<StorageLocation[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createLocation(name: string): Promise<StorageLocation> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Location name is required");

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("locations")
    .select("*")
    .ilike("name", trimmed)
    .maybeSingle();

  if (existing) return existing;

  const { data: maxRow } = await supabase
    .from("locations")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("locations")
    .insert({ name: trimmed, sort_order: sortOrder })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: dup } = await supabase
        .from("locations")
        .select("*")
        .eq("name", trimmed)
        .single();
      if (dup) return dup;
    }
    throw error;
  }

  return data;
}
