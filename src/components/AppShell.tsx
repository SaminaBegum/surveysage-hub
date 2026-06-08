import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Truck, FolderKanban, FileEdit, Link2,
  Inbox, ShieldCheck, BarChart3, Receipt, CreditCard, Crown,
  Bell, Settings as SettingsIcon, User as UserIcon, LogOut, Moon, Sun,
  Zap, Wallet, Gift, Sparkles,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { useStore, useDerived } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tierFor } from "@/lib/types";
import { useEffect, useState, type ReactNode } from "react";

const navByRole: Record<string, { label: string; to: string; icon: typeof LayoutDashboard }[]> = {
  admin: [
    { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
    { label: "Automations", to: "/app/automations", icon: Zap },
    { label: "Clients", to: "/app/clients", icon: Users },
    { label: "Suppliers", to: "/app/suppliers", icon: Truck },
    { label: "Projects", to: "/app/projects", icon: FolderKanban },
    { label: "Survey Builder", to: "/app/builder", icon: FileEdit },
    { label: "Survey Links", to: "/app/links", icon: Link2 },
    { label: "Responses", to: "/app/responses", icon: Inbox },
    { label: "Quality Check", to: "/app/quality", icon: ShieldCheck },
    { label: "Rewards Catalog", to: "/app/rewards", icon: Gift },
    { label: "Reports", to: "/app/reports", icon: BarChart3 },
    { label: "Invoices", to: "/app/invoices", icon: Receipt },
    { label: "Payments", to: "/app/payments", icon: CreditCard },
    { label: "SaaS Plans", to: "/app/plans", icon: Crown },
    { label: "Notifications", to: "/app/notifications", icon: Bell },
    { label: "Settings", to: "/app/settings", icon: SettingsIcon },
    { label: "Profile", to: "/app/profile", icon: UserIcon },
  ],
  client: [
    { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
    { label: "My Projects", to: "/app/projects", icon: FolderKanban },
    { label: "Reports", to: "/app/reports", icon: BarChart3 },
    { label: "Invoices", to: "/app/invoices", icon: Receipt },
    { label: "Notifications", to: "/app/notifications", icon: Bell },
    { label: "Profile", to: "/app/profile", icon: UserIcon },
  ],
  supplier: [
    { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
    { label: "My Projects", to: "/app/projects", icon: FolderKanban },
    { label: "My Links", to: "/app/links", icon: Link2 },
    { label: "My Completes", to: "/app/responses", icon: Inbox },
    { label: "Payments", to: "/app/payments", icon: CreditCard },
    { label: "Notifications", to: "/app/notifications", icon: Bell },
    { label: "Profile", to: "/app/profile", icon: UserIcon },
  ],
  respondent: [
    { label: "My Wallet", to: "/app/wallet", icon: Wallet },
    { label: "Rewards", to: "/app/rewards", icon: Gift },
    { label: "Notifications", to: "/app/notifications", icon: Bell },
    { label: "Profile", to: "/app/profile", icon: UserIcon },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { db } = useStore();
  const derived = useDerived();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("ss_dark") : null;
    if (saved === "1") { document.documentElement.classList.add("dark"); setDark(true); }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    if (typeof window !== "undefined") localStorage.setItem("ss_dark", next ? "1" : "0");
  };

  if (!user) return null;
  const items = navByRole[user.role] ?? navByRole.admin;
  const unread = db.notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen w-full bg-surface dark:bg-background flex">
      {/* Sidebar */}
      <aside className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 h-screen w-64 border-r border-border bg-sidebar transition-transform`}>
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Logo size="sm" linkTo="/app/dashboard" />
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100vh-4rem-4rem)]">
          {items.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span>{it.label}</span>
                {it.to === "/app/notifications" && unread > 0 && (
                  <Badge className="ml-auto h-5 px-1.5 text-[10px]">{unread}</Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-border px-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-full bg-gradient-to-br from-navy to-electric text-white flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={() => { logout(); }}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-4 lg:px-6 gap-3">
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            <LayoutDashboard className="size-5" />
          </Button>
          <div className="flex-1" />
          {user.role === "respondent" && (() => {
            const w = derived.walletFor(user.id);
            const tier = tierFor(w.lifetimePoints);
            return (
              <Link to="/app/wallet" className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-gradient-to-r from-primary/10 to-emerald/10 px-3 py-1.5 text-xs font-bold hover:shadow-elegant transition-all">
                <Sparkles className="size-3.5 text-primary" />
                <span>{w.points.toLocaleString()} pts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">{tier}</span>
              </Link>
            );
          })()}
          <Button size="icon" variant="ghost" onClick={toggleDark}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Link to="/app/notifications" className="relative">
            <Button size="icon" variant="ghost">
              <Bell className="size-4" />
            </Button>
            {unread > 0 && <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />}
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">{children}</main>
      </div>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
    </div>
  );
}
