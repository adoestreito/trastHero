"use client";

import { useMemo, useState } from "react";
import type { InventorySuggestion } from "@/types/shoppingList";
import { btnPrimary, cardClass, inputClass, sectionLabel } from "@/lib/ui";

type AddShoppingListItemProps = {
  suggestions: InventorySuggestion[];
  onAdd: (input: {
    name: string;
    quantity: number;
    item_id: string | null;
  }) => Promise<void>;
  disabled?: boolean;
};

export function AddShoppingListItem({
  suggestions,
  onAdd,
  disabled,
}: AddShoppingListItemProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [linkedItemId, setLinkedItemId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredSuggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 8);
    return suggestions
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [name, suggestions]);

  const pickSuggestion = (s: InventorySuggestion) => {
    setName(s.name);
    setLinkedItemId(s.id);
    setError(null);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    const match = suggestions.find(
      (s) => s.name.toLowerCase() === value.trim().toLowerCase()
    );
    setLinkedItemId(match?.id ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    setError(null);
    try {
      await onAdd({
        name: name.trim(),
        quantity: Math.max(1, quantity),
        item_id: linkedItemId,
      });
      setName("");
      setQuantity(1);
      setLinkedItemId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${cardClass} p-6`}
    >
      <h2 className={`mb-4 ${sectionLabel}`}>Add to shopping list</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-muted">
            Item name *
          </span>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Start typing — inventory items suggested"
            list="inventory-suggestions"
            disabled={disabled || busy}
            required
          />
          <datalist id="inventory-suggestions">
            {suggestions.map((s) => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-muted">
            Quantity to buy
          </span>
          <input
            className={inputClass}
            type="number"
            min={1}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            disabled={disabled || busy}
          />
        </label>
      </div>

      {filteredSuggestions.length > 0 && name.trim() !== "" && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {filteredSuggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => pickSuggestion(s)}
                disabled={disabled || busy}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs transition-colors hover:border-accent hover:bg-accent-light hover:text-accent disabled:opacity-50"
              >
                {s.name}
                <span className="ml-1 text-muted">({s.quantity} in stock)</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {linkedItemId && (
        <p className="mt-2 text-xs text-accent">Linked to inventory item</p>
      )}

      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || busy || !name.trim()}
        className={`mt-4 ${btnPrimary}`}
      >
        {busy ? "Adding…" : "Add to list"}
      </button>
    </form>
  );
}
