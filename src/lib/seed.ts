import type {
  Client, Supplier, Project, Survey, SurveyLink, SurveyResponse,
  Invoice, Payment, Notification, SaaSPlan, User, Settings,
  Wallet, PointsLedgerEntry, RewardCatalogItem, Redemption, Automation, AutomationRun,
} from "./types";

export const seedUsers: User[] = [
  { id: "u1", email: "admin@surveysathi.com", password: "123456", name: "Riya Sharma", role: "admin", company: "SurveySathi HQ" },
  { id: "u2", email: "client@demo.com", password: "123456", name: "Arjun Mehta", role: "client", linkedId: "c1", company: "Aurelius Group" },
  { id: "u3", email: "supplier@demo.com", password: "123456", name: "Nina Patel", role: "supplier", linkedId: "s1", company: "Nexus Panels" },
  { id: "u4", email: "respondent@demo.com", password: "123456", name: "Alex Rivera", role: "respondent", country: "USA" },
];

export const seedClients: Client[] = [
  { id: "c1", name: "Arjun Mehta", company: "Aurelius Group", email: "client@demo.com", phone: "+91 98200 11111", city: "Mumbai", industry: "FMCG", status: "active", totalSpend: 24500, createdAt: "2024-09-01" },
  { id: "c2", name: "Linda Park", company: "Veridian Research", email: "linda@veridian.io", phone: "+1 415 555 0102", city: "San Francisco", industry: "Tech", status: "active", totalSpend: 12800, createdAt: "2024-09-12" },
  { id: "c3", name: "Tomás Ruiz", company: "Mercado Insight", email: "tomas@mercado.es", phone: "+34 612 345 678", city: "Madrid", industry: "Retail", status: "active", totalSpend: 9200, createdAt: "2024-10-02" },
  { id: "c4", name: "Yui Tanaka", company: "Kobe Analytics", email: "yui@kobe.jp", phone: "+81 90 1234 5678", city: "Osaka", industry: "Automotive", status: "inactive", totalSpend: 3400, createdAt: "2024-10-15" },
  { id: "c5", name: "Sara Khan", company: "Northwind Labs", email: "sara@northwind.co", phone: "+44 20 7946 0101", city: "London", industry: "Healthcare", status: "active", totalSpend: 18900, createdAt: "2024-11-01" },
];

export const seedSuppliers: Supplier[] = [
  { id: "s1", name: "Nina Patel", company: "Nexus Panels", email: "supplier@demo.com", phone: "+91 98765 43210", country: "India", city: "Bangalore", expertise: "B2C, FMCG", costPerComplete: 2.5, status: "active", createdAt: "2024-08-01" },
  { id: "s2", name: "Carlos Diaz", company: "Alpha Research Group", email: "carlos@alpha.mx", phone: "+52 55 1234 5678", country: "Mexico", city: "Mexico City", expertise: "LATAM panels", costPerComplete: 3.2, status: "active", createdAt: "2024-08-12" },
  { id: "s3", name: "Anna Müller", company: "EuroPanels EU", email: "anna@europanels.de", phone: "+49 30 12345678", country: "Germany", city: "Berlin", expertise: "EU consumer", costPerComplete: 4.1, status: "active", createdAt: "2024-09-01" },
  { id: "s4", name: "James Wright", company: "QuotaWorks", email: "james@quotaworks.com", phone: "+1 212 555 0199", country: "USA", city: "New York", expertise: "Healthcare HCPs", costPerComplete: 8.5, status: "active", createdAt: "2024-09-20" },
  { id: "s5", name: "Mei Lin", company: "AsiaPanel", email: "mei@asiapanel.sg", phone: "+65 9123 4567", country: "Singapore", city: "Singapore", expertise: "APAC, Tech", costPerComplete: 5.0, status: "inactive", createdAt: "2024-10-05" },
];

