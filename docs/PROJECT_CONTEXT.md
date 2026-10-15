# TLS HRMS Web — Project Context

Labels used below:

- **[verified in repo]** — Confirmed from current files/implementation.
- **[from owner]** — Owner-approved direction; not necessarily implemented.
- **[assumed]** — Temporary interpretation needing owner confirmation.
- **[need confirmation]** — Explicitly unresolved; do not invent an answer.

---

## 1. Document Purpose

Living context for Cursor sessions working in `tls-hrms-web`. Prefer this
file for product flows, built status, repository boundaries, approved
production architecture direction, and frontend design *authority*
pointers.

Prefer `AGENTS.md` for short always-on working rules. Prefer parent
`HRMS/AGENTS.md` for workspace-wide repository boundaries.

**Visual design authority:** `docs/DESIGN_SYSTEM.md` is the authoritative
frontend visual-design document. This file must not duplicate or replace
it. Future UI work must align with `DESIGN_SYSTEM.md` and TLS Brand
Guidelines [from owner].

## 2. Product Purpose

TLS Group HRMS is an internal HR system for [from owner]:

- Augustea Ship Manning Philippines Inc.
- Elburg Shipmanagement Philippines Inc.
- I.M.A Assessment and Training Center Inc.

Company names match seed/display catalog [verified in repo]
(`lib/domain/directory-catalog.ts`, `lib/mock/seed.ts`).

Intended for internal company use; may eventually replace a rented HR
product [from owner]. “Employee” and “staff” refer to the same user
category [from owner].

## 3. Current Phase

Front-end-only mock demo for workflow, UX, and HRMS process validation
[from owner] / [verified in repo].

Present in this repository [verified in repo]:

- Next.js frontend, React 19, Tailwind CSS v4
- Radix-based / shadcn-style component architecture
- Geist typography
- Typed mock services; mock authentication and authorization
- Fictional HRMS data; versioned `localStorage` persistence

Not present in this repository [verified in repo]:

- Production backend, production database, production file storage
- Production API integration, real authentication provider
- Deployment pipeline

Do not build the production backend during the current frontend-demo phase
[from owner].

## 4. Verified Technology

| Item | Detail | Label |
|------|--------|-------|
| Framework | Next.js 16.4.0 (App Router) | [verified in repo] |
| UI runtime | React 19.3.0 | [verified in repo] |
| Styling | Tailwind CSS 4 + Turbopack CSS loader | [verified in repo] |
| Components | Radix + shadcn-style architecture (`components/ui`, `components.json`) | [verified in repo] |
| Typography | Geist + Geist Mono (`app/layout.tsx`) | [verified in repo] |
| Language | TypeScript strict (`tsconfig.json`) | [verified in repo] |
| Lint | `eslint.config.mjs` + `eslint-config-next` | [verified in repo] |
| Tests | Vitest 3 + happy-dom (`vitest.config.ts`, `lib/**/*.test.ts`) | [verified in repo] |
| Data | Browser `localStorage` mock store, `STORE_VERSION = 3` | [verified in repo] |
| Auth | Mock session only (`lib/session`, `session-service`) | [verified in repo] |
| API routes | None under `app/api` | [verified in repo] |

### Frontend design foundation [from owner]

Approved UI foundation: **TLS-branded shadcn** — Next.js, Tailwind CSS,
shadcn/ui, Radix UI, TLS Brand Guidelines, and `DESIGN_SYSTEM.md`.

- Continue the existing shadcn/ui ecosystem; do not migrate away from it.
- Reuse and extend existing shadcn/Radix patterns before inventing custom
  alternatives; preserve accessibility benefits.
- Layer TLS branding (colors, identity, visual language, enterprise HRMS
  appearance) on top of the shadcn foundation.
- Do not replace the foundation with Material UI, Ant Design, Chakra,
  Mantine, Bootstrap, Tailwind UI redesigns, or other competing systems.

Any `npx shadcn@latest init …` preset usage is a **frontend
implementation detail** only — not a branding, architecture, or
infrastructure decision [from owner].

## 5. Workspace and Repository Boundaries

Parent workspace `C:\Users\a.magat\HRMS` currently contains `.cursor/` and
`tls-hrms-web/` only [verified in repo].

| Expected path [from owner] | On disk |
|----------------------------|---------|
| `tls-hrms-web/` | Yes |
| `tls-hrms-api/` | No |
| parent `docs/` | No |
| `architecture/` | No |
| `database/` | No |

Frontend and backend are separate repositories [from owner].
`tls-hrms-web` folder exists; `.git` was not present at inspection
[verified in repo] — Git initialization status may change later.

