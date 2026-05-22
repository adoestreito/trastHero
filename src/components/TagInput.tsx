"use client";

import { useMemo, useState } from "react";
import { createTag } from "@/lib/tags";
import type { StorageTag } from "@/types/tag";
import { inputClass } from "@/lib/ui";

type TagInputProps = {
  tags: StorageTag[];
  selectedIds: string[];
  onChange: (tagIds: string[]) => void;
  onTagCreated: (tag: StorageTag) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  disabled?: boolean;
};

export function TagInput({
  tags,
  selectedIds,
  onChange,
  onTagCreated,
  query: controlledQuery,
  onQueryChange,
  disabled,
}: TagInputProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const query = controlledQuery ?? internalQuery;
  const setQuery = onQueryChange ?? setInternalQuery;

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTags = useMemo(
    () =>
      selectedIds
        .map((id) => tags.find((t) => t.id === id))
        .filter((t): t is StorageTag => t !== undefined),
    [selectedIds, tags]
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tags.filter(
      (t) =>
        !selectedIds.includes(t.id) &&
        (q === "" || t.name.toLowerCase().includes(q))
    );
  }, [tags, selectedIds, query]);

  const addTagById = (id: string) => {
    if (!selectedIds.includes(id)) onChange([...selectedIds, id]);
    setQuery("");
    setError(null);
  };

  const removeTag = (id: string) => {
    onChange(selectedIds.filter((tid) => tid !== id));
  };

  const addTagByName = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const existing = tags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      addTagById(existing.id);
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const created = await createTag(trimmed);
      onTagCreated(created);
      addTagById(created.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add tag");
    } finally {
      setAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void addTagByName(query);
    }
  };

  return (
    <div className="space-y-2">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                disabled={disabled}
                className="rounded-full hover:bg-accent/20 disabled:opacity-50"
                aria-label={`Remove tag ${tag.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a tag (Enter optional — saved with item)"
        disabled={disabled || adding}
        className={inputClass}
      />

      {suggestions.length > 0 && query.trim() !== "" && (
        <ul className="flex flex-wrap gap-1.5">
          {suggestions.slice(0, 8).map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                onClick={() => addTagById(tag.id)}
                disabled={disabled}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground transition-colors hover:border-accent hover:bg-accent-light hover:text-accent disabled:opacity-50"
              >
                + {tag.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
