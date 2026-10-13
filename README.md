# TLS Group HRMS — Front-end Demo

Clickable front-end demo for the TLS Group HRMS. All data is fictional mock data.
There is no backend, and the login is not real authentication.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

## Rules

- Screens (`app/`, `components/`, `features/`) must not import mock fixtures from
  `lib/mock`. ESLint enforces this; use the typed services instead.
- Role checks and route restrictions in this demo are presentation only, not security.
