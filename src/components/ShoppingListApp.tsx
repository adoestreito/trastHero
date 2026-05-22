"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddShoppingListItem } from "@/components/AddShoppingListItem";
import { ShoppingListEntryRow } from "@/components/ShoppingListEntryRow";
import {
  createShoppingListEntry,
  deleteShoppingListEntry,
  fetchInventorySuggestions,
  fetchShoppingList,
  setShoppingListPurchased,
} from "@/lib/shoppingList";
import type {
  InventorySuggestion,
  ShoppingListEntry,
} from "@/types/shoppingList";
import { alertError, sectionLabel } from "@/lib/ui";

function filterVisible(
  entries: ShoppingListEntry[],
  showPurchased: boolean
) {
  return entries.filter((e) => showPurchased || !e.purchased);
}

export function ShoppingListApp() {
  const [entries, setEntries] = useState<ShoppingListEntry[]>([]);
  const [suggestions, setSuggestions] = useState<InventorySuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPurchased, setShowPurchased] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, inv] = await Promise.all([
        fetchShoppingList(),
        fetchInventorySuggestions(),
      ]);
      setEntries(list);
      setSuggestions(inv);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load shopping list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { toBuy, keepAnEye } = useMemo(() => {
    const toBuyList = entries.filter((e) => e.kind === "to_buy");
    const keepAnEyeList = entries.filter((e) => e.kind === "keep_an_eye");
    return { toBuy: toBuyList, keepAnEye: keepAnEyeList };
  }, [entries]);

  const visibleToBuy = filterVisible(toBuy, showPurchased);
  const visibleKeepAnEye = filterVisible(keepAnEye, showPurchased);
  const pendingToBuy = toBuy.filter((e) => !e.purchased).length;

  const handleAdd = async (input: {
    name: string;
    quantity: number;
    item_id: string | null;
  }) => {
    const inv = input.item_id
      ? suggestions.find((s) => s.id === input.item_id)
      : null;
    const kind = inv
      ? inv.quantity === 0
        ? ("to_buy" as const)
        : ("keep_an_eye" as const)
      : ("to_buy" as const);

    const created = await createShoppingListEntry({ ...input, kind });
    setEntries((prev) =>
      [...prev, created].sort(
        (a, b) =>
          a.kind.localeCompare(b.kind) ||
          Number(a.purchased) - Number(b.purchased) ||
          a.name.localeCompare(b.name)
      )
    );
  };

  const handleTogglePurchased = async (entry: ShoppingListEntry) => {
    const updated = await setShoppingListPurchased(
      entry.id,
      !entry.purchased
    );
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? updated : e))
    );
  };

  const handleDelete = async (id: string) => {
    await deleteShoppingListEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const isEmpty =
    !loading && visibleToBuy.length === 0 && visibleKeepAnEye.length === 0;

  return (
    <>
      {error && (
        <div role="alert" className={`mb-6 ${alertError}`}>
          {error}
        </div>
      )}

      <div className="mb-6">
        <AddShoppingListItem
          suggestions={suggestions}
          onAdd={handleAdd}
          disabled={loading}
        />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {pendingToBuy} to buy · {keepAnEye.filter((e) => !e.purchased).length}{" "}
          to watch
        </p>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={showPurchased}
            onChange={(e) => setShowPurchased(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Show purchased
        </label>
      </div>

      {loading ? (
        <p className="py-12 text-center text-muted">Loading shopping list…</p>
      ) : isEmpty ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted">
          {entries.length === 0
            ? "Your shopping list is empty."
            : "No pending items. Toggle “Show purchased” to see completed buys."}
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className={`mb-3 ${sectionLabel}`}>Shopping list — to buy</h2>
            <p className="mb-3 text-xs text-muted">
              Inventory items marked for shopping with quantity 0
            </p>
            {visibleToBuy.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted">
                Nothing to buy right now.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {visibleToBuy.map((entry) => (
                  <ShoppingListEntryRow
                    key={entry.id}
                    entry={entry}
                    onTogglePurchased={handleTogglePurchased}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className={`mb-3 ${sectionLabel}`}>Keep an eye</h2>
            <p className="mb-3 text-xs text-muted">
              Marked for shopping list but still in stock (quantity greater than
              0)
            </p>
            {visibleKeepAnEye.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted">
                No items to watch.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {visibleKeepAnEye.map((entry) => (
                  <ShoppingListEntryRow
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
