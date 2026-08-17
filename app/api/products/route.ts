// app/api/products/route.ts
import { NextResponse } from "next/server"
import { getProducts, createProduct } from "@/lib/db"

export async function GET() {
  try {
    const data = await getProducts()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch products"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, category, price, stock, low_at, available, image_url } = body

    if (!name || !category || price == null || stock == null) {
      return NextResponse.json(
        { error: "name, category, price, and stock are required" },
        { status: 400 }
      )
    }

    const data = await createProduct({
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      low_at: low_at ? Number(low_at) : 5,
      available: available ?? true,
      image_url: image_url ?? null,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
