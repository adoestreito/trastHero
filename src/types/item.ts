import type { StorageLocation } from "@/types/location";
import type { StorageTag } from "@/types/tag";

export type StorageItem = {
  id: string;
  name: string;
  quantity: number;
  description: string | null;
  expiration_date: string | null;
  location_id: string | null;
  location: Pick<StorageLocation, "id" | "name"> | null;
  tags: Pick<StorageTag, "id" | "name">[];
  created_at: string;
  updated_at: string;
};

export type StorageItemInput = {
  name: string;
  quantity: number;
  description?: string | null;
  expiration_date?: string | null;
  location_id?: string | null;
  tag_ids?: string[];
};

export type StorageItemDraft = StorageItemInput & {
  id?: string;
};
