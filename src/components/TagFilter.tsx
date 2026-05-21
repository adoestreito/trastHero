"use client";

import { useMemo } from "react";
import type { StorageItem } from "@/types/item";

type TagFilterProps = {
  items: StorageItem[];
  selectedTagId: string | null;
  onChange: (tagId: string | null) => void;
};

export function TagFilter({
  items,
  selectedTagId,
  onChange,
}: TagFilterProps) {
  const tagsInUse = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; count: number }
    >();

    for (const item of items) {
      for (const tag of item.tags) {
        const existing = map.get(tag.id);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(tag.id, { id: tag.id, name: tag.name, count: 1 });
        }
      }
    }

    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  if (tagsInUse.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        Filter by tag
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            selectedTagId === null
              ? "bg-accent text-white"
              : "border border-border bg-card text-foreground hover:border-accent"
          }`}
        >
          All
        </button>
        {tagsInUse.map((tag) => {
          const active = selectedTagId === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onChange(active ? null : tag.id)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "border border-border bg-card text-foreground hover:border-accent"
              }`}
            >
              {tag.name}
              <span
                className={`ml-1.5 ${active ? "text-white/80" : "text-muted"}`}
              >
                {tag.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