### Separation rules

**Frontend-only** (layout, styling, components, client navigation,
presentation states, API adapter consumption later, UX validation) →
`tls-hrms-web` only unless owner approves cross-repo work.

**Backend-only** (API endpoints, auth authority, authorization, business
transactions, approval enforcement, server validation, audit logging,
workers, attendance imports) → `tls-hrms-api` only.

**Database-only** (schema, tables, constraints, indexes, migration
planning, seed/reference scripts, retention) → `database` area or backend
migration system — placement not confirmed yet [from owner / needs
confirmation]. Do not decide repository placement now.

- A frontend task must not automatically create backend endpoints.
- A backend task must not automatically redesign frontend screens.
- A database task must not automatically modify frontend and backend code.

If a change needs more than one area, identify: (1) why cross-boundary is
necessary, (2) which repos/folders change, (3) smallest safe sequence,
(4) what can complete independently, (5) what needs owner approval.

Selected future backend: FastAPI, Python, modular monolith, PostgreSQL,
separate `tls-hrms-api` [from owner]. Do not document Laravel, .NET, or
NestJS as selected unless the owner changes that decision.

**Hosting / data platform [from owner]:** Production uses
**company-controlled infrastructure**. Managed cloud hosting (including
previous proposals of Vercel, Render, and Supabase) is **not** the
approved production direction. See §19.

## 6. Users and Current Roles

| Role | Status |
|------|--------|
| Employee | Implemented (`RoleId = "employee"`) [verified in repo] |
| HR | Implemented (`RoleId = "hr"`) [verified in repo] |
| Manager / Supervisor | Planned [from owner] — not in `RoleId` |
| Head of HR | Planned as leave stage only; no Head-of-HR user role UI [verified in repo] |
| Accounting, Administrator, Super Administrator | Planned [from owner] |

Demo accounts [verified in repo] (`config/demo-accounts.ts`):

- `employee.augustea@tls-demo.test`
- `employee.elburg@tls-demo.test`
- `hr.augustea@tls-demo.test`
- `hr.group@tls-demo.test` (multi-company)
- Shared demo password constant: `demo1234` (fiction only)

HR capabilities [verified in repo] (`lib/auth/capabilities.ts`):
`hr.people.create|edit|change_status`, `hr.leave.review`,
`hr.attendance.company_view`, `hr.settings.manage`.

## 7. Authentication and Company Selection Flow

[verified in repo]

1. `/login` — mock email/password via `session-service` + `SessionProvider`.
2. Multi-company users → `/select-company` when no active company.
3. Active company stored in mock session (`localStorage`).
4. Company switcher in `AppShell`; detail paths navigate to section list.
5. Session/data are browser-controlled; not secure for production.

**Security limitation (required statement):** Current login is mock
authentication. Session and data are browser-controlled. `localStorage` is
not secure. Client-side role checks and company filters are presentation
behavior. Production requires backend-enforced authentication,
authorization, company scoping, validation, audit logging, and secure
sessions.

## 8. Shared Navigation

[verified in repo] (`config/navigation.ts`, `components/shell/app-shell.tsx`)

- One `SHARED_NAVIGATION` for every signed-in role.
- Role-aware Home content on `/home`; not separate Employee/HR shells.
- HR-only path prefixes remain gated (`isHrOnlyPath`): `/hr/settings/*`,
  `/leave/approvals`, `/attendance/company`, `/people/new`,
  `/people/*/edit`, legacy `/hr/time-off/*`.
- Legacy `/employee/*` and most `/hr/*` redirect to shared routes
  (`next.config.ts` + thin pages). `/hr/settings/*` stays HR-only.

Nav items: Home, To-Dos (Tasks, Time Off, Information Update, Forms,
Performance), Team Calendar, People, Documents, Forms → Form Library,
Workflows → Dashboard, Attendance → My Attendance, Expenses → Submission,
OKR → Objectives.

## 9. Main Employee Flows

[verified in repo unless noted]

- Role-aware Home (`getEmployeeHome`) — balances, recent leave, attendance
  snapshot.
- To-Dos — personal work items (`todo-service`, assignee filter).
- Team Calendar — privacy-limited leave presence (name, dates, Full/AM/PM,
  holiday).
- People directory — `DirectoryEmployeeSummary` without HR-only fields.
- Documents / Forms / Workflows / Expenses / OKR — mock presentation lists.
- My Attendance — linked `employeeId` only.
- Leave request / history / balances — employee self-service.

## 10. Main HR Flows

[verified in repo]

