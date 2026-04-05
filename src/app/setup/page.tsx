export default function SetupGuidePage() {
    return (
        <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-white font-playfair mb-1">Setup Guide</h1>
            <p className="text-gray-400 text-sm mb-4">Follow these steps to fully activate COSPACEX for your team.</p>
            <p className="text-sm mb-8">
                <a href="/health" className="text-cyan-400 hover:text-cyan-300 underline">System health</a>
                <span className="text-gray-500"> — kiểm tra DB &amp; biến môi trường (không cần đăng nhập)</span>
            </p>

            <div className="space-y-5">
                {/* Step 1 */}
                <Step num={1} title="Create Google OAuth Credentials" status="required" tag="AUTH">
                    <p className="text-sm text-gray-300 mb-4">Allows your team to sign in with Google accounts.</p>
                    <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside mb-4">
                        <li>Go to <A href="https://console.cloud.google.com">console.cloud.google.com</A></li>
                        <li>Create a new project or select existing → <strong>APIs & Services → Credentials</strong></li>
                        <li>Click <strong>Create Credentials → OAuth Client ID → Web Application</strong></li>
                        <li>Add Authorized Redirect URIs:
                            <Code>http://localhost:3001/api/auth/callback/google</Code>
                            <Code>https://yourdomain.com/api/auth/callback/google</Code>
                        </li>
                        <li>Copy <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                        <li>Also enable <strong>Google Drive API</strong> in the same project (for Drive integration)</li>
                    </ol>
                    <EnvBlock keys={["AUTH_GOOGLE_ID=paste-your-client-id", "AUTH_GOOGLE_SECRET=paste-your-client-secret", "AUTH_SECRET=run-openssl-rand-hex-32", "NEXTAUTH_URL=http://localhost:3001"]} />
                </Step>

                {/* Step 2 */}
                <Step num={2} title="Choose and Configure AI Provider" status="required" tag="AI">
                    <p className="text-sm text-gray-300 mb-4">Choose one provider (or configure all). You can switch anytime in Settings → AI Model.</p>
                    <div className="space-y-3 mb-4">
                        {[
                            { icon: "🔷", name: "Google Gemini (Recommended — Free tier available)", url: "https://aistudio.google.com/apikey", key: "GEMINI_API_KEY", hint: "Free 1M tokens/day on flash model" },
                            { icon: "⚡", name: "OpenAI (GPT-4o)", url: "https://platform.openai.com/api-keys", key: "OPENAI_API_KEY", hint: "Pay-per-use, ~$5/1M tokens" },
                            { icon: "🌸", name: "Anthropic (Claude 3.5 Sonnet)", url: "https://console.anthropic.com/settings/keys", key: "ANTHROPIC_API_KEY", hint: "Pay-per-use, strong for long documents" },
                            { icon: "☁️", name: "Azure Copilot / OpenAI", url: "https://portal.azure.com", key: "AZURE_OPENAI_API_KEY + AZURE_OPENAI_ENDPOINT", hint: "For enterprise with existing Azure contract" },
                        ].map(p => (
                            <div key={p.key} className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{p.icon}</span>
                                    <span className="text-sm font-semibold text-white">{p.name}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{p.hint}</p>
                                <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300">Get API key →</a>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-amber-400 mb-2">⚠️ After getting your key, paste it in <a href="/settings" className="underline">Settings → AI Model → All API Keys</a></p>
                </Step>

                {/* Step 3 */}
                <Step num={3} title="Set Up Supabase Database" status="required" tag="DATABASE">
                    <p className="text-sm text-gray-300 mb-4">Free PostgreSQL database for storing deals, proposals, chat history, and knowledge base.</p>
                    <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside mb-4">
                        <li>Go to <A href="https://supabase.com">supabase.com</A> → New Project</li>
                        <li>Choose a region close to Vietnam (Singapore recommended)</li>
                        <li>Go to <strong>Project Settings → Database → Connection String → URI</strong></li>
                        <li>Copy the connection string (replace <code>[YOUR-PASSWORD]</code>)</li>
                        <li>Run in your terminal:
                            <Code>npx prisma db push</Code>
                        </li>
                        <li>Seed built-in skills:
                            <Code>npx ts-node prisma/seed.ts</Code>
                        </li>
                    </ol>
                    <EnvBlock keys={["DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres"]} />
                </Step>

                {/* Step 4 */}
                <Step num={4} title="Create .env.local File" status="required" tag="CONFIG">
                    <p className="text-sm text-gray-300 mb-4">Create this file in the project root folder <code className="text-cyan-400">/spectral-orion/.env.local</code></p>
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                        <div className="px-4 py-2 text-xs font-mono text-gray-400 border-b flex justify-between" style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(255,255,255,0.08)" }}>
                            <span>.env.local</span>
                            <span className="text-gray-600">in /spectral-orion/</span>
                        </div>
                        <pre className="text-xs text-green-300 font-mono p-4 overflow-x-auto leading-6" style={{ background: "rgba(0,0,0,0.4)" }}>{`# Google OAuth (Step 1)
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_SECRET=your_32char_secret        # openssl rand -hex 32
NEXTAUTH_URL=http://localhost:3001

# AI Providers (Step 2 — add at least one)
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-proj-...            # optional
ANTHROPIC_API_KEY=sk-ant-...          # optional
AZURE_OPENAI_API_KEY=...              # optional

# Database (Step 3)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres`}</pre>
                    </div>
                </Step>

                {/* Step 5 */}
                <Step num={5} title="Start the Server" status="optional" tag="RUN">
                    <p className="text-sm text-gray-300 mb-3">Run locally using Node.js directly (Next.js 16 workaround):</p>
                    <Code>node node_modules/next/dist/bin/next dev --port 3001</Code>
                    <p className="text-xs text-gray-500 mt-3">Or add to package.json scripts and simply run <code className="text-cyan-300">npm run dev</code></p>
                </Step>

                {/* Step 6 */}
                <Step num={6} title="Optional: Configure Integrations" status="optional" tag="INTEGRATIONS">
                    <p className="text-sm text-gray-300 mb-3">After login, go to <a href="/settings" className="text-cyan-400 underline">Settings → Integrations</a> to configure:</p>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: "💬", name: "Slack", desc: "Deal notifications" },
                            { icon: "🎫", name: "Jira", desc: "Auto-create tickets" },
                            { icon: "📁", name: "Google Drive", desc: "Import/export docs" },
                        ].map(i => (
                            <div key={i.name} className="rounded-xl p-3 text-center border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                                <div className="text-2xl mb-1">{i.icon}</div>
                                <div className="text-xs font-semibold text-white">{i.name}</div>
                                <div className="text-[10px] text-gray-500">{i.desc}</div>
                            </div>
                        ))}
                    </div>
                </Step>
            </div>
        </div>
    )
}

