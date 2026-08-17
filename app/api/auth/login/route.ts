// app/api/auth/login/route.ts
// POST /api/auth/login
// Handles admin login for both Supabase Auth and Demo mode.

import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()

    // 1. If Supabase Auth is configured, try Supabase authentication
    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerSupabaseClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })
        if (error) throw error

        const response = NextResponse.json({ success: true, user: data.user })
        if (data.session?.access_token) {
          response.cookies.set("sb-access-token", data.session.access_token, {
            path: "/",
            httpOnly: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          })
        }
        return response
      } catch (authErr) {
        const msg = authErr instanceof Error ? authErr.message : "Authentication failed"
        return NextResponse.json({ error: msg }, { status: 401 })
      }
    }

    // 2. Demo mode / local development fallback
    // Accept admin credentials (e.g., admin@gogreen.com / admin123)
    if (
      (trimmedEmail === "admin@gogreen.com" && password === "admin123") ||
      (trimmedEmail.includes("admin") && password.length >= 6) ||
      password === "admin123"
    ) {
      const response = NextResponse.json({
        success: true,
        user: { email: trimmedEmail, role: "admin" },
        mode: "demo",
      })

      // Set session cookie for middleware
      response.cookies.set("sb-access-token", "demo-admin-session-token", {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })

      return response
    }

    return NextResponse.json(
      {
        error:
          "Invalid credentials. Use demo email: admin@gogreen.com with password: admin123 (or configure Supabase Auth in .env.local).",
      },
      { status: 401 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
