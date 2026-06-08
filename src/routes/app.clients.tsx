import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader, ConfirmDelete, StatusBadge } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@/lib/types";

export const Route = createFileRoute("/app/clients")({ component: Clients });

const empty: Omit<Client, "id" | "createdAt"> = { name: "", company: "", email: "", phone: "", city: "", industry: "", status: "active", totalSpend: 0 };

function Clients() {
  const { db, setDB, uid } = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(empty);

  const filtered = db.clients.filter((c) => {
    const q = search.toLowerCase();
    const m = !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const s = status === "all" || c.status === status;
    return m && s;
  });

  const startNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (c: Client) => { setEditing(c); setForm(c); setOpen(true); };

  const save = () => {
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    if (editing) {
      setDB((d) => ({ ...d, clients: d.clients.map((c) => c.id === editing.id ? { ...editing, ...form } : c) }));
      toast.success("Client updated");
    } else {
      const c: Client = { ...form, id: uid("c"), createdAt: new Date().toISOString().slice(0, 10) };
      setDB((d) => ({ ...d, clients: [c, ...d.clients] }));
      toast.success("Client added");
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    setDB((d) => ({ ...d, clients: d.clients.filter((c) => c.id !== id) }));
    toast.success("Client deleted");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" subtitle={`${db.clients.length} total · ${db.clients.filter((c) => c.status === "active").length} active`}
        action={<Button onClick={startNew}><Plus className="size-4" /> Add client</Button>} />
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search clients…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold text-muted-foreground bg-surface border-b border-border">
              <tr><th className="px-4 py-3">Client</th><th>Company</th><th>City</th><th>Industry</th><th>Spend</th><th>Status</th><th className="text-right pr-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3"><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.email}</div></td>
                  <td>{c.company}</td><td>{c.city}</td><td>{c.industry}</td>
                  <td className="font-semibold">${c.totalSpend.toLocaleString()}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="text-right pr-4">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(c)}><Pencil className="size-4" /></Button>
                    <ConfirmDelete onConfirm={() => remove(c.id)}><Button size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></ConfirmDelete>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-12">No clients found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit client" : "Add client"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div className="space-y-2"><Label>Industry</Label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
            <div className="space-y-2"><Label>Total Spend</Label><Input type="number" value={form.totalSpend} onChange={(e) => setForm({ ...form, totalSpend: +e.target.value })} /></div>
            <div className="space-y-2 col-span-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Client["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
