import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, useDerived } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { PageHeader, ConfirmDelete, StatusBadge } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Play, Pause, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Project, ProjectStatus } from "@/lib/types";

export const Route = createFileRoute("/app/projects")({ component: Projects });

const empty = { name: "", clientId: "", category: "", audience: "", location: "", sampleSize: 100, startDate: "", endDate: "", cpi: 5, supplierCpi: 2, supplierIds: [] as string[], status: "draft" as ProjectStatus };

function Projects() {
  const { db, setDB, uid } = useStore();
  const { user } = useAuth();
  const d = useDerived();
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(empty);

  let list = db.projects;
  if (user?.role === "client") list = list.filter((p) => p.clientId === user.linkedId);
  if (user?.role === "supplier") list = list.filter((p) => p.supplierIds.includes(user.linkedId ?? ""));

  const filtered = list.filter((p) => {
    const q = search.toLowerCase();
    const m = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    const s = statusF === "all" || p.status === statusF;
    return m && s;
  });

  const startNew = () => { setEditing(null); setForm({ ...empty, clientId: db.clients[0]?.id ?? "" }); setOpen(true); };
  const startEdit = (p: Project) => { setEditing(p); setForm(p); setOpen(true); };

  const genCode = () => `PRJ-${new Date().getFullYear()}-${String(db.projects.length + 1).padStart(3, "0")}`;

  const save = () => {
    if (!form.name || !form.clientId) { toast.error("Name and client required"); return; }
    if (editing) {
      setDB((db) => ({ ...db, projects: db.projects.map((p) => p.id === editing.id ? { ...editing, ...form } : p) }));
      toast.success("Project updated");
    } else {
      const p: Project = { ...form, id: uid("p"), code: genCode(), createdAt: new Date().toISOString().slice(0, 10) };
      setDB((db) => ({
        ...db,
        projects: [p, ...db.projects],
        surveys: [{ id: `sv-${p.id}`, projectId: p.id, title: p.name, questions: [] }, ...db.surveys],
        links: [{ id: `lnk-${p.id}-main`, projectId: p.id, type: "main", active: false, clicks: 0 }, ...db.links],
      }));
      toast.success("Project created with code " + p.code);
    }
    setOpen(false);
  };

  const setStatus = (id: string, status: ProjectStatus) => {
    setDB((db) => ({ ...db, projects: db.projects.map((p) => p.id === id ? { ...p, status } : p) }));
    toast.success(`Project ${status}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={user?.role === "admin" ? "Projects" : "My Projects"} subtitle={`${list.length} projects`}
        action={user?.role === "admin" && <Button onClick={startNew}><Plus className="size-4" /> New project</Button>} />
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input placeholder="Search…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select value={statusF} onValueChange={setStatusF}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="all">All</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="live">Live</SelectItem><SelectItem value="paused">Paused</SelectItem><SelectItem value="completed">Completed</SelectItem>
        </SelectContent></Select>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const prog = d.projectProgress(p.id);
          const client = db.clients.find((c) => c.id === p.clientId);
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground">{p.code}</p>
                  <h3 className="font-display font-bold mt-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{client?.company ?? "—"} · {p.location}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs"><span>Progress</span><span className="font-semibold">{prog}% · {d.approvedByProject(p.id)}/{p.sampleSize}</span></div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-emerald rounded-full" style={{ width: `${prog}%` }} /></div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div><p className="text-muted-foreground">CPI</p><p className="font-bold">${p.cpi}</p></div>
                <div><p className="text-muted-foreground">Sample</p><p className="font-bold">{p.sampleSize}</p></div>
                <div><p className="text-muted-foreground">Suppliers</p><p className="font-bold">{p.supplierIds.length}</p></div>
              </div>
              {user?.role === "admin" && (
                <div className="mt-4 flex gap-1 flex-wrap">
                  {p.status !== "live" && <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "live")}><Play className="size-3" /> Go live</Button>}
                  {p.status === "live" && <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "paused")}><Pause className="size-3" /> Pause</Button>}
                  {p.status !== "completed" && <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "completed")}><CheckCircle2 className="size-3" /> Complete</Button>}
                  <Button size="sm" variant="ghost" onClick={() => startEdit(p)}><Pencil className="size-3" /></Button>
                  <ConfirmDelete onConfirm={() => { setDB((db) => ({ ...db, projects: db.projects.filter((x) => x.id !== p.id) })); toast.success("Deleted"); }}>
                    <Button size="sm" variant="ghost"><Trash2 className="size-3 text-destructive" /></Button>
                  </ConfirmDelete>
                </div>
              )}
              <Link to="/app/links" className="mt-3 inline-block text-xs text-primary hover:underline">Manage links →</Link>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="md:col-span-2 xl:col-span-3 text-center text-muted-foreground py-12">No projects.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Client</Label><Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}><SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger><SelectContent>{db.clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div className="space-y-2"><Label>Audience</Label><Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></div>
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="space-y-2"><Label>Sample Size</Label><Input type="number" value={form.sampleSize} onChange={(e) => setForm({ ...form, sampleSize: +e.target.value })} /></div>
            <div className="space-y-2"><Label>CPI ($)</Label><Input type="number" step="0.1" value={form.cpi} onChange={(e) => setForm({ ...form, cpi: +e.target.value })} /></div>
            <div className="space-y-2"><Label>Start</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="space-y-2"><Label>End</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <div className="space-y-2"><Label>Supplier CPI ($)</Label><Input type="number" step="0.1" value={form.supplierCpi} onChange={(e) => setForm({ ...form, supplierCpi: +e.target.value })} /></div>
            <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="draft">Draft</SelectItem><SelectItem value="live">Live</SelectItem><SelectItem value="paused">Paused</SelectItem><SelectItem value="completed">Completed</SelectItem>
            </SelectContent></Select></div>
            <div className="space-y-2 col-span-2">
              <Label>Suppliers</Label>
              <div className="flex flex-wrap gap-2">
                {db.suppliers.map((s) => {
                  const on = form.supplierIds.includes(s.id);
                  return <button key={s.id} type="button" onClick={() => setForm({ ...form, supplierIds: on ? form.supplierIds.filter((x) => x !== s.id) : [...form.supplierIds, s.id] })}
                    className={`text-xs px-3 py-1 rounded-full border ${on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>{s.company}</button>;
                })}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