function Step({ num, title, status, tag, children }: { num: number; title: string; status: string; tag: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(13,21,39,0.7)", borderColor: status === "required" ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.07)" }}>
            <div className="px-6 py-4 border-b flex items-center gap-4" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
                    style={{ background: status === "required" ? "linear-gradient(135deg,#00d4aa,#3b82f6)" : "rgba(255,255,255,0.15)", color: status === "required" ? "black" : "white" }}>
                    {num}
                </div>
                <div className="flex-1">
                    <h2 className="text-sm font-bold text-white">{title}</h2>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono border" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(136,146,164,1)" }}>{tag}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${status === "required" ? "bg-red-500/15 text-red-400 border border-red-500/25" : "bg-gray-500/15 text-gray-400 border border-gray-500/25"}`}>
                        {status}
                    </span>
                </div>
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    )
}

function Code({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-lg px-4 py-2.5 font-mono text-xs text-green-300 mt-2 mb-2" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {children}
        </div>
    )
}

function EnvBlock({ keys }: { keys: string[] }) {
    return (
        <div className="rounded-lg px-4 py-3 font-mono text-xs mt-3" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {keys.map(k => <div key={k} className="text-green-300 leading-6">{k}</div>)}
        </div>
    )
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href} target="_blank" rel="noreferrer" className="text-cyan-400 underline hover:text-cyan-300">{children}</a>
}
