"use client"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

const TEMPLATES = {
    TMS: [
        { title: "Executive Summary", content: "- Transportation cost reduction opportunity: 15-25%\n- Real-time shipment visibility across all carriers\n- AI-powered route optimization for last-mile delivery\n- Estimated ROI: 18 months payback period", tag: "OVERVIEW", speakerNotes: "Open with the key financial case. This slide should make the CFO lean forward." },
        { title: "Current Transportation Challenges", content: "- Manual process: 3+ hours/day per planner for load building\n- No real-time carrier tracking → customer complaint rate 12%\n- Inbound not analyzed → empty miles at 34%\n- 6 different carrier systems, no unified view", tag: "SITUATION" },
        { title: "TMS Solution Architecture", content: "- Carrier management & tendering engine\n- AI route optimization (truck, air, sea, rail)\n- Real-time tracking & customer notifications\n- Freight audit & payment automation\n- Analytics dashboard & KPI reporting", tag: "SOLUTION" },
        { title: "Implementation Approach", content: "**Phase 1** (Month 1-2): Carrier onboarding, core TMS\n**Phase 2** (Month 3-4): Route optimization, tracking\n**Phase 3** (Month 5-6): Analytics, full go-live\n- Change management & training included", tag: "IMPLEMENTATION" },
        { title: "Business Case & ROI", content: "- Transport cost savings: $180K/year\n- Planner productivity: +40% (2.5 FTE freed)\n- Customer satisfaction: +25 NPS points\n**Total 3-year value: $750,000**\n**Payback: 18 months**", tag: "ROI" },
        { title: "Why Smartlog", content: "- 50+ TMS implementations in Vietnam\n- Deep carrier relationships: 200+ carriers integrated\n- 24/7 local support team\n- Reference: Big C Vietnam, DHL, Grab Logistics", tag: "WHY US" },
        { title: "Next Steps", content: "1. Sign NDA and receive data template\n2. 2-week discovery workshop\n3. Proof of concept (4 routes)\n4. Commercial proposal delivery\n**Target go-live: Q3 2026**", tag: "ACTION" },
    ],
    WMS: [
        { title: "Executive Summary", content: "- Warehouse efficiency improvement: 30-45%\n- Inventory accuracy: 99%+ (from current 82%)\n- Order fulfillment speed: same-day for 95% orders\n- Payback: 12-18 months", tag: "OVERVIEW", speakerNotes: "Lead with the inventory accuracy number — every warehouse manager knows the pain." },
        { title: "Current Warehouse Pain Points", content: "- Inventory shrinkage: 2.3% annually ($450K loss)\n- Pick error rate: 4.2% → returns cost $180K/year\n- Manual receiving: 45 min/pallet (target: 15 min)\n- No real-time location tracking", tag: "SITUATION" },
        { title: "WMS Solution Overview", content: "- Receiving & putaway optimization\n- RF/voice-directed picking\n- Real-time inventory tracking (RFID optional)\n- Labor management & incentive system\n- Multi-DC, multi-client support", tag: "SOLUTION" },
        { title: "Go-Live Plan", content: "**Month 1**: System config, data migration\n**Month 2**: Integration (ERP, TMS, OMS)\n**Month 3**: Parallel run, staff training\n**Month 4**: Go-live DC1\n**Month 5-6**: Rollout remaining DCs", tag: "PLAN" },
        { title: "ROI Summary", content: "- Inventory shrinkage reduction: $350K/year\n- Pick error reduction: $150K/year\n- Labor efficiency: $200K/year\n**Total annual benefit: $700,000**\n**3-year NPV: $1.8M**", tag: "ROI" },
        { title: "Next Steps", content: "1. Site visit and process mapping\n2. System demo with your data\n3. Pilot scope agreement\n4. Commercial proposal\n**Decision target: May 2026**", tag: "ACTION" },
    ],
    OMS: [
        { title: "Executive Summary", content: "- Omnichannel order orchestration\n- Inventory promise accuracy: 99.5%\n- Order processing time: <5 seconds\n- Customer satisfaction: +30 NPS", tag: "OVERVIEW" },
        { title: "Order Management Challenges", content: "- 5 order channels not synchronized → overselling 8%/month\n- Manual allocation: 2 hours/day per CSR\n- No unified inventory visibility across channels\n- Returns processing: 7 days average (target: 1 day)", tag: "SITUATION" },
        { title: "OMS Solution", content: "- Unified order hub: web, app, store, B2B, marketplace\n- Real-time inventory promise engine\n- Intelligent sourcing rules & auto-routing\n- Customer notification automation\n- Returns & exchange orchestration", tag: "SOLUTION" },
        { title: "Business Impact", content: "- Revenue recovery from oversell: $240K/year\n- CSR productivity: +60%\n- Customer CSAT: +35%\n**3-year total value: $1.2M**", tag: "ROI" },
        { title: "Next Steps", content: "1. Technical discovery (2 weeks)\n2. Integration assessment (ERP, ecommerce)\n3. Pilot with 2 channels\n4. Full rollout\n**Go-live: Q4 2026**", tag: "ACTION" },
    ],
    Planning: [
        { title: "Executive Summary", content: "- S&OP maturity upgrade: Level 2 → Level 4\n- Forecast accuracy: +35% improvement\n- Inventory reduction: 20-30% ($600K freed)\n- Out-of-stock events: -70%", tag: "OVERVIEW" },
        { title: "Planning Challenges", content: "- Excel-based S&OP: 3-week cycle, error-prone\n- Forecast accuracy: 65% (industry benchmark: 85%)\n- $2.1M excess inventory across 12 DCs\n- Supply-demand sync takes 5 days per cycle", tag: "SITUATION" },
        { title: "Planning Solution", content: "- AI demand sensing & forecasting\n- Consensus S&OP workflow\n- Inventory optimization engine\n- Supplier collaboration portal\n- Executive S&OP dashboard", tag: "SOLUTION" },
        { title: "Value Delivered", content: "- Inventory reduction: $600K freed capital\n- Forecast labor savings: 3 FTE equivalent\n- Service level improvement: 92% → 98%\n**3-year NPV: $2.4M**", tag: "ROI" },
        { title: "Next Steps", content: "1. Demand data diagnostic (1 week)\n2. AI forecast pilot (6 SKUs × 3 months)\n3. S&OP process redesign\n4. Full platform rollout\n**Pilot start: June 2026**", tag: "ACTION" },
    ],
}

