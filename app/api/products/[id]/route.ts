// app/api/products/[id]/route.ts
import { NextResponse } from "next/server"
import { updateProduct, deleteProduct } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = await updateProduct(id, body)
    if (!data) return NextResponse.json({ error: "Product not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteProduct(id)
    return new Response(null, { status: 204 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
