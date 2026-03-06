import Link from "next/link";
import {
  Search, FileText, MessageSquare, TableProperties,
  Sparkles, CheckCircle, ArrowRight, LayoutDashboard,
  Zap, Star, TrendingUp, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Search,
    title: "Smart Job Search",
    description: "Browse jobs from LinkedIn, Indeed, Glassdoor, and remote boards — unified in one beautiful search experience.",
    gradient: "from-blue-500 to-cyan-500",
    glow: "group-hover:shadow-blue-200",
  },
  {
    icon: FileText,
    title: "AI Resume Optimizer",
    description: "Paste any job description and AI instantly tailors your resume with real keywords — watch your ATS score jump.",
    gradient: "from-violet-500 to-purple-600",
    glow: "group-hover:shadow-violet-200",
  },
  {
    icon: Sparkles,
    title: "ATS Score (0–100)",
    description: "Get a precise ATS score with a breakdown by keyword match, section completeness, and relevance. Know exactly what to fix.",
    gradient: "from-amber-500 to-orange-500",
    glow: "group-hover:shadow-amber-200",
  },
  {
    icon: MessageSquare,
    title: "AI Career Co-pilot",
    description: "Chat with your personal AI agent. Cover letters, interview prep, salary negotiation — all in a streaming chat.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "group-hover:shadow-emerald-200",
  },
  {
    icon: TableProperties,
    title: "Job Tracker",
    description: "Spreadsheet-style tracker — job title, company, link, date applied, resume used, status, notes. Export to CSV instantly.",
    gradient: "from-rose-500 to-pink-600",
    glow: "group-hover:shadow-rose-200",
  },
  {
    icon: LayoutDashboard,
    title: "Analytics Dashboard",
    description: "Live charts: applications per day, status breakdown, response rates, and weekly goal progress — all real-time.",
    gradient: "from-sky-500 to-blue-600",
    glow: "group-hover:shadow-sky-200",
  },
];

const steps = [
  { step: "01", title: "Create your account", desc: "Sign up free in 30 seconds. No credit card, no catch.", icon: Zap },
  { step: "02", title: "Upload your resume", desc: "Drop a PDF or build from scratch. AI structures it instantly.", icon: FileText },
  { step: "03", title: "Optimize for any job", desc: "Paste a job description → AI rewrites your resume for that role.", icon: Sparkles },
  { step: "04", title: "Track & win", desc: "Log every application. Watch your success rate climb.", icon: TrendingUp },
];

const testimonials = [
  { text: "Finally one tool that does everything. The ATS optimizer alone got me 3x more callbacks.", name: "Software Engineer", role: "Hired at a top tech company" },
  { text: "The AI chat wrote a perfect cover letter in 30 seconds. I was skeptical but it worked.", name: "Product Manager", role: "Got 5 interviews in 2 weeks" },
  { text: "The tracker is like having a personal assistant. I can see exactly where every application stands.", name: "Data Scientist", role: "Landed dream job remotely" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white font-black text-base shadow-lg">
              A
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ApplyAI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="btn-glow bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white">
              <Link href="/register">Get started free →</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative animated-gradient text-white overflow-hidden py-28 px-6">
        {/* Floating blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/20 rounded-full animate-blob blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/20 rounded-full animate-blob delay-300 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full animate-blob delay-500 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm text-blue-200 mb-8 border border-blue-400/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            Free forever · Open source · Powered by Gemini AI
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in delay-100 text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
            Land your dream job{" "}
            <span className="gradient-text-blue">with AI</span>{" "}
            by your side
          </h1>

          <p className="animate-fade-in delay-200 text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Job search, AI resume optimization, ATS scoring, career chatbot, and application tracking — all in one free platform. No more juggling 10 different tools.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in delay-300 flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Button size="lg" asChild className="btn-glow text-base px-8 h-12 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 text-white">
              <Link href="/register">
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 h-12 border-white/20 text-white hover:bg-white/10 bg-transparent">
              <Link href="/login">Sign in →</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-in delay-400 flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
            {[
              { icon: CheckCircle, text: "No credit card" },
              { icon: CheckCircle, text: "No rate limits on tracking" },
              { icon: Shield,       text: "Your data stays yours" },
              { icon: Star,         text: "Open source on GitHub" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-emerald-400" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Floating UI mockup cards */}
        <div className="relative max-w-4xl mx-auto mt-16 hidden md:block animate-fade-in-up delay-500">
          <div className="grid grid-cols-3 gap-4">
            {/* ATS Score card */}
            <div className="glass rounded-2xl p-5 animate-float">
              <p className="text-xs text-blue-300 font-medium mb-2">ATS Score</p>
              <div className="text-4xl font-black text-white mb-1">87<span className="text-lg text-slate-400">/100</span></div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-blue-400 to-emerald-400" />
              </div>
              <p className="text-xs text-emerald-400 mt-2">↑ +22 after optimization</p>
            </div>
            {/* Applications card */}
            <div className="glass rounded-2xl p-5 animate-float delay-200">
              <p className="text-xs text-blue-300 font-medium mb-2">This Week</p>
              <div className="text-4xl font-black text-white mb-3">12</div>
              <div className="flex gap-1">
                {[3, 5, 2, 7, 4, 6, 8].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/10 rounded-sm overflow-hidden flex items-end">
                    <div className="w-full rounded-sm bg-gradient-to-t from-blue-400 to-violet-400" style={{ height: `${h * 5}px` }} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">applications sent</p>
            </div>
            {/* AI Chat card */}
            <div className="glass rounded-2xl p-5 animate-float delay-400">
              <p className="text-xs text-blue-300 font-medium mb-3">AI Co-pilot</p>
              <div className="space-y-2">
                <div className="bg-white/10 rounded-lg p-2 text-xs text-slate-300">
                  Write me a cover letter for the React dev role at Stripe
                </div>
                <div className="bg-blue-500/30 rounded-lg p-2 text-xs text-blue-100">
                  ✓ Cover letter ready — 342 words, tailored to Stripe's culture...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-4xl font-black mb-4 tracking-tight">One platform. Every tool.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Stop juggling 10 different apps. ApplyAI brings your entire job search workflow into one clean, intelligent platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`group bg-white rounded-2xl p-6 border hover:border-transparent card-hover card-glow transition-all duration-300 animate-fade-in`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`inline-flex rounded-2xl p-3 mb-5 bg-gradient-to-br ${f.gradient} shadow-lg ${f.glow} transition-shadow duration-300`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-4xl font-black mb-4 tracking-tight">From zero to hired</h2>
            <p className="text-muted-foreground">Get up and running in under 5 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-5 p-6 rounded-2xl bg-slate-50 border hover:border-blue-200 card-hover animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white font-black text-sm shadow-lg">
                    {s.step}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="h-4 w-4 text-blue-500" />
                    <h3 className="font-bold">{s.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">What users say</p>
            <h2 className="text-4xl font-black tracking-tight">Real results, real people</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border card-hover animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 animated-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full animate-blob blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500 rounded-full animate-blob delay-300 blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm text-blue-200 mb-6">
            <Sparkles className="h-4 w-4" /> 100% free forever
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight leading-tight">
            Ready to transform your job search?
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Join job seekers using ApplyAI to get more interviews. No credit card. No catch.
          </p>
          <Button size="lg" asChild className="btn-glow text-base px-10 h-12 bg-white text-slate-900 hover:bg-slate-100 font-bold">
            <Link href="/register">
              Get started for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-white font-black text-xs">A</div>
            <span className="text-sm text-muted-foreground">ApplyAI — Free, open-source job search platform</span>
          </div>
          <div className="flex gap-5 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
