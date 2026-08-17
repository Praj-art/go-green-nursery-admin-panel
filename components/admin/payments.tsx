"use client"

import { Fragment, useState } from "react"
import { Download, Search, RefreshCw } from "lucide-react"
import type { Payment } from "./data"

const payBadge: Record<string, string> = {
  Paid: "bg-primary/15 text-primary",
  Pending: "bg-accent/20 text-accent",
  Failed: "bg-destructive/15 text-destructive",
  Refunded: "bg-muted text-muted-foreground",
}

export function Payments({
  payments,
  onRefund,
}: {
  payments: Payment[]
  onRefund?: (id: string, refundStatus: "Initiated" | "Completed") => void
}) {
  const [filter, setFilter] = useState<"All" | "Failed">("All")
  const [search, setSearch] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)

  const list = payments.filter((p) => {
    const matchesFilter = filter === "All" || p.status === "Failed"
    const matchesSearch =
      p.txnId.toLowerCase().includes(search.toLowerCase()) ||
      p.orderId.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Txn ID,Order ID,Customer,Amount (INR),Method,Status,Refund Status,Date"]
    const rows = payments.map(
      (p) => `"${p.txnId}","${p.orderId}","${p.customer}",${p.amount},"${p.method}","${p.status}","${p.refund ?? "None"}","${p.date}"`
    )
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `gogreen_payments_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRefundClick = async (p: Payment) => {
    const nextState = p.refund === "Initiated" ? "Completed" : "Initiated"
    if (!confirm(`Are you sure you want to set refund status to '${nextState}' for transaction ${p.txnId}?`)) return

    try {
      await fetch(`/api/payments/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refund: nextState, status: nextState === "Completed" ? "Refunded" : p.status }),
      })
      if (onRefund) onRefund(p.id, nextState)
    } catch (err) {
      console.error("Failed to update refund", err)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "Failed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-secondary text-foreground hover:bg-primary/20"
              }`}
            >
              {f === "All" ? "All Payments" : "Failed Payments"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Txn ID, Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-60 rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Download className="size-3.5 text-primary" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Payment List Table */}
      <div className="tilt-card overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-4">Transaction ID</th>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment Status</th>
              <th className="p-4">Refund Status</th>
              <th className="p-4"><span className="sr-only">Details</span></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <Fragment key={p.id}>
                <tr className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                  {/* Transaction ID */}
                  <td className="p-4 font-mono text-xs text-foreground">{p.txnId}</td>
                  <td className="p-4 text-muted-foreground">{p.orderId}</td>
                  {/* Customer */}
                  <td className="p-4 text-foreground">{p.customer}</td>
                  {/* Amount */}
                  <td className="p-4 font-semibold text-foreground">{"Rs. "}{p.amount}</td>
                  {/* Payment Status */}
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${payBadge[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  {/* Refund Status */}
                  <td className="p-4 text-xs">
                    {p.refund && p.refund !== "None" ? (
                      <span className="rounded-full bg-amber-500/15 text-amber-500 px-2.5 py-0.5 font-medium">
                        {p.refund}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  {/* Details Toggle */}
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => setOpenId(openId === p.id ? null : p.id)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {openId === p.id ? "Hide" : "Details"}
                    </button>
                  </td>
                </tr>

                {/* Expanded Payment Details */}
                {openId === p.id && (
                  <tr className="border-b border-border/50 bg-secondary/40">
                    <td colSpan={7} className="p-4 text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-4">
                          <span>Payment ID: <span className="text-foreground font-semibold">{p.id}</span></span>
                          <span>Method: <span className="text-foreground font-semibold">{p.method}</span></span>
                          <span>Date: <span className="text-foreground font-semibold">{p.date}</span></span>
                          <span>Refund Status: <span className="text-foreground font-semibold">{p.refund ?? "None"}</span></span>
                        </div>

                        {/* Interactive Refund Action where applicable */}
                        {(p.status === "Paid" || p.refund === "Initiated") && (
                          <button
                            type="button"
                            onClick={() => handleRefundClick(p)}
                            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500 transition-colors hover:bg-amber-500/20"
                          >
                            <RefreshCw className="size-3 animate-spin-slow" />
                            {p.refund === "Initiated" ? "Complete Refund" : "Initiate Refund"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
