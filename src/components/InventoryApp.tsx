"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ItemForm, type ItemFormHandle } from "@/components/ItemForm";
import { LocationAccordion } from "@/components/LocationAccordion";
import { TagFilter } from "@/components/TagFilter";
import { draftToInput } from "@/lib/draft";
import {
  createItem,
  deleteItem,
  fetchItems,
  updateItem,
} from "@/lib/items";
import { fetchLocations } from "@/lib/locations";
import { fetchTags } from "@/lib/tags";
import type { StorageItem, StorageItemDraft } from "@/types/item";
import type { StorageLocation } from "@/types/location";
import type { StorageTag } from "@/types/tag";

const emptyDraft = (): StorageItemDraft => ({
  name: "",
  quantity: 1,
  description: null,
  expiration_date: null,
  location_id: null,
  tag_ids: [],
  on_shopping_list: false,
});

export function InventoryApp() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [tags, setTags] = useState<StorageTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<StorageItemDraft>(emptyDraft);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const addFormRef = useRef<ItemFormHandle>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [data, locs, tagList] = await Promise.all([
        fetchItems(),
        fetchLocations(),
        fetchTags(),
      ]);
      setItems(data);
      setLocations(locs);
      setTags(tagList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!newItem.name.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const prepared = (await addFormRef.current?.prepareDraft()) ?? newItem;
      const created = await createItem(draftToInput(prepared));
      setItems((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewItem(emptyDraft());
      setShowAddForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add item");
    } finally {
      setAdding(false);
    }
  };

  const handleSave = async (id: string, draft: StorageItemDraft) => {
    setError(null);
    try {
      const updated = await updateItem(id, draftToInput(draft));
      setItems((prev) =>
        prev
          .map((i) => (i.id === id ? updated : i))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save item";
      setError(message);
      throw e;
    }
  };

  const handleTagCreated = (tag: StorageTag) => {
    setTags((prev) => {
      if (prev.some((t) => t.id === tag.id)) return prev;
      return [...prev, tag].sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  const handleLocationCreated = (location: StorageLocation) => {
    setLocations((prev) => {
      if (prev.some((l) => l.id === location.id)) return prev;
      return [...prev, location].sort(
        (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)
      );
    });
  };

  const handleDelete = async (id: string) => {
    setError(null);
    await deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter((item) => {
    if (selectedTagId && !item.tags.some((t) => t.id === selectedTagId)) {
      return false;
    }

    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      item.name.toLowerCase().includes(q) ||
      (item.location?.name.toLowerCase().includes(q) ?? false) ||
      (item.description?.toLowerCase().includes(q) ?? false) ||
      item.tags.some((t) => t.name.toLowerCase().includes(q))
    );
  });

  const hasActiveFilters =
    search.trim().length > 0 || selectedTagId !== null;

  const busy = loading || adding;

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search by name, location, tags, or notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={() => {
            setShowAddForm((v) => !v);
            if (showAddForm) setNewItem(emptyDraft());
          }}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          {showAddForm ? "Cancel" : "+ Add item"}
        </button>
      </div>

      {!loading && (
        <TagFilter
          items={items}
          selectedTagId={selectedTagId}
          onChange={setSelectedTagId}
        />
      )}

      {showAddForm && (
        <section className="mb-8 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            New item
          </h2>
          <ItemForm
            ref={addFormRef}
            draft={newItem}
            onChange={setNewItem}
            locations={locations}
            tags={tags}
            onLocationCreated={handleLocationCreated}
            onTagCreated={handleTagCreated}
            disabled={busy}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={busy || !newItem.name.trim()}
            className="mt-4 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add to inventory"}
          </button>
        </section>
      )}

      {loading ? (
        <p className="text-center text-muted py-12">Loading inventory…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted">
          {items.length === 0
            ? "No items yet. Add your first one above."
            : hasActiveFilters
              ? "No items match your filters."
              : "No items match your search."}
        </p>
      ) : (
        <LocationAccordion
          items={filtered}
          locations={locations}
          tags={tags}
          expandAllSections={hasActiveFilters}
          onLocationCreated={handleLocationCreated}
          onTagCreated={handleTagCreated}
          onSave={handleSave}
          onDelete={handleDelete}
          disabled={busy}
        />
      )}

      {!loading && items.length > 0 && (
        <p className="mt-8 text-center text-xs text-muted">
          {items.length} item{items.length === 1 ? "" : "s"} in storage
        </p>
      )}
    </>
  );
}
