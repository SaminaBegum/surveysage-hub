import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, useDerived } from "@/lib/store";
import { PageHeader, ConfirmDelete, StatusBadge } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import type { Supplier } from "@/lib/types";

export const Route = createFileRoute("/app/suppliers")({ component: Suppliers });

const empty: Omit<Supplier, "id" | "createdAt"> = { name: "", company: "", email: "", phone: "", country: "", city: "", expertise: "", costPerComplete: 0, status: "active" };

function Suppliers() {
  const { db, setDB, uid } = useStore();
  const { user } = useAuth();
  const d = useDerived();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(empty);

  let list = db.suppliers;
  if (user?.role === "supplier") list = list.filter((s) => s.id === user.linkedId);

  const filtered = list.filter((s) => !search || s.company.toLowerCase().includes(search.toLowerCase()) || s.country.toLowerCase().includes(search.toLowerCase()));

  const save = () => {
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    if (editing) {
      setDB((db) => ({ ...db, suppliers: db.suppliers.map((s) => s.id === editing.id ? { ...editing, ...form } : s) }));
      toast.success("Supplier updated");
    } else {
      setDB((db) => ({ ...db, suppliers: [{ ...form, id: uid("s"), createdAt: new Date().toISOString().slice(0, 10) }, ...db.suppliers] }));
      toast.success("Supplier added");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={user?.role === "supplier" ? "My Profile" : "Suppliers"} subtitle={`${list.length} suppliers`}
        action={user?.role !== "supplier" && <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="size-4" /> Add supplier</Button>} />
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Search…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold text-muted-foreground bg-surface border-b border-border">
              <tr><th className="px-4 py-3">Supplier</th><th>Country</th><th>Expertise</th><th>CPC</th><th>Approved</th><th>Rejected</th><th>Payable</th><th>Status</th><th className="text-right pr-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3"><div className="font-medium">{s.company}</div><div className="text-xs text-muted-foreground">{s.email}</div></td>
                  <td>{s.country}</td><td>{s.expertise}</td><td>${s.costPerComplete}</td>
                  <td className="text-emerald font-semibold">{d.totalApprovedSupplier(s.id)}</td>
                  <td className="text-destructive">{d.rejectedSupplier(s.id)}</td>
                  <td className="font-semibold">${d.supplierPayable(s.id).toFixed(2)}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td className="text-right pr-4">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setForm(s); setOpen(true); }}><Pencil className="size-4" /></Button>
                    {user?.role !== "supplier" && (
                      <ConfirmDelete onConfirm={() => { setDB((db) => ({ ...db, suppliers: db.suppliers.filter((x) => x.id !== s.id) })); toast.success("Deleted"); }}>
                        <Button size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button>
                      </ConfirmDelete>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center text-muted-foreground py-12">No suppliers.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit supplier" : "Add supplier"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
            <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div className="space-y-2 col-span-2"><Label>Expertise</Label><Input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} /></div>
            <div className="space-y-2"><Label>Cost / Complete</Label><Input type="number" step="0.1" value={form.costPerComplete} onChange={(e) => setForm({ ...form, costPerComplete: +e.target.value })} /></div>
            <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Supplier["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
