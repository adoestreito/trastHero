"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ItemForm, type ItemFormHandle } from "@/components/ItemForm";
import { SwipeableItemActions } from "@/components/SwipeableItemActions";
import { dismissSwipeHint } from "@/components/SwipeHintBanner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatDate, getExpirationStatus } from "@/lib/dates";
import type { StorageLocation } from "@/types/location";
import type { StorageTag } from "@/types/tag";
import type { StorageItem, StorageItemDraft } from "@/types/item";
import {
  alertError,
  btnPrimary,
  btnSecondary,
  cardClass,
} from "@/lib/ui";

type ItemCardProps = {
  item: StorageItem;
  locations: StorageLocation[];
  tags: StorageTag[];
  onLocationCreated: (location: StorageLocation) => void;
  onTagCreated: (tag: StorageTag) => void;
  onSave: (id: string, draft: StorageItemDraft) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
  hideLocation?: boolean;
  /** Changes when the parent section opens — replays the swipe demo on mobile. */
  swipeDemoKey?: number;
};

function itemToDraft(item: StorageItem): StorageItemDraft {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    description: item.description,
    expiration_date: item.expiration_date,
    location_id: item.location_id,
    tag_ids: item.tags.map((t) => t.id),
    on_shopping_list: item.on_shopping_list,
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

export function ItemCard({
  item,
  locations,
  tags,
  onLocationCreated,
  onTagCreated,
  onSave,
  onDelete,
  disabled,
  hideLocation,
  swipeDemoKey,
}: ItemCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StorageItemDraft>(() => itemToDraft(item));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [displayQuantity, setDisplayQuantity] = useState(item.quantity);
  const [saveError, setSaveError] = useState<string | null>(null);
  const editFormRef = useRef<ItemFormHandle>(null);
  const quantityRef = useRef(item.quantity);
  const savedQuantityRef = useRef(item.quantity);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    quantityRef.current = item.quantity;
    savedQuantityRef.current = item.quantity;
    setDisplayQuantity(item.quantity);
  }, [item.id, item.quantity]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!editing) {
      setDraft(itemToDraft(item));
      setSaveError(null);
    }
  }, [item, editing]);

  const expStatus = getExpirationStatus(item.expiration_date);
  const actionBusy = disabled || deleting || adjusting || saving;

  const handleSave = async () => {
    if (!draft.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const prepared =
        (await editFormRef.current?.prepareDraft()) ?? {
          ...draft,
          tag_ids: draft.tag_ids ?? [],
        };
      await onSave(item.id, prepared);
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(itemToDraft(item));
    setEditing(false);
  };

  const flushQuantitySave = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (quantityRef.current === savedQuantityRef.current) return;

    if (saveInFlightRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    saveInFlightRef.current = true;
    setAdjusting(true);
    const target = quantityRef.current;

    try {
      await onSave(item.id, { ...itemToDraft(item), quantity: target });
      savedQuantityRef.current = target;
    } catch {
      /* parent surfaces error */
    } finally {
      saveInFlightRef.current = false;
      setAdjusting(false);
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        if (quantityRef.current !== savedQuantityRef.current) {
          void flushQuantitySave();
        }
      }
    }
  }, [item, onSave]);

  const scheduleQuantitySave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void flushQuantitySave();
    }, 350);
  }, [flushQuantitySave]);

  const adjustQuantityBy = useCallback(
    (delta: number): boolean => {
      const next = Math.max(0, quantityRef.current + delta);
      if (next === quantityRef.current) return false;

      quantityRef.current = next;
      setDisplayQuantity(next);
      scheduleQuantitySave();
      return true;
    },
    [scheduleQuantitySave]
  );

  const handleAdjustEnd = useCallback(() => {
    void flushQuantitySave();
  }, [flushQuantitySave]);

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
      <article className={`${cardClass} border-accent/30 p-4 ring-2 ring-accent/15`}>
        <ItemForm
          ref={editFormRef}
          draft={draft}
          onChange={setDraft}
          locations={locations}
          tags={tags}
          onLocationCreated={onLocationCreated}
          onTagCreated={onTagCreated}
          compact
          disabled={disabled || saving}
        />
        {saveError && (
          <p role="alert" className={`mt-3 ${alertError}`}>
            {saveError}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={disabled || saving || !draft.name.trim()}
            className={btnPrimary}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={disabled || saving}
            className={btnSecondary}
          >
            Cancel
          </button>
        </div>
      </article>
    );
  }

  const card = (
    <article className={`${cardClass} p-4 transition-shadow hover:shadow-fj-md`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
            <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-sm font-medium text-accent">
              ×{displayQuantity}
            </span>
            {adjusting && (
              <span className="text-xs text-muted">Updating…</span>
            )}
            {statusLabel[expStatus] && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass[expStatus]}`}
              >
                {statusLabel[expStatus]}
              </span>
            )}
          </div>

          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <dl className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
            {!hideLocation && item.location?.name && (
              <div>
                <dt className="inline font-medium text-foreground/70">Location: </dt>
                <dd className="inline">{item.location.name}</dd>
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

        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={actionBusy}
            className={`${btnSecondary} !py-2 !text-xs`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={actionBusy}
            className={`${btnSecondary} !border-danger/30 !py-2 !text-xs !text-danger hover:!bg-danger/5 disabled:opacity-50`}
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );

  if (!isMobile) return card;

  return (
    <SwipeableItemActions
      disabled={actionBusy}
      quantity={displayQuantity}
      busy={actionBusy}
      onAdjust={adjustQuantityBy}
      onAdjustEnd={handleAdjustEnd}
      onDelete={handleDelete}
      onEdit={() => {
        dismissSwipeHint();
        setEditing(true);
      }}
      demoKey={isMobile && swipeDemoKey != null ? swipeDemoKey : undefined}
    >
      {card}
    </SwipeableItemActions>
  );
}