export const seedProjects: Project[] = [
  { id: "p1", code: "PRJ-2024-001", name: "Global Consumer Study", clientId: "c1", category: "Consumer Insights", audience: "Adults 25-45", location: "Global", sampleSize: 1000, startDate: "2024-10-01", endDate: "2024-11-30", cpi: 8, supplierCpi: 3, supplierIds: ["s1", "s2"], status: "live", createdAt: "2024-10-01" },
  { id: "p2", code: "PRJ-2024-002", name: "FMCG Brand Tracker", clientId: "c1", category: "Brand Tracking", audience: "Homemakers", location: "India", sampleSize: 500, startDate: "2024-10-10", endDate: "2024-12-10", cpi: 6, supplierCpi: 2.5, supplierIds: ["s1"], status: "live", createdAt: "2024-10-10" },
  { id: "p3", code: "PRJ-2024-003", name: "Tech Adoption Survey", clientId: "c2", category: "Tech", audience: "Developers", location: "USA", sampleSize: 300, startDate: "2024-09-15", endDate: "2024-10-30", cpi: 12, supplierCpi: 5, supplierIds: ["s4"], status: "completed", createdAt: "2024-09-15" },
  { id: "p4", code: "PRJ-2024-004", name: "Auto Buyers Spain", clientId: "c3", category: "Automotive", audience: "Car owners 30-55", location: "Spain", sampleSize: 400, startDate: "2024-11-01", endDate: "2024-12-15", cpi: 10, supplierCpi: 4, supplierIds: ["s3"], status: "live", createdAt: "2024-11-01" },
  { id: "p5", code: "PRJ-2024-005", name: "Patient Care Study UK", clientId: "c5", category: "Healthcare", audience: "Patients 40+", location: "UK", sampleSize: 250, startDate: "2024-11-05", endDate: "2024-12-20", cpi: 15, supplierCpi: 6, supplierIds: ["s4"], status: "live", createdAt: "2024-11-05" },
  { id: "p6", code: "PRJ-2024-006", name: "EU Retail Habits", clientId: "c3", category: "Retail", audience: "Shoppers 18-65", location: "EU", sampleSize: 800, startDate: "2024-11-10", endDate: "2025-01-10", cpi: 7, supplierCpi: 3, supplierIds: ["s3", "s2"], status: "paused", createdAt: "2024-11-10" },
  { id: "p7", code: "PRJ-2024-007", name: "Mobile Usage APAC", clientId: "c2", category: "Tech", audience: "Mobile users", location: "APAC", sampleSize: 600, startDate: "2024-11-15", endDate: "2025-01-15", cpi: 9, supplierCpi: 3.5, supplierIds: ["s5"], status: "draft", createdAt: "2024-11-15" },
  { id: "p8", code: "PRJ-2024-008", name: "London Health Pulse", clientId: "c5", category: "Healthcare", audience: "Adults", location: "London", sampleSize: 350, startDate: "2024-11-20", endDate: "2024-12-30", cpi: 11, supplierCpi: 4.5, supplierIds: ["s4", "s1"], status: "live", createdAt: "2024-11-20" },
];

export const seedSurveys: Survey[] = seedProjects.map((p) => ({
  id: `sv-${p.id}`,
  projectId: p.id,
  title: p.name,
  questions: [
    { id: "q1", type: "single", title: "What is your age group?", required: true, options: ["18-24", "25-34", "35-44", "45-54", "55+"] },
    { id: "q2", type: "single", title: "Gender", required: true, options: ["Male", "Female", "Prefer not to say"] },
    { id: "q3", type: "multiple", title: "Which brands do you use regularly?", required: false, options: ["Brand A", "Brand B", "Brand C", "Brand D"] },
    { id: "q4", type: "rating", title: "How satisfied are you with current offerings?", required: true },
    { id: "q5", type: "text", title: "Any suggestions?", required: false },
  ],
}));

export const seedLinks: SurveyLink[] = seedProjects.flatMap((p) => [
  { id: `lnk-${p.id}-main`, projectId: p.id, type: "main", active: p.status === "live", clicks: Math.floor(Math.random() * 1000) + 100 },
  ...p.supplierIds.map((sid) => ({
    id: `lnk-${p.id}-${sid}`, projectId: p.id, supplierId: sid, type: "supplier" as const,
    active: p.status === "live", clicks: Math.floor(Math.random() * 800) + 50,
  })),
]);

