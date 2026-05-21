import type { StorageLocation } from "@/types/location";

export type StorageItem = {
  id: string;
  name: string;
  quantity: number;
  description: string | null;
  expiration_date: string | null;
  location_id: string | null;
  location: Pick<StorageLocation, "id" | "name"> | null;
  created_at: string;
  updated_at: string;
};

export type StorageItemInput = {
  name: string;
  quantity: number;
  description?: string | null;
  expiration_date?: string | null;
  location_id?: string | null;
};

export type StorageItemDraft = StorageItemInput & {
  id?: string;
};
