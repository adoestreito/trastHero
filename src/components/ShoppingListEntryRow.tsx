"use client";

import type { ShoppingListEntry } from "@/types/shoppingList";
import { btnSecondary, cardClass } from "@/lib/ui";

type ShoppingListEntryRowProps = {
  entry: ShoppingListEntry;
  onTogglePurchased?: (entry: ShoppingListEntry) => void;
  onDelete: (id: string) => void;
};

export function ShoppingListEntryRow({
  entry,
  onTogglePurchased,
  onDelete,
}: ShoppingListEntryRowProps) {
  const isWatch = entry.kind === "keep_an_eye";

  return (
    <li
      className={`flex flex-wrap items-center gap-3 ${cardClass} p-4 ${
        entry.purchased ? "opacity-60" : ""
      }`}
    >
      {!isWatch && onTogglePurchased ? (
        <input
          type="checkbox"
          checked={entry.purchased}
          onChange={() => onTogglePurchased(entry)}
          className="h-5 w-5 rounded border-border text-accent focus:ring-accent/20"
          aria-label={`Mark ${entry.name} as purchased`}
        />
      ) : (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold text-warning"
          title="Keep an eye"
          aria-hidden
        >
          !
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p
          className={`font-medium text-foreground ${entry.purchased ? "line-through" : ""}`}
        >
          {entry.name}
        </p>
        <p className="text-sm text-muted">
          {isWatch ? (
            <>
              Keep an eye
              {entry.inventory_quantity != null &&
                ` · ${entry.inventory_quantity} in storage`}
              {entry.item_id ? " · From inventory" : ""}
            </>
          ) : (
            <>
              Buy: {entry.quantity}
              {entry.item_id ? " · From inventory" : " · Not in inventory"}
            </>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDelete(entry.id)}
        className={`${btnSecondary} !border-danger/30 !text-xs !text-danger hover:!bg-danger/5`}
      >
        Remove
      </button>
    </li>
  );
}
