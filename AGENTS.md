<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TLS HRMS Web — Frontend Agent Rules

TLS Group HRMS internal front-end demo.
Current implementation uses fictional mock data and browser-only behavior.
There is no production backend, production database, or real authentication yet.

## Verified stack [verified in repo]

- Next.js `16.4.0`, React `19.3.0`, TypeScript (strict)
- Tailwind CSS 4 + Turbopack CSS loader, Radix/shadcn-style UI
- Vitest (`vitest run`, happy-dom), ESLint (`eslint-config-next`)

## Folder map [verified in repo]

- `app/` — App Router pages (shared routes + legacy `/employee/*`, `/hr/*` redirects)
- `components/shell/` — shared `AppShell`
- `components/people|shared|ui|hr/` — UI building blocks
- `features/` — auth, leave, people, calendar, settings feature UI
- `config/` — `navigation.ts`, `demo-accounts.ts`
- `lib/domain/` — types and domain rules (leave, attendance)
- `lib/services/` — typed mock services (screens import these, not fixtures)
- `lib/mock/` — seed, store (`STORE_VERSION` = 3), module fixtures
- `lib/session/` — `session-context.tsx`
- `lib/auth/` — capability gates for HR actions
- `docs/PROJECT_CONTEXT.md` — product and implementation context

## Working rules

- Inspect the relevant implementation before proposing or editing.
- State what is directly verified in code, what comes from documentation,
  and what remains assumed.
- Make the smallest change that completes the current request.
- Reuse an existing route, component, service, type, helper, hook, style,
  or test before creating another one.
- Do not create a new file, folder, component, hook, utility, service, or
  abstraction unless the task cannot be completed cleanly with an existing
  one.
- Do not add a dependency without explicit owner approval.
- Do not add features, pages, filters, roles, actions, or functions that
  were not requested.
- If something useful is outside the requested scope, report it as:
  "Noticed, not in scope."
- Do not change route structure, domain data shapes, mock-store version,
  service interfaces, company-scoping behavior, session behavior, or
  navigation architecture unless the task explicitly requires it.
- Do not weaken company isolation.
- Do not return HR-only fields to employee-facing services and merely hide
  them in the UI.
- Do not duplicate pages separately for Employee and HR when a shared
  route and role-aware content already exist.
- Preserve the shared sidebar and capability-based HR actions.
- Never include real employee data, credentials, secrets, production URLs,
  connection strings, real documents, or private company information.
- Do not add backend code, Next.js API routes, database clients, ORMs, or
  server-side authentication to the frontend repository unless a later
  approved backend-integration task explicitly requires frontend adapter
  changes.
- Do not modify the future backend repository, database folder,
  architecture folder, or CrewInspector projects from a frontend task.
- Before editing, list the specific files that need to change and why.
- If the task requires changing more than three existing files, creating
  any new implementation file, changing another repository, adding a
  dependency, or changing an approved business rule, provide a contained
  plan and wait for approval.
- For a targeted in-place fix that remains within the named file and
  scope, do not expand the task to adjacent issues.
- After changes, list files modified, checks run, results, and anything
  intentionally not changed.
- Do not claim browser verification unless a browser walkthrough was
  actually performed.
- Do not claim production security. Current role and company checks are
  mock presentation behavior.

## Repository commands [verified in repo — package.json]

| Purpose | Command |
|---------|---------|
| Local development | `npm run dev` |
| Production build | `npm run build` |
| Local production start | `npm run start` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Tests | `npm test` |

For product flows, built status, mock architecture, approved decisions,
and open questions, read `docs/PROJECT_CONTEXT.md` before planning a
feature.

For approved colors, typography, spacing, layout, and component appearance,
read `docs/DESIGN_SYSTEM.md` before making a visual or UI change.
