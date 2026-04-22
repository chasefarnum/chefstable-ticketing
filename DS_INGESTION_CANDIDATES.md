# DS Ingestion Candidates

Components authored in this app that should be promoted back into the Chef's Table Atelier Design System (`chefs-table-ds`). Each wraps real DS primitives (Card / Badge / Button / Input / Select / Label) — no parallel primitives, no new tokens.

All new components live at `client/src/components/ct/` and follow DS conventions: token-only styling, `data-slot` attributes, `cn()`, no raw hex, Inter for UI / mono for metadata, 2px corners, gold 3px focus ring.

---

## New components authored for the splash page

### 0. `<Icon>` — `client/src/components/ct/icon.tsx`

Thin wrapper around the full Boxicons library (via `react-icons/bi`) that enforces the two canonical DS icon sizes.

**Usage:**
```tsx
import { BiQrScan, BiRightArrowAlt } from "react-icons/bi";
import { Icon } from "@/components/ct";

<Icon as={BiQrScan} size="md" className="text-foreground" />  // 20px
<Icon as={BiRightArrowAlt} size="sm" />                        // 16px
```

**Props:**
- `as: IconType` — any Boxicon component from `react-icons/bi` (full Boxicons set, not limited to the curated tools/icons page)
- `size?: "sm" | "md"` — **only two allowed**: `sm` = 16px (`size-4`), `md` = 20px (`size-5`). Default `md`.
- All standard SVG props via `className`, `color` (inherits currentColor, so set via `text-*` on the parent)

**Why it's ingestion-worthy:** the live DS `/tools/icons` page shows the library and the two sanctioned sizes but the DS codebase itself still imports raw `BiX` components and manually applies `size-4`/`size-5` classes each time. This wrapper lifts the two-size rule into a lint-able API — you literally can't pick an off-scale size. Candidate to replace raw `react-icons/bi` usage throughout the DS.

**Note on library choice:** `react-icons/bi` is the React-component packaging of Boxicons. Same icon set, same SVG output, just consumable as `<BiQrScan />` instead of `<i class="bx bx-qr-scan">`. The DS repo uses this pattern; the Ticketing-Checkin app now matches.

---

### 1. `<PageHeader>` — `client/src/components/ct/page-header.tsx`

Editorial top-of-page lockup. Used at the top of any route for its display title.

**Composition:** eyebrow span (sans, mono-sized, tracking-widest) + h1 (Inter Light, tracking-tight, scaling `text-3xl sm:text-4xl md:text-5xl`) + optional description (sans `text-sm md:text-base text-muted-foreground`) + optional right-aligned `meta` slot (mono uppercase).

**Props:**
- `eyebrow?: ReactNode`
- `title: string` (required)
- `description?: ReactNode`
- `meta?: ReactNode` — small right-aligned metadata (counts, location, status)
- `size?: "default" | "sm"` — controls h1 scale and bottom margin

**Why it's ingestion-worthy:** the live DS already has `components/ds/page-header.tsx`, but that version is coupled to the docs-site layout (fixed `mb-[72px]`, monolithic prop shape, no meta slot). This version is a proper reusable primitive with variants and a metadata slot for product surfaces.

**Used on:** `/` Landing.

---

### 2. `<SectionLede>` — `client/src/components/ct/section-lede.tsx`

Section-level heading lockup placed above grids, lists, and feature blocks. Extends the existing `SectionHeading` idiom with a right-aligned metadata slot.

**Composition:** eyebrow (sans caps) + h2 (Inter Light `text-2xl sm:text-3xl tracking-tight`) + optional description (sans `text-sm`) + optional `meta` right slot (mono caps — "7 surfaces", "12 confirmed").

**Props:**
- `eyebrow?: ReactNode`
- `heading: ReactNode` (required)
- `description?: ReactNode`
- `meta?: ReactNode`
- `align?: "left" | "center"`

**Why it's ingestion-worthy:** the current DS `SectionHeading` uses `font-serif` for its description, but per brand direction Inter and mono are the primary families and EB Garamond is rare. `SectionLede` is the product-surface variant: Inter everywhere, plus the metadata slot for data-dense contexts. Candidate to *replace* `SectionHeading` in the DS, or ship alongside as the product-surface sibling.

**Used on:** `/` Landing (above module grid and stat row).

---

### 3. `<ModuleTile>` — `client/src/components/ct/module-tile.tsx`

Navigation tile for system/module directory pages. Wraps the real DS `<Card>` / `<Badge>` / `<Button>` primitives — no custom layout, no custom pill shapes.

**Composition (all from real DS primitives):**
- `<Card>` — `ring-1 ring-foreground/10`, `rounded-xl` → 2px, no shadow
- `<CardHeader>` — Boxicons glyph (`text-3xl text-foreground`, white — not gold), `<CardTitle>` (Inter semibold caps), `<CardDescription>` containing a mono-uppercase sublabel, `<CardAction>` holding the tag `<Badge>`
- `<CardContent>` — sans `text-sm text-muted-foreground` description
- `<CardFooter>` — full-width `<Button variant="outline" size="sm">` with Boxicons right-arrow, rendered via `asChild` + wouter `Link`

