import Link from "next/link";
import {
  Zap,
  Users,
  BarChart3,
  DollarSign,
  ArrowRight,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";

const VERTICALS = [
  { name: "Skip Bins", domain: "cheapskipbinsnearme.com.au", searches: "2,400+/mo" },
  { name: "Electricians", domain: "cheapelectriciansnearme.com.au", searches: "3,100+/mo" },
  { name: "Plumbers", domain: "cheapplumbersnearme.com.au", searches: "2,800+/mo" },
  { name: "Cleaners", domain: "cheapcleanersnearme.com.au", searches: "1,900+/mo" },
  { name: "Locksmiths", domain: "cheaplocksmithsnearme.com.au", searches: "1,200+/mo" },
  { name: "Removalists", domain: "cheapremovalistsnearme.com.au", searches: "1,600+/mo" },
];

const FEATURES = [
  {
    icon: Target,
    title: "Targeted Leads",
    description:
      "Only pay for leads in your service area. Choose which suburbs and postcodes you want to cover.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "See your impressions, clicks, and leads in real time. Know exactly what you're getting for your spend.",
  },
  {
    icon: DollarSign,
    title: "Flexible Budgets",
    description:
      "Set a monthly budget or pay per lead. Pause or adjust anytime. No lock-in contracts.",
  },
  {
    icon: Shield,
    title: "Verified Leads Only",
    description:
      "Every lead is a real customer searching for your service right now. No bots, no tire-kickers.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-brand" />
            <span className="text-xl font-bold text-text">
              Cheap<span className="text-brand">X</span> Ad Network
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-text-dim hover:text-text"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-text">
          Get More Customers From
          <br />
          <span className="text-brand">Australia&apos;s Biggest Service Directories</span>
        </h1>
        <p className="mt-6 text-lg text-text-dim max-w-2xl mx-auto">
          Advertise your business across 6 high-traffic service comparison sites.
          Customers are already searching — put your business in front of them.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-brand px-8 py-3 text-base font-semibold text-white hover:bg-brand-hover transition-colors flex items-center gap-2"
          >
            Start Advertising <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-lg border border-border px-8 py-3 text-base font-semibold text-text hover:bg-surface-hover transition-colors"
          >
            How It Works
          </Link>
        </div>
      </section>

      {/* Network Sites */}
      <section className="bg-surface-dim py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-text">
            6 Sites. Thousands of Searches. Your Business.
          </h2>
          <p className="text-center text-text-dim mt-3">
            Each site ranks for &quot;cheap [service] near me&quot; — the highest-intent search term in every trade.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VERTICALS.map((v) => (
              <div
                key={v.domain}
                className="rounded-xl border border-border bg-white p-5 hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-text">{v.name}</p>
                <p className="text-sm text-text-dim mt-1">{v.domain}</p>
                <div className="mt-3 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    {v.searches} searches
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-text">
            How It Works
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up & Choose Sites",
                desc: "Create your free account. Pick which CheapXNearMe sites you want your business to appear on.",
              },
              {
                step: "2",
                title: "Set Your Budget",
                desc: "Choose a monthly budget or pay per lead. Set your service areas. Start appearing in results.",
              },
              {
                step: "3",
                title: "Get Leads & Grow",
                desc: "Customers find you through our sites. Track every impression, click, and lead in your dashboard.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand font-bold text-lg">
                  {s.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-text-dim">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface-dim py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-text">
            Why Advertise With Us
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-white p-6 flex gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light">
                  <f.icon className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{f.title}</h3>
                  <p className="mt-1 text-sm text-text-dim">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold text-text">Simple Pricing</h2>
          <p className="mt-3 text-text-dim">
            No signup fees. No lock-in contracts. Only pay for results.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="rounded-xl border border-border bg-white p-8">
              <h3 className="text-lg font-semibold text-text">Monthly Budget</h3>
              <p className="mt-1 text-sm text-text-dim">
                Set a fixed monthly spend and we&apos;ll maximise your leads within that budget.
              </p>
              <p className="mt-4 text-3xl font-bold text-text">
                From $49<span className="text-base font-normal text-text-dim">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-text-dim text-left">
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-success" /> Appear on up to 6 sites
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-success" /> Full analytics dashboard
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" /> Pause or cancel anytime
                </li>
              </ul>
            </div>
            <div className="rounded-xl border-2 border-brand bg-white p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-0.5 text-xs font-medium text-white">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-text">Pay Per Lead</h3>
              <p className="mt-1 text-sm text-text-dim">
                Only pay when a real customer contacts you. Zero waste.
              </p>
              <p className="mt-4 text-3xl font-bold text-text">
                From $5<span className="text-base font-normal text-text-dim">/lead</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-text-dim text-left">
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-success" /> Verified leads only
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-success" /> Set daily caps
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" /> No minimum commitment
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            Start Getting Leads Today
          </h2>
          <p className="mt-3 text-blue-100">
            Join hundreds of Australian businesses already growing with CheapX Ad Network.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-semibold text-brand hover:bg-blue-50 transition-colors"
          >
            Create Your Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-sm text-text-dim">
          <p>&copy; {new Date().getFullYear()} CheapX Ad Network. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-text">Terms</Link>
            <Link href="/privacy" className="hover:text-text">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
