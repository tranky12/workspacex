import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = session.user

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-playfair">
          Good afternoon, {user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Pipeline overview · April 2026 · Powered by Gemini AI
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {[
          { icon: "💼", value: "12", label: "Active Opportunities", change: "+3 this week", up: true },
          { icon: "💰", value: "$4.2M", label: "Pipeline Value", change: "+18% vs last quarter", up: true },
          { icon: "📄", value: "7", label: "Proposals In Progress", change: "2 submitted this week", up: true },
          { icon: "✅", value: "68%", label: "Win Rate (LTM)", change: "+5% YoY", up: true },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-5 border transition-all hover:-translate-y-1" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)", backdropFilter: "blur(12px)" }}>
            <div className="text-2xl mb-3">{stat.icon}</div>
            <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
            <div className="text-xs text-gray-400 mb-2">{stat.label}</div>
            <div className={`text-xs flex items-center gap-1 ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
              {stat.up ? "▲" : "▼"} {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline + Quick Actions */}
      <div className="grid grid-cols-2 gap-6">
        {/* Active Pipeline */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Active Pipeline</h2>
            <a href="/deals" className="text-xs text-cyan-400 hover:text-cyan-300">View All →</a>
          </div>
          {[
            { co: "Vingroup Logistics", sol: "TMS Implementation · Hanoi", stage: "Proposal", value: "$850K", badge: "bg-amber-500/20 text-amber-400" },
            { co: "THACO Auto", sol: "WMS + OMS Integration · HCMC", stage: "Discovery", value: "$1.2M", badge: "bg-cyan-500/20 text-cyan-400" },
            { co: "Masan Consumer", sol: "SC Planning · National", stage: "Demo", value: "$680K", badge: "bg-purple-500/20 text-purple-400" },
            { co: "Saigon Co.op", sol: "Last-Mile Optimization", stage: "Qualified", value: "$420K", badge: "bg-blue-500/20 text-blue-400" },
            { co: "Viettel Post", sol: "Route Planning System", stage: "Negotiation", value: "$1.05M", badge: "bg-emerald-500/20 text-emerald-400" },
          ].map((deal, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{deal.co}</div>
                <div className="text-xs text-gray-500 mt-0.5">{deal.sol}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${deal.badge}`}>{deal.stage}</span>
              <div className="text-sm font-bold text-amber-400 min-w-[70px] text-right">{deal.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions + Activity */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border p-6" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)", backdropFilter: "blur(12px)" }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/proposals", icon: "📐", label: "New Proposal", primary: true },
                { href: "/deals", icon: "🎯", label: "Qualify Deal", primary: false },
                { href: "/clients", icon: "🔍", label: "Client Profile", primary: false },
                { href: "/chat", icon: "🧠", label: "Ask Expert", primary: false },
                { href: "/knowledge", icon: "📄", label: "Upload Docs", primary: false },
                { href: "/knowledge", icon: "📚", label: "Knowledge Base", primary: false },
              ].map((action, i) => (
                <a key={i} href={action.href} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 ${action.primary
                  ? "text-black"
                  : "text-white border hover:border-cyan-500/40"
                  }`}
                  style={action.primary
                    ? { background: "linear-gradient(135deg,#00d4aa,#3b82f6)", boxShadow: "0 4px 15px rgba(0,212,170,0.3)" }
                    : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }
                  }>
                  {action.icon} {action.label}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-6 flex-1" style={{ background: "rgba(13,21,39,0.7)", borderColor: "rgba(0,212,170,0.12)", backdropFilter: "blur(12px)" }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Recent Activity</h2>
            {[
              { time: "Today, 09:45", text: "Proposal deck sent to Vingroup Logistics", sub: "TMS Solution — 24 slides" },
              { time: "Yesterday, 14:30", text: "Discovery call — THACO Auto", sub: "Pain points: inventory accuracy, multi-DC sync" },
              { time: "Apr 3, 11:00", text: "Deal qualified — Masan Consumer (74/100)", sub: "Strong technical fit, budget confirmed" },
            ].map((item, i) => (
              <div key={i} className="relative pl-5 pb-4 last:pb-0" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 8px rgba(0,212,170,0.4)" }}></div>
                <div className="text-xs text-gray-500 mb-1 ml-3">{item.time}</div>
                <div className="text-sm text-white ml-3">{item.text}</div>
                <div className="text-xs text-gray-500 ml-3 mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
