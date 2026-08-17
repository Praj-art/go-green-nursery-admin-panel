// lib/supabase/client.ts
// Browser-side Supabase client — uses the public anon key.
// Safe to use in "use client" components and realtime hooks.

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClientSupabaseClient() {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey || url.includes("YOUR_PROJECT_REF") || anonKey.includes("YOUR_SUPABASE")) {
    return null
  }

  try {
    _client = createBrowserClient<Database>(url, anonKey)
    return _client
  } catch (err) {
    console.warn("Failed to initialize browser Supabase client:", err)
    return null
  }
}
