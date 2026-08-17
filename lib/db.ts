// lib/db.ts
// Dual-mode data layer: uses live Supabase if credentials are provided in .env.local,
// otherwise seamlessly falls back to a stateful in-memory store so the entire app works out of the box.

import { initialProducts, initialOrders, initialPayments } from "@/components/admin/data"
import { createServerSupabaseClient } from "./supabase/server"

// Check if valid Supabase configuration is present
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && !url.includes("YOUR_PROJECT_REF") && !key.includes("YOUR_SUPABASE"))
}

// In-memory fallback state (shared across routes in the Node runtime)
let fallbackProducts = initialProducts.map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  stock: p.stock,
  low_at: p.lowAt,
  available: p.available,
  image_url: null as string | null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))

let fallbackOrders = initialOrders.map((o) => ({
  id: o.id,
  customer: o.customer,
  phone: o.phone,
  address: o.address,
  pay_status: o.payStatus,
  status: o.status,
  date: o.date,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  items: o.items.map((it, idx) => ({
    id: idx + 1,
    order_id: o.id,
    product_name: it.name,
    qty: it.qty,
    price: it.price,
  })),
}))

let fallbackPayments = initialPayments.map((p) => ({
  id: p.id,
  txn_id: p.txnId,
  order_id: p.orderId,
  customer: p.customer,
  amount: p.amount,
  method: p.method,
  status: p.status,
  refund: p.refund ?? "None",
  date: p.date,
  razorpay_order_id: null as string | null,
  razorpay_payment_id: null as string | null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))

// ── Products API ─────────────────────────────────────────────────────────────
export async function getProducts() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase.from("products").select("*").order("name")
      if (!error && data && data.length > 0) return data
    } catch {
      // fallback
    }
  }
  return fallbackProducts
}

export async function createProduct(product: {
  name: string
  category: string
  price: number
  stock: number
  low_at?: number
  available?: boolean
  image_url?: string | null
}) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase.from("products").insert(product).select().single()
      if (!error && data) return data
    } catch {
      // fallback
    }
  }
  const newId = `P-${String(fallbackProducts.length + 1).padStart(3, "0")}`
  const newProduct = {
    id: newId,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    low_at: product.low_at ?? 5,
    available: product.available ?? true,
    image_url: product.image_url ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  fallbackProducts = [newProduct, ...fallbackProducts]
  return newProduct
}

export async function updateProduct(id: string, patch: Record<string, unknown>) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase.from("products").update(patch).eq("id", id).select().single()
      if (!error && data) return data
    } catch {
      // fallback
    }
  }
  fallbackProducts = fallbackProducts.map((p) => (p.id === id ? { ...p, ...patch } : p))
  return fallbackProducts.find((p) => p.id === id)
}

export async function deleteProduct(id: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient()
      await supabase.from("products").delete().eq("id", id)
    } catch {
      // fallback
    }
  }
  fallbackProducts = fallbackProducts.filter((p) => p.id !== id)
  return true
}

// ── Orders API ───────────────────────────────────────────────────────────────
export async function getOrders() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient()
      const [ordersRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("order_items").select("*"),
      ])
      if (!ordersRes.error && ordersRes.data && ordersRes.data.length > 0) {
        return ordersRes.data.map((order) => ({
          ...order,
          items: (itemsRes.data ?? []).filter((item) => item.order_id === order.id),
        }))
      }
    } catch {
      // fallback
    }
  }
  return fallbackOrders
}

export async function updateOrderStatus(id: string, status: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().single()
      if (!error && data) return data
    } catch {
      // fallback
    }
  }
  fallbackOrders = fallbackOrders.map((o) => (o.id === id ? { ...o, status: status as any } : o))
  return fallbackOrders.find((o) => o.id === id)
}

// ── Payments API ─────────────────────────────────────────────────────────────
export async function getPayments(statusFilter?: string | null) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient()
      let query = supabase.from("payments").select("*").order("created_at", { ascending: false })
      if (statusFilter) query = query.eq("status", statusFilter)
      const { data, error } = await query
      if (!error && data && data.length > 0) return data
    } catch {
      // fallback
    }
  }
  if (statusFilter) {
    return fallbackPayments.filter((p) => p.status === statusFilter)
  }
  return fallbackPayments
}

export async function updatePayment(id: string, patch: Record<string, unknown>) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase.from("payments").update(patch).eq("id", id).select().single()
      if (!error && data) return data
    } catch {
      // fallback
    }
  }
  fallbackPayments = fallbackPayments.map((p) => (p.id === id ? { ...p, ...patch } : p))
  return fallbackPayments.find((p) => p.id === id)
}
