# TLS HRMS — Frontend Design System

Living visual rules for `tls-hrms-web`. Read this before any visual or UI change.

Labels:

- **[verified in repo]** — Confirmed from current files.
- **[from owner]** — Owner-approved direction.
- **[proposed]** — Recommended for Phase B / later; needs owner approval to implement.
- **[needs confirmation]** — Ambiguous until owner decides.

---

## 1. Purpose

Define a calm, professional internal enterprise HR visual language so shell,
home, and later screens share one intentional product look — without becoming
a marketing site or a generic AI dashboard.

## 2. Product visual goals [from owner]

- Modern internal enterprise HR platform
- Professional, trustworthy, clear, structured
- Information-dense without feeling crowded
- Calm light theme, strong hierarchy, subtle depth
- Consistent components; distinctive enough to feel branded
- Suitable for daily employee and HR use

## 3. Explicit non-goals [from owner]

Do **not** use:

- Gradient-heavy styles
- Glassmorphism
- Neon / glow effects
- Decorative blobs
- Oversized display typography
- Excessive shadows
- Arbitrary analytics charts
- Decorative charts that do not answer a useful HR question
- Dark mode as the default product look (dark CSS tokens exist but are unused)

## 4. Inspection snapshot (Phase A)

### Verified theme tokens [verified in repo]

Source: `app/globals.css`

- Tailwind v4 `@theme inline` maps semantic colors (`--background`,
  `--primary`, `--card`, `--sidebar-*`, `--destructive`, etc.).
- Current `:root` uses **oklch neutrals** and a muted blue-ish
  `--primary: oklch(0.33 0.09 255)` — **not** the approved Material-blue hex
  family yet.
- Page background is effectively white (`oklch(1 0 0)`), so most surfaces
  read as flat white + thin borders [verified in repo + owner visual report].
- `--radius: 0.625rem`.
- `.dark` token set exists; no theme toggle in app [verified in repo].
- `prefers-reduced-motion` is respected [verified in repo].

### Fonts [verified in repo]

- `Geist` + `Geist_Mono` via `next/font/google` in `app/layout.tsx`.
- CSS variables: `--font-geist-sans`, `--font-geist-mono`.

### Shell / navigation [verified in repo]

- Single shell: `components/shell/app-shell.tsx`.
- Desktop sidebar: sticky, `w-64`, `hidden lg:flex`, border + `bg-card`.
- Brand mark: small `TLS` square + “TLS Group HRMS / Demo”.
- Expandable nav groups from `config/navigation.ts` (`SHARED_NAVIGATION`).
- Active leaf: `bg-primary text-primary-foreground`.
- Mobile: `Sheet` left drawer + hamburger (`lg:hidden`).
- Header: page title, demo chip, company switcher / name, user dropdown
  (reset demo + sign out).
- Main: `p-4 sm:p-6` on muted page (`bg-muted/30`).

### Home [verified in repo]

- `app/home/page.tsx` — role-aware Employee vs HR content.
- Sections are raw `div.rounded-lg.border.bg-card.p-4` (no Card primitive).
- Employee: greeting + leave balances + pending requests + holidays + todos
  (mostly text rows; weak hierarchy).
- HR: four equal `StatCard`s + leave queue + headcount + attendance snapshot.
- Uses `StatusBadge`, `EmptyState`, `LoadingBlock`, `ErrorState`.

### Other screens inspected for pattern consistency [verified in repo]

- People: table/cards + Sheet filter (`components/people/people-filter-panel.tsx`).
- Attendance: Tabs + table-like rows of records.
- Team Calendar: `MonthCalendar` feature; content capped `max-w-4xl`.
- Shared states: `components/shared/page-states.tsx`.

### UI primitives present [verified in repo]

Under `components/ui/`:

| Present | File |
|---------|------|
| Button | `button.tsx` |
| Badge | `badge.tsx` |
| Input | `input.tsx` |
| Textarea | `textarea.tsx` |
| Select | `select.tsx` |
| Tabs | `tabs.tsx` |
| Dialog | `dialog.tsx` |
| Sheet | `sheet.tsx` |
| Dropdown menu | `dropdown-menu.tsx` |
| Popover | `popover.tsx` |
| Checkbox | `checkbox.tsx` |
| Separator | `separator.tsx` |

### UI primitives **not** installed [verified in repo]

No component files for: **Card**, **Skeleton**, **Avatar**, **Toast**,
**Tooltip**, **Drawer**, **Table**.

Current “cards” are hand-rolled bordered divs. Loading is text
`LoadingBlock`, not skeletons.

### Dependencies [verified in repo]

Radix dialog/dropdown/select/separator/slot/tabs, CVA, lucide-react,
Tailwind 4, `tw-animate-css`. No chart library. No toast library.

