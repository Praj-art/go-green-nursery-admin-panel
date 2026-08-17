// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server"
import { updateOrderStatus } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 })
    }

    const data = await updateOrderStatus(id, status)
    if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update order"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
