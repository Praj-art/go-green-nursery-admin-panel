// hooks/useRealtimeInventory.ts
// Subscribes to Supabase Realtime on the products table.
// Stock changes (from POS, other admin sessions, webhooks) appear live.

"use client"

import { useEffect, useRef } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import type { ProductRow } from "@/lib/supabase/database.types"

type RealtimeCallback = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: ProductRow | null
  old: ProductRow | null
}) => void

export function useRealtimeInventory(onEvent: RealtimeCallback) {
  const callbackRef = useRef(onEvent)
  callbackRef.current = onEvent

  useEffect(() => {
    const supabase = createClientSupabaseClient()
    if (!supabase) return

    const channel = supabase
      .channel("realtime-inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          callbackRef.current({
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: payload.new as ProductRow | null,
            old: payload.old as ProductRow | null,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
