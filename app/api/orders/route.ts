// app/api/orders/route.ts
import { NextResponse } from "next/server"
import { getOrders } from "@/lib/db"

export async function GET() {
  try {
    const data = await getOrders()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch orders"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
