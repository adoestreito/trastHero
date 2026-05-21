"use client";

import { useMemo } from "react";
import type { StorageItem } from "@/types/item";
import type { StorageTag } from "@/types/tag";

type TagFilterProps = {
  tags: StorageTag[];
  items: StorageItem[];
  selectedTagId: string | null;
  onChange: (tagId: string | null) => void;
};

export function TagFilter({
  tags,
  items,
  selectedTagId,
  onChange,
}: TagFilterProps) {
  const tagsInUse = useMemo(() => {
    return tags
      .map((tag) => ({
        ...tag,
        count: items.filter((item) =>
          item.tags.some((t) => t.id === tag.id)
        ).length,
      }))
      .filter((t) => t.count > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tags, items]);

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
