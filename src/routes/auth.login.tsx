import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Login — SurveySathi Pro" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@surveysathi.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = login(email, password);
    setLoading(false);
    if (!res.ok) { toast.error(res.error ?? "Login failed"); return; }
    toast.success("Welcome back!");
    const target = res.role === "respondent" ? "/app/wallet" : "/app/dashboard";
    navigate({ to: target });
  };

  const quickLogin = (e: string) => { setEmail(e); setPassword("123456"); };

  return (
    <div className="min-h-screen flex bg-surface">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-navy to-electric text-white p-12 flex-col justify-between">
        <Logo size="sm" linkTo="/" />
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight">Market research operations, simplified.</h1>
          <p className="mt-4 text-white/80 max-w-md">Clients, suppliers, survey links, quality checks, reports and payments — all in one premium dashboard.</p>
        </div>
        <p className="text-xs text-white/60">© 2026 SurveySathi Operations Inc.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h2 className="font-display text-3xl font-bold">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your SurveySathi Pro account.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/auth/forgot" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Don't have an account? <Link to="/auth/signup" className="text-primary font-medium">Create account</Link>
          </p>

          <div className="mt-8 p-4 rounded-xl border border-border bg-card">
            <p className="text-xs font-semibold mb-3">Quick demo accounts</p>
            <div className="space-y-1.5 text-xs">
              {[
                { l: "Super Admin", e: "admin@surveysathi.com" },
                { l: "Client", e: "client@demo.com" },
                { l: "Supplier", e: "supplier@demo.com" },
                { l: "Respondent (earns rewards)", e: "respondent@demo.com" },
              ].map((d) => (
                <button key={d.e} type="button" onClick={() => quickLogin(d.e)} className="flex w-full justify-between rounded-md px-2 py-1.5 hover:bg-accent">
                  <span className="font-medium">{d.l}</span>
                  <span className="text-muted-foreground">{d.e}</span>
                </button>
              ))}
              <p className="mt-2 text-[10px] text-muted-foreground">Password for all: 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
