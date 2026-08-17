"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong!</h2>
        <p className="text-xs text-muted-foreground mb-6">
          {error.message || "An unexpected error occurred while rendering the page."}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
        >
          <RefreshCw className="size-4" />
          Try Again
        </button>
      </div>
    </div>
  )
}