**Props:**
- `icon: string` (Boxicons class, e.g. `"bx-qr-scan"`)
- `title: string`
- `sublabel?: string` (mono caps)
- `description?: string`
- `tag?: { label: string; variant?: BadgeVariant }` — renders as a real `<Badge>` in `<CardAction>`
- `href: string` (wouter)
- `ctaLabel?: string` — defaults to "Open module"

**Why it's ingestion-worthy:** module/surface directory pages are a common pattern across Chef's Table product surfaces (internal tools, attendee hubs, staff portals). Today the DS has no tile primitive — every team rebuilds it ad-hoc. This locks the layout to DS primitives so brand fidelity is automatic.

**Used on:** `/` Landing (7 tiles).

---

### 4. `<StatRow>` — `client/src/components/ct/stat-row.tsx`

Horizontal row of stat tiles with mono numerals and mono caps labels. Used as section dividers or end-of-page summaries.

**Composition:** CSS-grid of tiles with a 1px hairline divider technique (`gap-px bg-border ring-1 ring-foreground/10`) — the one place in the DS vocabulary where that trick is appropriate, because the stat row is presented as a unified metric band, not independent cards. Each tile: mono caps label + IBM Plex Mono Light tabular-nums value.

**Props:**
- `items: { label: string; value: string | number; tone?: "default" | "success" | "warning" | "destructive" | "info" }[]`
- `columns?: 2 | 3 | 4 | 5 | 6`
- `density?: "default" | "compact"` — default = 2xl numerals at py-4, compact = xl at py-3

**Why it's ingestion-worthy:** a near-universal pattern across product dashboards (admin KPIs, check-in progress, festival scale). This formalizes it as a DS primitive with tone variants bound to semantic tokens. Supersedes the `SessionStats` component I authored earlier (which had a heavier 3xl value; `StatRow` is the compact-to-default-density version with more flexibility).

**Used on:** `/` Landing, `/admin` KPI row (already), `/checkin` door-stats row (already).

---

## DS primitives that were upgraded in-target to match DS source

These aren't new components — the target already had stock shadcn copies. I replaced them with the DS-spec versions so every downstream consumer (all 53 shadcn primitives + product surfaces) reskins automatically. **No ingestion needed** — these are just bringing target's primitive files into line with the DS source at `chefs-table-ds/src/components/ui/`.

| Primitive | What changed |
|---|---|
| `<Card>` | Added `ring-1 ring-foreground/10` (was `border`), `gap-4 py-4` (was `gap-6 py-6`), `px-4` slot padding (was `px-6`), `size=sm` variant, `bg-muted/50` footer, image radii |
| `<Button>` | Full CVA rewrite: `font-semibold uppercase tracking-widest` always, `h-10` default (was `h-9`), added `xs`/`xl` sizes, `active:translate-y-px` press, `destructive/10` tinted variant |
| `<Badge>` | Fixed `h-5`, `rounded-4xl` full-pill, `font-mono text-xs font-medium uppercase tracking-wider`, added `ghost`/`link` variants, tinted `destructive/10` pattern |
| `<Input>` | `h-10 rounded-lg` (was `h-9 rounded-md`), `ring-3` focus (was `ring-[3px]`), correct `border-input` palette |
| `<SelectTrigger>` | `data-[size=default]:h-10` (was `h-9`), `rounded-lg`, `pl-2.5 pr-2`, size-5 icons |
| `<SelectContent>` | `ring-1 ring-foreground/10` (was `border`), `rounded-lg` |
| `<SelectItem>` | `rounded-md py-1 pl-1.5 pr-8 gap-1.5` (was `rounded-sm py-1.5 pl-2 pr-8 gap-2`) |

---

## Custom pills refactored to wrap real `<Badge>`

Previously these were reinventing the pill shape. Now they pass a `variant` through to the real DS `<Badge>` and compose tone classes as className overrides only.

- `<StatusPill>` — status states: checked-in / underage / pending / manual / denied / warning / neutral
- `<FuzzyMatchBadge>` — confidence levels: exact / alias / fuzzy / manual

---

## Components still on the follow-up list

Used locally on product surfaces; should be audited against the DS for possible ingestion:

- `<ScannerFrame>` — camera viewport framing (not in DS; app-specific)
- `<DeniedOverlay>` — full-screen denial state (not in DS; app-specific, Framer shake)
- `<SwipeCard>` — Framer drag card (not in DS; app-specific)
- `<TierCard>` — ticket tier card (Chef's Table-specific ramp; might be ingested as a CT component alongside `ChefCard`)
- `<ChefCard>` — portrait-led chef card (might belong in DS as a CT content pattern)
- `<RankingTray>` — drag-orderable list (Framer-specific, app-local)
- `<SquadSeatAssignment>` — day-selection row (app-specific; wraps DS `<Select>`)

---

## Typographic rules reinforced in this pass

- **Inter** for all UI, headlines, body copy
- **IBM Plex Mono** for metadata, stat values, eyebrow labels above hero headlines, tags
- **EB Garamond** reserved for rare editorial moments only (not used on the Landing page)
- **Icons** are Boxicons (`<i className="bx bx-...">`) in `text-foreground` (white on dark), not gold. Gold is reserved for the focus ring and deliberate accent moments — not decorative icon color.
