"use client"
import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"

type Report = { id: string; title: string; weekStart: string; createdAt: string; data: Record<string, number> }

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [activeReport, setActiveReport] = useState<{ id: string; title: string; content: string } | null>(null)
    const [generating, setGenerating] = useState(false)
    const [generated, setGenerated] = useState<string | null>(null)

    useEffect(() => { loadReports() }, [])

    async function loadReports() {
        const res = await fetch("/api/reports/weekly")
        const data = await res.json()
        setReports(data.reports || [])
    }

    async function generateReport() {
        setGenerating(true)
        setGenerated(null)
        try {
            const res = await fetch("/api/reports/weekly", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ weekStart: getThisMonday() }),
            })
            const data = await res.json()
            if (data.report) {
                setGenerated(data.report.content)
                setActiveReport(data.report)
                loadReports()
            }
        } catch (err) { console.error(err) }
        setGenerating(false)
    }

    function getThisMonday(): string {
        const d = new Date()
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1)
        d.setDate(diff); d.setHours(0, 0, 0, 0)
        return d.toISOString()
    }

    function exportPDF() {
        if (!activeReport) return
        const content = document.getElementById("report-content")!
        const printWindow = window.open("", "_blank")
        if (!printWindow) return
        printWindow.document.write(`<html><head><title>${activeReport.title}</title><style>
      body { font-family: 'Calibri', sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
      h1, h2, h3 { color: #060c1a; } h2 { border-bottom: 2px solid #00d4aa; padding-bottom: 8px; }
      ul { line-height: 1.8; } strong { color: #3b82f6; }
    </style></head><body>${content.innerHTML}</body></html>`)
        printWindow.document.close()
        printWindow.print()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-playfair mb-1">Báo Cáo BOD</h1>
                    <p className="text-gray-400 text-sm">Tổng hợp tuần cho Ban Giám Đốc · AI-powered · Tiếng Việt</p>
                </div>
                <div className="flex gap-2">
                    {activeReport && (
                        <button onClick={exportPDF}
                            className="px-4 py-2.5 rounded-xl text-sm border text-gray-300"
                            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                            📄 Export PDF
                        </button>
                    )}
                    <button onClick={generateReport} disabled={generating}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 4px 15px rgba(0,212,170,0.3)" }}>
                        {generating ? "✨ Đang tạo báo cáo..." : "✨ Tạo Báo Cáo Tuần"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-5">
                {/* Sidebar — past reports */}
                <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold px-1 mb-3">Báo cáo trước</p>
                    {reports.length === 0 && <p className="text-xs text-gray-600 px-1">Chưa có báo cáo nào</p>}
                    {reports.map(report => (
                        <button key={report.id} onClick={async () => {
                            const res = await fetch(`/api/reports/weekly?id=${report.id}`)
                            // For now, just show the selected report title in UI
                            setActiveReport({ id: report.id, title: report.title, content: "" })
                        }}
                            className="w-full text-left rounded-xl border p-3 transition-all"
                            style={{
                                background: activeReport?.id === report.id ? "rgba(0,212,170,0.08)" : "rgba(13,21,39,0.7)",
                                borderColor: activeReport?.id === report.id ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.07)",
                            }}>
                            <div className="text-xs font-bold text-white mb-1">📊 {report.title}</div>
                            <div className="text-[10px] text-gray-500">{new Date(report.createdAt).toLocaleDateString("vi-VN")}</div>
                            {report.data && (
                                <div className="flex gap-3 mt-2">
                                    {[["Pipeline", `$${((report.data.pipelineValue || 0) / 1000).toFixed(0)}K`],
                                    ["Tasks", String(report.data.tasksDone || 0) + "/" + String(report.data.tasksTotal || 0)]].map(([k, v]) => (
                                        <div key={k} className="text-[9px]">
                                            <span className="text-gray-600">{k}: </span>
                                            <span className="text-cyan-400">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main content area */}
                <div className="col-span-3">
                    {!generated && !generating && (
                        <div className="flex flex-col items-center justify-center rounded-2xl border h-96"
                            style={{ background: "rgba(13,21,39,0.5)", borderColor: "rgba(255,255,255,0.06)" }}>
                            <div className="text-5xl mb-4">📊</div>
                            <p className="text-white font-bold mb-2">Báo Cáo Tuần Cho BOD</p>
                            <p className="text-gray-400 text-sm text-center max-w-sm mb-5">
                                Nhấn &quot;Tạo Báo Cáo Tuần&quot; để AI tổng hợp deals, projects, tasks, knowledge base thành báo cáo tiếng Việt chuyên nghiệp cho Ban Giám Đốc.
                            </p>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                {[["📈", "Pipeline", "Deals & giá trị"], ["📋", "Projects", "Tiến độ dự án"], ["💡", "Insights", "Rủi ro & đề xuất"]].map(([icon, name, desc]) => (
                                    <div key={name} className="rounded-xl p-3 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                                        <div className="text-xl mb-1">{icon}</div>
                                        <div className="text-xs font-bold text-white">{name}</div>
                                        <div className="text-[10px] text-gray-500">{desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {generating && (
                        <div className="flex flex-col items-center justify-center rounded-2xl border h-96"
                            style={{ background: "rgba(13,21,39,0.5)", borderColor: "rgba(0,212,170,0.1)" }}>
                            <div className="flex gap-2 mb-4">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-2 h-2 rounded-full" style={{
                                        background: "#00d4aa", animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite`,
                                    }} />
                                ))}
                            </div>
                            <p className="text-white font-bold">Đang tổng hợp dữ liệu tuần...</p>
                            <p className="text-gray-400 text-sm mt-2">Gemini đang phân tích deals, projects, tasks và tạo báo cáo</p>
                        </div>
                    )}

                    {generated && (
                        <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)" }}>
                            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
                                <span className="text-sm font-bold text-white">📊 {activeReport?.title}</span>
                                <span className="text-xs text-cyan-400 px-2 py-1 rounded" style={{ background: "rgba(0,212,170,0.1)" }}>AI Generated · Tiếng Việt</span>
                            </div>
                            <div id="report-content" className="p-8 overflow-y-auto" style={{ maxHeight: "calc(100vh - 350px)" }}>
                                <div className="prose prose-invert prose-sm max-w-none
                  prose-h1:text-2xl prose-h1:font-black prose-h1:text-white prose-h1:mb-4
                  prose-h2:text-base prose-h2:font-bold prose-h2:text-cyan-400 prose-h2:border-b prose-h2:border-cyan-900 prose-h2:pb-2 prose-h2:mt-8
                  prose-h3:text-sm prose-h3:font-semibold prose-h3:text-gray-200
                  prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-li:text-gray-300 prose-li:leading-relaxed
                  prose-strong:text-white">
                                    <ReactMarkdown>{generated}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
