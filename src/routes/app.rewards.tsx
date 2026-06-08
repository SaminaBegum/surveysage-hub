import { createFileRoute } from "@tanstack/react-router";
import { useStore, useDerived } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatusBadge } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { POINTS_PER_DOLLAR } from "@/lib/types";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/rewards")({ component: RewardsPage });

function RewardsPage() {
  const { user } = useAuth();
  const { db, setDB, uid } = useStore();
  const d = useDerived();

  const isRespondent = user?.role === "respondent";
  const w = user ? d.walletFor(user.id) : null;
  const myRedemptions = user ? db.redemptions.filter((r) => r.userId === user.id) : [];

  const redeem = (rewardId: string) => {
    const reward = db.rewards.find((r) => r.id === rewardId);
    if (!reward || !user || !w) return;
    if (w.points < reward.costPoints) { toast.error("Not enough points"); return; }
    setDB((d) => ({
      ...d,
      wallets: d.wallets.map((x) => x.userId === user.id ? { ...x, points: x.points - reward.costPoints } : x),
      ledger: [
        { id: uid("le"), userId: user.id, delta: -reward.costPoints, reason: `Redeemed: ${reward.name}`, createdAt: new Date().toISOString() },
        ...d.ledger,
      ],
      redemptions: [
        { id: uid("rd"), userId: user.id, rewardId: reward.id, rewardName: reward.name, costPoints: reward.costPoints, cashValue: reward.cashValue, status: "pending", createdAt: new Date().toISOString() },
        ...d.redemptions,
      ],
    }));
    toast.success(`Redeemed ${reward.name}! Check your email within 24h.`);
  };

  const categories: { key: string; label: string }[] = [
    { key: "giftcard", label: "Gift Cards" },
    { key: "cash", label: "Cash" },
    { key: "subscription", label: "Subscriptions" },
    { key: "charity", label: "Charity" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rewards Catalog"
        subtitle={isRespondent ? `You have ${w?.points.toLocaleString()} points (≈ $${((w?.points ?? 0) / POINTS_PER_DOLLAR).toFixed(2)})` : "Manage what respondents can redeem."}
      />

      {categories.map((cat) => {
        const items = db.rewards.filter((r) => r.category === cat.key && r.active);
        if (items.length === 0) return null;
        return (
          <div key={cat.key} className="space-y-3">
            <h3 className="font-display font-bold text-lg">{cat.label}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {items.map((r) => {
                const canAfford = !!w && w.points >= r.costPoints;
                return (
                  <div key={r.id} className="rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition-all">
                    <div className="text-4xl mb-2">{r.icon}</div>
                    <p className="font-semibold text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">${r.cashValue} value</p>
                    <div className="mt-3 flex items-center gap-1.5 text-primary font-bold text-sm">
                      <Sparkles className="size-3.5" /> {r.costPoints.toLocaleString()} pts
                    </div>
                    {isRespondent && (
                      <Button size="sm" disabled={!canAfford} onClick={() => redeem(r.id)} className="mt-3 w-full">
                        {canAfford ? "Redeem" : `Need ${(r.costPoints - (w?.points ?? 0)).toLocaleString()} more`}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {isRespondent && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-bold mb-4">My redemptions</h3>
          {myRedemptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No redemptions yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground border-b border-border">
                <tr><th className="py-2">Reward</th><th>Points</th><th>Value</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myRedemptions.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 font-medium">{r.rewardName}</td>
                    <td>{r.costPoints.toLocaleString()}</td>
                    <td>${r.cashValue}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
