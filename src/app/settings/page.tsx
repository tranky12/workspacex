"use client"
import { useState, useEffect } from "react"
import { AI_PROVIDERS, AIProvider } from "@/lib/ai-providers"

type Settings = {
    aiProvider: string
    aiModel: string
    geminiApiKey: string
    openaiApiKey: string
    claudeApiKey: string
    azureApiKey: string
    azureEndpoint: string
    slackWebhook: string
    jiraHost: string
    jiraEmail: string
    jiraToken: string
    jiraProject: string
    driveFolderId: string
}

const DEFAULT: Settings = {
    aiProvider: "gemini", aiModel: "gemini-1.5-flash",
    geminiApiKey: "", openaiApiKey: "", claudeApiKey: "", azureApiKey: "", azureEndpoint: "",
    slackWebhook: "", jiraHost: "", jiraEmail: "", jiraToken: "", jiraProject: "", driveFolderId: "",
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>(DEFAULT)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [msg, setMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
    const [tab, setTab] = useState<"ai" | "integrations">("ai")

    useEffect(() => {
        fetch("/api/settings").then(r => r.json()).then(data => {
            if (data.settings) setSettings({ ...DEFAULT, ...data.settings })
        })
    }, [])

    const set = (k: keyof Settings, v: string) => setSettings(s => ({ ...s, [k]: v }))

    async function save() {
        setSaving(true); setMsg(null)
        const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) })
        const d = await res.json()
        setMsg(d.error ? { type: "error", text: d.error } : { type: "success", text: "✅ Settings saved successfully!" })
        setSaving(false)
    }

    async function testConnection() {
        setTesting(true); setMsg({ type: "info", text: "Testing AI connection..." })
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ persona: "consultant", message: "Hello, respond with one short sentence to confirm you are working.", history: [] }),
            })
            const d = await res.json()
            setMsg(d.error ? { type: "error", text: `❌ ${d.error}` } : { type: "success", text: `✅ Connected! AI said: "${d.response?.substring(0, 80)}..."` })
        } catch (e) {
            setMsg({ type: "error", text: "❌ Connection failed" })
        }
        setTesting(false)
    }

    const selectedProvider = AI_PROVIDERS.find(p => p.key === settings.aiProvider)!

    const input = (label: string, key: keyof Settings, placeholder = "", type = "text") => (
        <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(136,146,164,1)" }}>{label}</label>
            <input type={type} value={(settings[key] as string) || ""} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
        </div>
    )

    return (
        <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-white font-playfair mb-1">Settings</h1>
            <p className="text-gray-400 text-sm mb-8">Configure AI model, API keys, and integration connections.</p>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-8 w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {(["ai", "integrations"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                        style={tab === t ? { background: "#00d4aa", color: "#000" } : { color: "rgba(136,146,164,1)" }}>
                        {t === "ai" ? "🤖 AI Model" : "🔗 Integrations"}
                    </button>
                ))}
            </div>

            {/* AI Model Tab */}
            {tab === "ai" && (
                <div className="space-y-6">
                    {/* Provider Selection */}
                    <div className="rounded-2xl border p-6" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)" }}>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Choose AI Provider</h2>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {AI_PROVIDERS.map(p => (
                                <button key={p.key} onClick={() => { set("aiProvider", p.key); set("aiModel", p.defaultModel) }}
                                    className="flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all"
                                    style={{
                                        borderColor: settings.aiProvider === p.key ? "#00d4aa" : "rgba(255,255,255,0.08)",
                                        background: settings.aiProvider === p.key ? "rgba(0,212,170,0.07)" : "rgba(255,255,255,0.03)",
                                        boxShadow: settings.aiProvider === p.key ? "0 0 0 1px rgba(0,212,170,0.2)" : "none",
                                    }}>
                                    <span className="text-2xl">{p.icon}</span>
                                    <div>
                                        <div className="text-sm font-semibold text-white">{p.name}</div>
                                        <div className="text-xs text-gray-400">{p.defaultModel}</div>
                                    </div>
                                    {p.free && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Free</span>}
                                </button>
                            ))}
                        </div>

                        {/* Model selector */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5 text-gray-400">Model</label>
                            <select value={settings.aiModel} onChange={e => set("aiModel", e.target.value)}
                                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                                {selectedProvider?.models.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        {/* API Key for selected provider */}
                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">{selectedProvider?.keyLabel}</label>
                                <a href={selectedProvider?.docsUrl} target="_blank" rel="noreferrer"
                                    className="text-xs text-cyan-400 hover:text-cyan-300">Get API Key →</a>
                            </div>
                            <input type="password"
                                value={(settings[`${settings.aiProvider}ApiKey` as keyof Settings] as string) || ""}
                                onChange={e => set(`${settings.aiProvider}ApiKey` as keyof Settings, e.target.value)}
                                placeholder={selectedProvider?.keyPlaceholder}
                                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none font-mono"
                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                        </div>

                        {settings.aiProvider === "azure" && input("Azure Endpoint URL", "azureEndpoint", "https://your-resource.openai.azure.com")}

                        <div className="flex gap-3 mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                            <button onClick={testConnection} disabled={testing}
                                className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40"
                                style={{ borderColor: "rgba(0,212,170,0.3)", color: "#00d4aa", background: "rgba(0,212,170,0.08)" }}>
                                {testing ? "Testing..." : "🔌 Test Connection"}
                            </button>
                        </div>
                    </div>

                    {/* All Provider Keys */}
                    <div className="rounded-2xl border p-6" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)" }}>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">All API Keys</h2>
                        <p className="text-xs text-gray-500 mb-4">Store keys for all providers so you can switch without re-entering.</p>
                        {input("🔷 Gemini API Key", "geminiApiKey", "AIzaSy...", "password")}
                        {input("⚡ OpenAI API Key", "openaiApiKey", "sk-proj-...", "password")}
                        {input("🌸 Anthropic (Claude) API Key", "claudeApiKey", "sk-ant-...", "password")}
                        {input("☁️ Azure OpenAI API Key", "azureApiKey", "Azure subscription key", "password")}
                    </div>
                </div>
            )}

            {/* Integrations Tab */}
            {tab === "integrations" && (
                <div className="space-y-6">
                    {/* Slack */}
                    <div className="rounded-2xl border p-6" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)" }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">💬</span>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Slack</h2>
                                <p className="text-xs text-gray-400">Get deal notifications in your Slack channel</p>
                            </div>
                            <a href="https://api.slack.com/apps" target="_blank" rel="noreferrer"
                                className="ml-auto text-xs text-cyan-400 hover:text-cyan-300">Configure →</a>
                        </div>
                        {input("Slack Webhook URL", "slackWebhook", "https://hooks.slack.com/services/...", "password")}
                    </div>

                    {/* Jira */}
                    <div className="rounded-2xl border p-6" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)" }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🎫</span>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Jira</h2>
                                <p className="text-xs text-gray-400">Create Jira tickets automatically when deals are won</p>
                            </div>
                        </div>
                        {input("Jira Host", "jiraHost", "yourcompany.atlassian.net")}
                        {input("Jira Email", "jiraEmail", "user@company.com")}
                        {input("Jira API Token", "jiraToken", "Jira API token", "password")}
                        {input("Jira Project Key", "jiraProject", "PRESALE")}
                    </div>

                    {/* Google Drive */}
                    <div className="rounded-2xl border p-6" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)" }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📁</span>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Google Drive</h2>
                                <p className="text-xs text-gray-400">Import knowledge docs and export proposals to Drive</p>
                            </div>
                        </div>
                        {input("Drive Folder ID", "driveFolderId", "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs")}
                        <p className="text-xs text-gray-500 mt-1">Get folder ID from the URL: drive.google.com/drive/folders/<strong>FOLDER_ID</strong></p>
                    </div>
                </div>
            )}

            {/* Status Message */}
            {msg && (
                <div className={`mt-4 p-3 rounded-xl text-sm border ${msg.type === "success" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        : msg.type === "error" ? "text-red-400 border-red-500/30 bg-red-500/10"
                            : "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
                    }`}>{msg.text}</div>
            )}

            {/* Save Button */}
            <div className="flex justify-end mt-6">
                <button onClick={save} disabled={saving}
                    className="px-6 py-3 rounded-xl font-semibold text-sm text-black transition-all disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 4px 15px rgba(0,212,170,0.3)" }}>
                    {saving ? "Saving..." : "💾 Save Settings"}
                </button>
            </div>
        </div>
    )
}
