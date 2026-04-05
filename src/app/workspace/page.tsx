"use client"
import { useState, useEffect } from "react"

type Workspace = {
    id: string; name: string; slug: string; description: string
    memberRole: string; _count: { members: number; projects: number; deals: number }
    owner: { name: string; email: string; image: string }
}
type Member = {
    id: string; role: string; joinedAt: string
    user: { id: string; name: string; email: string; image: string }
}
type JoinRequest = {
    id: string; status: string; message: string; createdAt: string
    user: { id: string; name: string; email: string; image: string }
}

const ROLES = ["owner", "admin", "consultant", "viewer"]
const ROLE_COLORS: Record<string, string> = { owner: "#f59e0b", admin: "#ef4444", consultant: "#00d4aa", viewer: "#6b7280" }

export default function WorkspacePage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [selected, setSelected] = useState<Workspace | null>(null)
    const [members, setMembers] = useState<Member[]>([])
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
    const [tab, setTab] = useState<"overview" | "members" | "requests" | "join">("overview")
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState({ name: "", description: "" })
    const [joinSlug, setJoinSlug] = useState("")
    const [joinMessage, setJoinMessage] = useState("")
    const [saving, setSaving] = useState(false)
    const [joinSent, setJoinSent] = useState(false)

    useEffect(() => { loadWorkspaces() }, [])
    useEffect(() => {
        if (selected) {
            loadMembers(selected.id)
            loadJoinRequests(selected.id)
        }
    }, [selected])

    async function loadWorkspaces() {
        const res = await fetch("/api/workspace")
        const data = await res.json()
        setWorkspaces(data.workspaces || [])
        if (data.workspaces?.length > 0 && !selected) setSelected(data.workspaces[0])
    }

    async function loadMembers(workspaceId: string) {
        const res = await fetch(`/api/workspace/members?workspaceId=${workspaceId}`)
        const data = await res.json()
        setMembers(data.members || [])
    }

    async function loadJoinRequests(workspaceId: string) {
        const res = await fetch(`/api/workspace/join-request?workspaceId=${workspaceId}`)
        const data = await res.json()
        setJoinRequests(data.requests || [])
    }

    async function createWorkspace() {
        setSaving(true)
        const res = await fetch("/api/workspace", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!data.error) { loadWorkspaces(); setShowCreate(false); setForm({ name: "", description: "" }) }
        setSaving(false)
    }

    async function handleJoinRequest(requestId: string, action: "approve" | "reject", role = "consultant") {
        await fetch("/api/workspace/join-request", {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId, action, role }),
        })
        if (selected) { loadJoinRequests(selected.id); loadMembers(selected.id) }
    }

    async function updateMemberRole(memberId: string, role: string) {
        await fetch("/api/workspace/members", {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId, role }),
        })
        if (selected) loadMembers(selected.id)
    }

    async function removeMember(memberId: string) {
        if (!confirm("Remove this member?")) return
        await fetch("/api/workspace/members", {
            method: "DELETE", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId }),
        })
        if (selected) loadMembers(selected.id)
    }

    async function sendJoinRequest() {
        setSaving(true)
        const res = await fetch("/api/workspace/join-request", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workspaceSlug: joinSlug, message: joinMessage }),
        })
        const data = await res.json()
        if (!data.error) { setJoinSent(true); setJoinSlug(""); setJoinMessage("") }
        setSaving(false)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-playfair mb-1">Workspace</h1>
                    <p className="text-gray-400 text-sm">Manage your team workspace, members, roles and join requests.</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black"
                    style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 4px 15px rgba(0,212,170,0.3)" }}>
                    + Create Workspace
                </button>
            </div>

            {/* Create form */}
            {showCreate && (
                <div className="rounded-2xl border p-5 mb-5" style={{ background: "rgba(13,21,39,0.8)", borderColor: "rgba(0,212,170,0.2)" }}>
                    <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4">New Workspace</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Workspace Name *</label>
                            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Smartlog Presale Team"
                                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Description</label>
                            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Optional description..."
                                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={createWorkspace} disabled={saving || !form.name}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-40"
                            style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)" }}>
                            {saving ? "Creating..." : "✅ Create"}
                        </button>
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border"
                            style={{ borderColor: "rgba(255,255,255,0.1)" }}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-4 gap-5">
                {/* Workspace list */}
                <div className="space-y-3">
                    {workspaces.map(ws => (
                        <div key={ws.id} onClick={() => setSelected(ws)}
                            className="rounded-xl border p-4 cursor-pointer transition-all"
                            style={{
                                background: selected?.id === ws.id ? "rgba(0,212,170,0.07)" : "rgba(13,21,39,0.7)",
                                borderColor: selected?.id === ws.id ? "rgba(0,212,170,0.35)" : "rgba(255,255,255,0.07)",
                            }}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black"
                                    style={{ background: "linear-gradient(135deg,rgba(0,212,170,0.25),rgba(59,130,246,0.25))", border: "1px solid rgba(0,212,170,0.2)" }}>
                                    {ws.name[0].toUpperCase()}
                                </div>
                                <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase"
                                    style={{ background: `${ROLE_COLORS[ws.memberRole] || "#6b7280"}20`, color: ROLE_COLORS[ws.memberRole] || "#6b7280" }}>
                                    {ws.memberRole}
                                </span>
                            </div>
                            <div className="text-sm font-bold text-white mb-0.5">{ws.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">/{ws.slug}</div>
                            <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
                                <span>👥 {ws._count?.members || 0}</span>
                                <span>🗂️ {ws._count?.projects || 0}</span>
                                <span>🎯 {ws._count?.deals || 0}</span>
                            </div>
                        </div>
                    ))}

                    {/* Join workspace card */}
                    <div className="rounded-xl border-dashed border p-4 cursor-pointer" style={{ borderColor: "rgba(255,255,255,0.1)" }}
                        onClick={() => { setSelected(null); setTab("join") }}>
                        <p className="text-xs text-gray-400 text-center">🔗 Join another workspace</p>
                    </div>
                </div>

                {/* Detail panel */}
                <div className="col-span-3">
                    {tab === "join" || (!selected && workspaces.length === 0) ? (
                        <div className="rounded-2xl border p-8" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)" }}>
                            <h2 className="text-lg font-bold text-white mb-4">🔗 Join a Workspace</h2>
                            <p className="text-sm text-gray-400 mb-5">Get the workspace slug from your team lead and request to join.</p>
                            <div className="max-w-lg space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Workspace Slug (from your team)</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-sm">/</span>
                                        <input value={joinSlug} onChange={e => setJoinSlug(e.target.value)}
                                            placeholder="smartlog-presale-team-abc123"
                                            className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                                            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Message (optional)</label>
                                    <textarea value={joinMessage} onChange={e => setJoinMessage(e.target.value)}
                                        rows={2} placeholder="Hi, I'm from SC&L implementation team..."
                                        className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none resize-none"
                                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                                </div>
                                {joinSent ? (
                                    <div className="text-sm text-green-400">✅ Join request sent! Wait for workspace admin approval.</div>
                                ) : (
                                    <button onClick={sendJoinRequest} disabled={saving || !joinSlug}
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-40"
                                        style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)" }}>
                                        {saving ? "Sending..." : "📨 Send Join Request"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : selected && (
                        <div className="rounded-2xl border" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)" }}>
                            {/* Tabs */}
                            <div className="flex border-b px-5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                                {([["overview", "Overview"], ["members", `Members (${members.length})`], ["requests", `Requests (${joinRequests.length})`]] as const).map(([key, label]) => (
                                    <button key={key} onClick={() => setTab(key)}
                                        className="py-3 px-4 text-sm font-medium border-b-2 transition-all mr-1"
                                        style={{ borderColor: tab === key ? "#00d4aa" : "transparent", color: tab === key ? "#00d4aa" : "rgba(136,146,164,1)" }}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6">
                                {tab === "overview" && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <h2 className="text-xl font-bold text-white mb-1">{selected.name}</h2>
                                            <p className="text-sm text-gray-400 mb-4">{selected.description || "No description"}</p>
                                            <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Workspace Invite Link</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 text-xs text-green-300 font-mono px-3 py-2 rounded-lg" style={{ background: "rgba(0,0,0,0.3)" }}>
                                                        {selected.slug}
                                                    </code>
                                                    <button onClick={() => navigator.clipboard.writeText(selected.slug)}
                                                        className="text-xs px-3 py-2 rounded-lg border text-cyan-400"
                                                        style={{ borderColor: "rgba(0,212,170,0.3)" }}>
                                                        Copy Slug
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-gray-500 mt-2">Share this slug with team members so they can submit a join request.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {[["Members", selected._count?.members || 0], ["Projects", selected._count?.projects || 0], ["Deals", selected._count?.deals || 0]].map(([k, v]) => (
                                                <div key={k as string} className="rounded-xl p-4 border text-center"
                                                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                                                    <div className="text-2xl font-black text-white">{v}</div>
                                                    <div className="text-xs text-gray-500">{k}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {tab === "members" && (
                                    <div className="space-y-3">
                                        {members.map(member => (
                                            <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl border"
                                                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                                                <div className="flex items-center gap-3 flex-1">
                                                    {member.user.image ? (
                                                        <img src={member.user.image} alt="" className="w-10 h-10 rounded-full border" style={{ borderColor: "rgba(0,212,170,0.3)" }} />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                                            style={{ background: "linear-gradient(135deg,rgba(0,212,170,0.3),rgba(59,130,246,0.3))", color: "#00d4aa" }}>
                                                            {member.user.name?.[0]}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{member.user.name}</div>
                                                        <div className="text-xs text-gray-400">{member.user.email}</div>
                                                        <div className="text-[10px] text-gray-600">Joined {new Date(member.joinedAt).toLocaleDateString("vi-VN")}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select value={member.role} onChange={e => updateMemberRole(member.id, e.target.value)}
                                                        className="text-xs rounded-lg px-2 py-1.5 border outline-none font-semibold"
                                                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: ROLE_COLORS[member.role] || "#fff" }}>
                                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                    {member.role !== "owner" && (
                                                        <button onClick={() => removeMember(member.id)}
                                                            className="text-xs px-2 py-1.5 rounded-lg border text-red-400"
                                                            style={{ borderColor: "rgba(239,68,68,0.3)" }}>
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {tab === "requests" && (
                                    <div className="space-y-3">
                                        {joinRequests.length === 0 && (
                                            <p className="text-center text-gray-500 py-8">No pending join requests 🎉</p>
                                        )}
                                        {joinRequests.map(req => (
                                            <div key={req.id} className="rounded-xl border p-4 flex items-center gap-4"
                                                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(245,158,11,0.2)" }}>
                                                <div className="flex items-center gap-3 flex-1">
                                                    {req.user.image ? (
                                                        <img src={req.user.image} alt="" className="w-10 h-10 rounded-full" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                                            style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                                                            {req.user.name?.[0]}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{req.user.name}</div>
                                                        <div className="text-xs text-gray-400">{req.user.email}</div>
                                                        {req.message && <div className="text-xs text-gray-500 mt-1">&quot;{req.message}&quot;</div>}
                                                        <div className="text-[10px] text-gray-600">{new Date(req.createdAt).toLocaleString("vi-VN")}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleJoinRequest(req.id, "approve", "consultant")}
                                                        className="text-xs px-3 py-2 rounded-lg font-semibold"
                                                        style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
                                                        ✓ Approve
                                                    </button>
                                                    <button onClick={() => handleJoinRequest(req.id, "reject")}
                                                        className="text-xs px-3 py-2 rounded-lg font-semibold"
                                                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
                                                        ✕ Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
