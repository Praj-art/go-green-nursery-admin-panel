// lib/supabase/server.ts
// Server-side Supabase client — uses service_role key for full DB access.
// Only used in Route Handlers and Server Actions (never shipped to browser).

import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Add them to your .env.local file."
    )
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
