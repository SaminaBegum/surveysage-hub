import { createFileRoute } from "@tanstack/react-router";
import { useStore, useDerived } from "@/lib/store";
import { PageHeader } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({ component: Reports });

function Reports() {
  const { db } = useStore();
  const d = useDerived();

  const reports = [
    { title: "Project Performance Report", desc: "All projects with progress & completes." },
    { title: "Client Report", desc: "Spend, projects, and activity per client." },
    { title: "Supplier Performance Report", desc: "Approved/rejected rates per supplier." },
    { title: "Approved Response Report", desc: "All approved responses with quality scores." },
    { title: "Rejected Response Report", desc: "Rejection reasons and fraud patterns." },
    { title: "Daily Progress Report", desc: "Daily response volume and conversion." },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Export-ready reports for clients and internal teams." />
      <div className="grid md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div key={r.title} className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-all">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4"><FileText className="size-5" /></div>
            <h3 className="font-display font-bold">{r.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => toast.success("Preview opened")}>Preview</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("PDF downloaded")}><Download className="size-3" /> PDF</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Excel exported")}><Download className="size-3" /> Excel</Button>
              <Button size="sm" variant="ghost" onClick={() => toast.success("Shared with client")}><Share2 className="size-3" /> Share</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-bold mb-4">Project Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold text-muted-foreground border-b border-border">
              <tr><th className="py-2">Code</th><th>Project</th><th>Sample</th><th>Approved</th><th>Progress</th><th>Revenue</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {db.projects.map((p) => {
                const ap = d.approvedByProject(p.id);
                return <tr key={p.id}><td className="py-3 font-mono text-xs">{p.code}</td><td className="font-medium">{p.name}</td><td>{p.sampleSize}</td><td className="text-emerald font-semibold">{ap}</td><td>{d.projectProgress(p.id)}%</td><td className="font-semibold">${(ap * p.cpi).toLocaleString()}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
