import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

const problems = [
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="#6366f1" strokeWidth="1.5"/>
        <rect x="13" y="2" width="7" height="7" rx="1.5" stroke="#6366f1" strokeWidth="1.5"/>
        <rect x="2" y="13" width="7" height="7" rx="1.5" stroke="#6366f1" strokeWidth="1.5"/>
        <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="#6366f1" strokeWidth="1.5"/>
      </svg>
    ),
    title: "Everything is scattered",
    desc: "Your stocks live in one app, crypto in another, and mutual funds in a separate spreadsheet.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="9" stroke="#6366f1" strokeWidth="1.5"/>
        <path d="M11 7v5l3 3" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "No visibility",
    desc: "You can't see your total wealth at a glance, let alone how it's growing over time.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
        <path d="M4 16 L7.5 10 L11 12.5 L15 7 L19 10" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 19 H20" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "No consistency",
    desc: "You check your portfolio only when the market is wild. There's no record of your quiet progress.",
  },
];

const assetTypes = [
  { label: "Saham ID", color: "#8B1A1A", bg: "#FEF2F2", icon: "IDX" },
  { label: "Saham US", color: "#1a3a8b", bg: "#EFF6FF", icon: "NYSE" },
  { label: "Crypto", color: "#F7931A", bg: "#FFF7ED", icon: "₿" },
  { label: "Reksa Dana", color: "#059669", bg: "#F0FDF4", icon: "RD" },
  { label: "Cash", color: "#6B7280", bg: "#F9FAFB", icon: "Rp" },
];

