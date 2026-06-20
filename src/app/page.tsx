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
  Star,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Token Analytics",
    description:
      "Track input, output, cache read, and cache creation tokens across all your API calls with detailed breakdowns.",
  },
  {
    icon: DollarSign,
    title: "Cost Tracking",
    description:
      "Monitor your USD spend in real-time. Understand exactly what you're paying per model, per day, per workspace.",
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
      "Compare usage across Opus, Sonnet, Haiku, and Fable. Make informed decisions about which model to use when.",
  },
  {
    icon: Clock,
    title: "Date Range Filtering",
    description:
      "Drill into any time period — today, last week, last month, or a custom range — with a single click.",
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

function Stars({ count, className }: { count: number; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Red top stripe */}
      <div className="h-2 bg-gradient-to-r from-red-700 via-red-600 to-red-700" />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-blue-900/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 shadow-md">
              <Star className="h-4 w-4 fill-white text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-blue-900">
                Claude Dashboard
              </span>
              <div className="flex gap-0.5 mt-[-2px]">
                <div className="h-0.5 flex-1 bg-red-600" />
                <div className="h-0.5 flex-1 bg-white border-b border-gray-200" />
                <div className="h-0.5 flex-1 bg-blue-900" />
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-blue-900/70">
            <a href="#features" className="hover:text-blue-900 transition-colors">Features</a>
            <a href="#metrics" className="hover:text-blue-900 transition-colors">Metrics</a>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
            >
              Sign in
            </Link>
          </nav>
          <Link
            href="/login"
            className="md:hidden inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-blue-900 py-24 px-6">
        {/* Subtle star field background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <Stars count={13} className="mb-6 justify-center" />

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5" />
            Self-hosted · Your data stays local
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
            Built for Americans
            <br />
            <span className="text-red-400">Who Mean Business</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-blue-200 leading-relaxed">
            A self-hosted dashboard that syncs with the Anthropic Admin API to give you
            clear visibility into token consumption, costs, and model usage — all in one place.
            Freedom. Transparency. Control.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-900/40 hover:bg-red-700 transition-all hover:-translate-y-0.5"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* Red-white-blue stripe divider */}
      <div className="flex h-2">
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-white border-y border-gray-100" />
        <div className="flex-1 bg-blue-900" />
      </div>

      {/* Stats strip */}
      <section id="metrics" className="bg-gray-50 py-14 px-6 border-b border-gray-100">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-red-200" />
            <Stars count={5} />
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-900">
              By the Numbers
            </p>
            <Stars count={5} />
            <div className="h-px flex-1 bg-blue-200" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-blue-900">{s.value}</div>
                <div className="mt-1 text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Stars count={7} className="mb-4 justify-center" />
            <h2 className="text-3xl font-extrabold text-blue-900 md:text-4xl">
              Everything you need to understand your usage
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Built on the values of transparency and independence. No third-party analytics,
              no data leaving your infrastructure — your numbers, your rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border bg-white p-7 shadow-sm hover:shadow-md transition-all overflow-hidden"
                style={{
                  borderColor: i % 3 === 0 ? "#dc2626" : i % 3 === 1 ? "#1e3a8a" : "#e5e7eb",
                }}
              >
                {/* Accent corner */}
                <div
                  className="absolute top-0 right-0 h-8 w-8 rounded-bl-2xl"
                  style={{
                    background: i % 3 === 0 ? "#dc2626" : i % 3 === 1 ? "#1e3a8a" : "#f3f4f6",
                  }}
                />
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <f.icon className="h-5 w-5 text-blue-900" />
                </div>
                <h3 className="mb-2 text-base font-bold text-blue-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — red section */}
      <section className="relative overflow-hidden bg-red-600 py-20 px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(255,255,255,0.4) 18px, rgba(255,255,255,0.4) 20px)",
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <Stars count={13} className="mb-4 justify-center" />
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            Ready to take command?
          </h2>
          <p className="mt-4 text-lg text-red-100">
            Sign in with your Google account to access your personal dashboard.
            One nation, under data.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-blue-900 shadow-lg hover:bg-blue-50 transition-colors"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-blue-900 bg-blue-900 py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-white/80">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
              <Star className="h-3.5 w-3.5 fill-white text-white" />
            </div>
            Claude Dashboard — self-hosted Anthropic usage analytics
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-1.5 rounded-full bg-red-500" />
            <div className="h-4 w-1.5 rounded-full bg-white/60" />
            <div className="h-4 w-1.5 rounded-full bg-blue-400" />
            <p className="text-sm text-white/50 ml-1">Data sourced from the Anthropic Admin API</p>
          </div>
        </div>
      </footer>

      {/* Blue bottom stripe */}
      <div className="h-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900" />
    </div>
  );
}
