import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { PageHeader, ConfirmDelete, StatusBadge } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Eye, Trash2, Download, Search } from "lucide-react";
import { toast } from "sonner";
import type { SurveyResponse } from "@/lib/types";

export const Route = createFileRoute("/app/responses")({ component: Responses });

function Responses() {
  const { db, setDB } = useStore();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [projectF, setProjectF] = useState("all");
  const [viewing, setViewing] = useState<SurveyResponse | null>(null);
  const [rejecting, setRejecting] = useState<SurveyResponse | null>(null);
  const [reason, setReason] = useState("");

  let list = db.responses;
  if (user?.role === "supplier") list = list.filter((r) => r.supplierId === user.linkedId);
  if (user?.role === "client") {
    const cp = db.projects.filter((p) => p.clientId === user.linkedId).map((p) => p.id);
    list = list.filter((r) => cp.includes(r.projectId));
  }

  const filtered = list.filter((r) => {
    const q = search.toLowerCase();
    const m = !q || r.respondentName.toLowerCase().includes(q) || r.respondentEmail.toLowerCase().includes(q);
    const s = statusF === "all" || r.status === statusF;
    const p = projectF === "all" || r.projectId === projectF;
    return m && s && p;
  });

  const setStatus = (id: string, status: SurveyResponse["status"], rej?: string) => {
    setDB((db) => ({ ...db, responses: db.responses.map((r) => r.id === id ? { ...r, status, rejectionReason: rej } : r) }));
    toast.success("Response " + status);
  };

  const exportCsv = () => {
    const rows = [["ID", "Project", "Supplier", "Name", "Email", "Status", "Score", "Time", "Date"]];
    filtered.forEach((r) => rows.push([r.id, r.projectId, r.supplierId ?? "", r.respondentName, r.respondentEmail, r.status, String(r.qualityScore), String(r.timeSpent), r.submittedAt]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    if (typeof window === "undefined") return;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "responses.csv"; a.click();
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Responses" subtitle={`${list.length} total responses`}
        action={<Button variant="outline" onClick={exportCsv}><Download className="size-4" /> Export</Button>} />
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input placeholder="Search…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select value={statusF} onValueChange={setStatusF}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent></Select>
        <Select value={projectF} onValueChange={setProjectF}><SelectTrigger className="w-56"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="all">All projects</SelectItem>{db.projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>)}
        </SelectContent></Select>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold text-muted-foreground bg-surface border-b border-border">
              <tr><th className="px-4 py-3">Respondent</th><th>Project</th><th>Supplier</th><th>Score</th><th>Time</th><th>Date</th><th>Status</th><th className="text-right pr-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => {
                const p = db.projects.find((x) => x.id === r.projectId);
                const s = db.suppliers.find((x) => x.id === r.supplierId);
                return (
                  <tr key={r.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3"><div className="font-medium">{r.respondentName}</div><div className="text-xs text-muted-foreground">{r.respondentEmail}</div></td>
                    <td className="font-mono text-xs">{p?.code}</td><td>{s?.company ?? "—"}</td>
                    <td><span className={r.qualityScore >= 70 ? "text-emerald font-semibold" : "text-destructive font-semibold"}>{r.qualityScore}</span></td>
                    <td>{Math.round(r.timeSpent / 60)}m</td>
                    <td className="text-xs">{new Date(r.submittedAt).toLocaleDateString()}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="text-right pr-4 space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(r)}><Eye className="size-4" /></Button>
                      {user?.role === "admin" && r.status !== "approved" && <Button size="icon" variant="ghost" onClick={() => setStatus(r.id, "approved")}><Check className="size-4 text-emerald" /></Button>}
                      {user?.role === "admin" && r.status !== "rejected" && <Button size="icon" variant="ghost" onClick={() => { setRejecting(r); setReason(""); }}><X className="size-4 text-destructive" /></Button>}
                      {user?.role === "admin" && <ConfirmDelete onConfirm={() => { setDB((db) => ({ ...db, responses: db.responses.filter((x) => x.id !== r.id) })); toast.success("Deleted"); }}><Button size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></ConfirmDelete>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center text-muted-foreground py-12">No responses.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Response details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div><strong>Respondent:</strong> {viewing.respondentName} ({viewing.respondentEmail})</div>
              <div><strong>Status:</strong> <StatusBadge status={viewing.status} /></div>
              <div><strong>Quality Score:</strong> {viewing.qualityScore}</div>
              <div><strong>Time spent:</strong> {viewing.timeSpent}s</div>
              <div><strong>IP:</strong> {viewing.ip}</div>
              {viewing.rejectionReason && <div><strong>Rejection reason:</strong> {viewing.rejectionReason}</div>}
              <div><strong>Answers:</strong><pre className="mt-2 rounded-md bg-muted p-3 text-xs overflow-auto">{JSON.stringify(viewing.answers, null, 2)}</pre></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject response</DialogTitle></DialogHeader>
          <div className="space-y-2"><Label>Reason</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Straight-lining, too fast…" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
            <Button onClick={() => { if (rejecting) setStatus(rejecting.id, "rejected", reason); setRejecting(null); }} className="bg-destructive text-destructive-foreground">Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