const features = [
  {
    title: "Multi-asset tracking",
    desc: "Stocks (ID & US), crypto, mutual funds, and cash — all under one roof.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" stroke="#6366f1" strokeWidth="1.5"/>
        <path d="M10 6v4l2.5 2.5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Monthly journey",
    desc: "Auto-snapshot your portfolio every month. See exactly how far you've come.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect x="2" y="4" width="16" height="14" rx="2" stroke="#6366f1" strokeWidth="1.5"/>
        <path d="M6 2v4M14 2v4M2 9h16" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Milestone alerts",
    desc: "Know the moment you cross 100M, 250M, 500M, 1B — your psychological checkpoints.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <path d="M10 2l2.09 6.26H18l-5 3.64 1.91 6.1L10 14.27 5.09 18l1.91-6.1-5-3.64h5.91L10 2z" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Composition view",
    desc: "Pie chart breakdown of your portfolio — know where your money actually sits.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <path d="M10 3a7 7 0 100 14A7 7 0 0010 3z" stroke="#6366f1" strokeWidth="1.5"/>
        <path d="M10 3v7h7" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Consistency tracking",
    desc: "Track your monthly update streak. Consistency is the edge most investors miss.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <path d="M4 14L7.5 9l3.5 2.5L15 6l4 3.5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Performance view",
    desc: "See your best and worst months. Learn from the patterns in your own data.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <path d="M2 16l5-5 4 3 5-8 4 4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const steps = [
  {
    step: "01",
    title: "Add your assets",
    desc: "Enter your stocks, crypto, mutual funds, and cash. Takes under 5 minutes.",
  },
  {
    step: "02",
    title: "Track monthly",
    desc: "Lavenir locks a snapshot each month-end. Your portfolio history builds automatically.",
  },
  {
    step: "03",
    title: "Watch your journey",
    desc: "See milestones, streaks, and growth over time. Your wealth story, told clearly.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#6366f1]/10 text-[#6366f1] px-3 py-1.5 rounded-full text-sm font-medium mb-6">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path d="M7 1l1.5 4.5H13L9.5 8l1.5 4.5L7 10 3.5 12.5 5 8 1 5.5h4.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              Built for Indonesian investors
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#111827] leading-tight tracking-tight mb-6">
              Track your assets.{" "}
              <span className="text-[#6366f1]">Know your growth.</span>
            </h1>
            <p className="text-xl text-[#6B7280] leading-relaxed mb-10 max-w-2xl mx-auto">
              Lavenir unifies your stocks, crypto, mutual funds, and cash into a single timeline.
              See where you started, celebrate milestones, and build consistency.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/login"
                className="bg-[#6366f1] text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-[#4f46e5] transition-colors shadow-lg shadow-[#6366f1]/25"
              >
                Start tracking free
              </Link>
              <a
                href="#how-it-works"
                className="text-[#6B7280] hover:text-[#111827] transition-colors text-sm font-medium flex items-center gap-1.5"
              >
                See how it works
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="mt-16">
            <div className="bg-[#F0F2F7] rounded-2xl p-6 border border-[#E4E7EC] shadow-xl">
              <div className="bg-white rounded-xl p-5 border border-[#E4E7EC]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-[#6B7280]">Total Portfolio</p>
                    <p className="text-2xl font-bold text-[#111827]">Rp 847.2M</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#059669]/10 text-[#059669] px-2.5 py-1 rounded-full text-sm font-medium">
                    <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                      <path d="M2 9L5 6l2.5 2L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    +23.4% YTD
                  </div>
                </div>
                <div className="h-32 w-full">
                  <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#059669" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,90 C40,85 60,75 100,65 C140,55 160,60 200,50 C240,40 260,35 300,25 C340,15 360,18 400,10 L400,120 L0,120 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M0,90 C40,85 60,75 100,65 C140,55 160,60 200,50 C240,40 260,35 300,25 C340,15 360,18 400,10"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: "Total Return", value: "+Rp 162M", color: "#059669" },
                    { label: "This Month", value: "+3.2%", color: "#059669" },
                    { label: "Total Modal", value: "Rp 685M", color: "#6B7280" },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#F9FAFB] rounded-lg p-3">
                      <p className="text-xs text-[#6B7280]">{s.label}</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="py-20 px-6 bg-[#F0F2F7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-4">Sound familiar?</h2>
            <p className="text-[#6B7280] max-w-xl mx-auto">Most investors face the same problems. Lavenir solves all three.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {problems.map((p) => (
              <div key={p.title} className="card p-6">
                <div className="w-10 h-10 bg-[#6366f1]/10 rounded-xl flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="font-semibold text-[#111827] mb-2">{p.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported assets */}
      <section id="assets" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-4">All your assets, one place</h2>
            <p className="text-[#6B7280]">Support for every major asset class available to Indonesian investors.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {assetTypes.map((a) => (
              <div key={a.label} className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: a.bg, color: a.color }}>
                  {a.icon}
                </div>
                <span className="font-medium text-[#111827] text-sm">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-[#F0F2F7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-4">Everything you need</h2>
            <p className="text-[#6B7280]">Built around how investors actually think — not how spreadsheets work.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="w-9 h-9 bg-[#6366f1]/10 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#111827] mb-1.5">{f.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-4">How it works</h2>
            <p className="text-[#6B7280]">Up and running in minutes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-[#6366f1] text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg shadow-[#6366f1]/20">
                  {s.step}
                </div>
                <h3 className="font-semibold text-[#111827] mb-2 text-lg">{s.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA dark */}
      <section className="py-20 px-6 bg-[#111827]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Start building your financial story</h2>
          <p className="text-[#9CA3AF] mb-8 text-lg">Free to use. No credit card needed. Just your assets and the will to track them.</p>
          <Link
            href="/login"
            className="inline-block bg-[#6366f1] text-white px-10 py-4 rounded-xl font-semibold text-base hover:bg-[#4f46e5] transition-colors shadow-lg shadow-[#6366f1]/30"
          >
            Get started — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#E4E7EC] bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6366f1] flex items-center justify-center">
              <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
                <path d="M2 12 L5 7 L8 9 L11 4 L14 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-[#111827]">Lavenir</span>
          </div>
          <p className="text-sm text-[#6B7280]">© 2025 Lavenir. Built for investors who care about the long game.</p>
        </div>
      </footer>
    </div>
  );
}
