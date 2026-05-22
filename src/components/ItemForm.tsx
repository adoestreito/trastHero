"use client";

import {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { LocationSelect } from "@/components/LocationSelect";
import { TagInput } from "@/components/TagInput";
import { resolveDraftTags } from "@/lib/resolveDraftTags";
import type { StorageLocation } from "@/types/location";
import type { StorageTag } from "@/types/tag";
import type { StorageItemDraft } from "@/types/item";

export type ItemFormHandle = {
  /** Applies pending tag text and returns draft ready to save. */
  prepareDraft: () => Promise<StorageItemDraft>;
};

type ItemFormProps = {
  draft: StorageItemDraft;
  onChange: (draft: StorageItemDraft) => void;
  locations: StorageLocation[];
  onLocationCreated: (location: StorageLocation) => void;
  tags: StorageTag[];
  onTagCreated: (tag: StorageTag) => void;
  compact?: boolean;
  disabled?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export const ItemForm = forwardRef<ItemFormHandle, ItemFormProps>(
  function ItemForm(
    {
      draft,
      onChange,
      locations,
      onLocationCreated,
      tags,
      onTagCreated,
      compact,
      disabled,
    },
    ref
  ) {
    const [tagQuery, setTagQuery] = useState("");

    useImperativeHandle(ref, () => ({
      prepareDraft: async () => {
        const resolved = await resolveDraftTags(
          draft,
          tagQuery,
          tags,
          onTagCreated
        );
        onChange(resolved);
        setTagQuery("");
        return resolved;
      },
    }));

    const set = <K extends keyof StorageItemDraft>(
      key: K,
      value: StorageItemDraft[K]
    ) => onChange({ ...draft, [key]: value });

    return (
      <div
        className={
          compact
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
            : "grid gap-4 sm:grid-cols-2"
        }
      >
        <label className={compact ? "sm:col-span-2" : "sm:col-span-2"}>
          <span className="mb-1 block text-xs font-medium text-muted">
            Name *
          </span>
          <input
            className={inputClass}
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Camping tent"
            required
            disabled={disabled}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-muted">
            Quantity *
          </span>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={draft.quantity}
            onChange={(e) =>
              set("quantity", Math.max(0, parseInt(e.target.value, 10) || 0))
            }
            required
            disabled={disabled}
          />
        </label>

        <label className={compact ? "sm:col-span-2" : "sm:col-span-2"}>
          <span className="mb-1 block text-xs font-medium text-muted">
            Location
          </span>
          <LocationSelect
            locations={locations}
            value={draft.location_id ?? null}
            onChange={(locationId) => set("location_id", locationId)}
            onLocationCreated={onLocationCreated}
            disabled={disabled}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-muted">
            Expiration
          </span>
          <input
            className={inputClass}
            type="date"
            value={draft.expiration_date ?? ""}
            onChange={(e) => set("expiration_date", e.target.value || null)}
            disabled={disabled}
          />
        </label>

        <label className={compact ? "sm:col-span-6" : "sm:col-span-2"}>
          <span className="mb-1 block text-xs font-medium text-muted">
            Tags
          </span>
          <TagInput
            tags={tags}
            selectedIds={draft.tag_ids ?? []}
            onChange={(tagIds) => set("tag_ids", tagIds)}
            onTagCreated={onTagCreated}
            query={tagQuery}
            onQueryChange={setTagQuery}
            disabled={disabled}
          />
        </label>

        <label className={compact ? "sm:col-span-6" : "sm:col-span-2"}>
          <span className="mb-1 block text-xs font-medium text-muted">
            Description
          </span>
          <textarea
            className={`${inputClass} min-h-[2.5rem] resize-y`}
            rows={compact ? 1 : 2}
            value={draft.description ?? ""}
            onChange={(e) => set("description", e.target.value || null)}
            placeholder="Notes, brand, size…"
            disabled={disabled}
          />
        </label>
      </div>
    );
  }
);