export default function ProposalPage() {
    const [template, setTemplate] = useState<keyof typeof TEMPLATES>("TMS")
    const [company, setCompany] = useState("")
    const [slides, setSlides] = useState(TEMPLATES["TMS"])
    const [presenting, setPresenting] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    const [exporting, setExporting] = useState(false)
    const [editingSlide, setEditingSlide] = useState<number | null>(null)
    const [aiGenerating, setAiGenerating] = useState(false)
    const [selectedSlideIdx, setSelectedSlideIdx] = useState(0)

    function loadTemplate(t: keyof typeof TEMPLATES) {
        setTemplate(t)
        setSlides([...TEMPLATES[t]])
        setSelectedSlideIdx(0)
    }

    async function exportPPTX() {
        setExporting(true)
        try {
            const res = await fetch("/api/export/pptx", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: `${template} Solution Proposal`, company, slides }),
            })
            if (!res.ok) throw new Error("Export failed")
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `PresaleX-${company || "proposal"}-${template}-${new Date().toISOString().split("T")[0]}.pptx`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error(err)
        }
        setExporting(false)
    }

    async function aiEnhanceSlide(idx: number) {
        setAiGenerating(true)
        const slide = slides[idx]
        try {
            const res = await fetch("/api/chat", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    persona: "designer",
                    message: `Enhance the content for this proposal slide. Keep it concise and powerful for executive audience.

Company: ${company || "client"}
Solution: ${template}
Slide title: "${slide.title}"
Current content: "${slide.content}"

Return ONLY the enhanced bullet points (4-6 bullets max), keeping the format with "- " or "**" for emphasis. No preamble.`,
                    history: [],
                }),
            })
            const data = await res.json()
            if (data.response) {
                setSlides(prev => prev.map((s, i) => i === idx ? { ...s, content: data.response } : s))
            }
        } catch (err) { console.error(err) }
        setAiGenerating(false)
    }

    function updateSlide(idx: number, field: "title" | "content" | "tag", value: string) {
        setSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
    }

    const currentSlideData = slides[selectedSlideIdx]

    if (presenting) {
        const slide = slides[currentSlide]
        return (
            <div className="fixed inset-0 flex flex-col" style={{ background: "#060C1A" }}>
                <div className="absolute left-0 top-0 w-3 h-full" style={{ background: "linear-gradient(180deg,#00D4AA,#3b82f6)" }} />
                <div className="flex-1 flex flex-col justify-center px-20 py-16">
                    {slide.tag && <div className="text-xs font-bold tracking-widest mb-4" style={{ color: "#00D4AA" }}>{slide.tag}</div>}
                    <h1 className="text-5xl font-black text-white mb-8 font-playfair leading-tight">{slide.title}</h1>
                    <div className="text-xl text-gray-300 leading-relaxed prose prose-invert max-w-none" style={{ fontSize: "1.1rem" }}>
                        <ReactMarkdown>{slide.content}</ReactMarkdown>
                    </div>
                </div>
                <div className="flex items-center justify-between px-20 py-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="text-sm text-gray-500">Smartlog · Confidential{company ? ` · ${company}` : ""}</div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}
                            className="px-4 py-2 rounded-lg border text-sm text-gray-300 disabled:opacity-30" style={{ borderColor: "rgba(255,255,255,0.15)" }}>← Prev</button>
                        <span className="text-sm text-gray-400">{currentSlide + 1} / {slides.length}</span>
                        <button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} disabled={currentSlide === slides.length - 1}
                            className="px-4 py-2 rounded-lg border text-sm text-gray-300 disabled:opacity-30" style={{ borderColor: "rgba(255,255,255,0.15)" }}>Next →</button>
                        <button onClick={() => setPresenting(false)} className="px-4 py-2 rounded-lg text-sm text-red-400 border border-red-500/30">✕ Exit</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-3xl font-bold text-white font-playfair mb-1">Proposal Builder</h1>
                    <p className="text-gray-400 text-sm">Build branded proposals with AI-enhanced content and PPTX export.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setPresenting(true)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold border text-white transition-all"
                        style={{ borderColor: "rgba(0,212,170,0.3)", background: "rgba(0,212,170,0.08)" }}>
                        ▶ Present
                    </button>
                    <button onClick={exportPPTX} disabled={exporting}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 4px 15px rgba(0,212,170,0.3)" }}>
                        {exporting ? "Generating..." : "⬇ Export PPTX"}
                    </button>
                </div>
            </div>

            {/* Config bar */}
            <div className="flex gap-4 mb-5 p-4 rounded-2xl border" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.1)" }}>
                <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Client Company</label>
                    <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Vingroup Logistics"
                        className="w-full rounded-xl px-4 py-2 text-sm text-white border outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                </div>
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Solution Template</label>
                    <div className="flex gap-2">
                        {(["TMS", "WMS", "OMS", "Planning"] as const).map(t => (
                            <button key={t} onClick={() => loadTemplate(t)}
                                className="px-4 py-2 rounded-xl text-sm font-bold border transition-all"
                                style={{
                                    borderColor: template === t ? "#00d4aa" : "rgba(255,255,255,0.1)",
                                    background: template === t ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.03)",
                                    color: template === t ? "#00d4aa" : "rgba(136,146,164,1)",
                                }}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Editor Layout */}
            <div className="grid grid-cols-4 gap-4" style={{ height: "calc(100vh - 300px)", minHeight: "400px" }}>
                {/* Slide List */}
                <div className="overflow-y-auto space-y-2 pr-1">
                    {slides.map((slide, i) => (
                        <div key={i} onClick={() => setSelectedSlideIdx(i)}
                            className="rounded-xl border p-3 cursor-pointer transition-all"
                            style={{
                                background: selectedSlideIdx === i ? "rgba(0,212,170,0.08)" : "rgba(13,21,39,0.7)",
                                borderColor: selectedSlideIdx === i ? "rgba(0,212,170,0.4)" : "rgba(255,255,255,0.07)",
                            }}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(0,212,170,0.2)", color: "#00d4aa" }}>{i + 1}</span>
                                <span className="text-xs font-bold text-white truncate">{slide.title}</span>
                            </div>
                            {slide.tag && <div className="text-[9px] px-1.5 py-0.5 rounded font-mono w-fit" style={{ background: "rgba(0,212,170,0.1)", color: "rgba(0,212,170,0.8)" }}>{slide.tag}</div>}
                        </div>
                    ))}
                </div>

                {/* Canvas + Edit panel */}
                <div className="col-span-3 flex flex-col rounded-2xl overflow-hidden border" style={{ background: "#07111f", borderColor: "rgba(255,255,255,0.08)" }}>
                    {/* Slide Preview */}
                    <div className="flex-1 flex flex-col justify-center p-10 relative" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(0,212,170,0.04) 0%, transparent 60%)" }}>
                        <div className="absolute left-0 top-0 w-1.5 h-full" style={{ background: "linear-gradient(180deg,#00D4AA,#3b82f6)" }} />
                        {currentSlideData?.tag && <div className="text-[10px] font-bold tracking-widest mb-3 ml-4" style={{ color: "#00D4AA" }}>{currentSlideData.tag}</div>}
                        <h2 className="text-3xl font-black text-white mb-5 ml-4 font-playfair leading-tight">{currentSlideData?.title}</h2>
                        <div className="ml-4 text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{currentSlideData?.content || ""}</ReactMarkdown>
                        </div>
                        <div className="absolute bottom-3 right-5 text-[9px] text-gray-600">SMARTLOG · CONFIDENTIAL</div>
                    </div>

                    {/* Edit strip */}
                    {currentSlideData && (
                        <div className="border-t p-4" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.3)" }}>
                            {editingSlide === selectedSlideIdx ? (
                                <div className="space-y-2">
                                    <input value={currentSlideData.title} onChange={e => updateSlide(selectedSlideIdx, "title", e.target.value)}
                                        className="w-full rounded-lg px-3 py-2 text-sm text-white border outline-none"
                                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} placeholder="Slide title" />
                                    <textarea value={currentSlideData.content} onChange={e => updateSlide(selectedSlideIdx, "content", e.target.value)}
                                        rows={4} className="w-full rounded-lg px-3 py-2 text-sm text-white border outline-none resize-none font-mono"
                                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                                    <button onClick={() => setEditingSlide(null)} className="text-xs text-cyan-400">✓ Done editing</button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingSlide(selectedSlideIdx)}
                                        className="text-xs px-3 py-1.5 rounded-lg border text-gray-300" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                                        ✏️ Edit Slide
                                    </button>
                                    <button onClick={() => aiEnhanceSlide(selectedSlideIdx)} disabled={aiGenerating}
                                        className="text-xs px-3 py-1.5 rounded-lg border text-cyan-400 disabled:opacity-40"
                                        style={{ borderColor: "rgba(0,212,170,0.3)", background: "rgba(0,212,170,0.05)" }}>
                                        {aiGenerating ? "✨ Enhancing..." : "✨ AI Enhance"}
                                    </button>
                                    <span className="flex-1" />
                                    <span className="text-xs text-gray-600">{selectedSlideIdx + 1} / {slides.length}</span>
                                    <button onClick={() => setSelectedSlideIdx(Math.max(0, selectedSlideIdx - 1))} disabled={selectedSlideIdx === 0}
                                        className="text-xs px-2 py-1.5 rounded-lg border text-gray-400 disabled:opacity-30" style={{ borderColor: "rgba(255,255,255,0.1)" }}>←</button>
                                    <button onClick={() => setSelectedSlideIdx(Math.min(slides.length - 1, selectedSlideIdx + 1))} disabled={selectedSlideIdx === slides.length - 1}
                                        className="text-xs px-2 py-1.5 rounded-lg border text-gray-400 disabled:opacity-30" style={{ borderColor: "rgba(255,255,255,0.1)" }}>→</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
