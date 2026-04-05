import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import pkg from "../../../../package.json"

export const dynamic = "force-dynamic"

/**
 * Kiểm tra sức khỏe runtime: DB, biến môi trường (chỉ có/không — không trả giá trị secret).
 * Public để dùng trước khi đăng nhập (desktop / troubleshooting).
 */
export async function GET() {
    const hasDbUrl = !!process.env.DATABASE_URL?.trim()
    const envFlags = {
        databaseUrl: hasDbUrl,
        authSecret: !!process.env.AUTH_SECRET?.trim(),
        authGoogle: !!(process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim()),
        nextAuthUrl: !!process.env.NEXTAUTH_URL?.trim(),
        gemini: !!process.env.GEMINI_API_KEY?.trim(),
    }

    let database: { status: "ok" | "error" | "skipped"; message?: string } = { status: "skipped", message: "DATABASE_URL chưa cấu hình" }

    if (hasDbUrl) {
        try {
            await prisma.$queryRaw`SELECT 1`
            database = { status: "ok" }
        } catch (e) {
            database = {
                status: "error",
                message: e instanceof Error ? e.message : "Không kết nối được PostgreSQL",
            }
        }
    }

    const authReady = envFlags.authSecret && envFlags.authGoogle && envFlags.nextAuthUrl
    const ok = database.status !== "error"

    return NextResponse.json({
        ok,
        app: pkg.name,
        version: pkg.version,
        timestamp: new Date().toISOString(),
        checks: {
            database,
            env: envFlags,
            authConfigured: authReady,
            aiConfigured: envFlags.gemini,
        },
        hints: {
            login: authReady ? null : "Cần AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, NEXTAUTH_URL trong .env",
            database: database.status === "ok" ? null : database.message || "Kiểm tra DATABASE_URL và mạng tới Postgres",
        },
    })
}
