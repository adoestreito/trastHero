export type StorageItem = {
  id: string;
  name: string;
  quantity: number;
  description: string | null;
  expiration_date: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type StorageItemInput = {
  name: string;
  quantity: number;
  description?: string | null;
  expiration_date?: string | null;
  location?: string | null;
};

export type StorageItemDraft = StorageItemInput & {
  id?: string;
};
