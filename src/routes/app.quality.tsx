import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader, StatusBadge } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Check, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { toast } from "sonner";

export const Route = createFileRoute("/app/quality")({ component: Quality });

function Quality() {
  const { db, setDB } = useStore();

  const flagged = db.responses.map((r) => {
    const flags: string[] = [];
    if (r.timeSpent < 60) flags.push("Speeder");
    if (db.responses.filter((x) => x.ip === r.ip && x.id !== r.id).length > 0) flags.push("Duplicate IP");
    if (db.responses.filter((x) => x.respondentEmail === r.respondentEmail && x.id !== r.id).length > 0 && r.respondentEmail) flags.push("Duplicate email");
    if (r.qualityScore < 50) flags.push("Low quality");
    return { ...r, flags };
  });

  const suspicious = flagged.filter((r) => r.flags.length > 0);

  const setStatus = (id: string, status: "approved" | "rejected") => {
    setDB((db) => ({ ...db, responses: db.responses.map((r) => r.id === id ? { ...r, status, rejectionReason: status === "rejected" ? "Failed quality check" : undefined } : r) }));
    toast.success("Updated");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Quality Check" subtitle="Automated fraud and quality detection." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total" value={db.responses.length} accent="electric" icon={<ShieldCheck className="size-4" />} />
        <KPICard label="Flagged" value={suspicious.length} accent="destructive" icon={<AlertTriangle className="size-4" />} />
        <KPICard label="Clean" value={db.responses.length - suspicious.length} accent="emerald" />
        <KPICard label="Avg Quality" value={Math.round(db.responses.reduce((s, r) => s + r.qualityScore, 0) / Math.max(1, db.responses.length))} accent="navy" />
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold text-muted-foreground bg-surface border-b border-border">
              <tr><th className="px-4 py-3">Respondent</th><th>IP</th><th>Time</th><th>Score</th><th>Flags</th><th>Status</th><th className="text-right pr-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {flagged.map((r) => (
                <tr key={r.id} className={r.flags.length > 0 ? "bg-destructive/5" : ""}>
                  <td className="px-4 py-3"><div className="font-medium">{r.respondentName}</div></td>
                  <td className="font-mono text-xs">{r.ip}</td><td>{r.timeSpent}s</td>
                  <td className={r.qualityScore >= 70 ? "text-emerald font-semibold" : "text-destructive font-semibold"}>{r.qualityScore}</td>
                  <td><div className="flex gap-1 flex-wrap">{r.flags.map((f) => <span key={f} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold">{f}</span>)}{r.flags.length === 0 && <span className="text-xs text-emerald">Clean</span>}</div></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="text-right pr-4">
                    {r.status !== "approved" && <Button size="icon" variant="ghost" onClick={() => setStatus(r.id, "approved")}><Check className="size-4 text-emerald" /></Button>}
                    {r.status !== "rejected" && <Button size="icon" variant="ghost" onClick={() => setStatus(r.id, "rejected")}><X className="size-4 text-destructive" /></Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
