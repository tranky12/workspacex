"use client"
import { useState, useEffect } from "react"

type Deal = {
    id: string; title: string; company: string; value: number
    stage: string; industry: string; solution: string; score: number
    notes: string; nextStep: string; meddicData: Record<string, number>
    client?: { name: string }
}

const STAGES = [
    { key: "discovery", label: "Discovery", color: "#3b82f6" },
    { key: "qualified", label: "Qualified", color: "#00d4aa" },
    { key: "proposal", label: "Proposal", color: "#f59e0b" },
    { key: "demo", label: "Demo", color: "#8b5cf6" },
    { key: "negotiation", label: "Negotiation", color: "#f97316" },
    { key: "won", label: "Won ✅", color: "#10b981" },
    { key: "lost", label: "Lost ❌", color: "#ef4444" },
]

const MEDDIC_KEYS = ["metrics", "economicBuyer", "decisionCriteria", "decisionProcess", "identifyPain", "champion"]
const MEDDIC_LABELS: Record<string, string> = {
    metrics: "Metrics", economicBuyer: "Economic Buyer", decisionCriteria: "Decision Criteria",
    decisionProcess: "Decision Process", identifyPain: "Identify Pain", champion: "Champion",
}

const SOLUTIONS = ["TMS", "WMS", "OMS", "Planning", "TMS+WMS", "WMS+OMS", "Full Suite"]

