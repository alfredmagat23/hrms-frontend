# Handoff — TLS HRMS Web Demo

**Date:** 2026-10-12  
**Project:** `C:\Users\a.magat\HRMS\tls-hrms-web`  
**User:** Baby (software engineer). Assistant persona: JARVIS. Ponytail mode (lazy/minimal diffs) was active.

---

## What this is

Local **front-end only** mock HRMS demo (Next.js). No backend, no real auth, no DB, no deploy, no Git commits unless asked. Data lives in `localStorage` via mock store (`STORE_VERSION` currently **3**).

---

## Stack

- Next.js 16 + TypeScript + Tailwind + shadcn/Radix
- Vitest for unit tests
- Mock services under `lib/services/*`
- Session: `lib/session/session-context.tsx` + `lib/mock/store.ts`

---

## How to run

```bash
cd C:\Users\a.magat\HRMS\tls-hrms-web
npm run build
npm start -- -p 3100
# or: npm run start   (default port; check terminal)
```

Demo password: `demo1234`  
Accounts: see `config/demo-accounts.ts`  
- Employee Aug: `employee.augustea@tls-demo.test`  
- Employee Elb: `employee.elburg@tls-demo.test`  
- HR Aug: `hr.augustea@tls-demo.test`  
- Group HR: `hr.group@tls-demo.test` (multi-company chooser)

---

## Architecture (shared nav — important)

**Earlier mistake corrected:** HRIS expansion was HR-only; it was fixed so **every signed-in role** gets the same sidebar.

- **One nav config:** `config/navigation.ts` → `SHARED_NAVIGATION`
- **Capabilities** (HR actions only): `lib/auth/capabilities.ts`  
  `hr.people.create|edit|change_status`, `hr.leave.review`, `hr.attendance.company_view`, `hr.settings.manage`
- **Shared routes** (preferred):
  - `/home` (role-aware content)
  - `/todos/*`, `/calendar`, `/people`, `/documents`
  - `/forms/library`, `/workflows/dashboard`
  - `/attendance/my-attendance`, `/attendance/company` (HR-only path)
  - `/expenses/submission`, `/okr/objectives`
  - Leave: `/leave/request`, `/leave/history`, `/leave/balances`, `/leave/approvals` (HR)
- **Legacy** `/employee/*` and most `/hr/*` → redirects (`next.config.ts` + thin redirect pages). **`/hr/settings/*` stays HR-only.**
- Shell: `components/shell/app-shell.tsx` — one shell, expandable sidebar, mobile drawer.

---

## People page (latest UI work)

Files:
- `app/people/page.tsx`
- `components/people/people-filter-panel.tsx`

Recent UX changes:
1. Removed employee **No.** column from table/cards.
2. Status colors: **Active = green**, **Inactive = red** (On Leave = amber).
3. **Filter** button on the **right**; opens a **right-side Sheet** (sidebar drawer), not a popover.
4. Filter body: label column + status checkboxes + Location/Company/Department/Team/Position multi-select dropdowns (reference layout).

People privacy:
- Employees: `DirectoryEmployeeSummary` / profile without email, assignments, HR fields (`lib/services/people-service.ts`).
- HR: full summary + assignments; Add/Edit gated by capabilities.

---

## Other modules (mock / presentation)

| Area | Notes |
|------|--------|
| To-Dos | Read-only; personal vs HR work items via `assigneeUserId` |
| Team Calendar | Privacy: name, dates, Full/AM/PM, holiday — no leave type/reason |
| Documents / Forms / Workflows / Expenses / OKR | Fictional fixtures; no real upload/engine |
| My Attendance | Linked `employeeId` only; Group HR empty-state copy is exact string in `app/attendance/my-attendance/page.tsx` |
| Leave | Manager simulated → HR approve → **Pending - Head of HR**; do not break this |

Fixtures: `lib/mock/module-fixtures.ts` + `lib/mock/seed.ts`

---

## Tests

```bash
npm test
npx tsc --noEmit
npx eslint .
npm run build
npm audit --omit=dev
```

Last known good: **40 tests**, eslint/tsc/build clean, audit 0 vulns.  
Shared-nav coverage: `lib/services/shared-nav.test.ts`

---

## Hard scope limits (do not violate)

- No FastAPI / PostgreSQL / API routes / real auth / real files
- No new modules/features unless asked
- No Git repo create / commit / push / Vercel / deploy unless asked
- Do not touch CrewInspector projects
- Prefer fix-in-place; reuse shared pages — **no second shell or duplicated role page trees**

---

## Useful paths

```
config/navigation.ts
lib/auth/capabilities.ts
components/shell/app-shell.tsx
app/home/page.tsx
app/people/**
components/people/people-filter-panel.tsx
lib/services/people-service.ts
lib/services/leave-service.ts
lib/mock/store.ts
lib/mock/seed.ts
next.config.ts   # redirects
```

---

## Open / next ideas (not started unless user asks)

- Re-verify People filter Sheet + status colors on current `npm run start` session
- Any further People table polish
- Continue HRIS demo polish only within existing shared routes

---

## For the next chat

1. Open `C:\Users\a.magat\HRMS\tls-hrms-web`
2. Read this file + `config/navigation.ts` before large changes
3. Stay on shared routes; capability-gate HR actions
4. Keep diffs small (ponytail / YAGNI unless user wants full design)
