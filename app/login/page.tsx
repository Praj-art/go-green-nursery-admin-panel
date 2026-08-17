"use client"

import { useState, Suspense } from "react"
import { Leaf, Eye, EyeOff, Loader2, KeyRound } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"

  const [email, setEmail] = useState("admin@gogreen.com")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? "Invalid credentials")
      }

      router.push(next)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail("admin@gogreen.com")
    setPassword("admin123")
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/20">
      {/* Demo Credentials Pill */}
      <button
        type="button"
        onClick={fillDemo}
        className="mb-5 flex w-full items-center justify-between rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-2.5 text-left text-xs text-primary transition-colors hover:bg-primary/15"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 shrink-0" />
          <span>
            Demo: <strong>admin@gogreen.com</strong> / <strong>admin123</strong>
          </span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider underline">Auto-fill</span>
      </button>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {/* Error alert */}
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gogreen.com"
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 10%, oklch(0.55 0.19 150 / 0.35), transparent)",
        }}
      />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="animate-sway flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-lg shadow-primary/20">
            <Leaf className="size-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">GoGreen Nursery</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Dashboard — Sign In</p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-card">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          🌿 GoGreen Nursery Admin · Secured with Supabase / Admin Auth
        </p>
      </div>
    </div>
  )
}
