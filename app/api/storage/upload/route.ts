// app/api/storage/upload/route.ts
// POST /api/storage/upload
// Accepts a multipart form with a "file" field and optional "product_id".
// Uploads to Supabase Storage bucket "plant-images" and updates the product's image_url.

import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const BUCKET = "plant-images"
const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const productId = formData.get("product_id") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, WebP, or AVIF." },
        { status: 400 }
      )
    }

    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_SIZE_MB}MB allowed.` },
        { status: 400 }
      )
    }

    const ext = file.name.split(".").pop() ?? "jpg"
    const fileName = `${productId ?? "product"}-${Date.now()}.${ext}`
    const arrayBuffer = await file.arrayBuffer()

    const supabase = createServerSupabaseClient()

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Get the public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl

    // Update product's image_url if product_id provided
    if (productId) {
      const { error: updateError } = await supabase
        .from("products")
        .update({ image_url: publicUrl })
        .eq("id", productId)

      if (updateError) throw updateError
    }

    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