### Accessibility already present [verified in repo]

- `aria-label`, `aria-current`, `aria-expanded`, `aria-controls`
- Focus-visible rings on nav and buttons
- `role="status"` / `role="alert"` on loading/error
- Demo chip and status badges use text labels (not color alone for meaning
  when paired with copy)

### Responsive [verified in repo]

- Sidebar at `lg+`; Sheet below.
- Home grids: `md:grid-cols-2`, HR stats `sm:2` / `lg:4`.
- Company switcher hidden on small header (`md:flex`); available in mobile sheet.

---

## 5. Approved color palette [from owner]

### Brand blue family (only brand blues)

| Token name (proposed) | Hex | RGB |
|-----------------------|-----|-----|
| Blue 50 | `#E3F2FD` | 227, 242, 253 |
| Blue 200 | `#90CAF9` | 144, 202, 249 |
| Blue 500 | `#2196F3` | 33, 150, 243 |
| Blue 900 | `#0D47A1` | 13, 71, 161 |

Do not introduce a different brand hue without approval.

### Neutrals [from owner]

| Role | Hex |
|------|-----|
| Page background | `#F7F9FC` |
| Surface | `#FFFFFF` |
| Muted surface | `#F1F5F9` |
| Primary text | `#172033` |
| Secondary text | `#5F6B7A` |
| Border | `#DCE3EC` |

### Semantic colors [from owner + verified pattern]

Must stay distinct from primary blue:

| Tone | Current demo pattern [verified] | Rule |
|------|----------------------------------|------|
| Success | emerald (`StatusBadge`) | Keep non-blue |
| Warning | amber | Keep non-blue |
| Error / destructive | red / `--destructive` | Keep non-blue |
| Info | may use blue family | Allowed |

Existing `StatusBadge` tones already separate success/warning/danger from
primary [verified in repo]. Preserve that separation when remapping tokens.

### Proposed token mapping [proposed]

Map CSS variables in `globals.css` (light theme) approximately as:

| CSS variable | Maps to |
|--------------|---------|
| `--background` | Page `#F7F9FC` |
| `--card` / `--popover` / `--sidebar` | Surface `#FFFFFF` |
| `--muted` | Muted `#F1F5F9` |
| `--foreground` / `--card-foreground` | Primary text `#172033` |
| `--muted-foreground` | Secondary `#5F6B7A` |
| `--border` / `--sidebar-border` / `--input` | Border `#DCE3EC` |
| `--primary` | Blue 900 `#0D47A1` (actions, active nav) |
| `--primary-foreground` | `#FFFFFF` |
| `--ring` / accent soft fills | Blue 500 / Blue 50 |
| `--accent` | Blue 50 `#E3F2FD` |
| `--sidebar-accent` | Blue 50 or muted |
| `--sidebar-primary` | Blue 900 |
| Soft highlight / info chip | Blue 50 + Blue 900 text |
| Borders emphasis / focus soft | Blue 200 |

Exact oklch vs hex storage: **[needs confirmation]** prefer hex/RGB in
comments with CSS hex values for readability, or convert to oklch for
consistency with existing file. Recommendation: use hex in `:root` for the
approved palette (simpler to audit against this doc).

Dark mode: leave unused tokens alone in Phase B unless asked
**[proposed]**.

---

## 6. Typography [proposed]

Keep Geist [verified] — no new font dependency.

| Role | Guidance |
|------|----------|
| Page title (header `h1`) | `text-base sm:text-lg`, semibold, primary text |
| Section title | `text-sm` uppercase tracking optional **or** `text-base` semibold — pick one pattern and reuse |
| Body | `text-sm` default for dense HR UI |
| Meta / secondary | `text-xs` or `text-sm text-muted-foreground` |
| Stat value | `text-2xl` semibold, not display/hero sizes |
| Brand wordmark | `text-sm` semibold; avoid oversized logo type |

No marketing hero typography on app screens.

## 7. Spacing, radius, depth [proposed]

| Token | Guidance |
|-------|----------|
| Radius | Keep ~`0.625rem` family; cards `rounded-lg` |
| Page padding | Keep `p-4 sm:p-6`; on wide screens use a readable content max width **or** multi-column denser grids — not empty stretch |
| Card padding | `p-4` or `p-5`; section gap `gap-4` / `space-y-6` |
| Subtle depth | Prefer `border` + very light shadow (`shadow-sm`) on elevated surfaces only; no stacked heavy shadows |
| Sidebar | White surface, clear border; active item solid Blue 900 |

Wide-screen unused space: Home should use denser grids / optional max-width
container with aligned columns rather than sparse single-column stretch
**[proposed]**.

