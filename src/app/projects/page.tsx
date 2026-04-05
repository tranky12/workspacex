"use client"
import { useState, useEffect } from "react"

type Project = {
    id: string; title: string; description: string; type: string; status: string; priority: string
    clientName: string; dealValue: number; dueDate: string; progress: number; totalTasks: number
    taskCounts: Record<string, number>; ownerId: string
    members: { id: string; role: string; user: { id: string; name: string; image: string } }[]
}
type Task = {
    id: string; title: string; description: string; status: string; priority: string
    dueDate: string; slackRef: string
    assignee: { id: string; name: string; image: string } | null
}

const TASK_STATUSES = [
    { key: "todo", label: "📝 To Do", color: "#6b7280" },
    { key: "in_progress", label: "⚡ In Progress", color: "#f59e0b" },
    { key: "review", label: "🔍 Review", color: "#8b5cf6" },
    { key: "done", label: "✅ Done", color: "#10b981" },
]
const PRIORITY_COLORS: Record<string, string> = { low: "#6b7280", medium: "#3b82f6", high: "#f59e0b", urgent: "#ef4444" }
const PRIORITY_ICONS: Record<string, string> = { low: "▽", medium: "◈", high: "▲", urgent: "⚡" }

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [selected, setSelected] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [showNewProject, setShowNewProject] = useState(false)
    const [showNewTask, setShowNewTask] = useState(false)
    const [typeFilter, setTypeFilter] = useState<"all" | "internal" | "external">("all")
    const [form, setForm] = useState({ title: "", description: "", type: "internal", priority: "medium", clientName: "", dealValue: "", dueDate: "" })
    const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", dueDate: "" })
    const [saving, setSaving] = useState(false)
    const [dragging, setDragging] = useState<string | null>(null)

    useEffect(() => { loadProjects() }, [typeFilter])
    useEffect(() => { if (selected) loadTasks(selected.id) }, [selected])

    async function loadProjects() {
        const res = await fetch(`/api/projects?type=${typeFilter}`)
        const data = await res.json()
        setProjects(data.projects || [])
    }

    async function loadTasks(projectId: string) {
        const res = await fetch(`/api/projects/${projectId}/tasks`)
        const data = await res.json()
        setTasks(data.tasks || [])
    }

    async function createProject() {
        setSaving(true)
        const res = await fetch("/api/projects", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, dealValue: parseFloat(form.dealValue) || undefined }),
        })
        const data = await res.json()
        if (!data.error) { loadProjects(); setShowNewProject(false) }
        setSaving(false)
    }

    async function createTask() {
        if (!selected) return
        setSaving(true)
        const res = await fetch(`/api/projects/${selected.id}/tasks`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskForm),
        })
        const data = await res.json()
        if (!data.error) { loadTasks(selected.id); setShowNewTask(false); setTaskForm({ title: "", description: "", priority: "medium", dueDate: "" }) }
        setSaving(false)
    }

    async function updateTaskStatus(taskId: string, status: string) {
        await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        })
        if (selected) loadTasks(selected.id)
    }

    const fi = (label: string, key: string, type = "text", ph = "") => (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</label>
            <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={ph} className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
        </div>
    )

    const typeColor = (type: string) => type === "internal" ? "#8b5cf6" : "#00d4aa"

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-3xl font-bold text-white font-playfair mb-1">Project Management</h1>
                    <p className="text-gray-400 text-sm">Internal + external projects, task tracking, team workload.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                        {(["all", "internal", "external"] as const).map(t => (
                            <button key={t} onClick={() => setTypeFilter(t)}
                                className="px-4 py-2 text-xs font-semibold transition-all capitalize"
                                style={{
                                    background: typeFilter === t ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.03)",
                                    color: typeFilter === t ? "#00d4aa" : "rgba(136,146,164,1)",
                                }}>{t}</button>
                        ))}
                    </div>
                    <button onClick={() => setShowNewProject(!showNewProject)}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black"
                        style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 4px 15px rgba(0,212,170,0.3)" }}>
                        + New Project
                    </button>
                </div>
            </div>

            {/* New Project Form */}
            {showNewProject && (
                <div className="rounded-2xl border p-6 mb-5" style={{ background: "rgba(13,21,39,0.8)", borderColor: "rgba(0,212,170,0.2)" }}>
                    <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4">New Project</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {fi("Project Title *", "title", "text", "e.g. TMS Implementation — Vingroup")}
                        {fi("Client Name", "clientName", "text", "e.g. Vingroup Logistics (leave empty for internal)")}
                        {fi("Deal Value (USD)", "dealValue", "number", "e.g. 850000")}
                        {fi("Due Date", "dueDate", "date")}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Type</label>
                            <div className="flex gap-2">
                                {["internal", "external"].map(t => (
                                    <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                                        className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize"
                                        style={{ borderColor: form.type === t ? typeColor(t) : "rgba(255,255,255,0.08)", background: form.type === t ? `${typeColor(t)}22` : "rgba(255,255,255,0.03)", color: form.type === t ? typeColor(t) : "rgba(136,146,164,1)" }}>
                                        {t === "internal" ? "🔮 Internal" : "🤝 External"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Priority</label>
                            <div className="flex gap-2">
                                {["low", "medium", "high", "urgent"].map(p => (
                                    <button key={p} onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                                        className="flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all capitalize"
                                        style={{ borderColor: form.priority === p ? PRIORITY_COLORS[p] : "rgba(255,255,255,0.08)", background: form.priority === p ? `${PRIORITY_COLORS[p]}22` : "rgba(255,255,255,0.03)", color: form.priority === p ? PRIORITY_COLORS[p] : "rgba(136,146,164,1)" }}>
                                        {PRIORITY_ICONS[p]} {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            rows={2} placeholder="Project objectives..."
                            className="w-full rounded-xl px-4 py-2.5 text-sm text-white border outline-none resize-none"
                            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={createProject} disabled={saving}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-40"
                            style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)" }}>
                            {saving ? "Creating..." : "✅ Create Project"}
                        </button>
                        <button onClick={() => setShowNewProject(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border"
                            style={{ borderColor: "rgba(255,255,255,0.1)" }}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-5">
                {/* Project List */}
                <div className="space-y-3">
                    {projects.length === 0 && (
                        <div className="text-center py-12 rounded-2xl border" style={{ background: "rgba(13,21,39,0.5)", borderColor: "rgba(255,255,255,0.06)" }}>
                            <p className="text-3xl mb-2">🗂️</p>
                            <p className="text-gray-400 text-sm">No projects yet</p>
                        </div>
                    )}
                    {projects.map(project => (
                        <div key={project.id} onClick={() => setSelected(project === selected ? null : project)}
                            className="rounded-xl border p-4 cursor-pointer transition-all hover:-translate-y-0.5"
                            style={{
                                background: selected?.id === project.id ? "rgba(0,212,170,0.05)" : "rgba(13,21,39,0.7)",
                                borderColor: selected?.id === project.id ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.07)",
                            }}>
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase"
                                            style={{ background: `${typeColor(project.type)}20`, color: typeColor(project.type) }}>
                                            {project.type}
                                        </span>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                                            style={{ background: `${PRIORITY_COLORS[project.priority]}20`, color: PRIORITY_COLORS[project.priority] }}>
                                            {PRIORITY_ICONS[project.priority]}
                                        </span>
                                    </div>
                                    <div className="text-sm font-bold text-white">{project.title}</div>
                                    {project.clientName && <div className="text-xs text-gray-400 mt-0.5">{project.clientName}</div>}
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black" style={{ color: project.progress >= 70 ? "#10b981" : project.progress >= 30 ? "#f59e0b" : "#6b7280" }}>
                                        {project.progress}%
                                    </div>
                                    <div className="text-[10px] text-gray-500">{project.totalTasks} tasks</div>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="h-1.5 rounded-full mt-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                                <div className="h-full rounded-full transition-all" style={{
                                    width: `${project.progress}%`,
                                    background: project.progress >= 70 ? "linear-gradient(90deg,#10b981,#00d4aa)" : project.progress >= 30 ? "linear-gradient(90deg,#f59e0b,#f97316)" : "rgba(107,114,128,0.6)",
                                }} />
                            </div>
                            {/* Members */}
                            <div className="flex items-center gap-1 mt-2">
                                {project.members.slice(0, 4).map(m => (
                                    m.user.image ? (
                                        <img key={m.id} src={m.user.image} alt={m.user.name} className="w-5 h-5 rounded-full border border-gray-700" title={m.user.name} />
                                    ) : (
                                        <div key={m.id} className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                                            style={{ background: "rgba(0,212,170,0.3)", color: "#00d4aa" }} title={m.user.name}>
                                            {m.user.name?.[0]}
                                        </div>
                                    )
                                ))}
                                {project.members.length > 4 && <span className="text-[10px] text-gray-500">+{project.members.length - 4}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Task Kanban Board */}
                <div className="col-span-2">
                    {!selected ? (
                        <div className="rounded-2xl border h-full flex items-center justify-center" style={{ background: "rgba(13,21,39,0.5)", borderColor: "rgba(255,255,255,0.06)" }}>
                            <div className="text-center py-16">
                                <p className="text-4xl mb-3">👈</p>
                                <p className="text-gray-400 text-sm">Select a project to see tasks</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-white">{selected.title}</h2>
                                    <p className="text-xs text-gray-400">{selected.description || "No description"}</p>
                                </div>
                                <button onClick={() => setShowNewTask(!showNewTask)}
                                    className="text-xs px-3 py-2 rounded-xl border text-cyan-400"
                                    style={{ borderColor: "rgba(0,212,170,0.3)", background: "rgba(0,212,170,0.07)" }}>
                                    + Add Task
                                </button>
                            </div>

                            {showNewTask && (
                                <div className="rounded-xl border p-4 mb-4" style={{ background: "rgba(13,21,39,0.8)", borderColor: "rgba(0,212,170,0.2)" }}>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1">Title *</label>
                                            <input value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))}
                                                className="w-full rounded-lg px-3 py-2 text-sm text-white border outline-none"
                                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1">Due Date</label>
                                            <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))}
                                                className="w-full rounded-lg px-3 py-2 text-sm text-white border outline-none"
                                                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-3">
                                        {["low", "medium", "high", "urgent"].map(p => (
                                            <button key={p} onClick={() => setTaskForm(prev => ({ ...prev, priority: p }))}
                                                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all capitalize"
                                                style={{ borderColor: taskForm.priority === p ? PRIORITY_COLORS[p] : "rgba(255,255,255,0.08)", background: taskForm.priority === p ? `${PRIORITY_COLORS[p]}22` : "transparent", color: taskForm.priority === p ? PRIORITY_COLORS[p] : "rgba(136,146,164,1)" }}>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={createTask} disabled={saving}
                                            className="text-xs px-3 py-2 rounded-lg text-black disabled:opacity-40"
                                            style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)" }}>
                                            {saving ? "Saving..." : "✅ Add Task"}
                                        </button>
                                        <button onClick={() => setShowNewTask(false)} className="text-xs px-3 py-2 rounded-lg text-gray-400">Cancel</button>
                                    </div>
                                </div>
                            )}

                            {/* Kanban columns */}
                            <div className="grid grid-cols-4 gap-3">
                                {TASK_STATUSES.map(status => {
                                    const statusTasks = tasks.filter(t => t.status === status.key)
                                    return (
                                        <div key={status.key}
                                            onDragOver={e => e.preventDefault()}
                                            onDrop={async e => {
                                                e.preventDefault()
                                                if (dragging) {
                                                    await updateTaskStatus(dragging, status.key)
                                                    setDragging(null)
                                                }
                                            }}>
                                            <div className="flex items-center gap-2 mb-2 px-1">
                                                <div className="text-[9px] font-bold" style={{ color: status.color }}>{status.label}</div>
                                                <span className="text-[9px] text-gray-600 ml-auto">{statusTasks.length}</span>
                                            </div>
                                            <div className="space-y-2 min-h-[80px] rounded-lg p-1 transition-all"
                                                style={{ background: "rgba(255,255,255,0.01)" }}>
                                                {statusTasks.map(task => (
                                                    <div key={task.id}
                                                        draggable
                                                        onDragStart={() => setDragging(task.id)}
                                                        onDragEnd={() => setDragging(null)}
                                                        className="rounded-lg border p-2.5 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5"
                                                        style={{ background: "rgba(13,21,39,0.9)", borderColor: dragging === task.id ? status.color : "rgba(255,255,255,0.08)" }}>
                                                        <div className="flex items-start gap-1.5 mb-1.5">
                                                            <span style={{ color: PRIORITY_COLORS[task.priority], fontSize: "10px" }}>{PRIORITY_ICONS[task.priority]}</span>
                                                            <span className="text-[11px] font-semibold text-white leading-tight flex-1">{task.title}</span>
                                                        </div>
                                                        {task.assignee && (
                                                            <div className="flex items-center gap-1 mt-1.5">
                                                                {task.assignee.image ? (
                                                                    <img src={task.assignee.image} alt="" className="w-4 h-4 rounded-full" />
                                                                ) : (
                                                                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: "rgba(0,212,170,0.3)", color: "#00d4aa" }}>
                                                                        {task.assignee.name?.[0]}
                                                                    </div>
                                                                )}
                                                                <span className="text-[9px] text-gray-500 truncate">{task.assignee.name}</span>
                                                            </div>
                                                        )}
                                                        {task.dueDate && (
                                                            <div className="text-[9px] mt-1.5" style={{ color: new Date(task.dueDate) < new Date() ? "#ef4444" : "#6b7280" }}>
                                                                📅 {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                                                            </div>
                                                        )}
                                                        {task.slackRef && (
                                                            <a href={task.slackRef} target="_blank" rel="noreferrer" className="text-[9px] text-purple-400 mt-1 block">
                                                                💬 From Slack
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
