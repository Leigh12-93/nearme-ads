import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const key = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ""
    ).trim();
    if (!url || !key)
      throw new Error("Missing Supabase credentials for ad network");
    _supabase = createClient(url, key);
  }
  return _supabase;
}
