"use client";

import type { StorageItemDraft } from "@/types/item";

type ItemFormProps = {
  draft: StorageItemDraft;
  onChange: (draft: StorageItemDraft) => void;
  compact?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function ItemForm({ draft, onChange, compact }: ItemFormProps) {
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
        />
      </label>

      <label className={compact ? "sm:col-span-2" : "sm:col-span-2"}>
        <span className="mb-1 block text-xs font-medium text-muted">
          Location
        </span>
        <input
          className={inputClass}
          value={draft.location ?? ""}
          onChange={(e) => set("location", e.target.value || null)}
          placeholder="e.g. Shelf B, top box"
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
        />
      </label>
    </div>
  );
}
