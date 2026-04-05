"use client"

import { useEffect, useState } from "react"

type HealthPayload = {
    ok: boolean
    app: string
    version: string
    timestamp: string
    error?: string
    checks?: {
        database: { status: "ok" | "error" | "skipped"; message?: string }
        env: Record<string, boolean>
        authConfigured: boolean
        aiConfigured: boolean
    }
    hints?: { login: string | null; database: string | null }
}

function Row({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-white/10">
            <div>
                <div className="text-sm font-medium text-white">{label}</div>
                {detail ? <div className="text-xs text-gray-500 mt-1">{detail}</div> : null}
            </div>
            <span className={`text-xs font-mono px-2 py-1 rounded ${ok ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                {ok ? "OK" : "Thiếu / lỗi"}
            </span>
        </div>
    )
}

export default function HealthPage() {
    const [data, setData] = useState<HealthPayload | null>(null)
    const [err, setErr] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/health")
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.json()
            })
            .then(setData)
            .catch(e => setErr(e instanceof Error ? e.message : "Lỗi tải"))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "linear-gradient(165deg, #060C1A 0%, #0d1528 50%, #060C1A 100%)" }}>
            <div className="w-full max-w-lg rounded-2xl border border-white/10 p-8" style={{ background: "rgba(13,21,39,0.85)" }}>
                <h1 className="text-2xl font-bold text-white font-playfair mb-1">System health</h1>
                <p className="text-sm text-gray-400 mb-6">COSPACEX — kiểm tra nhanh trước khi đăng nhập (không hiển thị giá trị bí mật).</p>

                {loading && <p className="text-sm text-gray-400">Đang kiểm tra…</p>}
                {err && <p className="text-sm text-red-400 mb-4">{err}</p>}

                {data && data.checks && (
                    <>
                        <div className="text-xs text-gray-500 font-mono mb-4">
                            {data.app} v{data.version} · {new Date(data.timestamp).toLocaleString()}
                        </div>

                        <div className="rounded-xl border border-white/10 overflow-hidden px-4" style={{ background: "rgba(0,0,0,0.25)" }}>
                            <Row
                                label="PostgreSQL (DATABASE_URL)"
                                ok={data.checks.database.status === "ok"}
                                detail={data.checks.database.status === "error" ? data.checks.database.message : undefined}
                            />
                            <Row label="AUTH_SECRET" ok={data.checks.env.authSecret} />
                            <Row label="Google OAuth (ID + Secret)" ok={data.checks.env.authGoogle} />
                            <Row label="NEXTAUTH_URL" ok={data.checks.env.nextAuthUrl} />
                            <Row label="GEMINI_API_KEY (AI)" ok={data.checks.env.gemini} />
                        </div>

                        <div className="mt-6 space-y-2 text-xs text-gray-400">
                            {data.hints?.database && <p>DB: {data.hints.database}</p>}
                            {data.hints?.login && <p>Đăng nhập: {data.hints.login}</p>}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a href="/login" className="text-sm text-cyan-400 hover:text-cyan-300">→ Đăng nhập</a>
                            <a href="/setup" className="text-sm text-cyan-400 hover:text-cyan-300">→ Hướng dẫn setup</a>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
