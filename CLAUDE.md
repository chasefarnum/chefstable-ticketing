# Admin Ticketing — Project Context

_Template version: 1.2_

---

## Template Changelog
v1.2 — added handoff/ to folder structure for AI-ready project packages
v1.1 — added research/inspiration/ to folder structure; added design-system-brief.md to template scaffold
v1.0 — initial structure

---

## Project Overview

**Client:** Chef's Table Festival — see projects/chefs-table/CLAUDE.md for client context
**Project type:** Product Design + Build
**Status:** Active
**Started:** 2026-01
**Deadline:** August 2026 (festival date: Aug 13–16, 2026)

---

## The Ask

**What the client requested:**
A digital platform to manage festival ticket sales, attendee preference collection, squad coordination, and day-of operations.

**What they actually need:**
A complete end-to-end attendee experience — from ticket purchase through preference ranking, group coordination, and event-day concierge — plus an admin dashboard for ops staff to manage the matching engine, overrides, and white-glove VIP handling.

**Business goal this should serve:**
Run a frictionless, premium festival experience. Maximize attendee satisfaction with chef/dining assignments while giving ops staff full control.

**Success criteria:**
- Attendees can purchase tickets, set preferences, and manage squads without ops intervention
- The matching engine produces defensible dining assignments
- Ops can apply guided preferences and hard locks for VIPs without data loss
- The concierge handles late changes (cancellations, upgrades, waitlist) without human support

---

## Scope

**Deliverables:**
- Landing page (event entry, navigation hub)
- Ticket checkout (4 tiers: Standard, Premium, VIP, Patron — WCAG 2.1 AA)
- Preference portal — desktop (drag-rank) + mobile (swipe-rank)
- Squad management (bulk ticket + cross-ticket invite, conflict resolution)
- Admin dashboard (overview, inventory, timeline, squads & overrides, concierge log)
- Virtual concierge (3 rule phases: Pre-Plan, Late-Comer, Last-Ditch)

**Out of scope:**
Real payment processing (prototype only)

**Known constraints:**
- Timeline: Prototype delivered April 2026; production TBD
- Budget: TBD
- Tech: Full-stack Vite/TypeScript/React app (client + server)
- Brand: Chef-forward, editorial, premium — dark/cinematic

---

## Stack

- Framework: Vite + TypeScript + React
- Styling: Custom (see components.json)
- Animation: TBD
- CMS: N/A
- Deployment: TBD (prototype at chefcheckin.com, password: hungryfortickets)

---

## Folder Structure

```
admin-ticketing/
├── CLAUDE.md                      ← this file
├── CLIENT-OVERVIEW.md             ← full prototype overview and testing path
├── PRD-ChefTable-v3.md            ← latest PRD
├── DESIGN_SYSTEM_GAPS.md          ← gaps between current design and Chef's Table DS
├── ATELIER_MIGRATION_PLAN.md      ← migration plan doc
├── DS_INGESTION_CANDIDATES.md     ← components to pull into the design system
├── client/                        ← frontend React app
├── server/                        ← backend
├── shared/                        ← shared types/utilities
└── handoff/                       ← dated AI-ready ZIP packages for teammate handoffs
```

---

## Key Decisions

Meaningful creative or strategic decisions made on this project.
For the full log across all projects see: ~/claude/decisions/log.md

-

---

## Open Items

- Production architecture + deployment target TBD
- Real payment integration not yet scoped
- Concierge log tab (marked "planned" in prototype)
- Design system ingestion — see DS_INGESTION_CANDIDATES.md

---

_Last updated: 2026-05-07_
