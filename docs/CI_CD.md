# TLS HRMS — CI/CD Policy

Labels: **[implemented]** · **[recommended]** · **[future]**

Scope of this document: frontend CI foundation for `tls-hrms-web`, plus
deployment-agnostic standards for future backend CI and CD. Infrastructure
providers remain undecided; do not bake hosting assumptions into pipelines.

---

## 1. Current state

| Area | Status |
|------|--------|
| Frontend CI (`tls-hrms-web`) | **[implemented]** — `.github/workflows/ci.yml` |
| Backend CI (`tls-hrms-api`) | **[future]** — do not create until scaffold exists |
| Continuous Deployment | **[future]** — document only; do not implement |
| Infrastructure automation | **[future]** — deferred |

---

## 2. Frontend CI workflow (`ci.yml`)

### Triggers

- `push` → `dev`, `feature/**`
- `pull_request` → `dev`, `main`

### Permissions

```yaml
permissions:
  contents: read
```

Least privilege: the job only needs to read the repository. No write,
packages, or `id-token` until CD exists and needs them.

### Steps

| Step | Command / action | Why |
|------|------------------|-----|
| Checkout | `actions/checkout@v4` | Fetch commit under test |
| Setup Node.js | `actions/setup-node@v4`, Node **22**, `cache: npm` | Deterministic runtime + npm cache keyed from lockfile |
| Install | `npm ci` | Reproducible install from `package-lock.json` (fails if lockfile drift) |
| ESLint | `npm run lint` | Style and correctness gates |
| TypeScript | `npm run typecheck` (`tsc --noEmit`) | Type errors fail the pipeline before build |
| Build | `npm run build` | Next.js production build must succeed |
| Tests | `npm test` if `scripts.test` exists | Vitest today; skip cleanly if script removed |

Any non-zero exit fails the job. Concurrency cancels superseded runs on the
same ref so feature-branch noise stays low.

### Determinism rules

- Commit `package-lock.json`; never use `npm install` in CI.
- Pin major action versions (`@v4`); review Dependabot/action updates.
- Do not inject secrets into CI validation jobs unless a future test truly needs them.
- Keep the workflow deployment-agnostic (no Vercel/Hetzner/K8s steps).

---

## 3. Recommended GitHub repository settings (`tls-hrms-web`)

**[recommended]** — configure in GitHub UI (or org rulesets):

| Setting | Value |
|---------|--------|
| Default branch | `main` |
| Allow merge commits | Optional; prefer squash for solo clarity |
| Allow squash merging | On |
| Allow rebase merging | Optional |
| Automatically delete head branches | On |
| Actions → General → Workflow permissions | Read repository contents |
| Actions → Fork pull request workflows | Restrict secrets (N/A if private solo) |
| Dependabot alerts | On |
| Dependabot security updates | On (optional for solo; useful) |
| Secret scanning / push protection | On if available on plan |
| Dependency graph | On |

Create long-lived branches if missing: `main`, `dev`.

---

## 4. Branch protection

### `main` (production) **[recommended]**

- Restrict pushes: no direct pushes to `main`
- Require a pull request before merging
- Require status checks to pass: CI / Validate (exact check name from Actions)
- Require branches to be up to date before merging
- Require at least **1** approval (use a second account, CODEOWNERS, or org rule; solo workaround: ruleset with yourself + mandatory green CI until a reviewer exists)
- Dismiss stale pull request approvals when new commits are pushed
- Restrict force pushes
- Restrict deletions
- Do not allow bypass except break-glass admin (document who/when)

### `dev` (integration) **[recommended]**

- No direct pushes
- Pull request required
- Require successful CI checks
- Restrict force pushes
- Restrict deletions
- Approvals: optional for solo speed; enable when a second engineer joins

### Branch naming **[recommended]**

- `feature/*` — normal work
- `hotfix/*` — production fixes (merge path still ends at `main` via PR; CI on hotfix can be added later if needed)

### Flow

```
feature/* → CI → PR → dev → CI → PR → main → [future CD] → deploy
```

