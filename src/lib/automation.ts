import type {
  Automation, AutomationRun, Invoice, Notification, Payment,
  PointsLedgerEntry, Project, SurveyResponse, Wallet,
} from "./types";

export interface AutomationDB {
  projects: Project[];
  responses: SurveyResponse[];
  invoices: Invoice[];
  payments: Payment[];
  notifications: Notification[];
  wallets: Wallet[];
  ledger: PointsLedgerEntry[];
  automations: Automation[];
}

export type AutomationTrigger =
  | { type: "response:submitted"; responseId?: string }
  | { type: "scheduler:tick" }
  | { type: "invoice:paid"; invoiceId: string }
  | { type: "manual"; ruleId?: string };

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const enabled = (db: AutomationDB, id: string) => db.automations.find((a) => a.id === id)?.enabled ?? false;
const cfg = (db: AutomationDB, id: string, key: string, fallback: number) => {
  const v = db.automations.find((a) => a.id === id)?.config[key];
  return typeof v === "number" ? v : fallback;
};

export function runAutomations<T extends AutomationDB>(
  db: T,
  trigger: AutomationTrigger,
  onlyRule?: string,
): { db: T; logs: AutomationRun[] } {
  let next = { ...db };
  const logs: AutomationRun[] = [];
  const ts = new Date().toISOString();
  const should = (id: string) => (!onlyRule || onlyRule === id) && enabled(next, id);

  // RULE 1: auto quality + approval
  if (should("auto-quality")) {
    const minTime = cfg(next, "auto-quality", "minTime", 60);
    const minScore = cfg(next, "auto-quality", "minScore", 50);
    const approveAt = cfg(next, "auto-quality", "approveAt", 80);
    let approved = 0, rejected = 0;
    const updated = next.responses.map((r) => {
      if (r.status !== "pending") return r;
      const dup = next.responses.some((x) => x.id !== r.id && x.projectId === r.projectId && x.ip === r.ip);
      if (r.timeSpent < minTime || r.qualityScore < minScore || dup) {
        rejected++;
        return {
          ...r, status: "rejected" as const,
          rejectionReason: dup ? "Duplicate IP" : r.timeSpent < minTime ? "Speeder" : "Low quality",
        };
      }
      if (r.qualityScore >= approveAt) { approved++; return { ...r, status: "approved" as const }; }
      return r;
    });
    if (approved + rejected > 0) {
      next = { ...next, responses: updated };
      logs.push({ id: uid("ar"), automationId: "auto-quality", trigger: trigger.type, message: `Approved ${approved}, rejected ${rejected}`, affected: approved + rejected, createdAt: ts });
    }
  }

  // RULE 2: credit points to respondents
  if (should("credit-points")) {
    const multiplier = cfg(next, "credit-points", "pointsPerCpi", 10);
    const wallets = [...next.wallets];
    const ledger = [...next.ledger];
    let credited = 0, totalPts = 0;
    next.responses.forEach((r) => {
      if (r.status !== "approved" || !r.respondentUserId) return;
      if (ledger.some((e) => e.responseId === r.id)) return;
      const project = next.projects.find((p) => p.id === r.projectId);
      if (!project) return;
      const pts = Math.round(project.cpi * multiplier) + (r.qualityScore >= 90 ? 20 : 0);
      let w = wallets.find((x) => x.userId === r.respondentUserId);
      if (!w) {
        w = { userId: r.respondentUserId, points: 0, lifetimePoints: 0, referralCode: r.respondentUserId.slice(-6).toUpperCase() };
        wallets.push(w);
      }
      const idx = wallets.indexOf(w);
      wallets[idx] = { ...w, points: w.points + pts, lifetimePoints: w.lifetimePoints + pts };
      ledger.unshift({ id: uid("le"), userId: r.respondentUserId, delta: pts, reason: `Survey complete · ${project.code}`, responseId: r.id, createdAt: ts });
      credited++; totalPts += pts;
    });
    if (credited > 0) {
      next = { ...next, wallets, ledger };
      logs.push({ id: uid("ar"), automationId: "credit-points", trigger: trigger.type, message: `Credited ${totalPts} pts to ${credited} respondent(s)`, affected: credited, createdAt: ts });
    }
  }

  // RULE 3: auto invoice + payable when project hits quota
  if (should("auto-invoice")) {
    const invoices = [...next.invoices];
    const payments = [...next.payments];
    const projects = next.projects.map((p) => {
      const approved = next.responses.filter((r) => r.projectId === p.id && r.status === "approved").length;
      if (approved < p.sampleSize) return p;
      if (invoices.some((i) => i.projectId === p.id && i.number.startsWith("AUTO-"))) return p;
      invoices.unshift({
        id: uid("inv"), number: `AUTO-${Date.now().toString(36).slice(-5).toUpperCase()}`,
        clientId: p.clientId, projectId: p.id, amount: p.cpi * approved, status: "unpaid",
        issuedAt: ts.slice(0, 10), dueAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      });
      p.supplierIds.forEach((sid) => {
        const sa = next.responses.filter((r) => r.projectId === p.id && r.supplierId === sid && r.status === "approved").length;
        if (sa > 0) payments.unshift({ id: uid("py"), supplierId: sid, projectId: p.id, amount: p.supplierCpi * sa, status: "pending", createdAt: ts });
      });
      return { ...p, status: "completed" as const };
    });
    const created = invoices.length - next.invoices.length;
    if (created > 0) {
      next = { ...next, invoices, payments, projects };
      logs.push({ id: uid("ar"), automationId: "auto-invoice", trigger: trigger.type, message: `Generated ${created} client invoice(s) + supplier payables`, affected: created, createdAt: ts });
    }
  }

  // RULE 4: notifications + quota alerts
  if (should("notify-quota")) {
    const notifs = [...next.notifications];
    let added = 0;
    next.projects.forEach((p) => {
      if (p.status !== "live") return;
      const approved = next.responses.filter((r) => r.projectId === p.id && r.status === "approved").length;
      const pct = approved / Math.max(1, p.sampleSize);
      const key = `[Q${p.code}]`;
      if (pct >= 0.8 && !notifs.some((n) => n.message.includes(key))) {
        notifs.unshift({ id: uid("n"), title: "Project nearing quota", message: `${key} ${p.name} is at ${Math.round(pct * 100)}% of sample.`, type: "warning", read: false, createdAt: ts });
        added++;
      }
    });
    if (added > 0) {
      next = { ...next, notifications: notifs };
      logs.push({ id: uid("ar"), automationId: "notify-quota", trigger: trigger.type, message: `Sent ${added} quota alert(s)`, affected: added, createdAt: ts });
    }
  }

  return { db: next, logs };
}
