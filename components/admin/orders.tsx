"use client"

import { useState } from "react"
import { Printer, Download, Search } from "lucide-react"
import type { Order, OrderStatus } from "./data"

const statusBadge: Record<OrderStatus, string> = {
  Pending: "bg-accent/20 text-accent",
  Accepted: "bg-primary/15 text-primary",
  Preparing: "bg-amber-500/20 text-amber-400",
  Packed: "bg-primary/25 text-primary",
  Cancelled: "bg-muted text-muted-foreground",
  Failed: "bg-destructive/15 text-destructive",
}

const payBadge: Record<string, string> = {
  Paid: "bg-primary/15 text-primary",
  Pending: "bg-accent/20 text-accent",
  Failed: "bg-destructive/15 text-destructive",
  Refunded: "bg-muted text-muted-foreground",
}

const actions: { label: string; to: OrderStatus }[] = [
  { label: "Accept Order", to: "Accepted" },
  { label: "Preparing", to: "Preparing" },
  { label: "Packed", to: "Packed" },
  { label: "Cancelled", to: "Cancelled" },
  { label: "Failed", to: "Failed" },
]

export function Orders({
  orders,
  onStatus,
}: {
  orders: Order[]
  onStatus: (id: string, status: OrderStatus) => void
}) {
  const [openId, setOpenId] = useState<string | null>(orders[0]?.id ?? null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")

  const statuses = ["All", "Pending", "Accepted", "Preparing", "Packed", "Cancelled", "Failed"]

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.toLowerCase().includes(search.toLowerCase()) ||
      o.address.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "All" || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Order ID,Customer,Phone,Address,Items,Payment Status,Order Status,Date"]
    const rows = orders.map((o) => {
      const itemNames = o.items.map((i) => `${i.name} (${i.qty})`).join("; ")
      return `"${o.id}","${o.customer}","${o.phone}","${o.address}","${itemNames}","${o.payStatus}","${o.status}","${o.date}"`
    })
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `gogreen_orders_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print Invoice window handler
  const handlePrintInvoice = (order: Order) => {
    const total = order.items.reduce((s, i) => s + i.qty * i.price, 0)
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>GoGreen Nursery — Order Receipt #${order.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 32px; color: #111; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 16px; margin-bottom: 24px; }
            .header h1 { color: #15803d; margin: 0 0 4px 0; font-size: 24px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 14px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .total { font-weight: bold; font-size: 16px; text-align: right; padding-top: 12px; }
            .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌿 GoGreen Nursery</h1>
            <p>Official Delivery Receipt & Packing Slip</p>
          </div>
          <div class="meta">
            <div>
              <strong>Order ID:</strong> ${order.id}<br/>
              <strong>Date:</strong> ${order.date}<br/>
              <strong>Status:</strong> ${order.status}
            </div>
            <div style="text-align: right;">
              <strong>Payment:</strong> ${order.payStatus}
            </div>
          </div>
          <div class="box">
            <strong>Customer Details</strong><br/>
            Name: ${order.customer}<br/>
            Phone: ${order.phone}<br/>
            Address: ${order.address}
          </div>
          <h3>Ordered Plants</h3>
          <table>
            <thead>
              <tr>
                <th>Plant</th>
                <th>Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (i) => `
                <tr>
                  <td>${i.name}</td>
                  <td>${i.qty}</td>
                  <td style="text-align: right;">Rs. ${i.qty * i.price}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">Grand Total: Rs. ${total}</div>
          <div class="footer">Thank you for growing with GoGreen Nursery! 🌿</div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search order ID, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Export */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors self-start sm:self-auto"
        >
          <Download className="size-3.5 text-primary" />
          Export Orders CSV
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === st
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-secondary text-foreground hover:bg-primary/20"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        {filteredOrders.map((o) => {
          const total = o.items.reduce((s, i) => s + i.qty * i.price, 0)
          const open = openId === o.id
          return (
            <div key={o.id} className="tilt-card rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : o.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
                aria-expanded={open}
              >
                <div>
                  <div className="font-semibold text-foreground">{o.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.customer} · {o.date}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${payBadge[o.payStatus]}`}>
                    {o.payStatus}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge[o.status]}`}>
                    {o.status}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{"Rs. "}{total}</span>
                </div>
              </button>

              {open && (
                <div className="border-t border-border/50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Customer Details
                      </h4>
                      <p className="text-sm text-foreground">{o.customer}</p>
                      <p className="text-sm text-muted-foreground">{o.phone}</p>
                      <p className="text-sm text-muted-foreground">{o.address}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Order Items
                      </h4>
                      {o.items.map((it) => (
                        <div key={it.name} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {it.name} x{it.qty}
                          </span>
                          <span className="text-muted-foreground">{"Rs. "}{it.qty * it.price}</span>
                        </div>
                      ))}
                      <div className="mt-1 flex justify-between border-t border-border/50 pt-1 text-sm font-semibold text-foreground">
                        <span>Total</span>
                        <span>{"Rs. "}{total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/50 pt-4">
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Order Status Management
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {actions.map((a) => (
                          <button
                            key={a.to}
                            type="button"
                            onClick={() => onStatus(o.id, a.to)}
                            disabled={o.status === a.to}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              o.status === a.to
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-secondary text-foreground hover:bg-primary/20"
                            }`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Print Invoice Button */}
                    <button
                      type="button"
                      onClick={() => handlePrintInvoice(o)}
                      className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors self-start sm:self-end"
                    >
                      <Printer className="size-3.5" />
                      Print Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredOrders.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
            No orders found.
          </div>
        )}
      </div>
    </div>
  )
}
