"use client"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import ReactMarkdown from "react-markdown"

export default function DealRoomPage() {
    const params = useParams()
    const dealId = params.id as string
    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch(`/api/deals/${dealId}/room`)
            .then(res => res.json())
            .then(data => setMessages(data.messages || []))
    }, [dealId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim()) return
        const userMsg = { role: "user", content: input, persona: "user", TempId: Date.now() }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            const res = await fetch(`/api/deals/${dealId}/room`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content }),
            })
            const data = await res.json()
            if (data.reply) {
                setMessages(prev => [...prev, data.reply])
            }
        } catch (e) {
            console.error("Failed to send message", e)
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <h1 className="text-2xl font-bold p-4 border-b border-gray-800 text-cyan-400">Deal Room (Multi-Agent)</h1>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[rgba(13,21,39,0.5)]">
                {messages.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-4xl mb-4">💬</p>
                        <p>Welcome to the Deal Room!</p>
                        <p className="text-sm mt-2">Mention agents like <span className="text-blue-400">@dr_khoa</span> (Consultant) or <span className="text-amber-400">@thanh_hung</span> (Tech Lead) to get targeted advice.</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={m.id || i} className={`p-4 rounded-xl max-w-[80%] ${m.role === "user" ? "ml-auto bg-blue-600/20 text-blue-50 border border-blue-500/30" : "mr-auto bg-gray-800/80 border border-gray-700"}`}>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                            {m.role === "user" ? "You" : m.persona}
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {loading && <div className="text-gray-500 animate-pulse text-sm font-semibold p-4">AI is typing...</div>}
                <div ref={bottomRef} />
            </div>
            <div className="p-4 border-t border-gray-800 flex gap-3">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="Ask a question... tip: mention @thanh_hung or @dr_khoa"
                    className="flex-1 bg-[rgba(255,255,255,0.05)] border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button onClick={sendMessage} disabled={loading} 
                    className="px-8 py-3 rounded-xl font-bold text-black disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)" }}>
                    Send
                </button>
            </div>
        </div>
    )
}
