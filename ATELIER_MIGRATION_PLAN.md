# Atelier Migration — Ticketing-Checkin

Presentation-layer reskin of the Ticketing-Checkin app against the Chef's Table Atelier Design System. Routing, state, data flow, matching logic, Stripe integration, and form validation are untouched.

## Authoritative sources

- `../Atelier Design System/colors_and_type.css` — single-file token + type-class drop-in
- `../Atelier Design System/ui_kits/chefs_table/styles.css` — `ct-*` plain-CSS vocabulary
- `chasefarnum/Git/chefs-table-ds/` — Next.js reference implementation (conventions, component shape)

## Foundation

| Layer | Location | Status |
|---|---|---|
| Atelier tokens | `client/src/styles/atelier-tokens.css` | ✓ copied from Atelier |
| CT utilities | `client/src/styles/ct-utilities.css` | ✓ copied from Atelier |
| Tailwind `@theme` bridge | `client/src/index.css` | ✓ full token + back-compat alias block |
| Checkout light-scope | `[data-surface="checkout"]` in `index.css` | ✓ forces light regardless of `.dark` |
| Google Fonts | `client/index.html` `<link>` preconnect | ✓ Inter / EB Garamond / IBM Plex Mono |
| Boxicons | `client/index.html` `<link>` CDN | ✓ |
| Sonner toasts | `client/src/App.tsx` toast classNames | ✓ semantic tokens on success/error/warning/info |

### Back-compat aliases in `@theme`

Legacy Tailwind palette names are remapped to brand tokens so the existing class vocabulary reskins automatically without wholesale class-churn:

| Legacy class → Alias | Resolves to |
|---|---|
| `text-amber-300/400/500`, `bg-amber-400` | gold-200/300/400 |
| `text-emerald-400/500`, `bg-emerald-500/10` | green-pepper |
| `text-rose-400/500` | tomato-red |
| `text-violet-400/500` | grape-purple |
| `text-blue-400/500` | blue-berry |
| `bg-surface`, `bg-surface-raised` | neutral-800/700 |
| `rounded-2xl/3xl` | 2px (brand-sharp) |
| `font-display` | Inter (legacy Playfair alias) |

This lets complex pages (PreferencePortal ~1065 LOC, MobileSwipe ~1130 LOC, AdminDashboard ~1290 LOC, SquadManagement ~1143 LOC) recolor without invasive rewrites. Targeted DS-component upgrades layered on top where they add brand fidelity.

## CT component library (`client/src/components/ct/`)

### Ported from DS (9)

`combo-header`, `watch-icons`, `global-nav`, `global-footer`, `hero-section`, `section-heading`, `experience-card`, `news-card`, `media-feature`

### Built in-DS-style (10)

`status-pill`, `fuzzy-match-badge`, `session-stats`, `scanner-frame`, `denied-overlay`, `tier-card`, `chef-card`, `swipe-card`, `ranking-tray`, `squad-seat-assignment`

Each follows DS conventions: CVA + `data-slot` + function component + `cn()` + token-only + gold focus ring + 2px radii.

## Per-screen treatment

| Screen | Strategy | DS components used |
|---|---|---|
| Landing | Full DS rewrite | GlobalNav, HeroSection, SectionHeading, SessionStats, GlobalFooter |
| PreferencePortal | Alias-driven recolor; structure preserved | — (alias remapping) |
| MobileSwipe | Alias-driven recolor; structure preserved | — |
| SquadManagement | Alias-driven recolor; structure preserved | — |
| AdminDashboard | Alias-driven recolor; structure preserved | — |
| CheckIn | Alias-driven recolor; structure preserved | — |
| TicketCheckout | `data-surface="checkout"` root + token classes on chrome | — (light scope) |
| VirtualConcierge | Alias-driven recolor; structure preserved | — |
| NotFound | Full DS rewrite | ComboHeader ("Not / Found") |
| ErrorBoundary | Full DS rewrite | — (tokens + Inter Light + mono eyebrow) |
| PasswordGate, ManusDialog | Alias-driven recolor | — |

## Files left untouched

Per plan: `client/src/components/Map.tsx`, `client/src/contexts/`, `client/src/lib/`, `server/`, `shared/`, `patches/`, all 53 shadcn primitives in `client/src/components/ui/` (they read CSS vars and reskin via the token swap).

## Verification checklist

- [ ] `pnpm install && pnpm dev` boots clean
- [ ] Every route renders without runtime error
- [ ] Checkout end-to-end with Stripe test card `4242 4242 4242 4242`
- [ ] Check-in fuzzy match → underage denial → manual override
- [ ] `pnpm run build` passes
- [ ] `pnpm run check` passes (tsc --noEmit)
- [ ] Landing at 375 / 768 / 1280 / 1728 matches `preview/` specimens
- [ ] Boxicons CDN resolves
- [ ] 2px radii globally; 1px ring on cards
- [ ] Gold focus ring (3px / 50% α) on every interactive
- [ ] Keyboard-only pass on `/checkout`; axe DevTools zero critical
- [ ] Contrast 4.5:1 on `/checkout` body copy
