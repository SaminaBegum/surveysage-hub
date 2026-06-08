import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConfirmDelete({ onConfirm, children, title = "Delete this item?", description = "This action cannot be undone." }: {
  onConfirm: () => void; children: ReactNode; title?: string; description?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    live: "bg-emerald/10 text-emerald border-emerald/20",
    active: "bg-emerald/10 text-emerald border-emerald/20",
    paid: "bg-emerald/10 text-emerald border-emerald/20",
    approved: "bg-emerald/10 text-emerald border-emerald/20",
    completed: "bg-primary/10 text-primary border-primary/20",
    draft: "bg-muted text-muted-foreground border-border",
    paused: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    unpaid: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    inactive: "bg-muted text-muted-foreground border-border",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };
  const cls = map[status.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>{status}</span>;
}

export { Button };
