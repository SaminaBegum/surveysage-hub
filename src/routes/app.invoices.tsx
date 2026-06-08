import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, useDerived } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { PageHeader, ConfirmDelete, StatusBadge } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Download, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Invoice } from "@/lib/types";

export const Route = createFileRoute("/app/invoices")({ component: Invoices });

const empty: Omit<Invoice, "id"> = { number: "", clientId: "", projectId: "", amount: 0, status: "unpaid", issuedAt: "", dueAt: "" };

function Invoices() {
  const { db, setDB, uid } = useStore();
  const { user } = useAuth();
  const d = useDerived();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState(empty);

  let list = db.invoices;
  if (user?.role === "client") list = list.filter((i) => i.clientId === user.linkedId);

  const save = () => {
    if (!form.number || !form.clientId) { toast.error("Number and client required"); return; }
    if (editing) {
      setDB((db) => ({ ...db, invoices: db.invoices.map((i) => i.id === editing.id ? { ...editing, ...form } : i) }));
      toast.success("Invoice updated");
    } else {
      setDB((db) => ({ ...db, invoices: [{ ...form, id: uid("i") }, ...db.invoices] }));
      toast.success("Invoice created");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle={`${list.length} invoices · $${list.reduce((s, i) => s + i.amount, 0).toLocaleString()} total`}
        action={user?.role === "admin" && <Button onClick={() => { setEditing(null); setForm({ ...empty, number: `INV-${String(db.invoices.length + 1).padStart(3, "0")}`, clientId: db.clients[0]?.id ?? "", projectId: db.projects[0]?.id ?? "", issuedAt: new Date().toISOString().slice(0,10) }); setOpen(true); }}><Plus className="size-4" /> New invoice</Button>} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold text-muted-foreground bg-surface border-b border-border">
              <tr><th className="px-4 py-3">Number</th><th>Client</th><th>Project</th><th>Amount</th><th>Approved</th><th>Auto-calc</th><th>Issued</th><th>Status</th><th className="text-right pr-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((i) => {
                const c = db.clients.find((x) => x.id === i.clientId);
                const p = db.projects.find((x) => x.id === i.projectId);
                const ap = p ? d.approvedByProject(p.id) : 0;
                const auto = p ? ap * p.cpi : 0;
                return (
                  <tr key={i.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-mono font-semibold">{i.number}</td>
                    <td>{c?.company}</td><td className="font-mono text-xs">{p?.code}</td>
                    <td className="font-semibold">${i.amount.toLocaleString()}</td>
                    <td>{ap}</td><td className="text-primary font-semibold">${auto.toLocaleString()}</td>
                    <td className="text-xs">{i.issuedAt}</td><td><StatusBadge status={i.status} /></td>
                    <td className="text-right pr-4 space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => toast.success("PDF downloaded")}><Download className="size-4" /></Button>
                      {user?.role === "admin" && <>
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(i); setForm(i); setOpen(true); }}><Pencil className="size-4" /></Button>
                        <ConfirmDelete onConfirm={() => { setDB((db) => ({ ...db, invoices: db.invoices.filter((x) => x.id !== i.id) })); toast.success("Deleted"); }}><Button size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></ConfirmDelete>
                      </>}
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && <tr><td colSpan={9} className="text-center text-muted-foreground py-12">No invoices.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit invoice" : "New invoice"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Number</Label><Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></div>
            <div className="space-y-2"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} /></div>
            <div className="space-y-2"><Label>Client</Label><Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{db.clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Project</Label><Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{db.projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Issued</Label><Input type="date" value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} /></div>
            <div className="space-y-2"><Label>Due</Label><Input type="date" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} /></div>
            <div className="space-y-2 col-span-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "paid" | "unpaid" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unpaid">Unpaid</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
