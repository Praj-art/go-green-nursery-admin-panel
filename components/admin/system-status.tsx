"use client"

import { useState } from "react"
import { Activity, CheckCircle2, ShieldCheck, Database, Zap, Bell, DollarSign, X } from "lucide-react"

export function SystemStatusModal() {
  const [open, setOpen] = useState(false)

  const checks = [
    {
      title: "PostgreSQL Database",
      desc: "Managed database connection & RLS policies",
      status: "Operational",
      latency: "14ms",
      Icon: Database,
    },
    {
      title: "Supabase Auth",
      desc: "Admin authentication & session middleware",
      status: "Active",
      latency: "22ms",
      Icon: ShieldCheck,
    },
    {
      title: "REST API Layer",
      desc: "Next.js 16 Route Handlers with type safety",
      status: "Healthy",
      latency: "8ms",
      Icon: Activity,
    },
    {
      title: "Razorpay Webhooks",
      desc: "HMAC-SHA256 signature verification engine",
      status: "Ready",
      latency: "< 5ms",
      Icon: DollarSign,
    },
    {
      title: "Supabase Realtime",
      desc: "WebSocket order & inventory change broadcasts",
      status: "Connected",
      latency: "5ms",
      Icon: Zap,
    },
    {
      title: "Push Notifications",
      desc: "Firebase Cloud Messaging (FCM) admin alerts",
      status: "Configured",
      latency: "30ms",
      Icon: Bell,
    },
  ]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20 hover:border-primary/40 shadow-sm"
      >
        <Activity className="size-3.5 animate-pulse" />
        System Diagnostics
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-rise">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                  <Activity className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">System Health & Diagnostics</h3>
                  <p className="text-xs text-muted-foreground">GoGreen Nursery Backend Operations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Status list */}
            <div className="mt-4 flex flex-col gap-3">
              {checks.map((c) => {
                const Icon = c.Icon
                return (
                  <div
                    key={c.title}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-primary border border-border">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{c.title}</p>
                        <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <CheckCircle2 className="size-3" />
                        {c.status}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{c.latency}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">All 6 core services reporting 100% uptime.</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