- Role-aware HR Home (`getHrHome`).
- To-Dos include HR work items (`hr-todo-service` / assignee).
- People management — create/edit/status via capabilities.
- Leave approvals — HR stage approve/reject.
- Company attendance — `hr.attendance.company_view`.
- Settings — departments, positions, shifts, holidays under `/hr/settings/*`.
- Group HR — directory company filter limited to memberships
  (`people-service`, tests in `expansion.test.ts` / `shared-nav.test.ts`).

## 11. Leave Workflow

[verified in repo] (`lib/services/leave-service.ts`, `lib/domain/leave.ts`)

Expected demo flow (matches implementation):

1. Employee submits leave.
2. Mock service auto-adds timeline entry
   `"Simulated manager approval (demo only)"` and advances manager stage.
3. Request awaits HR (`Pending - HR`).
4. HR approves or rejects HR stage (`approveHrStage` / `rejectHrStage`).
5. HR approval sets Head-of-HR stage pending → label
   `"Pending - Head of HR"`.
6. Final Head-of-HR approval exists in prepared seed data only
   (e.g. `lr-jamie-final` with actor `"Head of HR (seed)"`).
7. No Head-of-HR interactive implementation / role yet.

UI copy on approvals detail notes Head-of-HR is not implemented for live
demo action [verified in repo].

## 12. Attendance Rules

Owner-confirmed demo rules [from owner], implemented in
`lib/domain/attendance.ts` and seed shift [verified in repo]:

| Rule | Value |
|------|-------|
| Standard schedule | 09:00–18:00 |
| Lunch | 12:00–13:00 |
| Grace ends | 09:15 (on time) |
| Late | 09:16 = 16 minutes late from 09:00 |
| Undertime | Leave before 18:00 |
| Morning half-day leave | 09:00–12:00 (portion `am`) |
| Afternoon half-day leave | 13:00–18:00 (portion `pm`) |

Half-day attendance late/undertime: **not calculated** — status
`half_day_leave` with
`"Not calculated — rule pending HR confirmation"`
[verified in repo]. Unresolved policy remains open [from owner].

## 13. People Directory and Company Scope

[verified in repo]

- Active company scopes most data via `requireScopedSession`.
- Group HR (`permittedCompanyIds.length > 1`) may filter directory across
  membership companies only — not arbitrary companies.
- Employees get privacy-reduced summaries; HR gets email, assignments,
  management fields.
- Screens must use `@/lib/services/*`; ESLint blocks importing `@/lib/mock`
  from `app`/`components`/`features`.

## 14. Mock Data and Persistence

[verified in repo]

- `lib/mock/seed.ts` — seed users, companies, leave, punches, settings.
- `lib/mock/module-fixtures.ts` — Documents, Forms, Workflows, Expenses,
  OKR, To-Dos fixtures.
- `lib/mock/store.ts` — versioned keys
  `tls-hrms-demo-data-v3` / `tls-hrms-demo-session-v3`, in-memory +
  `localStorage`, `mutateStore` / `resetStore`.
- Artificial `delay()` on services for demo feel.

## 15. Service-Layer Boundaries

[verified in repo]

Typed services under `lib/services/`: session, company, dashboard, people,
leave, attendance, settings, todo, document, forms, workflow, expense,
okr, scope helpers.

Domain pure logic: `lib/domain/leave.ts`, `lib/domain/attendance.ts`,
`lib/domain/types.ts`.

Do not bypass services from screens. Do not put production secrets in
services.

## 16. Main Routes

Preferred shared routes [verified in repo]:

| Area | Path |
|------|------|
| Login / company | `/login`, `/select-company` |
| Home | `/home` |
| To-Dos | `/todos/tasks`, `/todos/time-off`, `/todos/information-update`, `/todos/forms`, `/todos/performance` |
| Calendar | `/calendar` |
| People | `/people`, `/people/[id]`, `/people/new`, `/people/[id]/edit` |
| Documents | `/documents` |
| Forms | `/forms/library` |
| Workflows | `/workflows/dashboard` |
| Attendance | `/attendance/my-attendance`, `/attendance/company` (HR) |
| Expenses | `/expenses/submission` |
| OKR | `/okr/objectives` |
| Leave | `/leave/request`, `/leave/history`, `/leave/history/[id]`, `/leave/balances`, `/leave/approvals`, `/leave/approvals/[id]` |
| HR settings | `/hr/settings/departments\|positions\|shifts\|holidays` |
| Authz | `/not-authorized` |

Legacy `/employee/*` and most `/hr/*` redirect to the above.

## 17. Current Implementation Status