## 8. Layout principles [proposed]

1. **One shell identity** — sidebar + header feel branded; content sits on
   cool page background.
2. **Hierarchy** — page title → section titles → primary numbers → supporting
   rows → tertiary links.
3. **Card weight** — primary action cards slightly stronger (border + optional
   left accent or soft header band); secondary cards quieter.
4. **Density** — prefer compact rows with clear separators over large empty
   card interiors.
5. **No fake analytics** — HR Home stats stay meaningful counts already
   provided by `getHrHome`; do not add charts in Phase B.

## 9. Component appearance rules

### Shell [proposed for Phase B]

- Sidebar brand: Blue 900 mark tile; wordmark primary text; “Demo” secondary.
- Active nav: Blue 900 fill + white text (existing pattern, new color).
- Group open state: muted / Blue 50 wash, not competing with leaf active.
- Header: white surface, hairline border; demo chip stays amber warning
  (semantic, not brand blue).
- Company / user controls: outline buttons; tighten truncation.

### Cards / panels [proposed]

- Do **not** require installing shadcn Card for Phase B if home/shell can use
  a tiny shared class pattern or local markup.
- Optional later: add `components/ui/card.tsx` only if reuse across many
  screens justifies it **[needs confirmation]**.

### Buttons / badges [verified + proposed]

- Keep CVA variants; remap primary to Blue 900.
- `StatusBadge` keeps emerald/amber/red/info separation.
- Info tone may shift from sky to Blue 50 / Blue 900 text to align with brand.

### Loading / empty / error [verified + proposed]

- Keep `page-states` API.
- Visually: loading on muted surface; empty dashed border; error uses
  destructive (not blue).
- Skeletons: out of Phase B unless owner asks (component not installed).

## 10. Phase B implementation scope (approval gate)

**In scope after owner approval only:**

1. `app/globals.css` — remap light theme tokens to approved palette + neutrals.
2. `components/shell/app-shell.tsx` — sidebar, header, mobile sheet chrome
   (visual only; no nav architecture change).
3. `app/home/page.tsx` — Employee Home + HR Home hierarchy, card weight,
   denser layout.
4. Minimal shared styling touch only if required for Home
   (e.g. `StatusBadge` info tone, `page-states` surface classes) —
   keep file count small.

**Out of Phase B:**

- People, Attendance, Calendar, Leave, Documents, Forms, Settings redesign
- New dependencies / new shadcn packages
- Charts, dark mode toggle, route changes, domain/service changes
- Backend / other repos

## 11. Contained Phase B plan [proposed]

| Step | Change | Why |
|------|--------|-----|
| B1 | Update `:root` CSS variables to approved blues + neutrals | One source of truth for brand |
| B2 | Tune shell sidebar/header classes (brand tile, active/hover, header chrome, main bg) | Product identity |
| B3 | Employee Home: greeting band, stronger section headers, denser balance/request rows, clearer CTAs | Hierarchy |
| B4 | HR Home: differentiate primary KPI (pending leave) vs secondary stats; denser queues | Hierarchy without fake charts |
| B5 | Verify `npm run lint`, `typecheck`, `test`; manual visual check of `/home` employee + HR | Safety |

Expected files (target ≤4 unless approval expands):

- `app/globals.css`
- `components/shell/app-shell.tsx`
- `app/home/page.tsx`
- Optionally `components/shared/page-states.tsx` (info/success surfaces only)

## 12. Success criteria for Phase B [proposed]

- Page background reads cool gray-blue (`#F7F9FC`), not flat pure white.
- Primary actions / active nav use Blue 900; soft fills use Blue 50.
- Success/warning/error remain non-blue.
- Shell and both Homes feel like one system.
- No gradients, glass, neon, or decorative charts.
- Behavior, routes, roles, company scope unchanged.
- Wide layout uses space for columns/density, not emptiness.

## 13. Open questions [needs confirmation]

1. Store palette as hex in CSS or convert to oklch?
2. Add a shared `Card` primitive in Phase B, or hand-rolled classes only?
3. Content max-width on Home (e.g. `max-w-6xl`) vs full fluid width with denser grid?
4. Remap Badge/Button only via CSS variables, or also edit component class strings?
5. Should “Demo — mock data” chip stay amber forever, or become a neutral demo pattern?

## 14. Classification summary

| Item | Label |
|------|-------|
| Plain white / weak hierarchy / unused width | Owner visual report + code patterns |
| Approved blues + neutrals + non-goals | [from owner] |
| Current tokens, shell, home, UI inventory | [verified in repo] |
| Token mapping + Phase B file list | [proposed] |
| Hex vs oklch, Card primitive, max-width | [needs confirmation] |

---

**Phase B must not start until the owner approves this plan.**
