export type Role = "admin" | "client" | "supplier" | "respondent";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  company?: string;
  phone?: string;
  avatar?: string;
  linkedId?: string;
  country?: string;
}

export interface Client {
  id: string; name: string; company: string; email: string; phone: string;
  city: string; industry: string; status: "active" | "inactive"; totalSpend: number; createdAt: string;
}

export interface Supplier {
  id: string; name: string; company: string; email: string; phone: string;
  country: string; city: string; expertise: string; costPerComplete: number;
  status: "active" | "inactive"; createdAt: string;
}

export type ProjectStatus = "draft" | "live" | "paused" | "completed";

export interface Project {
  id: string; code: string; name: string; clientId: string; category: string;
  audience: string; location: string; sampleSize: number; startDate: string; endDate: string;
  cpi: number; supplierCpi: number; supplierIds: string[]; status: ProjectStatus; createdAt: string;
}

export type QuestionType = "single" | "multiple" | "text" | "rating" | "dropdown" | "number" | "date";

export interface Question { id: string; type: QuestionType; title: string; required: boolean; options?: string[]; }
export interface Survey { id: string; projectId: string; title: string; questions: Question[]; }
export interface SurveyLink { id: string; projectId: string; supplierId?: string; type: "main" | "supplier" | "client_preview"; active: boolean; clicks: number; }
export type ResponseStatus = "pending" | "approved" | "rejected";

export interface SurveyResponse {
  id: string; projectId: string; linkId: string; supplierId?: string;
  respondentName: string; respondentEmail: string; respondentUserId?: string;
  answers: Record<string, unknown>; status: ResponseStatus; rejectionReason?: string;
  qualityScore: number; timeSpent: number; ip: string; submittedAt: string;
}

export interface Invoice { id: string; number: string; clientId: string; projectId: string; amount: number; status: "paid" | "unpaid"; issuedAt: string; dueAt: string; }
export interface Payment { id: string; supplierId: string; projectId: string; amount: number; status: "paid" | "pending"; paidAt?: string; createdAt: string; }
export interface Notification { id: string; title: string; message: string; type: "info" | "success" | "warning"; read: boolean; createdAt: string; }
export interface SaaSPlan { id: string; name: string; price: number; projectLimit: number; supplierLimit: number; responseLimit: number; active: boolean; features: string[]; }
export interface Settings { companyName: string; companyEmail: string; darkMode: boolean; emailNotif: boolean; whatsappNotif: boolean; activePlanId: string; }

// ---- Rewards & Automation ----
export interface Wallet { userId: string; points: number; lifetimePoints: number; referralCode: string; }
export interface PointsLedgerEntry { id: string; userId: string; delta: number; reason: string; responseId?: string; createdAt: string; }
export interface RewardCatalogItem { id: string; name: string; category: "giftcard" | "cash" | "subscription" | "charity"; costPoints: number; cashValue: number; icon: string; active: boolean; }
export interface Redemption { id: string; userId: string; rewardId: string; rewardName: string; costPoints: number; cashValue: number; status: "pending" | "approved" | "paid"; createdAt: string; }
export interface Automation { id: string; name: string; description: string; category: "quality" | "billing" | "routing" | "notify"; enabled: boolean; config: Record<string, number | string | boolean>; }
export interface AutomationRun { id: string; automationId: string; trigger: string; message: string; affected: number; createdAt: string; }

export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";
export function tierFor(lifetime: number): Tier {
  if (lifetime > 5000) return "Platinum";
  if (lifetime > 2000) return "Gold";
  if (lifetime > 500) return "Silver";
  return "Bronze";
}
export const POINTS_PER_DOLLAR = 100;
