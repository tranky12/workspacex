"use client"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

const navItems = [
    { href: "/", icon: "⬡", label: "Dashboard", section: "workspace" },
    { href: "/chat", icon: "🧠", label: "Expert Panel", section: "workspace" },
    { href: "/proposals", icon: "📐", label: "Proposal Builder", section: "tools" },
    { href: "/deals", icon: "🎯", label: "Deal Qualifier", section: "tools" },
    { href: "/clients", icon: "🔍", label: "Client Intel", section: "tools" },
    { href: "/skills", icon: "🛠️", label: "Skills", section: "tools" },
    { href: "/projects", icon: "🗂️", label: "Projects", section: "team" },
    { href: "/workspace", icon: "🏢", label: "Workspace", section: "team" },
    { href: "/reports", icon: "📊", label: "BOD Reports", section: "team" },
    { href: "/knowledge", icon: "📚", label: "Knowledge Base", section: "library" },
    { href: "/settings", icon: "⚙️", label: "Settings", section: "system" },
    { href: "/setup", icon: "🚀", label: "Setup Guide", section: "system" },
    { href: "/health", icon: "💓", label: "System health", section: "system" },
]


export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()
    const { data: session } = useSession()

    const sections: Record<string, string> = { workspace: "Workspace", tools: "Tools", team: "Team", library: "Library", system: "System" }

    let lastSection = ""

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside
                className="fixed top-0 left-0 z-50 h-screen flex flex-col border-r transition-all duration-300"
                style={{
                    width: collapsed ? "72px" : "260px",
                    background: "linear-gradient(180deg, #060c1a 0%, #080f1e 100%)",
                    borderColor: "rgba(255,255,255,0.06)",
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 0 15px rgba(0,212,170,0.3)" }}>
                        ⟡
                    </div>
                    {!collapsed && (
                        <div>
                            <div className="text-sm font-bold text-white">COSPACEX</div>
                            <div className="text-[10px] text-cyan-400 uppercase tracking-widest">SC&L Expert</div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-3">
                    {navItems.map((item) => {
                        const showSection = !collapsed && item.section !== lastSection
                        if (showSection) lastSection = item.section
                        const active = pathname === item.href

                        return (
                            <div key={item.href}>
                                {showSection && (
                                    <div className="px-5 pt-4 pb-1.5 text-[10px] uppercase tracking-widest text-gray-600 font-medium">
                                        {sections[item.section]}
                                    </div>
                                )}
                                <Link href={item.href}
                                    className="flex items-center gap-3 px-5 py-2.5 relative transition-all group"
                                    style={{
                                        background: active ? "rgba(0,212,170,0.08)" : "transparent",
                                        color: active ? "#00d4aa" : "#8892a4",
                                    }}>
                                    {active && (
                                        <div className="absolute left-0 top-0 h-full w-0.5 rounded-r" style={{ background: "linear-gradient(180deg,#00d4aa,#3b82f6)" }} />
                                    )}
                                    <span className="text-lg w-5 text-center flex-shrink-0">{item.icon}</span>
                                    {!collapsed && <span className="text-[13.5px] font-medium">{item.label}</span>}
                                </Link>
                            </div>
                        )
                    })}
                </nav>

                {/* User + collapse */}
                <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    {!collapsed && session?.user && (
                        <div className="flex items-center gap-3 px-4 py-3">
                            {session.user.image ? (
                                <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full border" style={{ borderColor: "rgba(0,212,170,0.3)" }} />
                            ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
                                    style={{ background: "linear-gradient(135deg,#00d4aa,#3b82f6)" }}>
                                    {session.user.name?.[0] || "U"}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-white truncate">{session.user.name}</div>
                                <div className="text-[10px] text-gray-500 truncate">{session.user.email}</div>
                            </div>
                            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-gray-600 hover:text-gray-400 text-xs" title="Sign out">⎋</button>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center gap-3 px-5 py-3 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                    >
                        <span className="text-base">{collapsed ? "▶" : "◀"}</span>
                        {!collapsed && <span className="text-xs">Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col" style={{ marginLeft: collapsed ? "72px" : "260px", transition: "margin-left 0.3s" }}>
                {/* Topbar */}
                <header className="sticky top-0 z-40 flex items-center gap-4 px-8 h-16 border-b"
                    style={{ background: "rgba(6,12,26,0.9)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white font-playfair">
                            {navItems.find(n => n.href === pathname)?.label || "COSPACEX"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px rgba(16,185,129,0.6)", animation: "pulse 2s infinite" }} />
                        <span className="text-xs text-gray-500">AI Active</span>

                        <Link href="/knowledge" className="text-xs px-3 py-1.5 rounded-lg border text-gray-300 hover:text-white transition-colors"
                            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                            📄 Upload Docs
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