export default function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([])
    const [view, setView] = useState<"kanban" | "list">("kanban")
    const [selected, setSelected] = useState<Deal | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: "", company: "", value: "", stage: "discovery", industry: "", solution: "", notes: "", nextStep: "" })
    const [saving, setSaving] = useState(false)
    const [meddicScores, setMeddicScores] = useState<Record<string, number>>({})
    const [slackSent, setSlackSent] = useState(false)

    useEffect(() => { loadDeals() }, [])

    async function loadDeals() {
        const res = await fetch("/api/deals")
        const data = await res.json()
        setDeals(data.deals || [])
    }

    async function saveDeal() {
        setSaving(true)
        const method = "POST"
        const res = await fetch("/api/deals", {
            method, headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, meddicData: meddicScores }),
        })
        const data = await res.json()
        if (!data.error) { loadDeals(); setShowForm(false); setForm({ title: "", company: "", value: "", stage: "discovery", industry: "", solution: "", notes: "", nextStep: "" }) }
        setSaving(false)
    }

    async function updateDealStage(dealId: string, newStage: string) {
        await fetch(`/api/deals/${dealId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stage: newStage }),
        })
        loadDeals()
    }

    async function updateMeddic(dealId: string, scores: Record<string, number>) {
        const total = Object.values(scores).reduce((a, b) => a + b, 0)
        const score = Math.round((total / (MEDDIC_KEYS.length * 3)) * 100)
        await fetch(`/api/deals/${dealId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ meddicData: scores, score }),
        })
        loadDeals()
    }

    async function notifySlack(deal: Deal) {
        const res = await fetch("/api/integrations/slack/notify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dealId: deal.id, event: deal.stage }),
        })
        const data = await res.json()
        if (!data.error) setSlackSent(true)
        setTimeout(() => setSlackSent(false), 3000)
    }

    async function createJiraTicket(deal: Deal) {
        const res = await fetch("/api/integrations/jira/create", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dealId: deal.id }),
        })
        const data = await res.json()
        if (data.ticketUrl) window.open(data.ticketUrl, "_blank")
    }

    function getMeddicScore(deal: Deal) {
        const scores = deal.meddicData || {}
        const total = MEDDIC_KEYS.reduce((a, k) => a + (scores[k] || 0), 0)
        return Math.round((total / (MEDDIC_KEYS.length * 3)) * 100)
    }

    const fieldInput = (label: string, k: keyof typeof form, ph = "") => (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</label>
            <input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={ph}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
        </div>
    )

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-playfair mb-1">Deal Qualifier</h1>
                    <p className="text-gray-400 text-sm">MEDDIC scoring, pipeline tracking & deal management.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setView(v => v === "kanban" ? "list" : "kanban")}
                        className="px-4 py-2 rounded-xl text-sm border text-gray-300"
                        style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                        {view === "kanban" ? "📋 List" : "📊 Kanban"}
                    </button>
                    <button onClick={() => setShowForm(!showForm)}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black"
                        style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 4px 15px rgba(0,212,170,0.3)" }}>
                        + New Deal
                    </button>
                </div>
            </div>

            {/* New Deal Form */}
            {showForm && (
                <div className="rounded-2xl border p-6 mb-6" style={{ background: "rgba(13,21,39,0.8)", borderColor: "rgba(0,212,170,0.2)" }}>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4">New Deal</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {fieldInput("Deal Title *", "title", "e.g. TMS Implementation — Vingroup")}
                        {fieldInput("Company *", "company", "e.g. Vingroup Logistics")}
                        {fieldInput("Deal Value (USD)", "value", "e.g. 850000")}
                        {fieldInput("Industry", "industry", "e.g. Retail / FMCG / 3PL")}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Stage</label>
                            <select value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}
                                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                                {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Solution</label>
                            <select value={form.solution} onChange={e => setForm(p => ({ ...p, solution: e.target.value }))}
                                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                                <option value="">Select solution...</option>
                                {SOLUTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        {fieldInput("Notes", "notes", "Key context...")}
                        {fieldInput("Next Step", "nextStep", "e.g. Schedule exec sponsor meeting")}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={saveDeal} disabled={saving}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-40"
                            style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)" }}>
                            {saving ? "Saving..." : "✅ Create Deal"}
                        </button>
                        <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border"
                            style={{ borderColor: "rgba(255,255,255,0.1)" }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Kanban View */}
            {view === "kanban" && (
                <div className="overflow-x-auto">
                    <div className="flex gap-4 pb-4" style={{ minWidth: "1200px" }}>
                        {STAGES.map(stage => {
                            const stageDeals = deals.filter(d => d.stage === stage.key)
                            const stageValue = stageDeals.reduce((a, d) => a + (d.value || 0), 0)
                            return (
                                <div key={stage.key} className="flex-1 min-w-[160px]">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: stage.color }}>{stage.label}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">{stageDeals.length} deals · ${(stageValue / 1000).toFixed(0)}K</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {stageDeals.map(deal => (
                                            <div key={deal.id} onClick={() => setSelected(deal === selected ? null : deal)}
                                                className="rounded-xl p-3 cursor-pointer border transition-all hover:scale-[1.01]"
                                                style={{
                                                    background: selected?.id === deal.id ? `${stage.color}18` : "rgba(13,21,39,0.8)",
                                                    borderColor: selected?.id === deal.id ? `${stage.color}60` : "rgba(255,255,255,0.07)",
                                                }}>
                                                <div className="text-xs font-bold text-white mb-1 truncate">{deal.company}</div>
                                                <div className="text-[10px] text-gray-400 truncate mb-2">{deal.solution || "TBD"}</div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs font-bold" style={{ color: "#f59e0b" }}>${(deal.value / 1000).toFixed(0)}K</div>
                                                    <div className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{
                                                        background: deal.score >= 70 ? "rgba(16,185,129,0.2)" : deal.score >= 40 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)",
                                                        color: deal.score >= 70 ? "#10b981" : deal.score >= 40 ? "#f59e0b" : "#ef4444",
                                                    }}>{deal.score}%</div>
                                                </div>
                                            </div>
                                        ))}
                                        {stageDeals.length === 0 && (
                                            <div className="text-center py-4 rounded-xl border-dashed border text-gray-600 text-xs"
                                                style={{ borderColor: "rgba(255,255,255,0.08)" }}>Empty</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Selected Deal MEDDIC Panel */}
            {selected && (
                <div className="mt-6 rounded-2xl border p-6" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)" }}>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-bold text-white">{selected.title}</h2>
                            <p className="text-sm text-gray-400">{selected.company} · {selected.solution} · ${(selected.value / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="flex gap-2">
                            <select value={selected.stage} onChange={e => updateDealStage(selected.id, e.target.value)}
                                className="text-xs rounded-lg px-3 py-1.5 border outline-none text-white"
                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                                {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>
                            <button onClick={() => notifySlack(selected)}
                                className="text-xs px-3 py-1.5 rounded-lg border text-purple-400 transition-all"
                                style={{ borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)" }}>
                                {slackSent ? "✅ Sent!" : "💬 Slack"}
                            </button>
                            <button onClick={() => createJiraTicket(selected)}
                                className="text-xs px-3 py-1.5 rounded-lg border text-blue-400"
                                style={{ borderColor: "rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.08)" }}>
                                🎫 Jira
                            </button>
                        </div>
                    </div>

                    {/* MEDDIC Scorecard */}
                    <div className="grid grid-cols-3 gap-4 mb-5">
                        {MEDDIC_KEYS.map(key => {
                            const currentScore = selected.meddicData?.[key] ?? 0
                            return (
                                <div key={key} className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                                    <div className="text-xs font-semibold text-gray-400 mb-3">{MEDDIC_LABELS[key]}</div>
                                    <div className="flex gap-2">
                                        {[0, 1, 2, 3].map(score => (
                                            <button key={score} onClick={() => {
                                                const newScores = { ...selected.meddicData, [key]: score }
                                                updateMeddic(selected.id, newScores)
                                            }}
                                                className="w-8 h-8 rounded-lg text-xs font-bold border transition-all hover:scale-105"
                                                style={{
                                                    background: currentScore === score ? score === 0 ? "rgba(239,68,68,0.3)" : score === 1 ? "rgba(245,158,11,0.3)" : score === 2 ? "rgba(59,130,246,0.3)" : "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.04)",
                                                    borderColor: currentScore === score ? score === 0 ? "#ef4444" : score === 1 ? "#f59e0b" : score === 2 ? "#3b82f6" : "#10b981" : "rgba(255,255,255,0.1)",
                                                    color: currentScore === score ? "white" : "rgba(136,146,164,1)",
                                                }}>
                                                {score}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Score Bar */}
                    <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-white">MEDDIC Score</span>
                            <span className="text-2xl font-black" style={{ color: selected.score >= 70 ? "#10b981" : selected.score >= 40 ? "#f59e0b" : "#ef4444" }}>
                                {selected.score}/100
                            </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-full rounded-full transition-all" style={{
                                width: `${selected.score}%`,
                                background: selected.score >= 70 ? "linear-gradient(90deg,#10b981,#00d4aa)" : selected.score >= 40 ? "linear-gradient(90deg,#f59e0b,#f97316)" : "linear-gradient(90deg,#ef4444,#dc2626)",
                            }} />
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                            {selected.score >= 70 ? "✅ Strong deal — ready to advance" : selected.score >= 40 ? "⚠️ Moderate — address gaps before proposal" : "❌ Weak — needs significant qualification"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
