// app/api/auth/signout/route.ts
// POST /api/auth/signout
// Signs out the current admin session and redirects to /login.

import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    await supabase.auth.signOut()

    const response = NextResponse.redirect(
      new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    )

    // Clear auth cookies
    response.cookies.delete("sb-access-token")
    response.cookies.delete("sb-refresh-token")

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign out failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
