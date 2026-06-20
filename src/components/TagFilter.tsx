"use client";

import { useMemo, useState } from "react";
import { sectionLabel } from "@/lib/ui";
import type { StorageItem } from "@/types/item";

type TagFilterProps = {
  items: StorageItem[];
  selectedTagId: string | null;
  onChange: (tagId: string | null) => void;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function TagFilter({
  items,
  selectedTagId,
  onChange,
}: TagFilterProps) {
  const [open, setOpen] = useState(true);

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

  const selectedTag = tagsInUse.find((t) => t.id === selectedTagId);

  if (tagsInUse.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-2 flex w-full items-center gap-2 text-left transition-colors hover:text-foreground"
      >
        <span className={sectionLabel}>Filter by tag</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-light">
          <ChevronIcon open={open} />
        </span>
        {!open && selectedTag && (
          <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent">
            {selectedTag.name}
          </span>
        )}
        {!open && (
          <span className="ml-auto text-xs text-muted">
            {tagsInUse.length} tag{tagsInUse.length === 1 ? "" : "s"}
          </span>
        )}
      </button>

      {open && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
              selectedTagId === null
                ? "fj-pill-active"
                : "border border-border bg-card/80 text-foreground hover:border-accent/40 fj-hover-surface"
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
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                  active
                    ? "fj-pill-active"
                    : "border border-border bg-card/80 text-foreground hover:border-accent/40 fj-hover-surface"
                }`}
              >
                {tag.name}
                <span
                  className={`ml-1.5 ${active ? "text-accent-foreground/70" : "text-muted"}`}
                >
                  {tag.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
