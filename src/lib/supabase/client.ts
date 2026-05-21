import { createClient } from "@supabase/supabase-js";
import type { StorageItem } from "@/types/item";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local"
    );
  }
  return createClient(supabaseUrl, supabaseKey);
}

export type Database = {
  public: {
    Tables: {
      items: {
        Row: StorageItem;
        Insert: Omit<StorageItem, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<StorageItem, "id" | "created_at">>;
      };
    };
  };
};
