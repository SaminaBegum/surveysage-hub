import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatusBadge } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Pause, Play } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/links")({ component: Links });

function Links() {
  const { db, setDB } = useStore();
  const { user } = useAuth();

  let links = db.links;
  if (user?.role === "supplier") links = links.filter((l) => l.supplierId === user.linkedId);
  if (user?.role === "client") {
    const cp = db.projects.filter((p) => p.clientId === user.linkedId).map((p) => p.id);
    links = links.filter((l) => cp.includes(l.projectId));
  }

  const copy = (id: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/survey/${id}`;
    if (typeof navigator !== "undefined") navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const toggle = (id: string) => {
    setDB((db) => ({ ...db, links: db.links.map((l) => l.id === id ? { ...l, active: !l.active } : l) }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Survey Links" subtitle="Unique tracking links per project & supplier." />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold text-muted-foreground bg-surface border-b border-border">
              <tr><th className="px-4 py-3">Project</th><th>Type</th><th>Supplier</th><th>Clicks</th><th>Approved</th><th>Conv.</th><th>Status</th><th className="text-right pr-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {links.map((l) => {
                const project = db.projects.find((p) => p.id === l.projectId);
                const supplier = l.supplierId ? db.suppliers.find((s) => s.id === l.supplierId) : null;
                const responses = db.responses.filter((r) => r.linkId === l.id);
                const approved = responses.filter((r) => r.status === "approved").length;
                const conv = l.clicks > 0 ? Math.round((approved / l.clicks) * 100) : 0;
                return (
                  <tr key={l.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3"><div className="font-medium">{project?.name}</div><div className="text-xs text-muted-foreground font-mono">{project?.code}</div></td>
                    <td className="capitalize">{l.type}</td>
                    <td>{supplier?.company ?? "—"}</td>
                    <td>{l.clicks}</td>
                    <td className="text-emerald font-semibold">{approved}</td>
                    <td>{conv}%</td>
                    <td><StatusBadge status={l.active ? "active" : "paused"} /></td>
                    <td className="text-right pr-4 space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => copy(l.id)}><Copy className="size-4" /></Button>
                      <a href={`/survey/${l.id}`} target="_blank" rel="noreferrer"><Button size="icon" variant="ghost"><ExternalLink className="size-4" /></Button></a>
                      {user?.role === "admin" && <Button size="icon" variant="ghost" onClick={() => toggle(l.id)}>{l.active ? <Pause className="size-4" /> : <Play className="size-4" />}</Button>}
                    </td>
                  </tr>
                );
              })}
              {links.length === 0 && <tr><td colSpan={8} className="text-center text-muted-foreground py-12">No links.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
