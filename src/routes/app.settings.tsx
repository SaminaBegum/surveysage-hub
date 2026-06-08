import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { db, setDB, resetDB } = useStore();
  const s = db.settings;
  const update = (patch: Partial<typeof s>) => setDB((d) => ({ ...d, settings: { ...d.settings, ...patch } }));

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Company profile and platform preferences." />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display font-bold">Company Profile</h3>
          <div className="space-y-2"><Label>Company name</Label><Input value={s.companyName} onChange={(e) => update({ companyName: e.target.value })} /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={s.companyEmail} onChange={(e) => update({ companyEmail: e.target.value })} /></div>
          <div className="space-y-2"><Label>Logo upload</Label><Input type="file" accept="image/*" /></div>
          <Button onClick={() => toast.success("Profile saved")}>Save profile</Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display font-bold">Notifications</h3>
          <div className="flex items-center justify-between"><Label>Email notifications</Label><Switch checked={s.emailNotif} onCheckedChange={(c) => update({ emailNotif: c })} /></div>
          <div className="flex items-center justify-between"><Label>WhatsApp notifications</Label><Switch checked={s.whatsappNotif} onCheckedChange={(c) => update({ whatsappNotif: c })} /></div>
          <div className="flex items-center justify-between"><Label>Dark mode</Label><Switch checked={s.darkMode} onCheckedChange={(c) => { update({ darkMode: c }); document.documentElement.classList.toggle("dark", c); }} /></div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 md:col-span-2">
          <h3 className="font-display font-bold">Data</h3>
          <p className="text-sm text-muted-foreground">Export, backup, or reset all your platform data.</p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => { const url = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = "surveysathi-backup.json"; a.click(); toast.success("Backup downloaded"); }}>Download backup</Button>
            <Button variant="destructive" onClick={() => { if (confirm("Reset all data?")) { resetDB(); toast.success("Data reset"); } }}>Reset all data</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
