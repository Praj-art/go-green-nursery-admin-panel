// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Public paths that do not require authentication
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/webhooks/razorpay",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files and internal Next.js routes
  const isStaticOrInternal =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")

  if (isStaticOrInternal) return NextResponse.next()

  // Allow public endpoints
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL
  const projectRef = urlEnv && urlEnv.includes("//") ? urlEnv.split("//")[1]?.split(".")[0] : null
  const supabaseCookieName = projectRef ? `sb-${projectRef}-auth-token` : null

  const accessToken =
    request.cookies.get("sb-access-token")?.value ??
    request.cookies.get("admin-session")?.value ??
    (supabaseCookieName ? request.cookies.get(supabaseCookieName)?.value : undefined)

  if (!accessToken) {
    // For API requests, return 401 JSON instead of redirecting to HTML page
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
