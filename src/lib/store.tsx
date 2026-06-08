import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type {
  Client, Supplier, Project, Survey, SurveyLink, SurveyResponse,
  Invoice, Payment, Notification, SaaSPlan, User, Settings, Question,
  Wallet, PointsLedgerEntry, RewardCatalogItem, Redemption, Automation, AutomationRun,
} from "./types";
import {
  seedClients, seedSuppliers, seedProjects, seedSurveys, seedLinks,
  seedResponses, seedInvoices, seedPayments, seedNotifications, seedPlans,
  seedUsers, seedSettings, seedWallets, seedLedger, seedRewards, seedRedemptions,
  seedAutomations, seedRuns,
} from "./seed";
import { runAutomations, type AutomationTrigger } from "./automation";

interface DB {
  users: User[];
  clients: Client[];
  suppliers: Supplier[];
  projects: Project[];
  surveys: Survey[];
  links: SurveyLink[];
  responses: SurveyResponse[];
  invoices: Invoice[];
  payments: Payment[];
  notifications: Notification[];
  plans: SaaSPlan[];
  settings: Settings;
  wallets: Wallet[];
  ledger: PointsLedgerEntry[];
  rewards: RewardCatalogItem[];
  redemptions: Redemption[];
  automations: Automation[];
  runs: AutomationRun[];
}

const KEY = "surveysathi_db_v3";

function makeDefault(): DB {
  return {
    users: seedUsers, clients: seedClients, suppliers: seedSuppliers, projects: seedProjects,
    surveys: seedSurveys, links: seedLinks, responses: seedResponses, invoices: seedInvoices,
    payments: seedPayments, notifications: seedNotifications, plans: seedPlans, settings: seedSettings,
    wallets: seedWallets, ledger: seedLedger, rewards: seedRewards, redemptions: seedRedemptions,
    automations: seedAutomations, runs: seedRuns,
  };
}

function loadDB(): DB {
  if (typeof window === "undefined") return makeDefault();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // self-heal any missing arrays from older versions
      return { ...makeDefault(), ...parsed };
    }
  } catch {}
  const def = makeDefault();
  localStorage.setItem(KEY, JSON.stringify(def));
  return def;
}

interface StoreCtx {
  db: DB;
  setDB: (updater: (d: DB) => DB) => void;
  resetDB: () => void;
  uid: (prefix: string) => string;
  triggerAutomations: (trigger: AutomationTrigger, onlyRule?: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDBState] = useState<DB>(() => makeDefault());
  const ready = useRef(false);

  useEffect(() => { setDBState(loadDB()); ready.current = true; }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && ready.current) {
      try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
    }
  }, [db]);

  const setDB = (updater: (d: DB) => DB) => setDBState((prev) => updater(prev));
  const resetDB = () => setDBState(makeDefault());
  const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const triggerAutomations = (trigger: AutomationTrigger, onlyRule?: string) => {
    setDBState((prev) => {
      const { db: next, logs } = runAutomations(prev, trigger, onlyRule);
      if (logs.length === 0 && next === prev) return prev;
      return { ...next, runs: [...logs, ...next.runs].slice(0, 200) };
    });
  };

  // background scheduler — runs every 30s
  useEffect(() => {
    const id = setInterval(() => triggerAutomations({ type: "scheduler:tick" }), 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Ctx.Provider value={{ db, setDB, resetDB, uid, triggerAutomations }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useDerived() {
  const { db } = useStore();
  const approvedByProject = (pid: string) =>
    db.responses.filter((r) => r.projectId === pid && r.status === "approved").length;
  const totalApprovedSupplier = (sid: string) =>
    db.responses.filter((r) => r.supplierId === sid && r.status === "approved").length;
  const rejectedSupplier = (sid: string) =>
    db.responses.filter((r) => r.supplierId === sid && r.status === "rejected").length;
  const supplierPayable = (sid: string) => {
    let total = 0;
    db.responses.forEach((r) => {
      if (r.supplierId !== sid || r.status !== "approved") return;
      const p = db.projects.find((p) => p.id === r.projectId);
      if (p) total += p.supplierCpi;
    });
    return total;
  };
  const projectProgress = (pid: string) => {
    const p = db.projects.find((x) => x.id === pid);
    if (!p) return 0;
    return Math.min(100, Math.round((approvedByProject(pid) / Math.max(1, p.sampleSize)) * 100));
  };
  const walletFor = (uid: string) => db.wallets.find((w) => w.userId === uid)
    ?? { userId: uid, points: 0, lifetimePoints: 0, referralCode: uid.slice(-6).toUpperCase() };
  return { approvedByProject, totalApprovedSupplier, rejectedSupplier, supplierPayable, projectProgress, walletFor };
}

export type { Question };
