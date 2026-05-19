import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function getSupabase() {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}
