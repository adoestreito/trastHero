"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import { groupItemsByLocation } from "@/lib/groupByLocation";
import type { StorageItem, StorageItemDraft } from "@/types/item";
import type { StorageLocation } from "@/types/location";
import type { StorageTag } from "@/types/tag";
import { cardClass } from "@/lib/ui";

type LocationAccordionProps = {
  items: StorageItem[];
  locations: StorageLocation[];
  tags: StorageTag[];
  expandAllSections?: boolean;
  onLocationCreated: (location: StorageLocation) => void;
  onTagCreated: (tag: StorageTag) => void;
  onSave: (id: string, draft: StorageItemDraft) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
};

function bumpDemo(
  prev: Record<string, number>,
  keys: string[]
): Record<string, number> {
  const next = { ...prev };
  for (const key of keys) {
    next[key] = (next[key] ?? 0) + 1;
  }
  return next;
}

export function LocationAccordion({
  items,
  locations,
  tags,
  expandAllSections = false,
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

  const groupKeys = groups.map((g) => g.key).join(",");

  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());
  const [demoGeneration, setDemoGeneration] = useState<Record<string, number>>(
    {}
  );
  const prevExpandAllRef = useRef(expandAllSections);

  useEffect(() => {
    if (groups.length === 0) {
      setOpenKeys(new Set());
      return;
    }
    if (expandAllSections) {
      setOpenKeys(new Set(groups.map((g) => g.key)));
      if (!prevExpandAllRef.current) {
        setDemoGeneration((prev) =>
          bumpDemo(
            prev,
            groups.map((g) => g.key)
          )
        );
      }
      prevExpandAllRef.current = true;
      return;
    }
    prevExpandAllRef.current = false;
    setOpenKeys((prev) => {
      const valid = new Set(groups.map((g) => g.key));
      return new Set([...prev].filter((k) => valid.has(k)));
    });
  }, [groupKeys, expandAllSections, groups]);

  const toggle = (key: string) => {
    const opening = !openKeys.has(key);
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    if (opening) {
      setDemoGeneration((prev) => bumpDemo(prev, [key]));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const isOpen = openKeys.has(group.key);
        const totalQty = group.items.reduce((sum, i) => sum + i.quantity, 0);

        return (
          <section
            key={group.key}
            className={`overflow-hidden ${cardClass}`}
          >
            <button
              type="button"
              onClick={() => toggle(group.key)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.02]"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs text-accent transition-transform ${isOpen ? "rotate-90" : ""}`}
                aria-hidden
              >
                ›
              </span>
              <span className="min-w-0 flex-1 text-base font-semibold tracking-tight text-foreground">
                {group.title}
              </span>
              <span className="shrink-0 rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent">
                {group.items.length} item{group.items.length === 1 ? "" : "s"}
                {totalQty !== group.items.length && (
                  <span className="text-muted"> · {totalQty} units</span>
                )}
              </span>
            </button>

            {isOpen && (
              <ul className="flex flex-col gap-3 border-t border-border px-4 py-4">
                {group.items.map((item, index) => (
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
                      swipeDemoKey={
                        index === 0 ? demoGeneration[group.key] : undefined
                      }
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
