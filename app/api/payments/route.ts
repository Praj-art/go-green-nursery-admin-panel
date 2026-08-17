// app/api/payments/route.ts
import { NextResponse } from "next/server"
import { getPayments } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const data = await getPayments(status)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch payments"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
