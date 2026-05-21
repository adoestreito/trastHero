import type { StorageItem } from "@/types/item";
import type { StorageLocation } from "@/types/location";

export type LocationGroup = {
  key: string;
  title: string;
  sortOrder: number;
  items: StorageItem[];
};

const UNASSIGNED_KEY = "__unassigned__";

export function groupItemsByLocation(
  items: StorageItem[],
  locations: StorageLocation[]
): LocationGroup[] {
  const byKey = new Map<string, StorageItem[]>();

  for (const item of items) {
    const key = item.location_id ?? UNASSIGNED_KEY;
    const list = byKey.get(key) ?? [];
    list.push(item);
    byKey.set(key, list);
  }

  const groups: LocationGroup[] = [];

  for (const loc of locations) {
    const locItems = byKey.get(loc.id);
    if (!locItems?.length) continue;
    groups.push({
      key: loc.id,
      title: loc.name,
      sortOrder: loc.sort_order,
      items: locItems.sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  const unassigned = byKey.get(UNASSIGNED_KEY);
  if (unassigned?.length) {
    groups.push({
      key: UNASSIGNED_KEY,
      title: "Sin ubicación",
      sortOrder: 9999,
      items: unassigned.sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  return groups;
}
