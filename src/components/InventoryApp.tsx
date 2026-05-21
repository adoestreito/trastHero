"use client";

import { useCallback, useEffect, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import { ItemForm } from "@/components/ItemForm";
import {
  createItem,
  deleteItem,
  fetchItems,
  updateItem,
} from "@/lib/items";
import type { StorageItem, StorageItemDraft } from "@/types/item";

const emptyDraft = (): StorageItemDraft => ({
  name: "",
  quantity: 1,
  description: null,
  expiration_date: null,
  location: null,
});

type InventoryAppProps = {
  userEmail: string;
  onSignOut: () => Promise<void>;
};

export function InventoryApp({ userEmail, onSignOut }: InventoryAppProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState<StorageItemDraft>(emptyDraft);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchItems();
      setItems(data);
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
      const created = await createItem(newItem);
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
    const updated = await updateItem(id, draft);
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? updated : i))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const handleDelete = async (id: string) => {
    setError(null);
    await deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      (item.location?.toLowerCase().includes(q) ?? false) ||
      (item.description?.toLowerCase().includes(q) ?? false)
    );
  });

  const busy = loading || adding;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            TrastHero
          </h1>
          <p className="mt-1 text-muted">Family storage room inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{userEmail}</span>
          <button
            type="button"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              try {
                await onSignOut();
              } finally {
                setSigningOut(false);
              }
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-background disabled:opacity-50"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </header>

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
          placeholder="Search by name, location, or notes…"
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

      {showAddForm && (
        <section className="mb-8 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            New item
          </h2>
          <ItemForm draft={newItem} onChange={setNewItem} />
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
            : "No items match your search."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((item) => (
            <li key={item.id}>
              <ItemCard
                item={item}
                onSave={handleSave}
                onDelete={handleDelete}
                disabled={busy}
              />
            </li>
          ))}
        </ul>
      )}

      {!loading && items.length > 0 && (
        <p className="mt-8 text-center text-xs text-muted">
          {items.length} item{items.length === 1 ? "" : "s"} in storage
        </p>
      )}
    </div>
  );
}
