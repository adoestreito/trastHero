export type ShoppingListKind = "to_buy" | "keep_an_eye";

export type ShoppingListEntry = {
  id: string;
  name: string;
  quantity: number;
  kind: ShoppingListKind;
  item_id: string | null;
  purchased: boolean;
  notes: string | null;
  inventory_quantity: number | null;
  created_at: string;
  updated_at: string;
};

export type ShoppingListEntryInput = {
  name: string;
  quantity: number;
  kind?: ShoppingListKind;
  item_id?: string | null;
  notes?: string | null;
};

export type InventorySuggestion = {
  id: string;
  name: string;
  quantity: number;
};
