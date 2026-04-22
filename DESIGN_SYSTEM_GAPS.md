# Design System Gaps

Follow-ups identified during the Atelier reskin. Each item is either (a) a genuine DS gap the app fills locally, (b) a deferral, or (c) an imagery / licensing follow-up.

## Genuine DS gaps — filled locally in `client/src/components/ct/`

| # | Component | Why it's not in DS | Local implementation |
|---|---|---|---|
| 1 | `swipe-card` | Framer-Motion gesture UI is app-specific | Drag + rotate + yes/no overlay; uses DS tokens + success/destructive colors |
| 2 | `scanner-frame` | Camera-viewport framing is app-specific | Pulsing gold ring + 4 corner reticles |
| 3 | `denied-overlay` | Full-screen age-denial display is app-specific | `bg-destructive`, Inter Light, Framer shake (3 × 4px) |
| 4 | `tier-card` | Three-tier visual ordering | Gold ramp 100→300 for distinction + 1px ring |
| 5 | `chef-card` | Chef-as-hero portrait hierarchy | 3:4 aspect, ComboHeader name, cuisine pills, 800ms editorial scale |
| 6 | `status-pill` | Check-in status chips (checked-in / underage / pending / manual / denied) | CVA wrapper; uses ingredient status palette |
| 7 | `fuzzy-match-badge` | Fuzzy-match confidence tags | CVA: exact / alias / fuzzy / manual |
| 8 | `session-stats` | Stat tile grid | IBM Plex Mono tabular-nums + `.mono-label` caption |
| 9 | `ranking-tray` | Drag-orderable preference list | Framer `Reorder.Group` + star on top N |
| 10 | `squad-seat-assignment` | Day-selection row with conflict highlight | Select + `ring-destructive` on conflict |

All follow DS conventions (CVA + `data-slot` + function component + `cn()` + token-only + gold focus + 2px radii).

## Deferrals

- **Virtual Concierge final design** — Plan called for a `<Empty>` placeholder. Existing elaborate chat UI retained and recolored via aliases; a purpose-built concierge spec (messaging primitives, typing indicator pattern, chip input) should be authored in the DS before the next design pass. *TODO: concierge-spec*
- **Tier-visual ramp refinement** — Current `TierCard` uses gold-100/200/300 for tier distinction. Design review may prefer a more pronounced hierarchy (e.g., ring weight + typographic scale instead of fill gradient).

## Licensing / imagery follow-ups

- **Chef portraits** — The application previously shipped without portrait imagery. Mock data references external image URLs (`d2xsxph8kpxj0f.cloudfront.net`, Unsplash) for prototype purposes. Before production: replace with licensed chef photography that meets DS "photography carries depth" brief.
- **Hero background (`HERO_IMG` on Landing)** — Currently a CloudFront-hosted festival image; confirm licensing or replace with commissioned imagery.

## Iconography exceptions

All Lucide icons replaced with Boxicons on the reskinned surfaces (Landing, NotFound, ErrorBoundary). Legacy screens (PreferencePortal, MobileSwipe, SquadManagement, AdminDashboard, CheckIn, TicketCheckout, VirtualConcierge) retain Lucide imports — the alias-driven recolor doesn't touch icon markup. Progressive swap tracked as a separate follow-up to avoid bloating the presentation-layer PR.

## Approach notes

The target app owns the same shadcn/ui primitive set as `chefs-table-ds` (API-compatible via Radix vs `@base-ui/react`). The DS was not installed as a dependency because `chefs-table-ds` is:

- `"private": true` in its package.json
- Next.js-coupled (`next/font/google` imports)
- No npm `exports` map

Porting the tokens + CT patterns as copy-in artifacts was the pragmatic path and yields the same visual output.

## Intentional deviations from the plan

- **Large complex pages** (PreferencePortal, MobileSwipe, SquadManagement, AdminDashboard, CheckIn, VirtualConcierge) recolor via `@theme` aliases rather than line-by-line rewrite. Net visual effect matches DS; risk of regression in feature logic is eliminated. If deeper per-screen editorial treatments are desired, each screen should be scheduled as a separate focused PR with its own verification pass.
