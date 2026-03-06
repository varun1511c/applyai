# ApplyAI — Free AI-Powered Job Search Platform

A unified, open-source job search platform combining AI resume optimization, ATS scoring, career chatbot, job tracking, and analytics dashboards. Built with Next.js, Supabase, and Google Gemini (free tier).

**Total monthly cost: ~$0**

## Features

- **Job Search** — Search LinkedIn, Indeed, and remote boards (Phase 2)
- **Resume Manager** — Upload PDF, edit inline, section by section
- **AI ATS Optimizer** — Paste any JD → get ATS score (0-100) + AI rewrites your resume to match
- **AI Chat Agent** — Streaming chat for cover letters, interview prep, career advice
- **Job Tracker** — Spreadsheet-style table: job title, company, link, date, resume, status, notes. Export to CSV
- **Dashboard** — Line chart (applications/day), donut chart (status breakdown), stats cards, weekly goal

## Quick Start

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org) (LTS version recommended).

### 2. Get Free API Keys

| Service | Link | Cost |
|---------|------|------|
| Supabase | [supabase.com](https://supabase.com) | Free tier |
| Google Gemini | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | Free, 1500 req/day |
| JSearch (RapidAPI) | [rapidapi.com/letscrape](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) | 500 req/mo free |
| Adzuna | [developer.adzuna.com](https://developer.adzuna.com) | Free, unlimited |

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and run the contents of `supabase/migrations/001_initial_schema.sql`
4. Go to **Storage** → create a bucket named `resumes` → set to public

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in your keys in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
RAPIDAPI_KEY=your-rapidapi-key
ADZUNA_APP_ID=your-adzuna-app-id
ADZUNA_API_KEY=your-adzuna-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Install & Run

```bash
cd applyai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── (auth)/login              # Login
│   ├── (auth)/register           # Register
│   ├── (dashboard)/dashboard     # Analytics dashboard
│   ├── (dashboard)/jobs          # Job search
│   ├── (dashboard)/resume        # Resume manager + editor
│   ├── (dashboard)/tracker       # Job tracker spreadsheet
│   ├── (dashboard)/chat          # AI chat agent
│   ├── (dashboard)/settings      # Profile + preferences
│   └── api/                      # API routes
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Sidebar, TopNav
│   ├── dashboard/                # Charts, stats cards
│   ├── resume/                   # Resume editor, optimize panel
│   ├── chat/                     # Chat interface
│   └── tracker/                  # Application table
└── lib/
    ├── supabase/                  # Supabase clients
    └── utils.ts                   # Utilities
```

## Deploy to Vercel (Free)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. Add all environment variables from `.env.local`
4. Deploy!

## Roadmap

- [x] Phase 1: Foundation (auth, dashboard, resume editor, AI chat, tracker)
- [ ] Phase 2: Job Search (JSearch + Adzuna + RemoteOK APIs)
- [ ] Phase 3: Enhanced Resume (PDF export, AI parsing from PDF)
- [ ] Phase 4: Cover Letter Generator
- [ ] Phase 5: Chrome Extension for Auto-Apply

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS + shadcn/ui**
- **Supabase** (Auth, PostgreSQL, Storage)
- **Google Gemini 2.0 Flash** (AI features, free tier)
- **Recharts** (charts)
- **TanStack Query** (data fetching)

## Contributing

This is a free, open-source project. Contributions welcome!

## License

MIT
