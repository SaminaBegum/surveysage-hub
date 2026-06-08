import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, useDerived } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatusBadge } from "@/components/Common";
import { Activity, CheckCircle2, XCircle, DollarSign, TrendingUp, Sparkles, Zap, FileText, Users as UsersIcon, BarChart3 } from "lucide-react";
import { useState } from "react";
import { POINTS_PER_DOLLAR, tierFor } from "@/lib/types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

interface TimelineItem { id: string; title: string; meta: string; time: string; tone: "info" | "success" | "warning" | "danger"; }

function Dashboard() {
  const { db, triggerAutomations } = useStore();
  const { user } = useAuth();
  const d = useDerived();
  const [showAnalytics, setShowAnalytics] = useState(false);
  if (!user) return null;

  // ----- role-scoped data -----
  const scopedProjects = user.role === "client" ? db.projects.filter((p) => p.clientId === user.linkedId)
    : user.role === "supplier" ? db.projects.filter((p) => p.supplierIds.includes(user.linkedId ?? ""))
    : db.projects;
  const scopedResponses = user.role === "client" ? db.responses.filter((r) => scopedProjects.some((p) => p.id === r.projectId))
    : user.role === "supplier" ? db.responses.filter((r) => r.supplierId === user.linkedId)
    : user.role === "respondent" ? db.responses.filter((r) => r.respondentUserId === user.id)
    : db.responses;

  // ----- hero KPI per role -----
  const today = new Date().toISOString().slice(0, 10);
  let hero: { label: string; value: string; sub: string; tone: "primary" | "emerald" | "navy"; icon: React.ReactNode };
  if (user.role === "admin") {
    const todayCompletes = db.responses.filter((r) => r.submittedAt.slice(0, 10) === today && r.status === "approved").length;
    const revToday = db.invoices.filter((i) => i.issuedAt === today && i.status === "paid").reduce((s, i) => s + i.amount, 0);
    hero = { label: "Today's pulse", value: `${todayCompletes} completes`, sub: `$${revToday.toLocaleString()} revenue today`, tone: "primary", icon: <TrendingUp className="size-6" /> };
  } else if (user.role === "client") {
    const total = scopedProjects.reduce((s, p) => s + p.sampleSize, 0);
    const done = scopedProjects.reduce((s, p) => s + d.approvedByProject(p.id), 0);
    const pct = total ? Math.round((done / total) * 100) : 0;
    hero = { label: "Portfolio completion", value: `${pct}%`, sub: `${done.toLocaleString()} of ${total.toLocaleString()} approved completes`, tone: "emerald", icon: <Activity className="size-6" /> };
  } else if (user.role === "supplier") {
    const earned = d.supplierPayable(user.linkedId ?? "");
    const month = scopedResponses.filter((r) => r.status === "approved" && new Date(r.submittedAt).getMonth() === new Date().getMonth()).length;
    hero = { label: "Earnings this month", value: `$${earned.toFixed(0)}`, sub: `${month} approved completes`, tone: "emerald", icon: <DollarSign className="size-6" /> };
  } else {
    const w = d.walletFor(user.id);
    const tier = tierFor(w.lifetimePoints);
    hero = { label: "Points balance", value: w.points.toLocaleString(), sub: `${tier} tier · worth $${(w.points / POINTS_PER_DOLLAR).toFixed(2)}`, tone: "primary", icon: <Sparkles className="size-6" /> };
  }

  // ----- timeline -----
  const timeline: TimelineItem[] = [];
  scopedResponses.slice(0, 12).forEach((r) => {
    const p = db.projects.find((x) => x.id === r.projectId);
    timeline.push({
      id: `r-${r.id}`,
      title: r.status === "approved" ? `Response approved` : r.status === "rejected" ? `Response rejected` : `Response submitted`,
      meta: `${p?.code ?? ""} · ${r.respondentName}${r.rejectionReason ? ` · ${r.rejectionReason}` : ""}`,
      time: r.submittedAt,
      tone: r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "info",
    });
  });
  if (user.role === "admin" || user.role === "client") {
    db.invoices.slice(0, 5).forEach((i) =>
      timeline.push({ id: `i-${i.id}`, title: `Invoice ${i.number} ${i.status}`, meta: `$${i.amount.toLocaleString()} · ${db.clients.find(c=>c.id===i.clientId)?.company ?? ""}`, time: i.issuedAt, tone: i.status === "paid" ? "success" : "warning" }),
    );
  }
  if (user.role === "respondent") {
    db.ledger.filter((l) => l.userId === user.id).slice(0, 10).forEach((l) =>
      timeline.push({ id: `l-${l.id}`, title: `${l.delta > 0 ? "+" : ""}${l.delta} pts`, meta: l.reason, time: l.createdAt, tone: l.delta > 0 ? "success" : "info" }),
    );
  }
  db.runs.slice(0, 5).forEach((r) =>
    timeline.push({ id: `run-${r.id}`, title: `🤖 ${r.message}`, meta: `Automation · ${r.automationId}`, time: r.createdAt, tone: "info" }),
  );
  timeline.sort((a, b) => b.time.localeCompare(a.time));

  const toneClasses = { info: "bg-primary/10 text-primary", success: "bg-emerald/10 text-emerald", warning: "bg-amber-500/10 text-amber-600", danger: "bg-destructive/10 text-destructive" };

  // ----- analytics charts (collapsible) -----
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(); day.setDate(day.getDate() - (6 - i));
    const key = day.toISOString().slice(0, 10);
    return { day: day.toLocaleDateString("en", { weekday: "short" }),
      responses: scopedResponses.filter((r) => r.submittedAt.slice(0, 10) === key).length };
  });
  const supplierPerf = db.suppliers.slice(0, 5).map((s) => ({ name: s.company.slice(0, 12), approved: d.totalApprovedSupplier(s.id), rejected: d.rejectedSupplier(s.id) }));
  const pie = [
    { name: "Approved", value: scopedResponses.filter((r) => r.status === "approved").length, color: "oklch(0.72 0.17 165)" },
    { name: "Rejected", value: scopedResponses.filter((r) => r.status === "rejected").length, color: "oklch(0.58 0.24 27)" },
    { name: "Pending", value: scopedResponses.filter((r) => r.status === "pending").length, color: "oklch(0.78 0.15 80)" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Here's what's happening right now."
        action={user.role === "admin" ? (
          <Button onClick={() => triggerAutomations({ type: "manual" })} className="gap-2">
            <Zap className="size-4" /> Run automations
          </Button>
        ) : undefined}
      />

      {/* HERO */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-elegant">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{hero.label}</p>
            <p className="mt-3 font-display text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">{hero.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{hero.sub}</p>
          </div>
          <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-emerald text-white flex items-center justify-center shadow-elegant">{hero.icon}</div>
        </div>
        <div className="mt-6 flex gap-2 flex-wrap">
          {user.role === "admin" && <>
            <QuickLink to="/app/automations" icon={<Zap className="size-3.5" />} label="Automations" />
            <QuickLink to="/app/projects" icon={<FileText className="size-3.5" />} label="Projects" />
            <QuickLink to="/app/clients" icon={<UsersIcon className="size-3.5" />} label="Clients" />
            <QuickLink to="/app/reports" icon={<BarChart3 className="size-3.5" />} label="Reports" />
          </>}
          {user.role === "client" && <>
            <QuickLink to="/app/projects" icon={<FileText className="size-3.5" />} label="My projects" />
            <QuickLink to="/app/reports" icon={<BarChart3 className="size-3.5" />} label="Reports" />
            <QuickLink to="/app/invoices" icon={<DollarSign className="size-3.5" />} label="Invoices" />
          </>}
          {user.role === "supplier" && <>
            <QuickLink to="/app/links" icon={<FileText className="size-3.5" />} label="My links" />
            <QuickLink to="/app/responses" icon={<CheckCircle2 className="size-3.5" />} label="My completes" />
            <QuickLink to="/app/payments" icon={<DollarSign className="size-3.5" />} label="Payments" />
          </>}
          {user.role === "respondent" && <>
            <QuickLink to="/app/wallet" icon={<Sparkles className="size-3.5" />} label="Wallet" />
            <QuickLink to="/app/rewards" icon={<DollarSign className="size-3.5" />} label="Redeem rewards" />
          </>}
        </div>
      </div>

      {/* TIMELINE + side */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Activity timeline</h3>
            <Link to="/app/notifications" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
          ) : (
            <ol className="space-y-3">
              {timeline.slice(0, 15).map((t) => (
                <li key={t.id} className="flex items-start gap-3 group">
                  <div className={`size-8 shrink-0 rounded-full flex items-center justify-center ${toneClasses[t.tone]}`}>
                    {t.tone === "success" ? <CheckCircle2 className="size-4" /> : t.tone === "danger" ? <XCircle className="size-4" /> : <Activity className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-3 border-b border-border/50 group-last:border-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.meta}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(t.time).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-bold mb-4">Recent {user.role === "respondent" ? "available surveys" : "projects"}</h3>
          {user.role === "respondent" ? (
            <ul className="space-y-3">
              {db.projects.filter((p) => p.status === "live").slice(0, 5).map((p) => {
                const main = db.links.find((l) => l.projectId === p.id && l.type === "main");
                return (
                  <li key={p.id} className="rounded-xl border border-border p-3 hover:border-primary/40 transition-colors">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.audience} · earn ~{Math.round(p.cpi * 10)} pts</p>
                    {main && <Link to="/survey/$linkId" params={{ linkId: main.id }} className="mt-2 inline-flex text-xs font-bold text-primary hover:underline">Take survey →</Link>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="space-y-2">
              {scopedProjects.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{p.code}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Analytics toggle */}
      <div>
        <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)} className="gap-2">
          <BarChart3 className="size-4" /> {showAnalytics ? "Hide" : "Show"} detailed analytics
        </Button>
      </div>
      {showAnalytics && (
        <div className="grid lg:grid-cols-3 gap-4 animate-fade-in">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display font-bold mb-4">Daily responses (7d)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={last7}>
                <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="oklch(0.62 0.2 252)" stopOpacity={0.4} /><stop offset="95%" stopColor="oklch(0.62 0.2 252)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.013 256)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                <Area type="monotone" dataKey="responses" stroke="oklch(0.62 0.2 252)" fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display font-bold mb-4">Quality breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>{pie.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Legend /><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          {(user.role === "admin") && (
            <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display font-bold mb-4">Supplier performance</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={supplierPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.013 256)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend />
                  <Bar dataKey="approved" fill="oklch(0.72 0.17 165)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="rejected" fill="oklch(0.58 0.24 27)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuickLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-semibold hover:border-primary/40 hover:text-primary transition-colors">
      {icon} {label}
    </Link>
  );
}
