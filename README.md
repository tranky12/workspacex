# PresaleX — SC&L Expert Workspace

> Professional presale solution support workspace for Supply Chain & Logistics teams.
> Built with Next.js 14, Google OAuth, Gemini AI, Supabase, and file intelligence.

## 🚀 Phase 1 Features
- **Google OAuth** — Team sign-in via Google account
- **Gemini AI Personas** — 4 real AI experts (SC&L Consultant, Designer, BOD Advisor, Tech Lead)
- **File Upload & Parsing** — PDF, DOCX, PPTX → searchable knowledge base
- **Deal Pipeline** — Track and qualify presale opportunities (MEDDIC)
- **Proposal Builder** — Structured slide deck creation with templates
- **Knowledge Base** — SC&L frameworks, case studies, solution maps

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Auth | NextAuth.js v5 + Google OAuth |
| AI | Google Gemini 1.5 Pro |
| Database | Supabase (PostgreSQL + pgvector) |
| ORM | Prisma |
| File Parsing | pdf-parse + mammoth (DOCX) + pptxgenjs |
| Deploy | Vercel |

## ⚙️ Setup

### 1. Clone the repo
```bash
git clone https://github.com/tranky12/presalex-workspace.git
cd presalex-workspace
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
```
Fill in your keys in `.env.local` (see below).

### 3. Setup database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🔑 Environment Variables (`.env.local`)
```
# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_SECRET=your_nextauth_secret  # generate: openssl rand -hex 32

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📁 Project Structure
```
src/
├── app/
│   ├── (auth)/           # Login page
│   ├── (dashboard)/      # Protected workspace pages
│   │   ├── page.tsx      # Dashboard
│   │   ├── chat/         # AI Expert Panel
│   │   ├── proposals/    # Proposal Builder
│   │   ├── deals/        # Deal Qualifier (MEDDIC)
│   │   ├── knowledge/    # Knowledge Base
│   │   └── clients/      # Client Intelligence
│   └── api/
│       ├── auth/         # NextAuth config
│       ├── chat/         # Gemini AI endpoint
│       ├── upload/       # File upload & parsing
│       └── knowledge/    # Vector search
├── components/           # Shared UI components
├── lib/                  # Utils, Prisma client, AI config
└── prisma/               # Database schema
```

## 📋 Roadmap
- [x] Phase 1: Next.js + Auth + Gemini AI + File Upload
- [ ] Phase 2: Google Drive, Slack, Jira integrations
- [ ] Phase 3: Smartlog template engine + PPTX export
- [ ] Phase 4: Multi-user, roles, production deploy

## 🏗️ Legacy Demo
The original HTML/CSS/JS demo is preserved in `/legacy/` for reference.

## License
Private — Smartlog / PresaleX Team
