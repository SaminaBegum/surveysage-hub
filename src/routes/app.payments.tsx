import { createFileRoute } from "@tanstack/react-router";
import { useStore, useDerived } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatusBadge } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/payments")({ component: Payments });

function Payments() {
  const { db, setDB } = useStore();
  const { user } = useAuth();
  const d = useDerived();

  let list = db.payments;
  if (user?.role === "supplier") list = list.filter((p) => p.supplierId === user.linkedId);

  const markPaid = (id: string) => {
    setDB((db) => ({ ...db, payments: db.payments.map((p) => p.id === id ? { ...p, status: "paid", paidAt: new Date().toISOString().slice(0, 10) } : p) }));
    toast.success("Marked as paid");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Supplier Payments" subtitle={`$${list.reduce((s, p) => s + p.amount, 0).toFixed(0)} total · auto-calculated from approved completes`} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold text-muted-foreground bg-surface border-b border-border">
              <tr><th className="px-4 py-3">Supplier</th><th>Project</th><th>Amount</th><th>Auto-Payable</th><th>Status</th><th>Paid At</th><th className="text-right pr-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((p) => {
                const sup = db.suppliers.find((x) => x.id === p.supplierId);
                const proj = db.projects.find((x) => x.id === p.projectId);
                const auto = d.supplierPayable(p.supplierId);
                return (
                  <tr key={p.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">{sup?.company}</td>
                    <td className="font-mono text-xs">{proj?.code}</td>
                    <td className="font-semibold">${p.amount.toFixed(2)}</td>
                    <td className="text-primary font-semibold">${auto.toFixed(2)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="text-xs">{p.paidAt ?? "—"}</td>
                    <td className="text-right pr-4">{user?.role === "admin" && p.status !== "paid" && <Button size="sm" variant="outline" onClick={() => markPaid(p.id)}><Check className="size-3" /> Mark paid</Button>}</td>
                  </tr>
                );
              })}
              {list.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-12">No payments.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
