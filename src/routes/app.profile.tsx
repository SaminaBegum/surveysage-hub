import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({ component: Profile });

function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", company: user?.company ?? "", phone: user?.phone ?? "" });
  const [pw, setPw] = useState({ current: "", next: "" });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your personal account." />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-gradient-to-br from-navy to-electric text-white flex items-center justify-center font-bold text-xl">{user.name.charAt(0)}</div>
            <div><p className="font-display font-bold text-lg">{user.name}</p><p className="text-xs text-muted-foreground capitalize">{user.role} · {user.email}</p></div>
          </div>
          <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <Button onClick={() => { updateProfile(form); toast.success("Profile updated"); }}>Save</Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display font-bold">Change password</h3>
          <div className="space-y-2"><Label>Current password</Label><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
          <div className="space-y-2"><Label>New password</Label><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
          <Button onClick={() => {
            if (pw.current !== user.password) { toast.error("Current password incorrect"); return; }
            if (pw.next.length < 6) { toast.error("Password too short"); return; }
            updateProfile({ password: pw.next });
            setPw({ current: "", next: "" });
            toast.success("Password updated");
          }}>Update password</Button>
          <div className="pt-6 border-t border-border">
            <Button variant="destructive" onClick={() => { logout(); navigate({ to: "/auth/login" }); }}>Logout</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
