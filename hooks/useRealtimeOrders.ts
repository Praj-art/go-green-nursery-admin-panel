// hooks/useRealtimeOrders.ts
// Subscribes to Supabase Realtime on the orders table.
// Any INSERT or UPDATE from any source (webhooks, other admins) is reflected live.

"use client"

import { useEffect, useRef } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import type { OrderRow } from "@/lib/supabase/database.types"

type RealtimeCallback = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: OrderRow | null
  old: OrderRow | null
}) => void

export function useRealtimeOrders(onEvent: RealtimeCallback) {
  const callbackRef = useRef(onEvent)
  callbackRef.current = onEvent

  useEffect(() => {
    const supabase = createClientSupabaseClient()

    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          callbackRef.current({
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: payload.new as OrderRow | null,
            old: payload.old as OrderRow | null,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