export const seedResponses: SurveyResponse[] = Array.from({ length: 15 }).map((_, i) => {
  const p = seedProjects[i % seedProjects.length];
  const sid = p.supplierIds[0];
  const status: SurveyResponse["status"] = i % 4 === 0 ? "rejected" : i % 3 === 0 ? "pending" : "approved";
  return {
    id: `r${i + 1}`,
    projectId: p.id,
    linkId: `lnk-${p.id}-${sid}`,
    supplierId: sid,
    respondentName: ["Aman", "Priya", "Jose", "Mika", "Liam", "Sofia"][i % 6] + " R.",
    respondentEmail: `r${i + 1}@example.com`,
    answers: { q1: "25-34", q2: "Female", q4: 4 },
    status,
    rejectionReason: status === "rejected" ? "Too fast / straight-lining" : undefined,
    qualityScore: status === "rejected" ? 35 + i : 75 + (i % 20),
    timeSpent: 120 + i * 30,
    ip: `192.168.1.${i + 10}`,
    submittedAt: new Date(Date.now() - i * 86400000).toISOString(),
  };
});

export const seedInvoices: Invoice[] = [
  { id: "i1", number: "INV-001", clientId: "c1", projectId: "p1", amount: 8000, status: "paid", issuedAt: "2024-10-15", dueAt: "2024-11-15" },
  { id: "i2", number: "INV-002", clientId: "c1", projectId: "p2", amount: 3000, status: "unpaid", issuedAt: "2024-11-01", dueAt: "2024-12-01" },
  { id: "i3", number: "INV-003", clientId: "c2", projectId: "p3", amount: 3600, status: "paid", issuedAt: "2024-10-30", dueAt: "2024-11-30" },
  { id: "i4", number: "INV-004", clientId: "c3", projectId: "p4", amount: 4000, status: "unpaid", issuedAt: "2024-11-10", dueAt: "2024-12-10" },
  { id: "i5", number: "INV-005", clientId: "c5", projectId: "p5", amount: 3750, status: "paid", issuedAt: "2024-11-12", dueAt: "2024-12-12" },
];

export const seedPayments: Payment[] = [
  { id: "py1", supplierId: "s1", projectId: "p1", amount: 1500, status: "paid", paidAt: "2024-11-01", createdAt: "2024-10-20" },
  { id: "py2", supplierId: "s2", projectId: "p1", amount: 960, status: "pending", createdAt: "2024-11-05" },
  { id: "py3", supplierId: "s4", projectId: "p3", amount: 1500, status: "paid", paidAt: "2024-11-02", createdAt: "2024-10-22" },
  { id: "py4", supplierId: "s3", projectId: "p4", amount: 1600, status: "pending", createdAt: "2024-11-10" },
  { id: "py5", supplierId: "s4", projectId: "p5", amount: 1500, status: "pending", createdAt: "2024-11-12" },
];

