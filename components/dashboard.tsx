"use client"

import { useState, useEffect, useCallback } from "react"
import { Leaf, Menu, X, LayoutDashboard, LayoutGrid, ShoppingCart, CreditCard, ChevronRight, LogOut } from "lucide-react"
import { Overview } from "./admin/overview"
import { Inventory } from "./admin/inventory"
import { Orders } from "./admin/orders"
import { Payments } from "./admin/payments"
import { SystemStatusModal } from "./admin/system-status"
import type { OrderStatus } from "./admin/data"
import { stockStatus } from "./admin/data"
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders"
import { useRealtimeInventory } from "@/hooks/useRealtimeInventory"
import type { ProductRow, OrderWithItems, PaymentRow } from "@/lib/supabase/database.types"

type Tab = "Overview" | "Inventory" | "Orders" | "Payments"

const tabIcons = {
  Overview: LayoutDashboard,
  Inventory: LayoutGrid,
  Orders: ShoppingCart,
  Payments: CreditCard,
}

// Map ProductRow to the legacy Product shape the UI components expect
function rowToProduct(r: ProductRow) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    stock: r.stock,
    lowAt: r.low_at,
    price: r.price,
    available: r.available,
    imageUrl: r.image_url ?? undefined,
  }
}

// Map OrderWithItems to the legacy Order shape
function rowToOrder(r: OrderWithItems) {
  return {
    id: r.id,
    customer: r.customer,
    phone: r.phone ?? "",
    address: r.address ?? "",
    items: r.items.map((i) => ({ name: i.product_name, qty: i.qty, price: i.price })),
    payStatus: r.pay_status as "Paid" | "Pending" | "Failed" | "Refunded",
    status: r.status as OrderStatus,
    date: r.date,
  }
}

// Map PaymentRow to the legacy Payment shape
function rowToPayment(r: PaymentRow) {
  return {
    id: r.id,
    txnId: r.txn_id,
    orderId: r.order_id ?? "",
    customer: r.customer,
    amount: r.amount,
    method: r.method,
    status: r.status as "Paid" | "Pending" | "Failed" | "Refunded",
    refund: (r.refund ?? "None") as "None" | "Initiated" | "Completed",
    date: r.date,
  }
}

