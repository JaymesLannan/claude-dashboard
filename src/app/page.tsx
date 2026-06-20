import Link from "next/link";
import {
  BarChart3,
  DollarSign,
  Zap,
  Clock,
  Shield,
  RefreshCw,
  ArrowRight,
  Activity,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Token Analytics",
    description:
      "Track input, output, cache read, and cache creation tokens across all your API calls with granular breakdowns.",
  },
  {
    icon: DollarSign,
    title: "Cost Tracking",
    description:
      "Monitor USD spend in real-time. Understand exactly what you're paying per model, per day, per workspace.",
  },
  {
    icon: Activity,
    title: "Request Volume",
    description:
      "See request counts over time. Spot traffic patterns and understand peak usage across your organization.",
  },
  {
    icon: Zap,
    title: "Model Breakdown",
    description:
      "Compare usage across Opus, Sonnet, Haiku, and Fable. Make informed decisions about model selection.",
  },
  {
    icon: Clock,
    title: "Date Range Filtering",
    description:
      "Drill into any time period — today, last week, last month, or a fully custom range — in one click.",
  },
  {
    icon: RefreshCw,
    title: "Hourly Sync",
    description:
      "Data is automatically pulled from the Anthropic Admin API every hour so you're never looking at stale numbers.",
  },
];

const stats = [
  { label: "Metrics tracked", value: "6+" },
  { label: "Sync frequency", value: "Hourly" },
  { label: "Models supported", value: "4" },
  { label: "Data freshness", value: "~5 min" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              Claude Dashboard
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
            <a href="#metrics" className="hover:text-white transition-colors duration-150">Metrics</a>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors duration-150"
            >
              Sign in
            </Link>
          </nav>
          <Link
            href="/login"
            className="md:hidden inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-32 text-center overflow-hidden">
        {/* Glow orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, #7c3aed 0%, #4f46e5 40%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/4 top-1/2 h-72 w-72 rounded-full opacity-10 blur-3xl"
          style={{ background: "#06b6d4" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-1/4 top-1/2 h-72 w-72 rounded-full opacity-10 blur-3xl"
          style={{ background: "#8b5cf6" }}
        />

        {/* Subtle dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle, #71717a 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-4xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            Self-hosted · Your data stays local
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-[72px] lg:leading-[1.05]">
            <span className="text-white">Your Claude API</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #38bdf8 100%)",
              }}
            >
              usage, visualized
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            A self-hosted dashboard that syncs with the Anthropic Admin API to give you
            clear visibility into token consumption, costs, and model usage — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 text-[15px] font-semibold text-white shadow-xl shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 hover:-translate-y-0.5"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-[15px] font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        id="metrics"
        className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-14"
      >
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="mt-1 text-sm text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
              Features
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Everything you need to understand your usage
            </h2>
            <p className="mt-4 text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              No third-party analytics, no data leaving your infrastructure.
              Built specifically for the Anthropic API.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:border-violet-500/40 hover:bg-white/[0.06] transition-all duration-200"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "radial-gradient(200px at 50% 0%, rgba(124,58,237,0.08), transparent)"
                  }}
                />
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
                  <f.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="mb-2 text-[15px] font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent p-px">
            <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 px-10 py-14 text-center">
              {/* Inner glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
                style={{
                  background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.3), transparent 60%)",
                }}
              />
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-400">
                  <Shield className="h-3 w-3" />
                  Google OAuth protected
                </div>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Ready to see your usage?
                </h2>
                <p className="mb-8 text-base text-zinc-400">
                  Sign in with your Google account to access your personal dashboard.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-[15px] font-semibold text-white shadow-xl shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <BarChart3 className="h-3 w-3 text-white" />
            </div>
            Claude Dashboard — self-hosted Anthropic usage analytics
          </div>
          <p className="text-sm text-zinc-700">
            Data sourced from the Anthropic Admin API
          </p>
        </div>
      </footer>
    </div>
  );
}