export const seedNotifications: Notification[] = [
  { id: "n1", title: "New project assigned", message: "PRJ-2024-008 has been assigned to your account.", type: "info", read: false, createdAt: new Date(Date.now() - 3600_000).toISOString() },
  { id: "n2", title: "Target achieved", message: "PRJ-2024-003 has reached 100% of its sample size.", type: "success", read: false, createdAt: new Date(Date.now() - 86400_000).toISOString() },
  { id: "n3", title: "Supplier link paused", message: "Nexus Panels link on PRJ-2024-006 was paused.", type: "warning", read: true, createdAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
  { id: "n4", title: "Report ready", message: "Monthly performance report is ready to download.", type: "info", read: true, createdAt: new Date(Date.now() - 3 * 86400_000).toISOString() },
  { id: "n5", title: "Payment updated", message: "Invoice INV-001 marked as paid.", type: "success", read: true, createdAt: new Date(Date.now() - 4 * 86400_000).toISOString() },
];

export const seedPlans: SaaSPlan[] = [
  { id: "pl1", name: "Starter", price: 199, projectLimit: 5, supplierLimit: 10, responseLimit: 1000, active: false, features: ["5 active projects", "10 suppliers", "1,000 responses/mo", "Email support"] },
  { id: "pl2", name: "Professional", price: 499, projectLimit: 25, supplierLimit: 100, responseLimit: 10000, active: true, features: ["25 active projects", "100 suppliers", "10,000 responses/mo", "Advanced automation", "Priority support"] },
  { id: "pl3", name: "Enterprise", price: 1499, projectLimit: 9999, supplierLimit: 9999, responseLimit: 999999, active: false, features: ["Unlimited projects", "Unlimited suppliers", "Custom automation", "Dedicated CSM", "SLA & SSO"] },
];

export const seedSettings: Settings = {
  companyName: "SurveySathi Operations Inc.",
  companyEmail: "ops@surveysathi.com",
  darkMode: false,
  emailNotif: true,
  whatsappNotif: false,
  activePlanId: "pl2",
};

export const seedWallets: Wallet[] = [
  { userId: "u4", points: 1250, lifetimePoints: 1850, referralCode: "ALEX01" },
];

export const seedLedger: PointsLedgerEntry[] = [
  { id: "le1", userId: "u4", delta: 250, reason: "Survey complete · PRJ-2024-001", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "le2", userId: "u4", delta: 200, reason: "Referral bonus · friend signup", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "le3", userId: "u4", delta: 300, reason: "Survey complete · PRJ-2024-003", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "le4", userId: "u4", delta: -600, reason: "Redeemed: $5 Amazon Gift Card", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];

export const seedRewards: RewardCatalogItem[] = [
  { id: "rw1", name: "$5 Amazon Gift Card", category: "giftcard", costPoints: 500, cashValue: 5, icon: "🎁", active: true },
  { id: "rw2", name: "$10 Amazon Gift Card", category: "giftcard", costPoints: 1000, cashValue: 10, icon: "🎁", active: true },
  { id: "rw3", name: "$25 Amazon Gift Card", category: "giftcard", costPoints: 2500, cashValue: 25, icon: "🎁", active: true },
  { id: "rw4", name: "$10 PayPal Cash", category: "cash", costPoints: 1100, cashValue: 10, icon: "💵", active: true },
  { id: "rw5", name: "$25 PayPal Cash", category: "cash", costPoints: 2700, cashValue: 25, icon: "💵", active: true },
  { id: "rw6", name: "Netflix 1 Month", category: "subscription", costPoints: 1600, cashValue: 16, icon: "🎬", active: true },
  { id: "rw7", name: "Spotify Premium 1 Mo", category: "subscription", costPoints: 1100, cashValue: 11, icon: "🎵", active: true },
  { id: "rw8", name: "Donate to UNICEF", category: "charity", costPoints: 1000, cashValue: 10, icon: "❤️", active: true },
];

export const seedRedemptions: Redemption[] = [
  { id: "rd1", userId: "u4", rewardId: "rw1", rewardName: "$5 Amazon Gift Card", costPoints: 500, cashValue: 5, status: "paid", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];

export const seedAutomations: Automation[] = [
  { id: "auto-quality", name: "Auto Quality Check & Approval", description: "Reject speeders, duplicates and low-quality responses. Auto-approve high-scoring responses.", category: "quality", enabled: true, config: { minTime: 60, minScore: 50, approveAt: 80 } },
  { id: "credit-points", name: "Credit Respondent Points", description: "Award points to respondents for each approved survey (cpi × multiplier + quality bonus).", category: "billing", enabled: true, config: { pointsPerCpi: 10 } },
  { id: "auto-invoice", name: "Auto Invoice on Quota Hit", description: "When a project reaches 100% of sample size, generate the client invoice and supplier payables and mark the project completed.", category: "billing", enabled: true, config: {} },
  { id: "notify-quota", name: "Quota Alerts & Notifications", description: "Send in-app notifications when a live project reaches 80% of sample.", category: "notify", enabled: true, config: { threshold: 0.8 } },
];

export const seedRuns: AutomationRun[] = [];
