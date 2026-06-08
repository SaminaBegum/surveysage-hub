import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Forgot Password — SurveySathi Pro" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center"><Logo /></div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <h2 className="font-display text-2xl font-bold">Reset your password</h2>
          <p className="text-sm text-muted-foreground mt-1">We'll send you a reset link.</p>

          {sent ? (
            <div className="mt-6 rounded-lg bg-emerald/10 border border-emerald/20 p-4 text-sm text-emerald">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); toast.success("Reset link sent"); }}
              className="mt-6 space-y-4"
            >
              <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <Button type="submit" className="w-full">Send reset link</Button>
            </form>
          )}

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Remember your password? <Link to="/auth/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
