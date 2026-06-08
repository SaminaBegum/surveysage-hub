## What's being fixed & added

### 1. Login fix (already applied this turn)
Storage keys bumped to `v3` so stale localStorage from earlier versions is cleared. Demo accounts (`admin@surveysathi.com` / `client@demo.com` / `supplier@demo.com`, password `123456`) work after a hard refresh.

### 2. Respondent role + Rewards Wallet (Points → Rewards)
- New `respondent` role added to auth (signup + login).
- New types: `Wallet`, `PointsLedgerEntry`, `RewardCatalogItem`, `Redemption`, `Referral`.
- Each approved response credits **points** to the respondent's wallet (points = `project.cpi × 10`, with quality bonuses).
- Tier system: **Bronze (0–500) / Silver (501–2000) / Gold (2001–5000) / Platinum (5000+)** — higher tiers get bonus multipliers + early access to high-paying surveys.
- Streak bonus: 3 days = +20pts, 7 days = +100pts.
- Referral: unique referral code per respondent; both parties get 200pts when referee completes their first survey.
- **Reward Catalog** page (`/app/rewards`): Amazon GC, PayPal cash, UPI cash, Netflix, Spotify, charity donations. Redeem with points → creates a `Redemption` (pending/approved/paid).
- **Respondent dashboard** (`/app/wallet`): hero KPI = "Total points + cash value", activity timeline of recent earns/redeems, available surveys list, referral card.

### 3. Simplified Dashboard (Single hero KPI + timeline)
Replace the 12-KPI grid with one role-specific hero card and a unified Activity Timeline:
- **Admin**: hero = "Today's revenue + completes", timeline = all approvals/invoices/payouts/signups.
- **Client**: hero = "Project completion %", timeline = recent responses on their projects.
- **Supplier**: hero = "This month's earnings", timeline = approvals/rejections/payments.
- **Respondent**: hero = "Points balance + tier", timeline = earns/redemptions/new surveys matching profile.
Charts move to a secondary "Analytics" tab on the same page (kept, just out of the way).

### 4. Automation Engine (new `/app/automations` page)
A rule-based engine that runs on every relevant store mutation. Built-in rules (each toggleable, with editable thresholds):

**Quality + Approval**
- Auto-reject if `timeSpent < 60s` OR `qualityScore < 50` OR duplicate IP for same project.
- Auto-approve if `qualityScore ≥ 80` AND no flags.
- On approval → credit respondent points + supplier payable.

**Smart Routing**
- When respondent opens generic survey link, route to the highest-CPI live project they qualify for (by country/age/audience tags) AND that hasn't hit quota.
- Auto-pause project when approved completes ≥ sample size.

**Invoice + Payment**
- When project hits 100% sample → auto-generate client invoice, supplier payable, and queue respondent payouts.
- When invoice marked paid → auto-release supplier payment + respondent redemption approvals.

**Notifications + Scheduling**
- In-app + (mock) email on: project goes live, quota 80% reached, redemption approved, weekly digest every Monday.
- Daily digest stored as a Notification; scheduler runs in a `useEffect` interval (every 30s in demo = 1 day).

Each rule has a **Run log** showing the last 50 executions, plus a "Run now" button to trigger manually.

### 5. New / changed files
**Types & data**
- `src/lib/types.ts` — add `respondent` role, `Wallet`, `PointsLedgerEntry`, `RewardCatalogItem`, `Redemption`, `Referral`, `Automation`, `AutomationRun`.
- `src/lib/seed.ts` — seed 1 respondent user (`respondent@demo.com`/`123456`), reward catalog (8 items), 4 default automations enabled.
- `src/lib/store.tsx` — bump to `v3`, add CRUD for wallets/redemptions/automations, derived selectors `respondentPoints(uid)`, `respondentTier(uid)`.
- `src/lib/automation.ts` (new) — engine: `runAutomations(db, trigger)` returns mutated DB + run logs. Triggers: `response:submitted`, `response:approved`, `project:quota_hit`, `invoice:paid`, `scheduler:tick`.

**Routes (new)**
- `src/routes/app.wallet.tsx` — respondent wallet/dashboard.
- `src/routes/app.rewards.tsx` — reward catalog + redeem flow + redemption history.
- `src/routes/app.automations.tsx` — list of automation rules with toggles, thresholds, run log, "Run now".
- `src/routes/auth.signup.tsx` — extend role selector to include "Respondent".

**Routes (refactored)**
- `src/routes/app.dashboard.tsx` — role-aware single hero KPI + activity timeline + collapsible Analytics section.
- `src/routes/survey.$linkId.tsx` — on submit, run automation engine; if respondent is logged in, credit points immediately.
- `src/components/AppShell.tsx` — add Wallet / Rewards / Automations links; show points + tier badge in header for respondents.

### 6. Technical details
- Engine is pure: `(db, trigger, payload) => { db, logs }`. Called from store mutators inside `setDB` so every write is consistent.
- Scheduler: a single `useEffect` in `StoreProvider` runs `scheduler:tick` every 30s; safe because engine is idempotent (each rule checks "already done" before acting).
- Points → cash conversion: `100 points = $1` (constant in `automation.ts`, easy to change).
- All new tables persist to localStorage under the new `v3` key. No backend required — this stays a fully working demo app.

### 7. What I will verify before finishing
- Login works for all 4 roles (admin/client/supplier/respondent) after fresh load.
- Submitting a public survey while logged in as respondent credits points and shows in wallet.
- Reaching sample target on a project auto-generates an invoice and supplier payable.
- Toggling an automation off stops it from firing on the next trigger.
- Dashboard renders the correct hero KPI per role and the timeline is non-empty.

Approve and I'll build it.