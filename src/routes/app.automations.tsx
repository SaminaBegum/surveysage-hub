import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/Common";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Play, ShieldCheck, Sparkles, Receipt, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/automations")({ component: AutomationsPage });

const iconFor = (cat: string) => ({
  quality: <ShieldCheck className="size-5" />, billing: <Receipt className="size-5" />,
  routing: <Sparkles className="size-5" />, notify: <Bell className="size-5" />,
} as Record<string, React.ReactNode>)[cat] ?? <Zap className="size-5" />;

function AutomationsPage() {
  const { db, setDB, triggerAutomations } = useStore();

  const toggle = (id: string, on: boolean) => {
    setDB((d) => ({ ...d, automations: d.automations.map((a) => a.id === id ? { ...a, enabled: on } : a) }));
    toast.success(on ? "Automation enabled" : "Automation disabled");
  };
  const updateConfig = (id: string, key: string, value: number) => {
    setDB((d) => ({ ...d, automations: d.automations.map((a) => a.id === id ? { ...a, config: { ...a.config, [key]: value } } : a) }));
  };
  const runNow = (id: string) => {
    triggerAutomations({ type: "manual", ruleId: id }, id);
    toast.success("Automation triggered");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation Engine"
        subtitle="Rules that run automatically on every event and on a 30-second scheduler."
        action={
          <Button onClick={() => { triggerAutomations({ type: "manual" }); toast.success("All enabled automations triggered"); }} className="gap-2">
            <Play className="size-4" /> Run all now
          </Button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-4">
        {db.automations.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className={`size-12 rounded-xl flex items-center justify-center ${a.enabled ? "bg-gradient-to-br from-primary to-emerald text-white" : "bg-muted text-muted-foreground"}`}>
                {iconFor(a.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-bold">{a.name}</h3>
                  <Switch checked={a.enabled} onCheckedChange={(v) => toggle(a.id, v)} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
              </div>
            </div>
            {Object.keys(a.config).length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-border">
                {Object.entries(a.config).map(([k, v]) => (
                  <div key={k}>
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</Label>
                    <Input type="number" value={typeof v === "number" ? v : 0} onChange={(e) => updateConfig(a.id, k, Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Category · {a.category}</span>
              <Button size="sm" variant="outline" onClick={() => runNow(a.id)} className="gap-1.5"><Play className="size-3" /> Run now</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-bold mb-4">Run log</h3>
        {db.runs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No runs yet. Click "Run all now" to test.</p>
        ) : (
          <ul className="divide-y divide-border">
            {db.runs.slice(0, 50).map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.message}</p>
                  <p className="text-[10px] text-muted-foreground">{r.automationId} · trigger: {r.trigger}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald">{r.affected} affected</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleTimeString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