export function Dashboard() {
  const [tab, setTab] = useState<Tab>("Overview")
  const [autoOpenAddModal, setAutoOpenAddModal] = useState(false)
  const [products, setProducts] = useState<ReturnType<typeof rowToProduct>[]>([])
  const [orders, setOrders] = useState<ReturnType<typeof rowToOrder>[]>([])
  const [payments, setPayments] = useState<ReturnType<typeof rowToPayment>[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // ── Fetch all data on mount ─────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [productsRes, ordersRes, paymentsRes] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/payments").then((r) => r.json()),
      ])
      if (Array.isArray(productsRes)) setProducts(productsRes.map(rowToProduct))
      if (Array.isArray(ordersRes)) setOrders(ordersRes.map(rowToOrder))
      if (Array.isArray(paymentsRes)) setPayments(paymentsRes.map(rowToPayment))
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── Realtime: orders ────────────────────────────────────────────────────────
  useRealtimeOrders(
    useCallback(({ eventType, new: newRow }) => {
      if (!newRow) return
      if (eventType === "UPDATE") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === newRow.id
              ? {
                  ...o,
                  status: newRow.status as OrderStatus,
                  payStatus: newRow.pay_status as "Paid" | "Pending" | "Failed" | "Refunded",
                }
              : o
          )
        )
      }
    }, [])
  )

  // ── Realtime: inventory ─────────────────────────────────────────────────────
  useRealtimeInventory(
    useCallback(({ eventType, new: newRow }) => {
      if (!newRow) return
      if (eventType === "UPDATE") {
        setProducts((prev) =>
          prev.map((p) => (p.id === newRow.id ? rowToProduct(newRow) : p))
        )
      }
    }, [])
  )

  // ── Mutations ───────────────────────────────────────────────────────────────
  const updateProduct = async (id: string, patch: Partial<ReturnType<typeof rowToProduct>>) => {
    // Optimistic update
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))

    // Map back to DB column names
    const dbPatch: Record<string, unknown> = {}
    if (patch.stock !== undefined) dbPatch.stock = patch.stock
    if (patch.available !== undefined) dbPatch.available = patch.available
    if (patch.price !== undefined) dbPatch.price = patch.price
    if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl

    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbPatch),
    })
  }

  const handleAddProduct = () => {
    fetchAll()
    setAutoOpenAddModal(false)
  }

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    // Optimistic update
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)))

    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
  }

  const handleRefund = (id: string, refundState: "Initiated" | "Completed") => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              refund: refundState,
              status: refundState === "Completed" ? "Refunded" : p.status,
            }
          : p
      )
    )
  }

  const handleTabSelect = (name: Tab) => {
    setTab(name)
    setAutoOpenAddModal(false)
    setSidebarOpen(false)
  }

  const handleOpenAddPlant = () => {
    setTab("Inventory")
    setAutoOpenAddModal(true)
  }

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.href = "/login"
  }

  // ── Badge counts ────────────────────────────────────────────────────────────
  const lowCount = products.filter((p) => stockStatus({ ...p, lowAt: p.lowAt }) !== "In Stock").length
  const pendingOrders = orders.filter((o) => o.status === "Pending").length
  const failedPays = payments.filter((p) => p.status === "Failed").length

  const tabs: { name: Tab; badge: number }[] = [
    { name: "Overview", badge: 0 },
    { name: "Inventory", badge: lowCount },
    { name: "Orders", badge: pendingOrders },
    { name: "Payments", badge: failedPays },
  ]

  return (
    <div className="perspective-1200 min-h-screen bg-background">

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-card border-r border-border shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="animate-sway flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Leaf className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">GoGreen Nursery</p>
              <p className="text-[11px] text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex flex-col gap-1 p-4" aria-label="Sidebar navigation">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Navigation
          </p>
          {tabs.map((t) => {
            const Icon = tabIcons[t.name]
            const active = tab === t.name
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => handleTabSelect(t.name)}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className={`size-4 shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className="flex-1 text-left">{t.name}</span>
                {t.badge > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${active ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                    {t.badge}
                  </span>
                )}
                <ChevronRight className={`size-3.5 shrink-0 transition-all ${active ? "text-primary" : "text-transparent group-hover:text-muted-foreground"}`} />
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 flex flex-col gap-2">
          <div className="rounded-xl bg-primary/10 px-4 py-3">
            <p className="text-xs font-semibold text-primary">🌿 GoGreen Admin</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {products.length} products · {orders.length} orders
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className="animate-rise sticky top-0 z-20 border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-5">
          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Menu className="size-5" />
          </button>

          <div className="animate-sway flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Leaf className="size-5 text-primary" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-foreground">GoGreen Nursery Admin</h1>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading data…" : "Live — powered by Supabase"}
            </p>
          </div>

          {/* System Diagnostics & Live indicator */}
          <div className="ml-auto flex items-center gap-3">
            <SystemStatusModal />

            {!loading && (
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="animate-rise mx-auto max-w-6xl px-4 py-6" style={{ animationDelay: "120ms" }}>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading dashboard data…</p>
            </div>
          </div>
        ) : (
          <>
            {tab === "Overview" && (
              <Overview
                products={products}
                orders={orders}
                payments={payments}
                onNavigate={handleTabSelect}
                onOpenAddPlant={handleOpenAddPlant}
              />
            )}
            {tab === "Inventory" && (
              <Inventory
                products={products}
                onUpdate={updateProduct}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                autoOpenAddModal={autoOpenAddModal}
              />
            )}
            {tab === "Orders" && <Orders orders={orders} onStatus={updateOrderStatus} />}
            {tab === "Payments" && <Payments payments={payments} onRefund={handleRefund} />}
          </>
        )}
      </main>
    </div>
  )
}
