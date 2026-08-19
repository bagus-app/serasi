import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

/** null bila env belum diisi → fitur otomatis mode lokal */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;