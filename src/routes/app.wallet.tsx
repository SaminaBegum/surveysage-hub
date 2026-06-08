import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useStore, useDerived } from "@/lib/store";
import { PageHeader } from "@/components/Common";
import { POINTS_PER_DOLLAR, tierFor } from "@/lib/types";
import { Sparkles, Gift, Users as UsersIcon, Copy, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/wallet")({ component: WalletPage });

function WalletPage() {
  const { user } = useAuth();
  const { db } = useStore();
  const d = useDerived();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate({ to: "/auth/login" }); }, [user, navigate]);
  if (!user) return null;

  const w = d.walletFor(user.id);
  const tier = tierFor(w.lifetimePoints);
  const ledger = db.ledger.filter((l) => l.userId === user.id);
  const liveProjects = db.projects.filter((p) => p.status === "live");
  const tierProgress = (() => {
    const next = tier === "Bronze" ? 500 : tier === "Silver" ? 2000 : tier === "Gold" ? 5000 : 5000;
    return Math.min(100, Math.round((w.lifetimePoints / next) * 100));
  })();

  const copyRef = () => {
    navigator.clipboard.writeText(`https://surveysathi.app/?ref=${w.referralCode}`);
    toast.success("Referral link copied!");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Wallet" subtitle="Earn points by taking surveys. Redeem for cash, gift cards & more." />

      {/* Hero */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-emerald/10 p-8 shadow-elegant">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Points balance</p>
            <div className="mt-2 flex items-baseline gap-3">
              <p className="font-display text-6xl font-bold text-foreground">{w.points.toLocaleString()}</p>
              <span className="text-lg font-semibold text-muted-foreground">pts</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">≈ <span className="font-bold text-emerald">${(w.points / POINTS_PER_DOLLAR).toFixed(2)}</span> USD redeemable</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-emerald text-white px-4 py-2 text-sm font-bold shadow-elegant">
              <Trophy className="size-4" /> {tier} Tier
            </span>
            <p className="text-xs text-muted-foreground">Lifetime: {w.lifetimePoints.toLocaleString()} pts</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Tier progress</span><span>{tierProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-emerald" style={{ width: `${tierProgress}%` }} />
          </div>
        </div>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link to="/app/rewards" className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:shadow-elegant transition-all">
            <Gift className="size-4" /> Redeem rewards
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available surveys */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-bold mb-4">Available surveys</h3>
          {liveProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No surveys available right now. Check back soon!</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {liveProjects.slice(0, 6).map((p) => {
                const main = db.links.find((l) => l.projectId === p.id && l.type === "main");
                const pts = Math.round(p.cpi * 10);
                return (
                  <div key={p.id} className="rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-elegant transition-all">
                    <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.audience} · {p.location}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 text-emerald px-2 py-1 text-xs font-bold">
                        <Sparkles className="size-3" /> +{pts} pts
                      </span>
                      {main && <Link to="/survey/$linkId" params={{ linkId: main.id }} className="text-xs font-bold text-primary hover:underline">Start →</Link>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Referral */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2"><UsersIcon className="size-4 text-primary" /> Refer & earn</h3>
          <p className="text-sm text-muted-foreground">Share your referral code. Earn <span className="font-bold text-emerald">200 pts</span> each when your friend completes a survey.</p>
          <div className="mt-4 rounded-xl bg-muted p-3 font-mono text-center text-lg font-bold">{w.referralCode}</div>
          <button onClick={copyRef} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold hover:bg-accent transition-colors">
            <Copy className="size-3.5" /> Copy referral link
          </button>
        </div>
      </div>

      {/* Ledger */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-bold mb-4">Points history</h3>
        {ledger.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {ledger.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{l.reason}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-sm font-bold ${l.delta > 0 ? "text-emerald" : "text-destructive"}`}>{l.delta > 0 ? "+" : ""}{l.delta} pts</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
