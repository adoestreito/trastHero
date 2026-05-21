"use client";

import { useState } from "react";
import { ItemForm } from "@/components/ItemForm";
import { formatDate, getExpirationStatus } from "@/lib/dates";
import type { StorageItem, StorageItemDraft } from "@/types/item";

type ItemCardProps = {
  item: StorageItem;
  onSave: (id: string, draft: StorageItemDraft) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
};

function itemToDraft(item: StorageItem): StorageItemDraft {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    description: item.description,
    expiration_date: item.expiration_date,
    location: item.location,
  };
}

const statusLabel = {
  none: null,
  ok: null,
  soon: "Expires soon",
  expired: "Expired",
} as const;

const statusClass = {
  none: "",
  ok: "",
  soon: "bg-warning/15 text-warning",
  expired: "bg-danger/15 text-danger",
} as const;

export function ItemCard({ item, onSave, onDelete, disabled }: ItemCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StorageItemDraft>(() => itemToDraft(item));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const expStatus = getExpirationStatus(item.expiration_date);

  const handleSave = async () => {
    if (!draft.name.trim()) return;
    setSaving(true);
    try {
      await onSave(item.id, draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(itemToDraft(item));
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <article className="rounded-xl border border-accent/40 bg-card p-4 shadow-sm">
        <ItemForm draft={draft} onChange={setDraft} compact />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={disabled || saving || !draft.name.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={disabled || saving}
            className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-background disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-sm font-medium text-accent">
              ×{item.quantity}
            </span>
            {statusLabel[expStatus] && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass[expStatus]}`}
              >
                {statusLabel[expStatus]}
              </span>
            )}
          </div>

          <dl className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
            {item.location && (
              <div>
                <dt className="inline font-medium text-foreground/70">Location: </dt>
                <dd className="inline">{item.location}</dd>
              </div>
            )}
            {item.expiration_date && (
              <div>
                <dt className="inline font-medium text-foreground/70">Expires: </dt>
                <dd className="inline">{formatDate(item.expiration_date)}</dd>
              </div>
            )}
            {item.description && (
              <div className="sm:col-span-2">
                <dt className="inline font-medium text-foreground/70">Notes: </dt>
                <dd className="inline">{item.description}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={disabled || deleting}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-background disabled:opacity-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={disabled || deleting}
            className="rounded-lg border border-danger/30 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
