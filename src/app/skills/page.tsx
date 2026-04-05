"use client"
import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"

type Variable = { name: string; label: string; type: string; placeholder: string; required: boolean }
type Skill = {
    id: string; name: string; description: string; icon: string
    persona: string; category: string; isBuiltin: boolean; usageCount: number
    variables: Variable[]
}

const CATEGORY_LABELS: Record<string, string> = {
    meddic: "🎯 MEDDIC", proposal: "📐 Proposal", pain_point: "💡 Pain Point",
    competitive: "⚔️ Competitive", custom: "🛠️ Custom",
}

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([])
    const [selected, setSelected] = useState<Skill | null>(null)
    const [inputs, setInputs] = useState<Record<string, string>>({})
    const [output, setOutput] = useState("")
    const [running, setRunning] = useState(false)
    const [showCreate, setShowCreate] = useState(false)
    const [newSkill, setNewSkill] = useState({ name: "", description: "", icon: "🛠️", category: "custom", persona: "consultant", promptTemplate: "", variables: "[]" })
    const [creating, setCreating] = useState(false)
    const [filter, setFilter] = useState("all")

    useEffect(() => { loadSkills() }, [])

    async function loadSkills() {
        const res = await fetch("/api/skills")
        const data = await res.json()
        setSkills(data.skills || [])
    }

    function selectSkill(skill: Skill) {
        setSelected(skill)
        setInputs({})
        setOutput("")
    }

    async function runSkill() {
        if (!selected) return
        setRunning(true); setOutput("")
        try {
            const res = await fetch(`/api/skills/${selected.id}/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inputs }),
            })
            const data = await res.json()
            setOutput(data.error ? `⚠️ Error: ${data.error}` : data.output)
            if (!data.error) loadSkills() // refresh usage count
        } catch {
            setOutput("⚠️ Network error — please try again")
        }
        setRunning(false)
    }

    async function createSkill() {
        setCreating(true)
        try {
            JSON.parse(newSkill.variables) // validate JSON
        } catch {
            alert("Variables must be valid JSON array")
            setCreating(false); return
        }
        const res = await fetch("/api/skills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newSkill, variables: JSON.parse(newSkill.variables) }),
        })
        const data = await res.json()
        if (!data.error) { loadSkills(); setShowCreate(false) }
        setCreating(false)
    }

    const filtered = filter === "all" ? skills : skills.filter(s => (filter === "builtin" ? s.isBuiltin : s.category === filter))

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-playfair mb-1">Skills</h1>
                    <p className="text-gray-400 text-sm">AI-powered workflow templates. Run built-in skills or create your own.</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black"
                    style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 4px 15px rgba(0,212,170,0.3)" }}>
                    + Create Skill
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="rounded-2xl border p-6 mb-6" style={{ background: "rgba(13,21,39,0.8)", borderColor: "rgba(0,212,170,0.2)" }}>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4">Create Custom Skill</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {[["Name", "name", "e.g. RFP Response Generator"], ["Icon", "icon", "🛠️"], ["Description", "description", "What does this skill do?"]].map(([label, key, ph]) => (
                            <div key={key} className={key === "description" ? "col-span-2" : ""}>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
                                <input value={newSkill[key as keyof typeof newSkill]} onChange={e => setNewSkill(s => ({ ...s, [key]: e.target.value }))} placeholder={ph}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                                    style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Category</label>
                            <select value={newSkill.category} onChange={e => setNewSkill(s => ({ ...s, category: e.target.value }))}
                                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">AI Persona</label>
                            <select value={newSkill.persona} onChange={e => setNewSkill(s => ({ ...s, persona: e.target.value }))}
                                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                                <option value="consultant">Dr. Minh Khoa (Consultant)</option>
                                <option value="designer">Linh Anh (Designer)</option>
                                <option value="bod">Mr. Trung Kiên (BOD)</option>
                                <option value="techleader">Thanh Hùng (Tech Lead)</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Prompt Template (use {'{{variable_name}}'} for inputs)</label>
                        <textarea value={newSkill.promptTemplate} onChange={e => setNewSkill(s => ({ ...s, promptTemplate: e.target.value }))}
                            rows={5} placeholder="e.g. Analyze this deal and score each MEDDIC dimension:\n\nCompany: {{company}}\nDeal value: {{deal_value}}\nKey pain points: {{pain_points}}\n\nProvide a detailed MEDDIC score..."
                            className="w-full rounded-xl px-4 py-3 text-sm text-white border outline-none font-mono resize-none"
                            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                    </div>
                    <div className="mb-5">
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Variables (JSON array)</label>
                        <textarea value={newSkill.variables} onChange={e => setNewSkill(s => ({ ...s, variables: e.target.value }))}
                            rows={3} placeholder='[{"name":"company","label":"Company Name","type":"text","placeholder":"e.g. Vingroup","required":true}]'
                            className="w-full rounded-xl px-4 py-3 text-sm text-cyan-300 border outline-none font-mono resize-none"
                            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }} />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={createSkill} disabled={creating}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-40"
                            style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)" }}>
                            {creating ? "Creating..." : "✅ Create Skill"}
                        </button>
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border"
                            style={{ borderColor: "rgba(255,255,255,0.1)" }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 mb-5 flex-wrap">
                {[["all", "All"], ["builtin", "Built-in"], ...Object.entries(CATEGORY_LABELS)].map(([k, v]) => (
                    <button key={k} onClick={() => setFilter(k)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                        style={filter === k ? { background: "rgba(0,212,170,0.15)", borderColor: "#00d4aa", color: "#00d4aa" }
                            : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(136,146,164,1)" }}>
                        {v}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-5">
                {/* Left: Skills List */}
                <div className="space-y-3">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl border" style={{ background: "rgba(13,21,39,0.5)", borderColor: "rgba(255,255,255,0.06)" }}>
                            <p className="text-4xl mb-3">🛠️</p>
                            <p className="text-gray-400 text-sm">No skills found.</p>
                            <p className="text-gray-600 text-xs mt-1">Click "Create Skill" to build your first custom skill.</p>
                        </div>
                    ) : filtered.map(skill => (
                        <div key={skill.id} onClick={() => selectSkill(skill)}
                            className="rounded-xl border p-4 cursor-pointer transition-all hover:-translate-y-0.5"
                            style={{
                                background: selected?.id === skill.id ? "rgba(0,212,170,0.07)" : "rgba(13,21,39,0.7)",
                                borderColor: selected?.id === skill.id ? "rgba(0,212,170,0.4)" : "rgba(255,255,255,0.07)",
                            }}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{skill.icon}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">{skill.name}</span>
                                        {skill.isBuiltin && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">Built-in</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{skill.description}</p>
                                </div>
                                <div className="text-[10px] text-gray-600 text-right">
                                    <div>{CATEGORY_LABELS[skill.category] || skill.category}</div>
                                    <div className="mt-0.5">{skill.usageCount} runs</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Runner */}
                <div className="rounded-2xl border p-6 sticky top-20" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)", maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
                    {!selected ? (
                        <div className="text-center py-16">
                            <p className="text-4xl mb-3">👈</p>
                            <p className="text-gray-400 text-sm">Select a skill to run it</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-3xl">{selected.icon}</span>
                                <div>
                                    <h2 className="text-base font-bold text-white">{selected.name}</h2>
                                    <p className="text-xs text-gray-400">{selected.description}</p>
                                </div>
                            </div>

                            {/* Variables */}
                            {(selected.variables as Variable[]).length > 0 && (
                                <div className="space-y-4 mb-5">
                                    {(selected.variables as Variable[]).map(v => (
                                        <div key={v.name}>
                                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5 text-gray-400">
                                                {v.label} {v.required && <span className="text-red-400">*</span>}
                                            </label>
                                            {v.type === "textarea" ? (
                                                <textarea value={inputs[v.name] || ""} onChange={e => setInputs(i => ({ ...i, [v.name]: e.target.value }))}
                                                    placeholder={v.placeholder} rows={3}
                                                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none resize-none"
                                                    style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                                            ) : (
                                                <input value={inputs[v.name] || ""} onChange={e => setInputs(i => ({ ...i, [v.name]: e.target.value }))}
                                                    placeholder={v.placeholder}
                                                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                                                    style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button onClick={runSkill} disabled={running}
                                className="w-full py-3 rounded-xl font-semibold text-sm text-black mb-4 disabled:opacity-40"
                                style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 4px 15px rgba(0,212,170,0.25)" }}>
                                {running ? "⏳ Running..." : "▶ Run Skill"}
                            </button>

                            {output && (
                                <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Output</span>
                                        <button onClick={() => navigator.clipboard.writeText(output)}
                                            className="text-xs text-cyan-400 hover:text-cyan-300">📋 Copy</button>
                                    </div>
                                    <div className="prose prose-invert prose-sm max-w-none text-gray-200">
                                        <ReactMarkdown>{output}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
