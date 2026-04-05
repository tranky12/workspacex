import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Edge-compatible middleware — checks for session cookie without importing Prisma
export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Always allow: auth routes, static files, login page
    if (
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/uploads") ||
        pathname === "/login" ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next()
    }

    // Check for NextAuth session cookie (set by NextAuth after Google login)
    const hasSession =
        req.cookies.has("authjs.session-token") ||
        req.cookies.has("__Secure-authjs.session-token") ||
        req.cookies.has("next-auth.session-token") ||
        req.cookies.has("__Secure-next-auth.session-token")

    if (!hasSession) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
}
