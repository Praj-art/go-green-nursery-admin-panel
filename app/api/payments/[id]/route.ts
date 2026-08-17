// app/api/payments/[id]/route.ts
import { NextResponse } from "next/server"
import { updatePayment } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = await updatePayment(id, body)
    if (!data) return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update payment"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
