import { createTag } from "@/lib/tags";
import type { StorageItemDraft } from "@/types/item";
import type { StorageTag } from "@/types/tag";

/** Turn typed tag text into tag_ids before saving an item. */
export async function resolveDraftTags(
  draft: StorageItemDraft,
  pendingTagText: string,
  knownTags: StorageTag[],
  onTagCreated: (tag: StorageTag) => void
): Promise<StorageItemDraft> {
  const tagIds = [...(draft.tag_ids ?? [])];
  const trimmed = pendingTagText.trim();
  if (!trimmed) {
    return { ...draft, tag_ids: tagIds };
  }

  const existing = knownTags.find(
    (t) => t.name.toLowerCase() === trimmed.toLowerCase()
  );
  const tag = existing ?? (await createTag(trimmed));

  if (!existing) {
    onTagCreated(tag);
  }

  if (!tagIds.includes(tag.id)) {
    tagIds.push(tag.id);
  }

  return { ...draft, tag_ids: tagIds };
}
