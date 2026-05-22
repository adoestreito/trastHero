import type { StorageItemDraft, StorageItemInput } from "@/types/item";

/** Normalize form draft before sending to Supabase (always includes tag_ids). */
export function draftToInput(draft: StorageItemDraft): StorageItemInput {
  return {
    name: draft.name,
    quantity: draft.quantity,
    description: draft.description ?? null,
    expiration_date: draft.expiration_date ?? null,
    location_id: draft.location_id ?? null,
    tag_ids: draft.tag_ids ?? [],
  };
}
