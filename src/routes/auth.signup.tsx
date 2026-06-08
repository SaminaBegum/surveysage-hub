import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create Account — SurveySathi Pro" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", role: "respondent" as Role });

  const dashFor = (r: Role) => r === "respondent" ? "/app/wallet" as const : "/app/dashboard" as const;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const res = signup(form);
    if (!res.ok) { toast.error(res.error ?? "Signup failed"); return; }
    toast.success("Account created!");
    navigate({ to: dashFor(form.role) });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center"><Logo /></div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <h2 className="font-display text-2xl font-bold">Create your account</h2>
          <p className="text-sm text-muted-foreground mt-1">Start your free SurveySathi Pro trial.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2"><Label>Full name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="space-y-2"><Label>Company (optional)</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>I am a</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="respondent">Respondent (Earn rewards for surveys)</SelectItem>
                  <SelectItem value="admin">Admin / Project Manager</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="supplier">Supplier / Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Create account</Button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/auth/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
