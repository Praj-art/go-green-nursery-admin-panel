"use client"

import { Leaf, ShoppingCart, Users, TrendingUp, Sun, Wind, Package, Plus, CreditCard, ChevronRight } from "lucide-react"

const weeklyData = [
  { day: "Mon", sales: 42 },
  { day: "Tue", sales: 68 },
  { day: "Wed", sales: 75 },
  { day: "Thu", sales: 95 },
  { day: "Fri", sales: 82 },
  { day: "Sat", sales: 118 },
  { day: "Sun", sales: 88 },
]
const maxSales = Math.max(...weeklyData.map((d) => d.sales))

const inventoryHealth = [
  { name: "Succulents", pct: 82, Icon: Sun },
  { name: "Indoor Plants", pct: 64, Icon: Leaf },
  { name: "Herbs", pct: 45, Icon: Wind },
  { name: "Pots & Soil", pct: 91, Icon: Package },
]

const statusStyle: Record<string, string> = {
  Packed: "bg-primary/20 text-primary",
  Preparing: "bg-amber-500/20 text-amber-400",
  Accepted: "bg-blue-500/20 text-blue-400",
  Pending: "bg-muted text-muted-foreground",
  Cancelled: "bg-muted text-muted-foreground",
  Failed: "bg-destructive/20 text-destructive",
}
const statusLabel: Record<string, string> = {
  Packed: "Delivered",
  Preparing: "Shipped",
  Accepted: "Accepted",
  Pending: "Pending",
  Cancelled: "Cancelled",
  Failed: "Failed",
}

interface Product { id: string; name: string; stock: number; lowAt: number; available: boolean; price: number; category: string }
interface Order { id: string; customer: string; status: string; items: { name: string; qty: number; price: number }[]; date: string }
interface Payment { id: string; amount: number; status: string }

type TabName = "Overview" | "Inventory" | "Orders" | "Payments"

export function Overview({
  products = [],
  orders = [],
  payments = [],
  onNavigate,
  onOpenAddPlant,
}: {
  products?: Product[]
  orders?: Order[]
  payments?: Payment[]
  onNavigate?: (tab: TabName) => void
  onOpenAddPlant?: () => void
}) {
  const totalStock = products.reduce((s, p) => s + p.stock, 0)
  const today = new Date().toISOString().split("T")[0]
  const todayOrders = orders.filter((o) => o.date === today).length
  const totalRevenue = payments
    .filter((p) => p.status === "Paid")
    .reduce((s, p) => s + p.amount, 0)
  const totalCustomers = new Set(orders.map((o) => o.customer)).size

  const recentOrders = orders.slice(0, 5).map((o) => ({
    id: o.id,
    plant: o.items[0]?.name ?? "—",
    customer: o.customer,
    status: o.status,
    amount: o.items.reduce((s, i) => s + i.qty * i.price, 0),
  }))

  const statCards: { label: string; value: string; change: string; Icon: any; tab: TabName }[] = [
    { label: "Total Plants", value: totalStock.toLocaleString(), change: "Click to open Inventory →", Icon: Leaf, tab: "Inventory" },
    { label: "Orders Today", value: todayOrders.toString(), change: "Click to view Orders →", Icon: ShoppingCart, tab: "Orders" },
    { label: "Customers", value: totalCustomers.toString(), change: "Click to view Orders →", Icon: Users, tab: "Orders" },
    { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, change: "Click to view Payments →", Icon: TrendingUp, tab: "Payments" },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Quick Actions Panel */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</p>
          <span className="text-[11px] text-muted-foreground">Shortcuts</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* + Add New Plant */}
          <button
            type="button"
            onClick={onOpenAddPlant}
            className="group flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 p-4 text-left transition-all hover:bg-primary/20 hover:border-primary/40 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Plus className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">+ Add New Plant</p>
                <p className="text-[11px] text-muted-foreground">Create catalog item</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </button>

          {/* View Orders */}
          <button
            type="button"
            onClick={() => onNavigate?.("Orders")}
            className="group flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-4 text-left transition-all hover:bg-secondary hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-foreground border border-border">
                <ShoppingCart className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">View Orders</p>
                <p className="text-[11px] text-muted-foreground">{orders.length} total orders</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </button>

          {/* View Payments */}
          <button
            type="button"
            onClick={() => onNavigate?.("Payments")}
            className="group flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-4 text-left transition-all hover:bg-secondary hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-foreground border border-border">
                <CreditCard className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">View Payments</p>
                <p className="text-[11px] text-muted-foreground">{payments.length} transactions</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </button>
        </div>
      </div>

      {/* Clickable Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => onNavigate?.(stat.tab)}
            className="tilt-card group rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 focus:outline-none"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</p>
              <stat.Icon className="size-4 text-primary transition-transform group-hover:scale-110" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
              {stat.change}
            </p>
          </button>
        ))}
      </div>

      {/* Chart + Inventory Health */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">

        {/* Weekly Sales Bar Chart */}
        <div className="tilt-card rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-foreground">Weekly Sales</p>
          <p className="text-xs text-muted-foreground">Plants sold per day</p>
          <div className="mt-6 flex h-44 gap-2">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-lg animate-grow-bar"
                  style={{
                    height: `${(d.sales / maxSales) * 100}%`,
                    background: `linear-gradient(to top, oklch(0.55 0.19 150), oklch(0.78 0.19 150))`,
                    animationDelay: `${i * 70}ms`,
                  }}
                />
                <span className="shrink-0 text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Health */}
        <div
          className="tilt-card rounded-xl border border-border bg-card p-6 cursor-pointer hover:border-primary/30 transition-all"
          onClick={() => onNavigate?.("Inventory")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Inventory Health</p>
              <p className="text-xs text-muted-foreground">Stock levels by category</p>
            </div>
            <span className="text-xs font-semibold text-primary hover:underline">View All →</span>
          </div>
          <div className="mt-6 flex flex-col gap-5">
            {inventoryHealth.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.Icon className="size-3.5 text-primary" />
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary animate-grow-bar-x"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clickable Recent Orders */}
      <div className="tilt-card rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="text-sm font-semibold text-foreground">Recent Orders</p>
          <button
            type="button"
            onClick={() => onNavigate?.("Orders")}
            className="text-xs font-semibold text-primary hover:underline"
          >
            View All Orders →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Plant</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground text-sm">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => onNavigate?.("Orders")}
                    className="border-b border-border/30 last:border-0 transition-colors hover:bg-primary/10 cursor-pointer"
                  >
                    <td className="px-6 py-3 font-semibold text-foreground">#{o.id}</td>
                    <td className="px-6 py-3 text-foreground">{o.plant}</td>
                    <td className="px-6 py-3 text-muted-foreground">{o.customer}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                          statusStyle[o.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {statusLabel[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-foreground">
                      ₹{o.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
