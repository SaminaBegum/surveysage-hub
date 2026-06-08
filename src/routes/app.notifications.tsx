import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notifications")({ component: Notifications });

function Notifications() {
  const { db, setDB } = useStore();
  const markAll = () => { setDB((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) })); toast.success("All marked read"); };
  const clear = () => { setDB((d) => ({ ...d, notifications: [] })); toast.success("Cleared"); };

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle={`${db.notifications.filter((n) => !n.read).length} unread`}
        action={<div className="flex gap-2"><Button variant="outline" onClick={markAll}><Check className="size-4" /> Mark all read</Button><Button variant="ghost" onClick={clear}><Trash2 className="size-4" /> Clear</Button></div>} />
      <div className="space-y-2">
        {db.notifications.map((n) => (
          <div key={n.id} className={`rounded-xl border bg-card p-4 flex items-start gap-3 ${!n.read ? "border-primary/30 bg-primary/5" : "border-border"}`}>
            <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${n.type === "success" ? "bg-emerald/10 text-emerald" : n.type === "warning" ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}><Bell className="size-4" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.read && <Button size="icon" variant="ghost" onClick={() => setDB((d) => ({ ...d, notifications: d.notifications.map((x) => x.id === n.id ? { ...x, read: true } : x) }))}><Check className="size-4" /></Button>}
          </div>
        ))}
        {db.notifications.length === 0 && <div className="text-center text-muted-foreground py-12">All caught up.</div>}
      </div>
    </div>
  );
}
