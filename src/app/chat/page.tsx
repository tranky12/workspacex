"use client"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"

const PERSONAS = [
    {
        key: "consultant",
        name: "Dr. Minh Khoa",
        title: "Senior SC&L Consultant · 30 Years",
        icon: "🏛️",
        color: "rgba(0,212,170,0.15)",
        border: "rgba(0,212,170,0.3)",
        tags: ["McKinsey", "Blue Yonder", "KPMG", "SCOR", "Vietnam Market"],
    },
    {
        key: "designer",
        name: "Linh Anh",
        title: "Proposal Designer · 10 Years",
        icon: "🎨",
        color: "rgba(139,92,246,0.15)",
        border: "rgba(139,92,246,0.3)",
        tags: ["Slide Storytelling", "Data Viz", "Executive Decks", "Persuasion"],
    },
    {
        key: "bod",
        name: "Mr. Trung Kiên",
        title: "BOD Advisor · Ex-CEO",
        icon: "🏢",
        color: "rgba(245,158,11,0.15)",
        border: "rgba(245,158,11,0.3)",
        tags: ["BOD Mindset", "ROI Analysis", "Objection Handling", "P&L"],
    },
    {
        key: "techleader",
        name: "Thanh Hùng",
        title: "Digital Transformation Lead · 15 Years",
        icon: "⚙️",
        color: "rgba(59,130,246,0.15)",
        border: "rgba(59,130,246,0.3)",
        tags: ["TMS/WMS/OMS", "Integration", "Change Management", "Vendor Selection"],
    },
]

type Message = { role: "user" | "assistant"; content: string }

export default function ChatPage() {
    const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0])
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Reset chat when persona changes
    useEffect(() => {
        setMessages([{
            role: "assistant",
            content: `Xin chào! Tôi là **${selectedPersona.name}**, ${selectedPersona.title.toLowerCase()}. Hãy cho tôi biết bạn đang cần hỗ trợ gì về deal hoặc proposal SC&L của bạn?`,
        }])
        setSessionId(null)
    }, [selectedPersona])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    async function sendMessage() {
        if (!input.trim() || loading) return

        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: "user", content: userMsg }])
        setLoading(true)

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    persona: selectedPersona.key,
                    message: userMsg,
                    sessionId,
                    history: messages.slice(-10), // last 10 messages for context
                }),
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: "assistant", content: data.response }])
            if (data.sessionId) setSessionId(data.sessionId)
        } catch (err) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "⚠️ Xin lỗi, có lỗi xảy ra. Vui lòng kiểm tra API key Gemini trong `.env.local` và thử lại.",
            }])
        } finally {
            setLoading(false)
        }
    }

    const p = selectedPersona

    return (
        <div>
            <h1 className="text-3xl font-bold text-white font-playfair mb-1">AI Expert Panel</h1>
            <p className="text-gray-400 text-sm mb-6">Chọn chuyên gia và chat — powered by Gemini 1.5 Pro</p>

            {/* Persona Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {PERSONAS.map((persona) => (
                    <div
                        key={persona.key}
                        onClick={() => setSelectedPersona(persona)}
                        className="rounded-xl p-4 cursor-pointer transition-all border-2"
                        style={{
                            background: "rgba(13,21,39,0.7)",
                            borderColor: selectedPersona.key === persona.key ? persona.border : "rgba(255,255,255,0.06)",
                            boxShadow: selectedPersona.key === persona.key ? `0 0 20px ${persona.color}` : "none",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 border"
                                style={{ background: persona.color, borderColor: persona.border }}>
                                {persona.icon}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white leading-tight">{persona.name}</div>
                                <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{persona.title}</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {persona.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded border text-gray-400"
                                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Panel */}
            <div className="rounded-2xl border flex flex-col" style={{ height: "480px", background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)" }}>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-base border"
                        style={{ background: p.color, borderColor: p.border }}>
                        {p.icon}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.title} · Gemini 1.5 Pro</div>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <button onClick={() => setMessages([{ role: "assistant", content: `Xin chào! Tôi là **${p.name}**. Hãy cho tôi biết bạn cần hỗ trợ gì?` }])}
                            className="text-xs px-3 py-1.5 rounded-lg border text-gray-400 hover:text-white transition-colors"
                            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                            🗑 Clear
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 border"
                                style={msg.role === "assistant"
                                    ? { background: p.color, borderColor: p.border }
                                    : { background: "rgba(0,212,170,0.15)", borderColor: "rgba(0,212,170,0.3)" }
                                }>
                                {msg.role === "assistant" ? p.icon : "👤"}
                            </div>
                            <div className={`max-w-[76%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed border ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                                style={msg.role === "user"
                                    ? { background: "rgba(0,212,170,0.1)", borderColor: "rgba(0,212,170,0.2)", borderRadius: "16px 4px 16px 16px" }
                                    : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)", borderRadius: "4px 16px 16px 16px" }
                                }>
                                <div className="prose prose-invert prose-sm max-w-none text-gray-200">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ background: p.color, borderColor: p.border }}>{p.icon}</div>
                            <div className="px-4 py-3 rounded-2xl border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}>
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-3 p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <input
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none border transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                        placeholder={`Hỏi ${p.name}… (vd: Khách hàng FMCG cần TMS, budget $500K, tôi nên present gì?)`}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="px-5 py-2.5 rounded-xl font-semibold text-sm text-black transition-all disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 4px 15px rgba(0,212,170,0.3)" }}>
                        Send ↗
                    </button>
                </div>
            </div>
        </div>
    )
}