All production merges must be PR-traceable.

---

## 5. Backend CI roadmap (`tls-hrms-api`) **[future]**

**Do not create backend GitHub Actions until all of the following exist:**

1. FastAPI modular-monolith scaffold
2. Docker setup (local/dev image at minimum)
3. Test framework (e.g. pytest)
4. Linting (e.g. ruff / eslint-equivalent for Python)
5. Build / image or package validation path

### Recommended future stages (order)

1. **install** — lockfile-based deps (`pip`/`uv`/`poetry` — pick one later)
2. **lint** — static style + import hygiene
3. **tests** — unit + API tests; fail closed
4. **build** — app/package or container build (no registry push required for CI-only)
5. **security validation** — dependency audit + SAST when tooling is chosen

Same git trigger pattern as frontend once the API repo is active. Keep
workflows deployment-agnostic.

---

## 6. Future CD architecture **[future — document only]**

### Policy

| Source | Deploy? |
|--------|---------|
| `main` | Yes — production only path |
| `dev` | No |
| `feature/*` | No |
| `hotfix/*` | No (merge to `main` first, then CD from `main`) |

Frontend `main` → production frontend deploy  
Backend `main` → production API deploy  

### Required gates before any production deploy

1. Successful CI on the merge commit
2. Protected-branch merge (PR, not direct push)
3. Production approval gate (GitHub Environment protection / manual review)
4. Deployment audit trail (who approved, what SHA, when)

### Explicit non-goals right now

- No CD workflows
- No infra-specific Actions (Hetzner, Cloudflare, Vercel, Render, K8s, etc.)
- No assumption of Redis, load balancers, or a chosen host

When CD is designed, use GitHub Environments (`production`) with required
reviewers so the pipeline stays portable across hosts.

---

## 7. HRMS-specific quality gates **[future / recommended]**

Enterprise HR data (multi-company tenancy, audit logging, admin 2FA) raises
the bar:

| Gate | Frontend now | Later (both repos) |
|------|--------------|--------------------|
| Lint | Yes | Required |
| Type / static checks | Yes (`tsc`) | Backend: mypy/pyright when scaffolded |
| Build | Yes | Required |
| Automated tests | Yes | Expand coverage before real auth/PII |
| Dependency review | Recommend Dependabot | Required before production |
| Security scanning | Plan CodeQL / audit | Required before production |
| Auditability | PR-only to `main`/`dev` | Keep; add deploy audit via Environments |

Never ship production credentials or connection strings in either repository.

---

## 8. Solo-developer DevOps risks and improvements **[recommended]**

1. **Single approver gap** — Branch protection wanting 1 approval conflicts with true solo merge. Prefer: mandatory CI + no direct push; add a human approver rule when a second owner exists. Avoid disabling protection.
2. **Secrets creep** — Demo mocks must not evolve into real credentials in git. Use GitHub Secrets / OIDC only when CD arrives.
3. **Lockfile discipline** — `npm ci` fails on drift; treat that as a feature.
4. **Test depth before real PII** — Vitest exists; expand domain/auth/tenancy tests before connecting a real API.
5. **Tenancy regressions** — When backend lands, add CI tests that company A cannot read company B data.
6. **Admin 2FA** — Treat auth/2FA changes as high-risk: require green CI + explicit PR review notes.
7. **Separate repos** — Keep frontend CI and future backend CI independent; do not merge into a monorepo workflow “for convenience.”
8. **Hotfix CI** — Optional later: add `hotfix/**` to the same `ci.yml` push triggers so emergency branches get the same gates without waiting for a PR target.
9. **Action pinning** — Consider full commit-SHA pins for `checkout` / `setup-node` if supply-chain hardening is required by policy.
10. **No premature CD** — Deploying from a laptop or ad-hoc host is fine until Environments + approval gates exist; do not fake production CD early.

---

## 9. Out of scope (intentional)

- Backend `.github/workflows/*`
- Deployment workflows
- Infrastructure-as-code pipelines
- Provider-specific deploy actions