| Area | Status | Evidence / path | Demo limitation | Next production dependency |
|------|--------|-----------------|-----------------|----------------------------|
| Login | Built | `app/login`, `session-service` | Mock password in browser | Real auth server |
| Company chooser | Built | `app/select-company`, `company-service` | Client session only | Server memberships |
| Shared shell/navigation | Built | `app-shell.tsx`, `navigation.ts` | Client role gates | AuthZ middleware |
| Employee Home | Built | `app/home`, `dashboard-service` | Mock KPIs | API aggregates |
| HR Home | Built | same | Mock KPIs | API aggregates |
| To-Dos | Built | `app/todos/*`, todo services | Read-only fixtures | Task engine |
| Team Calendar | Built | `app/calendar` | Privacy mock only | Calendar API |
| People directory | Built | `app/people`, `people-service` | Fictional people | HRIS API |
| HR People management | Built | create/edit + capabilities | localStorage writes | CRUD API + audit |
| Leave employee flow | Built | `leave-service` submit | Simulated manager | Workflow engine |
| HR leave approval | Built | approve/reject HR stage | Browser-only | Server enforcement |
| Head-of-HR approval | Partial | seed final approval only | No live Head-of-HR UI | Role + API stage |
| Attendance | Built | `attendance.ts` + pages | Mock punches | Biometric/import bridge |
| Documents | Built | `document-service`, fixtures | No real files | Company-controlled file storage [from owner] |
| Forms | Built | `forms-service`, fixtures | No form engine | Forms backend |
| Workflows | Built | `workflow-service`, fixtures | Dashboard mock | Workflow engine |
| Expenses | Built | `expense-service`, fixtures | No payments | Expense API |
| OKR | Built | `okr-service`, fixtures | Display only | OKR API |
| Settings | Built | `/hr/settings/*`, `settings-service` | Company mock refs | Config API |
| Mock services | Built | `lib/services/*` | Intentional | Versioned REST adapters over HTTPS |
| Browser persistence | Built | `lib/mock/store.ts` v3 | Not secure | Server DB |
| Automated tests | Built | 5 files under `lib/**/*.test.ts` | Unit/domain only | E2E + contract tests |
| Backend API | Not started | `tls-hrms-api` absent | — | FastAPI modular monolith |
| PostgreSQL | Not started | — | — | Company-controlled PostgreSQL [from owner] |
| Real authentication | Not started | — | — | Backend sessions/tokens |
| File storage | Not started | — | — | Protected internal storage on company infrastructure [from owner] |
| Biometric attendance bridge | Not started | — | — | Import workers |
| Deployment | Not started | — | — | Company-controlled infrastructure [from owner] |

Status vocabulary: Built | Partial | Not started | Needs confirmation.

## 18. Built but Demo-Only Modules

Documents, Forms, Workflows, Expenses, OKR, Performance (To-Dos child), and
similar screens are **built as front-end mock presentations**: typed
services, routes, UI, fictional fixtures, company scoping where applied.

They are:

- Partially functional with local mock state where services mutate/list
  store data
- **Not** production-ready
- **Not** backed by a server or database

Do not describe them as “unimplemented placeholders” merely because they
lack a backend.

## 19. Future Production Architecture

All items in this section are **[from owner]** unless noted.

### Applications

- Frontend: `tls-hrms-web` (Next.js) — separate repository
- Backend: `tls-hrms-api` — FastAPI modular monolith, separate repository
- Frontend and backend remain separate applications even if deployed on the
  same company-controlled infrastructure
- Auth, authorization, company scope, validation, and audit on the server
- Do not select NestJS, Laravel, or .NET unless the owner changes this

### Hosting

- **Company-controlled infrastructure** is the approved production direction
- **Render is not** part of the approved production architecture
- **Managed cloud hosting** (including prior Vercel / Render / Supabase
  hosting proposals) is **not** the approved production direction

### Database

- PostgreSQL remains approved
- **Supabase is not** the approved PostgreSQL provider
- Production PostgreSQL runs on company-approved infrastructure

### File storage

- **Supabase Storage is not** the approved storage platform
- Approved direction: protected internal file storage on
  company-controlled infrastructure

### Integration

- Initial frontend–backend communication: **versioned REST APIs over HTTPS**

### Scalability (not initially required)

Do not introduce the following unless justified by verified requirements:

- Redis, WebSockets, Kubernetes, microservices, message brokers, event buses

### Frontend design direction (authority pointers only)

- Visual rules live in `docs/DESIGN_SYSTEM.md` (authoritative) and TLS Brand
  Guidelines — not in this document
- Approved foundation: TLS-branded shadcn (see §4)
- Existing design system in-repo should be **evolved**, not replaced
- Product appearance: professional, structured, enterprise-focused, calm,
  information-dense, trustworthy, internally branded

