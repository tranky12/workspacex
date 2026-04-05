# COSPACEX — SC&L Expert Workspace

> Professional presale solution support workspace for Supply Chain & Logistics teams.
> Built with Next.js (App Router), Google OAuth, Gemini AI, Supabase, and file intelligence.

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
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Auth | NextAuth.js v5 + Google OAuth |
| AI | Google Gemini 1.5 Pro |
| Database | Supabase (PostgreSQL + pgvector) |
| ORM | Prisma |
| File Parsing | pdf-parse + mammoth (DOCX) + pptxgenjs |
| Desktop | Electron + electron-builder (DMG / NSIS) |
| Deploy | Vercel (web) · [GitHub Releases](https://github.com/tranky12/workspacex/releases) (desktop) |

## ⚙️ Setup

### 1. Clone the repo
```bash
git clone https://github.com/tranky12/workspacex.git
cd workspacex
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
Open [http://localhost:3001](http://localhost:3001) (dev server port is **3001**).

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

## 🏢 Organization & workspace (phòng ban)

- **Organization** — công ty / tenant: một tổ chức có nhiều **Workspace** (phòng ban). API: `GET` / `POST` `/api/organizations`.
- **Workspace** — dữ liệu vận hành (deals, clients, projects, knowledge, …) **tách theo `workspaceId`**. Mỗi workspace thuộc một `organizationId`.
- **Phân quyền:** `OrganizationMember` (`org_owner` | `org_admin` | `member`): admin cấp tổ chức xem mọi workspace trong org; thành viên thường chỉ thấy workspace được thêm vào. Trong workspace, `WorkspaceMember.role` + tùy chọn `permissions` (JSON theo module) — xem `src/lib/workspace-access.ts`.
- **DB có sẵn:** sau `npx prisma db push`, nếu còn workspace cũ không có org, chạy `npm run db:backfill-org`.

## 📋 Roadmap (this repo: [tranky12/workspacex](https://github.com/tranky12/workspacex))
- [x] **Phase 1** — Next.js + Auth + Gemini AI + file upload + core workspace
- [x] **Desktop** — Electron app + CI builds + [GitHub Releases](https://github.com/tranky12/workspacex/releases) (DMG / Windows installer)
- [x] **Org / multi-workspace** — Organization + workspace phòng ban + API + backfill (v2.2+)
- [ ] **Phase 2** — Integrations: Slack / Jira / Google Drive (API routes exist; OAuth UX, error handling, and coverage still in progress)
- [ ] **Phase 3** — Smartlog template engine + richer PPTX export
- [ ] **Phase 4** — SSOT master data cấp org, enforcement permissions trên mọi API, production hardening

## 🔐 Desktop builds: code signing (optional)

CI builds are **unsigned** by default. To produce **signed** macOS (Developer ID + **notarization**) and **Authenticode** Windows installers:

1. In GitHub → **Settings → Secrets and variables → Actions → Variables**, add:
   - **`ENABLE_CODE_SIGNING`** = `true`

2. In **Secrets**, add (names must match exactly):

   | Secret | Purpose |
   |--------|---------|
   | `MACOS_CERT_P12` | Base64-encoded **Developer ID Application** `.p12` |
   | `MACOS_CERT_PASSWORD` | Password for the `.p12` |
   | `APPLE_ID` | Apple ID email (notarization) |
   | `APPLE_APP_SPECIFIC_PASSWORD` | [App-specific password](https://support.apple.com/en-us/102654) for notarization |
   | `APPLE_TEAM_ID` | 10-character Apple Team ID |
   | `WINDOWS_CERT_PFX` | Base64-encoded **Authenticode** `.pfx` |
   | `WINDOWS_CERT_PASSWORD` | Password for the `.pfx` |

3. The release workflow merges `electron-builder.json` with **`electron-builder.signing.json`** when `ENABLE_CODE_SIGNING` is `true` (enables hardened runtime + notarize on macOS, Authenticode on Windows).

4. **Local** signed builds (after exporting the same env vars and decoding certs to disk):
   ```bash
   export CSC_LINK=/absolute/path/to/DeveloperID.p12
   export CSC_KEY_PASSWORD=...
   export APPLE_ID=... APPLE_APP_SPECIFIC_PASSWORD=... APPLE_TEAM_ID=...
   npx electron-builder --mac -c electron-builder.json -c electron-builder.signing.json --publish never
   ```

## 🏗️ Legacy Demo
The original HTML/CSS/JS demo is preserved in `/legacy/` for reference.

## License
Private — Smartlog / COSPACEX Team
