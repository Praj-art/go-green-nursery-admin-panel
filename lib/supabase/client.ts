// lib/supabase/client.ts
// Browser-side Supabase client — uses the public anon key.
// Safe to use in "use client" components and realtime hooks.

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClientSupabaseClient() {
  if (_client) return _client

  _client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return _client
}
