import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pocoystpkrdmobplazhd.supabase.co").trim();
    const key = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvY295c3Rwa3JkbW9icGxhemhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzA4MjksImV4cCI6MjA4MDE0NjgyOX0.yzcMW0IkJEkQIsoypqqPPaKjedI2RN0jHGcm5PJue70"
    ).trim();
    if (!url || !key)
      throw new Error("Missing Supabase credentials for ad network");
    _supabase = createClient(url, key);
  }
  return _supabase;
}
