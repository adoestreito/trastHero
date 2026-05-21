"use client";

import { useEffect, useMemo, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import { groupItemsByLocation } from "@/lib/groupByLocation";
import type { StorageItem, StorageItemDraft } from "@/types/item";
import type { StorageLocation } from "@/types/location";
import type { StorageTag } from "@/types/tag";

type LocationAccordionProps = {
  items: StorageItem[];
  locations: StorageLocation[];
  tags: StorageTag[];
  searchQuery: string;
  onLocationCreated: (location: StorageLocation) => void;
  onTagCreated: (tag: StorageTag) => void;
  onSave: (id: string, draft: StorageItemDraft) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
};

export function LocationAccordion({
  items,
  locations,
  tags,
  searchQuery,
  onLocationCreated,
  onTagCreated,
  onSave,
  onDelete,
  disabled,
}: LocationAccordionProps) {
  const groups = useMemo(
    () => groupItemsByLocation(items, locations),
    [items, locations]
  );

  const isSearching = searchQuery.trim().length > 0;
  const groupKeys = groups.map((g) => g.key).join(",");

  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (groups.length === 0) {
      setOpenKeys(new Set());
      return;
    }
    if (isSearching) {
      setOpenKeys(new Set(groups.map((g) => g.key)));
      return;
    }
    setOpenKeys(new Set([groups[0].key]));
  }, [groupKeys, isSearching, groups]);

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const isOpen = openKeys.has(group.key);
        const totalQty = group.items.reduce((sum, i) => sum + i.quantity, 0);

        return (
          <section
            key={group.key}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggle(group.key)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-background/80"
            >
              <span
                className={`shrink-0 text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}
                aria-hidden
              >
                ▶
              </span>
              <span className="min-w-0 flex-1 font-semibold text-foreground">
                {group.title}
              </span>
              <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {group.items.length} item{group.items.length === 1 ? "" : "s"}
                {totalQty !== group.items.length && (
                  <span className="text-muted"> · {totalQty} units</span>
                )}
              </span>
            </button>

            {isOpen && (
              <ul className="flex flex-col gap-3 border-t border-border px-4 py-4">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <ItemCard
                      item={item}
                      locations={locations}
                      tags={tags}
                      onLocationCreated={onLocationCreated}
                      onTagCreated={onTagCreated}
                      onSave={onSave}
                      onDelete={onDelete}
                      disabled={disabled}
                      hideLocation
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
