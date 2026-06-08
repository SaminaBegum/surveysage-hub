import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/plans")({ component: Plans });

function Plans() {
  const { db, setDB } = useStore();
  const active = db.plans.find((p) => p.id === db.settings.activePlanId);
  const responsesUsed = db.responses.length;
  const usage = active ? Math.min(100, Math.round((responsesUsed / active.responseLimit) * 100)) : 0;

  const upgrade = (id: string) => {
    setDB((db) => ({ ...db, settings: { ...db.settings, activePlanId: id }, plans: db.plans.map((p) => ({ ...p, active: p.id === id })) }));
    toast.success("Plan updated");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="SaaS Plans" subtitle="Manage your subscription and usage." />
      {active && (
        <div className="rounded-2xl border border-border bg-gradient-to-br from-navy to-electric text-white p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">Current plan</p>
              <h3 className="font-display text-2xl font-bold flex items-center gap-2"><Crown className="size-5" /> {active.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${active.price}<span className="text-sm opacity-80">/mo</span></p>
              <p className="text-xs opacity-80">Billing active</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div><p className="opacity-80 text-xs">Projects</p><p className="font-bold">{db.projects.length} / {active.projectLimit === 9999 ? "∞" : active.projectLimit}</p></div>
            <div><p className="opacity-80 text-xs">Suppliers</p><p className="font-bold">{db.suppliers.length} / {active.supplierLimit === 9999 ? "∞" : active.supplierLimit}</p></div>
            <div><p className="opacity-80 text-xs">Responses</p><p className="font-bold">{responsesUsed} / {active.responseLimit === 999999 ? "∞" : active.responseLimit.toLocaleString()}</p></div>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-emerald" style={{ width: `${usage}%` }} /></div>
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-4">
        {db.plans.map((p) => (
          <div key={p.id} className={`rounded-2xl border bg-card p-6 ${p.active ? "border-primary ring-1 ring-primary/30" : "border-border"}`}>
            <p className="text-sm font-semibold text-muted-foreground">{p.name}</p>
            <p className="text-3xl font-display font-bold mt-2">${p.price}<span className="text-sm text-muted-foreground">/mo</span></p>
            <ul className="mt-4 space-y-2 text-sm">{p.features.map((f) => <li key={f} className="flex items-start gap-2"><Check className="size-4 text-emerald mt-0.5 shrink-0" />{f}</li>)}</ul>
            <Button className="w-full mt-6" disabled={p.active} variant={p.active ? "outline" : "default"} onClick={() => upgrade(p.id)}>{p.active ? "Current plan" : "Upgrade"}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
