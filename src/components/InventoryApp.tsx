"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ItemForm, type ItemFormHandle } from "@/components/ItemForm";
import { LocationAccordion } from "@/components/LocationAccordion";
import { MobileAddItemDrawer } from "@/components/MobileAddItemDrawer";
import { SwipeHintBanner } from "@/components/SwipeHintBanner";
import { TagFilter } from "@/components/TagFilter";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
import {
  alertError,
  btnPrimary,
  cardClass,
  emptyState,
  inputClass,
  sectionLabel,
} from "@/lib/ui";

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
  const [mobileAddOpen, setMobileAddOpen] = useState(false);
  const addFormRef = useRef<ItemFormHandle>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

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

  const closeAdd = useCallback(() => {
    setShowAddForm(false);
    setMobileAddOpen(false);
    setNewItem(emptyDraft());
  }, []);

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
      closeAdd();
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

  const handleLocationUpdated = (location: StorageLocation) => {
    setLocations((prev) =>
      [...prev.map((l) => (l.id === location.id ? location : l))].sort(
        (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)
      )
    );
    setItems((prev) =>
      prev.map((item) =>
        item.location_id === location.id
          ? {
              ...item,
              location: { id: location.id, name: location.name },
            }
          : item
      )
    );
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

  const addForm = (
    <ItemForm
      ref={addFormRef}
      draft={newItem}
      onChange={setNewItem}
      locations={locations}
      tags={tags}
      onLocationCreated={handleLocationCreated}
      onLocationUpdated={handleLocationUpdated}
      onTagCreated={handleTagCreated}
      disabled={busy}
    />
  );

  const inventoryBody = (
    <>
      {!loading && (
        <TagFilter
          items={items}
          selectedTagId={selectedTagId}
          onChange={setSelectedTagId}
        />
      )}

      {loading ? (
        <p className="py-12 text-center text-muted">Loading inventory…</p>
      ) : filtered.length === 0 ? (
        <p className={`${emptyState} py-16 text-center text-muted`}>
          {items.length === 0
            ? isMobile
              ? "No items yet. Swipe left or tap + on the edge to add one."
              : "No items yet. Add your first one above."
            : hasActiveFilters
              ? "No items match your filters."
              : "No items match your search."}
        </p>
      ) : (
        <>
          <SwipeHintBanner />
          <LocationAccordion
            items={filtered}
            locations={locations}
            tags={tags}
            expandAllSections={hasActiveFilters}
            onLocationCreated={handleLocationCreated}
            onLocationUpdated={handleLocationUpdated}
            onTagCreated={handleTagCreated}
            onSave={handleSave}
            onDelete={handleDelete}
            disabled={busy}
          />
        </>
      )}

      {!loading && items.length > 0 && (
        <p className="mt-8 text-center text-xs text-muted">
          {items.length} item{items.length === 1 ? "" : "s"} in storage
        </p>
      )}
    </>
  );

  return (
    <>
      {error && (
        <div role="alert" className={`mb-6 ${alertError}`}>
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search by name, location, tags, or notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`flex-1 ${inputClass}`}
        />
        <button
          type="button"
          onClick={() => {
            if (isMobile) {
              setMobileAddOpen(true);
              return;
            }
            setShowAddForm((v) => !v);
            if (showAddForm) setNewItem(emptyDraft());
          }}
          className={`${btnPrimary} hidden sm:inline-flex`}
        >
          {showAddForm ? "Cancel" : "+ Add item"}
        </button>
        {isMobile && (
          <p className="text-center text-xs text-muted sm:hidden">
            Swipe left on the list or tap <span className="font-semibold text-accent">+</span> on the right edge to add
          </p>
        )}
      </div>

      {showAddForm && !isMobile && (
        <section className={`mb-8 ${cardClass} p-6`}>
          <h2 className={`mb-4 ${sectionLabel}`}>New item</h2>
          {addForm}
          <button
            type="button"
            onClick={handleAdd}
            disabled={busy || !newItem.name.trim()}
            className={`mt-4 ${btnPrimary}`}
          >
            {adding ? "Adding…" : "Add to inventory"}
          </button>
        </section>
      )}

      {isMobile ? (
        <MobileAddItemDrawer
          open={mobileAddOpen}
          onOpen={() => setMobileAddOpen(true)}
          onClose={closeAdd}
          onSubmit={handleAdd}
          submitting={adding}
          canSubmit={!!newItem.name.trim()}
          surface={inventoryBody}
        >
          {addForm}
        </MobileAddItemDrawer>
      ) : (
        inventoryBody
      )}
    </>
  );
}