Palette / brand conflicts between `DESIGN_SYSTEM.md`, TLS Brand Guidelines,
and live tokens (e.g. primary `#0D47A1` vs TLS digital blue `#0963C6`) are
**[need confirmation]** — do not resolve here.

## 20. Explicitly Out of Scope for the Current Frontend

- FastAPI / PostgreSQL / real auth / real file upload
- Next.js API routes, ORMs, DB clients, server sessions
- Creating `tls-hrms-api`, parent `database/`, or `architecture/` unless asked
- CrewInspector projects
- Real employee PII, credentials, production URLs, connection strings
- New modules/features not requested
- Git init/commit/push/deploy unless owner asks
- Claiming production security from client checks
- Migrating away from shadcn/ui to another component system [from owner]
- Replacing `DESIGN_SYSTEM.md` with ad-hoc visual directions in this file

## 21. Decisions Already Made

- Shared navigation for all signed-in roles (not HR-only expansion)
[verified in repo]
- Capability-gated HR actions [verified in repo]
- Prefer shared routes over duplicated Employee/HR page trees
[verified in repo]
- Versioned mock store (currently v3) [verified in repo]
- Employee directory privacy vs HR summaries [verified in repo]
- Leave demo: simulated manager → HR → Pending Head of HR
[verified in repo]
- Attendance grace/late/undertime rules as above; half-day not calculated
[verified in repo]
- Future backend = FastAPI modular monolith + PostgreSQL [from owner]
- Frontend/backend separate repositories [from owner]
- No production backend during frontend-demo phase [from owner]
- Company-controlled infrastructure for production hosting, PostgreSQL, and
  protected file storage; Render / Vercel / Supabase not approved [from owner]
- Initial API style: versioned REST over HTTPS [from owner]
- Redis / WebSockets / Kubernetes / microservices / brokers not initially
  required [from owner]
- UI foundation remains TLS-branded shadcn; `DESIGN_SYSTEM.md` is visual
  authority; TLS Brand Guidelines apply [from owner]

## 22. Open Questions

### Product / demo

- Half-day attendance late/undertime policy (currently not calculated)
  [from owner] / [verified in repo implementation]
- Exact future placement of database migrations (`database/` vs
  `tls-hrms-api`) — [need confirmation]
- When to initialize Git for `tls-hrms-web` and create `tls-hrms-api`
  [assumed: owner-driven]
- Timing/priority for Manager, Head of HR, Accounting, Admin roles
  [from owner planned; schedule unknown]
- Whether parent `docs/` / `architecture/` / `database/` folders will be
  created soon [assumed: when owner requests]

### Infrastructure [need confirmation]

- Server OS; physical vs virtual machine; shared vs dedicated
- CPU / memory / storage / network sizing
- Internet-facing vs VPN-only vs internal-only deployment

### Deployment [need confirmation]

- Reverse proxy selection (e.g. Nginx, Caddy)
- Docker Compose vs systemd (or other) deployment model
- Production CI/CD

### Operations [need confirmation]

- PostgreSQL administration model
- Backup tooling, destination, restore procedures, recovery objectives
- Monitoring and alerting platforms

### Ownership [need confirmation]

- Domain, DNS, and TLS certificate ownership
- Emergency administrative access

### Frontend design [need confirmation]

- Whether `DESIGN_SYSTEM.md` or TLS Brand Guidelines is final when palette
  differences exist
- Whether current primary token `#0D47A1` remains or aligns with TLS digital
  blue `#0963C6`

## 23. Safe Change Checklist

### Before changing code

- Am I in the correct repository?
- Did I inspect the relevant existing implementation?
- Is this request frontend, backend, database, architecture, or explicitly
  cross-cutting?
- Is there an existing component, service, type, hook, helper, route, or
  test I can reuse?
- Am I changing only what the owner requested?
- Does this require a new dependency?
- Does this change an approved business rule?
- Does this weaken company scope or expose data?
- Does this touch another repository?
- Do I need to stop and propose a plan first?

### After changing code

- Did I run the relevant repository checks?
- Did I test the exact requested flow?
- Did I preserve existing role and company behavior?
- Did I avoid real data and secrets?
- Did I report every changed file?
- Did I state what I intentionally did not change?
- Did I distinguish code verification from assumption?

---

## Related handoff

`HANDOFF.md` (2026-10-12) summarizes prior chat state. Prefer this
`PROJECT_CONTEXT.md` for ongoing agent context; use HANDOFF as historical
notes. Where they conflict, re-verify in code.
