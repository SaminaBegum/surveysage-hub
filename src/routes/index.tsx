import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  CheckSquare, ShieldCheck, Link2, BarChart3, Receipt, Users, Truck,
  FolderKanban, FileEdit, Zap, ArrowRight, Sparkles, Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SurveySathi Pro — Smart Survey Management for Market Research" },
      { name: "description", content: "Run market research projects faster, smarter & cleaner. Manage clients, suppliers, survey links, quality checks, reports and payments." },
      { property: "og:title", content: "SurveySathi Pro" },
      { property: "og:description", content: "All-in-one SaaS for market research operations." },
    ],
  }),
  component: Landing,
});

const modules = [
  { icon: Users, title: "Client Management", desc: "Full CRM for research clients, projects and spend." },
  { icon: Truck, title: "Supplier Management", desc: "Track panel partners, CPC and approval rates." },
  { icon: FolderKanban, title: "Project Management", desc: "Live status, sample tracking, quota balancing." },
  { icon: FileEdit, title: "Survey Builder", desc: "Drag-and-drop questions with logic and validation." },
  { icon: Link2, title: "Unique Survey Links", desc: "Auto-generated tracking links per supplier." },
  { icon: CheckSquare, title: "Response Tracking", desc: "Real-time completes, starts and conversion." },
  { icon: ShieldCheck, title: "Quality Check", desc: "Auto fraud, duplicate and speeder detection." },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Export-ready dashboards and PDF reports." },
  { icon: Receipt, title: "Invoices & Payments", desc: "Auto invoicing and supplier payable calc." },
  { icon: Zap, title: "Automation", desc: "Auto-close on target, alerts, and quality rules." },
];

const plans = [
  { name: "Starter", price: 199, popular: false, items: ["5 active projects", "10 suppliers", "1,000 responses / month", "Email support"] },
  { name: "Professional", price: 499, popular: true, items: ["25 active projects", "100 suppliers", "10,000 responses / month", "Advanced automation", "Priority support"] },
  { name: "Enterprise", price: 1499, popular: false, items: ["Unlimited projects", "Unlimited suppliers", "Custom automation", "Dedicated CSM", "SLA & SSO"] },
];

const steps = [
  "Create project", "Add client and suppliers", "Build survey", "Generate unique links",
  "Collect responses", "Verify quality", "Share report", "Track payment",
];

function Landing() {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#modules" className="text-muted-foreground hover:text-foreground">Platform</a>
            <a href="#how" className="text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a>
            <div className="h-4 w-px bg-border" />
            <Link to="/auth/login" className="text-muted-foreground hover:text-foreground">Sign In</Link>
            <Link to="/auth/signup"><Button className="rounded-full">Start Free Trial</Button></Link>
          </div>
          <Link to="/auth/login" className="md:hidden"><Button size="sm">Sign In</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden pt-20 pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.62_0.2_252/0.12),transparent)]" />
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1 text-xs font-semibold text-emerald">
            <Sparkles className="size-3" /> NEW: Automated Fraud Detection 2.0
          </div>
          <h1 className="font-display mx-auto max-w-4xl text-5xl md:text-6xl font-bold tracking-tight text-navy dark:text-foreground">
            Run Market Research Projects <span className="gradient-text">Faster, Smarter & Cleaner.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Manage clients, suppliers, survey links, quality checks, reports and payments from one premium SaaS dashboard built for market research companies.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/auth/login"><Button size="lg" className="rounded-xl bg-primary px-8 shadow-elegant">Login</Button></Link>
            <Link to="/auth/signup"><Button size="lg" variant="outline" className="rounded-xl px-8">Create Account</Button></Link>
            <a href="#modules"><Button size="lg" variant="ghost" className="rounded-xl px-8">View Demo <ArrowRight className="ml-1 size-4" /></Button></a>
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="mx-auto mt-16 max-w-7xl px-6">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-elegant">
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <div className="grid grid-cols-12">
                <aside className="col-span-3 hidden md:block border-r border-border p-5 bg-surface/50">
                  <div className="space-y-2">
                    {["Dashboard", "Projects", "Suppliers", "Responses", "Reports"].map((l, i) => (
                      <div key={l} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${i === 1 ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}>
                        <div className="size-4 rounded bg-current opacity-30" />{l}
                      </div>
                    ))}
                  </div>
                </aside>
                <main className="col-span-12 md:col-span-9 p-6">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-display font-bold">Global Consumer Study</h3>
                      <p className="text-xs text-muted-foreground">PRJ-2024-001</p>
                    </div>
                    <span className="rounded-full bg-emerald/10 text-emerald px-3 py-1 text-[10px] font-bold uppercase tracking-wider">LIVE</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { l: "Completes", v: "1,248 / 2,000", bar: 62 },
                      { l: "LOI (min)", v: "14.2", hint: "+2% vs target" },
                      { l: "Incidence", v: "48%", hint: "5 regions" },
                      { l: "Revenue", v: "$14,850", hint: "Current billable" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl border border-border bg-surface p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.l}</p>
                        <p className="mt-1 text-xl font-display font-bold">{s.v}</p>
                        {s.bar !== undefined && <div className="mt-2 h-1.5 w-full rounded-full bg-border"><div className="h-full rounded-full bg-primary" style={{ width: `${s.bar}%` }} /></div>}
                        {s.hint && <p className="mt-1 text-xs text-emerald">{s.hint}</p>}
                      </div>
                    ))}
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* About */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold">A complete research operations platform.</h2>
        <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">SurveySathi Pro helps survey companies manage client projects, supplier links, live responses, fraud checks and reporting — all from one premium SaaS dashboard.</p>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Every module your team needs.</h2>
          <p className="mt-3 text-muted-foreground">Ten focused modules, one premium operations layer.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {modules.map((m) => (
            <div key={m.title} className="rounded-2xl border border-border bg-card p-5 hover:shadow-elegant hover:-translate-y-0.5 transition-all">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <m.icon className="size-5" />
              </div>
              <h3 className="font-display font-bold">{m.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-background border-y border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">From kickoff to payment in 8 steps.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <div key={s} className="rounded-xl border border-border bg-card p-5">
                <div className="size-8 rounded-lg bg-gradient-to-br from-navy to-electric text-white flex items-center justify-center font-bold text-sm">{i + 1}</div>
                <p className="mt-3 font-medium text-sm">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Scalable pricing for every research firm.</h2>
          <p className="mt-3 text-muted-foreground">No per-user fees. Scale with your research volume.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-2xl border bg-card p-8 flex flex-col ${p.popular ? "border-primary shadow-elegant ring-1 ring-primary/30" : "border-border"}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-full">Most Popular</div>}
              <p className="text-sm font-semibold text-muted-foreground">{p.name}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold">${p.price}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {p.items.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="size-4 text-emerald mt-0.5 shrink-0" />{i}
                  </li>
                ))}
              </ul>
              <Link to="/auth/signup" className="mt-8">
                <Button className="w-full" variant={p.popular ? "default" : "outline"}>Start with {p.name}</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-navy to-electric text-white p-12 text-center shadow-elegant">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Start managing research projects like a premium enterprise.</h2>
          <p className="mt-3 opacity-80">Demo accounts available. No credit card needed.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth/login"><Button size="lg" className="rounded-xl bg-white text-navy hover:bg-white/90">Login</Button></Link>
            <Link to="/auth/signup"><Button size="lg" variant="outline" className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10">Create Account</Button></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">© 2026 SurveySathi Operations Inc. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">About</a>
            <a href="#modules" className="hover:text-foreground">Features</a>
            <a href="#" className="hover:text-foreground">Contact</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
