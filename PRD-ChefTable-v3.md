# Chef's Table Festival — Platform Product Requirements Document

**Version:** 3.0
**Date:** April 13, 2026
**Status:** Living Document — Team Review
**Supersedes:** PRD-ChefTable-v2.md

---

## Table of Contents

1. [Product Vision & Brand Philosophy](#1-product-vision--brand-philosophy)
2. [Design System & Creative Direction](#2-design-system--creative-direction)
3. [Product Timeline](#3-product-timeline)
4. [Dining Windows](#4-dining-windows)
5. [Ticketing Tiers](#5-ticketing-tiers)
6. [Module 1 — Primary Ticket Checkout](#6-module-1--primary-ticket-checkout)
7. [Module 2 — Preference Portal (Desktop)](#7-module-2--preference-portal-desktop)
8. [Module 3 — Preference Portal (Mobile)](#8-module-3--preference-portal-mobile)
9. [Module 4 — Squad Management](#9-module-4--squad-management)
10. [Module 5 — Admin Dashboard](#10-module-5--admin-dashboard)
11. [Module 6 — Day-of Check-In](#11-module-6--day-of-check-in)
12. [Matching Engine — Two-Pass Allocation](#12-matching-engine--two-pass-allocation)
13. [Dynamic Venue Capacity](#13-dynamic-venue-capacity)
14. [Data Model](#14-data-model)
15. [Open Questions & Decisions Required](#15-open-questions--decisions-required)
16. [Changelog](#16-changelog)

---

## 1. Product Vision & Brand Philosophy

Chef's Table Festival is a four-day curated dining event held in Park City, Utah from August 13–16, 2026. The platform manages the complete attendee lifecycle: from initial ticket purchase through chef preference collection, algorithmic seat allocation, squad coordination, and day-of check-in.

The platform serves three distinct audiences simultaneously. **Attendees** — from General Admission to Concierge tier — interact with a consumer-grade experience that mirrors the prestige of the event itself. **Operations staff** use a high-contrast, high-speed tool designed for dim restaurant environments and real-time decision-making. **Administrators** have a command-center dashboard for overseeing the matching engine, managing the buffer pool, and applying white-glove overrides for VIP and sponsor guests.

### 1.1 Chef-as-Hero Brand Principle

The single most important creative decision in this platform is the elevation of the **chef as the primary identity unit** across every surface. This is not a venue-booking product. It is a culinary experience product, and the chef's face, name, and story are the reason an attendee chooses one experience over another.

This principle must be applied consistently and without exception across all touchpoints:

**Within the platform:** Chef portrait photography leads every card, every selection unit, and every itinerary entry. Venue names are secondary identifiers. Cuisine pills and accolades support the chef's identity but never compete with it. The chef's name is always the largest typographic element in any selection context.

**Promotional communications:** Social media posts announcing new talent must lead with the chef's portrait and name — not the venue, not the event logo, not the date. The announcement hierarchy is: chef portrait → chef name → cuisine/accolades → event context. This mirrors the visual language of how the world's best culinary publications (e.g., *Chef's Table* on Netflix, *Lucky Peach*, *Bon Appétit*) present culinary talent.

**Talent announcement cadence:** As chefs are confirmed for the lineup, each announcement should be treated as a standalone editorial moment — a single chef, a single image, a single story. Batch announcements dilute the impact. The platform's promotional infrastructure should be designed to support individual chef spotlight moments, not grid reveals.

**Email communications:** Itinerary emails, preference reminders, and confirmation messages should feature the chef's portrait prominently. An attendee who has been matched to Thomas Keller for Friday Dinner should receive an email that opens with Keller's portrait, not a generic event header.

**Aspirational tone:** The voice across all communications is that of a trusted culinary insider — knowledgeable, warm, and never transactional. The platform should feel like receiving a personal invitation from the chef, not a ticket confirmation from a ticketing system.

---

## 2. Design System & Creative Direction

The selected design movement is **Dark Ops Dashboard** — chosen for its operational clarity in dim restaurant environments, unmissable status states, and the premium dark aesthetic that aligns with the Chef's Table brand identity.

### 2.1 Core Design Principles

The design system is governed by four principles that apply to every screen, component, and interaction across the platform:

**1. Dark, atmospheric, hyper-functional.** The background is a very dark warm gray (`#1c1917` / `oklch(0.18 0.010 60)`). Cards sit at a slightly lighter value. The contrast between the background and card surfaces creates depth without requiring decorative gradients. Every interactive element has a visible active state — nothing is ambiguous.

**2. Amber/gold as the primary accent.** The warm amber (`#d97706` / `oklch(0.73 0.15 65)`) evokes candlelight and the warmth of a dining room. It is used for primary CTAs, active states, tier indicators, and the matching engine's VIP pass. It is never used decoratively — every amber element carries semantic weight.

**3. Status colors are pure and saturated.** Emerald green for confirmed/success states, rose red for errors/denied states, and blue for informational/secondary states. These colors must read instantly across a crowded room or a dim restaurant floor. They are never muted or desaturated in operational contexts.

**4. Chef portrait photography is always editorial-quality.** Images are never cropped to thumbnails in primary contexts. The chef's face and expression are the emotional anchor of every selection card. On mobile, the portrait fills the full card height. On desktop, it occupies a minimum of 40% of the card surface.

### 2.2 Typography System

| Role | Font | Usage |
|---|---|---|
| Display / Brand | Space Grotesk (geometric, modern) | Headings, chef names, module titles |
| Data / Operational | Space Mono | IDs, ticket numbers, scan data, capacity figures |
| Body | Inter | Supporting copy, descriptions, labels |

### 2.3 Animation Guidelines

Animations serve operational clarity, not decoration. Status results slide up from the bottom with a spring transition (damping 30, stiffness 300). Green/red status overlays fade in over 200ms. The camera border pulses amber while scanning. Denied states shake horizontally (3 cycles, 4px amplitude). Card entrance animations use a 150ms ease-out fade — never more than 300ms for any operational interaction.

### 2.4 Accessibility

The checkout module (`/checkout`) is designed to WCAG 2.1 AA compliance. This includes a minimum contrast ratio of 4.5:1 for all body text, visible focus rings on all interactive elements, keyboard navigability across all form steps, and screen-reader-compatible labeling for all form fields and error states. The stark black-and-white aesthetic of the checkout was chosen specifically to meet these requirements without visual compromise.

---

## 3. Product Timeline

The platform operates across three distinct phases, each with a hard go-live date that gates the next phase.

| Milestone | Target Date | Description |
|---|---|---|
| **Ticket Sales Go-Live** | Week of May 4, 2026 | Primary checkout opens. Bulk purchase available across all 7 tiers. Named attendee assignment available post-purchase. |
| **Full Programming Announced** | June 1, 2026 | Complete featured chef lineup and event schedule published. Preference portal unlocks for all named attendees. |
| **Preference Collection Window** | June 1 – July 30, 2026 | Attendees rank chefs per dining window (minimum 3 selections). VIP attendees receive curated early-access prompts. |
| **Preference Deadline** | July 30, 2026 | Portal closes. Attendees who have not submitted preferences are flagged for buffer pool assignment. |
| **Matching Engine Run** | Early August 2026 | Two-pass Gale-Shapley allocation. See Section 12 for full logic. |
| **Itineraries Delivered** | August 10, 2026 | Personalized schedules emailed to all matched attendees. Buffer pool manually resolved by operations. |
| **Festival** | August 13–16, 2026 | Chef's Table Festival, Park City, Utah. |

**Pre-programming window (May 4 – June 1):** During this period, tickets are sold but the full chef lineup is not yet published. The platform must support ticket purchase and attendee assignment without exposing preference collection. This window is also the primary opportunity for dynamic venue capacity review (see Section 13).

---

## 4. Dining Windows

The festival schedule is organized into six dining windows. Each window is an independent allocation unit for the matching engine.

| Window ID | Day | Meal Type | Date | Notes |
|---|---|---|---|---|
| `thu-dinner` | Thursday | Dinner | Aug 13 | Opening night |
| `fri-lunch` | Friday | Lunch | Aug 14 | |
| `fri-dinner` | Friday | Dinner | Aug 14 | VIP Afterparty add-on available |
| `sat-lunch` | Saturday | Lunch | Aug 15 | |
| `sat-dinner` | Saturday | Dinner | Aug 15 | |
| `sun-brunch` | Sunday | Brunch | Aug 16 | Closing event |

---

## 5. Ticketing Tiers

All tickets are sold in bulk at the time of purchase. Named attendee assignment is completed post-purchase. Tickets are non-transferable and non-refundable per festival policy.

| Tier Level | Ticket Type | Price | Dining Experiences | Lottery Priority | Guaranteed 1st Choice | Est. Available |
|---|---|---|---|---|---|---|
| CONCIERGE | Be a Chef | $15,000 | All 3 lunches, all 3 dinners, all 3 VIP after-hours, exclusive hands-on chef experience, private kitchen masterclass, dedicated concierge | S — First Access | All 6 windows | No cap |
| VVIP | AMEX Centurion | $7,500 | All 3 lunches, all 3 dinners, all 3 VIP after-hours, AMEX Centurion Lounge, exclusive chef experiences | A — Priority Access | All 6 windows | 100 |
| VVIP | Elite | $7,500 | All 3 lunches, all 3 dinners, all 3 VIP after-hours | A — Priority Access | All 6 windows | 100 |
| VIP | AMEX Platinum | $4,000 | 2 lunches, 2 dinners, 2 VIP after-hours, AMEX Platinum Lounge | B — Early Access | Two windows | 200 |
| VIP | Premier | $4,000 | 2 lunches, 2 dinners, 2 VIP after-hours | B — Early Access | One window | 100 |
| GENERAL | Signature | $2,000 | 1 lunch, 2 dinners, 2 after-hours | C — Standard Lottery | None | 600 |
| LOCAL | Local | $100 | 1 lunch or dinner (lottery allocation) | C — Standard Lottery | None | 150 |

**Multi-tier purchase notice:** When a purchaser buys tickets across more than one tier level in a single order, the platform surfaces a toast notification informing them that attendees may not be seated together, as seating is allocated by tier level.

**Large group notice:** Orders exceeding 16 tickets trigger a notification informing the purchaser that they will have the option to divide tickets into separate dining groups during the attendee assignment phase. This increases the group's odds of securing access to limited-capacity events.

---

## 6. Module 1 — Primary Ticket Checkout

**Route:** `/checkout` | **Audience:** Public — ticket purchasers | **Status:** Prototype complete

### 6.1 Layout & Flow

The checkout uses a **Shopify-style two-column layout**: a left panel containing the three-step purchase flow and a right sticky panel showing the live order summary. The visual design is a stark black-and-white WCAG AA-compliant aesthetic — deliberately distinct from the dark amber system used in attendee-facing modules, signaling a transactional context.

The three steps are:

1. **Ticket Selection** — Tiers are presented in descending price order (most expensive first). Each tier card displays the full inclusions list without expand/collapse — all information is always visible. Quantity controls allow up to the available cap per tier.
2. **Contact & Billing** — Purchaser name, email, and billing address. Named attendee assignment is deferred to post-purchase.
3. **Payment** — Stripe card element. A security badge and lock icon reinforce trust. The submit button is disabled until all required fields are valid.

### 6.2 WCAG AA Compliance Requirements

The checkout is the platform's highest-stakes transactional surface and must meet WCAG 2.1 AA standards:

- All body text must achieve a minimum contrast ratio of 4.5:1 against its background.
- All interactive elements (buttons, inputs, selects) must have visible focus rings that meet a 3:1 contrast ratio against adjacent colors.
- All form fields must have associated `<label>` elements, not placeholder-only labeling.
- Error states must be communicated through both color and text — never color alone.
- The entire checkout flow must be navigable via keyboard without a mouse.
- Screen readers must receive meaningful descriptions for all quantity controls, tier selection states, and payment field labels.

### 6.3 Promoted Offers & Upsell Tooltips

The selection tray (right-side order summary) must surface contextual upgrade prompts when an attendee's current selection is eligible for an upsell. Specific requirements:

- When a GA (Signature) ticket is in the cart, a tooltip or inline callout in the tray should highlight the delta to the next tier (e.g., "Add $2,000 to unlock VIP priority access and guaranteed first-choice seating for two windows").
- When an AMEX Platinum ticket is in the cart, the tray should surface the AMEX Centurion upgrade path if the purchaser has not already selected it.
- Promoted offers must be visually distinct from the order summary content — use a bordered callout with an amber accent, not inline text.
- Tooltips on tier names in the tray must explain the lottery priority level in plain language (e.g., "Priority S — your preferences are processed before all other attendees").
- Promoted offers must never block the primary CTA or obscure the order total.

### 6.4 Stripe Integration

The current prototype uses a test publishable key and a simulated payment confirmation. Production integration requires a backend server to create Stripe PaymentIntents server-side before the client confirms payment. This is a hard dependency for the May 4 go-live and must be scoped separately.

---

## 7. Module 2 — Preference Portal (Desktop)

**Route:** `/preferences` | **Audience:** Named attendees on desktop | **Status:** Prototype complete

### 7.1 Layout

The preference portal uses a **two-panel layout**: a scrollable chef grid on the left and a sticky ranking tray on the right. The window selector at the top allows navigation between the six dining windows. Only windows included in the attendee's ticket tier are active; others are visually dimmed.

### 7.2 Chef-First Information Hierarchy

Each chef card in the grid presents information in the following order:

1. Chef portrait photograph (minimum 40% of card surface)
2. Chef name (largest typographic element)
3. Cuisine category pills
4. Accolades (Michelin stars, World's 50 Best ranking, etc.)
5. Venue name (secondary identifier, smaller type)
6. Expandable menu detail: menu style, signature dishes, description

This hierarchy must be preserved in all future iterations. Venue names must never be promoted above chef names in any selection context.

### 7.3 Ranking Mechanics

Attendees drag-and-drop or click to add chefs to their ranked list. The minimum required selections per window is 3; the maximum is 8. The ranking tray shows the current ordered list with drag handles for reordering.

**VIP priority indicator:** For VIP tier and above, the top two ranked choices per window are marked with a gold star indicator and accompanied by copy explaining that these choices receive priority weighting in the matching algorithm. This is a transparency mechanism, not a guarantee.

**High demand indicator:** Chefs flagged as `highDemand: true` in the data model display a "High Demand" badge on their card when unranked. This badge disappears once the chef is added to the ranking tray, as it is no longer relevant to the attendee's decision.

### 7.4 Selection Tray — Tooltips & Contextual Guidance

The ranking tray must provide contextual guidance at key moments:

- **Empty state:** "Select at least 3 chefs to submit your preferences for this window. Your top 2 choices receive priority weighting."
- **Minimum met (3 selections):** A subtle green indicator confirms the minimum is met. The submit button becomes active.
- **VIP top-2 tooltip:** A persistent `(i)` icon next to the first two ranked slots, with a tooltip explaining: "Your top 2 choices are weighted as priority selections in the matching engine. Choose the experiences you most want to attend."
- **High demand warning in tray:** When a high-demand chef is in position 3 or lower, a soft warning note: "This chef is in high demand — consider ranking them higher to improve your chances."
- **Window completion indicator:** After submitting a window, the window selector tab shows a checkmark. Partially completed windows (selections made but not submitted) show a dot indicator.

### 7.5 Add-On Experiences

Sponsored add-on experiences (e.g., the Friday Night VIP Afterparty presented by Dom Pérignon) are surfaced below the chef grid for the relevant window. Each add-on card displays the sponsor name, event title, subtitle, hero image, capacity, and an RSVP CTA. The RSVP modal collects confirmation independently of the chef preference ranking — it does not affect the attendee's ranked list.

Add-on RSVPs are subject to separate capacity limits and eligibility rules (e.g., the Friday Afterparty is restricted to Tier 1 and Tier 2 guests).

### 7.6 Deadline Countdown

A persistent deadline countdown in the portal header shows the number of days remaining until the July 30 preference deadline. When fewer than 7 days remain, the countdown changes to a red/amber urgency state.

---

## 8. Module 3 — Preference Portal (Mobile)

**Route:** `/swipe` | **Audience:** Named attendees on mobile | **Status:** Prototype complete

### 8.1 Swipe Deck Mechanics

The mobile portal presents chefs as a swipe deck — one card at a time, full-screen portrait format. The attendee swipes right to rank, left to pass. The deck is ordered by the window's curated chef subset. A maximum of 10 chefs are shown per deck by default; a "Show more" option expands the deck.

Swipe physics use Framer Motion drag with a rotation transform tied to the x-axis position. A right-swipe threshold of 80px triggers a rank action; left-swipe triggers a pass. Tapping the card expands the chef detail view (menu highlights, accolades, description) without consuming a swipe action.

### 8.2 VIP Priority Messaging

For VIP tier and above, the first two ranked choices display a gold star and a brief inline message: "Top pick — priority weighted." This mirrors the desktop portal's VIP indicator and ensures consistency across both surfaces.

### 8.3 Review & Reorder

After the deck is exhausted (or the attendee taps "Review"), a full-screen review panel shows the current ranked list with drag handles for reordering. The attendee can remove items, reorder, and confirm the window before proceeding to the next.

### 8.4 Add-On Prompt (Mobile)

After the attendee confirms their rankings for Friday Dinner, the platform presents the VIP Afterparty add-on as a full-screen interstitial — a hero image, sponsor attribution, event description, capacity indicator, and RSVP CTA. The attendee can RSVP or dismiss. This is the mobile equivalent of the desktop add-on card shown below the chef grid.

### 8.5 Window Skip

Attendees may skip a window if their ticket tier does not include it, or if they choose not to attend that day. Skipped windows are tracked and excluded from the matching engine run for that attendee.

---

## 9. Module 4 — Squad Management

**Route:** `/squad` | **Audience:** Named attendees | **Status:** Prototype complete (redesigned April 13, 2026; Squad Manager delegation added April 13, 2026)

### 9.1 Overview

Squads allow groups of attendees to coordinate dining preferences so the matching engine places them together at the same chef's table. The Squad Leader is the attendee who initiates and manages the squad. Squad membership is day-level — a member may join the squad for some days and not others. The squad inherits the priority tier of its lowest-tier member for shared windows.

### 9.2 Flow 1 — Host with Bulk Tickets

This flow applies when a single purchaser has bought multiple tickets and wishes to assign them to other attendees and coordinate their dining as a group.

The Squad Leader sees a **ticket pool** showing all tickets purchased in their order. Each unassigned ticket is a collapsible card. The Leader clicks to assign a name and email address to each ticket, then selects which days that person will join the squad using day-level pills (Thu / Fri / Sat / Sun). Days not included in the assignee's ticket tier are greyed out and non-selectable.

Once assigned, the ticket card shows the member's name, email, tier badge, and selected days. A **"Send access link"** CTA delivers an invitation to the assignee's email. The Leader's own ticket is always pinned at the top of the pool with a Crown indicator and "Accepted" status.

This flow is inspired by the Airbnb shared-trip UX — the emphasis is on the Leader having a clear, manageable view of who is in their party and which days each person is attending.

### 9.3 Flow 2 — Cross-Ticket Invite by Email

This flow applies when the person the Leader wishes to invite purchased their own ticket independently.

The Leader enters the invitee's email address and triggers a roster lookup. Two outcomes are possible:

**Not found:** A red warning banner states that the email address does not appear on the attendee roster and that the person must purchase a ticket before joining the squad. A "Copy ticket purchase link" CTA allows the Leader to share the checkout URL directly.

**Found:** The system surfaces the invitee's name, ticket tier badge, ticket ID, and the days included in their ticket. The Leader selects which days to coordinate as a squad (days not on the invitee's ticket are greyed out). A conflict count badge appears if the selected days include windows where the invitee has already submitted preferences that differ from the squad's current preferences.

The Leader clicks **"Add to squad"** to proceed. If conflicts exist, the conflict resolution modal fires before the member is added.

### 9.4 Day-Level Membership

Squad membership is granular to the day, not the full festival. A member may be in the squad for Friday and Saturday but attend independently on Thursday and Sunday. The matching engine processes squad members as a unit only for the windows where they share squad membership. For non-squad windows, each member's preferences are processed independently.

### 9.5 Conflict-Aware Override Modal

When a member is added to the squad for a day where they have already submitted preferences that differ from the squad's current selections, the platform presents a **Preference Conflict modal** before confirming the addition.

The modal lists each conflicting dining window as a row. Each row shows two side-by-side options: the member's current personal preference (blue, labeled "My Preference") and the squad's current preference for that window (amber, labeled "Squad Preference"). The member must make an explicit choice for every conflicting window before the modal can be confirmed. Unresolved conflicts disable the "Confirm choices" button.

This mechanic applies symmetrically: when the invitee receives and accepts the squad join instructions, they are also presented with the same conflict resolution modal for any windows where their preferences diverge from the squad's.

### 9.6 Squad Manager Delegation

The Squad Leader (ticket purchaser) may delegate the **Squad Manager** role to any assigned attendee in Flow 1. This is designed for situations where the purchaser is not the primary decision-maker for the group's dining experience — for example, a corporate buyer purchasing tickets for clients.

**Delegation requirements:**
- The designated Squad Manager must have a valid mobile phone number on record (country code + number required at time of delegation)
- The phone number is mandatory for operations coordination — the admin team may contact the Squad Manager directly if schedule changes, conflicts, or last-minute adjustments arise during the festival
- Only one Squad Manager may be active per squad at any time
- Re-assigning the role transfers it from the previous holder and clears their phone record
- Removing the role reverts preference authority to the Squad Leader (host)

**Squad Manager permissions:**
- Their dining selections prevail for all coordinated windows (overrides the host's preferences)
- Can update name, email, and day selections for any squad member
- Can adjust which days each member participates in the squad
- Reachable by the operations team via the registered mobile number

**Visual indicators:**
- Squad Manager card displays an amber shield badge labeled "Squad Manager"
- Phone number is displayed on the card for ops reference
- A summary banner below the ticket pool confirms the active Squad Manager and their contact number
- The admin dashboard Squads & Overrides tab surfaces the Squad Manager name and phone for each squad

### 9.7 Join Instructions Email

After a cross-ticket invitee is added to the squad, the Leader can send them join instructions via email. The platform presents an **email preview modal** showing the recipient's name, the days they have been added for, the squad join link, and a note that they will be prompted to resolve any preference conflicts when they accept. The Leader clicks "Send email" to dispatch the instructions.

---

## 10. Module 5 — Admin Dashboard

**Route:** `/admin` | **Audience:** Operations team | **Status:** Prototype complete (Squads & Overrides tab added April 13, 2026)

### 10.1 Tab Structure

The Admin Dashboard is organized into six tabs:

| Tab | Purpose |
|---|---|
| Overview | KPI summary, preference submission progress by venue/chef, quick actions |
| Matching Engine | Two-pass Gale-Shapley engine controls, live run log, post-match results |
| Buffer Pool | Manual resolution of unmatched attendees post-engine run |
| Inventory | Per-venue, per-window capacity management and dynamic capacity flags |
| Squads & Overrides | Squad roster management, admin preference states, VIP/sponsor white-glove overrides |
| Timeline | Project milestone tracker from ticket sales through festival delivery |

### 10.2 Overview Tab — Preference Submission Progress

The preference submission progress section must show **per-venue, per-chef capacity and demand data** — not aggregate window-level percentages. For each dining window, the section displays a breakdown of:

- Each chef/venue available in that window
- Total seat capacity for that chef/venue (default 80, or expanded capacity if flagged)
- Number of attendees who have ranked that chef as their first choice
- Number of attendees who have ranked that chef in any position
- Demand pressure indicator: the ratio of first-choice demand to available seats (e.g., "2.3× oversubscribed" shown in amber/red when demand exceeds capacity)

This data allows the operations team to identify high-pressure venues before the matching engine runs and make informed decisions about dynamic capacity expansion.

### 10.3 Matching Engine Tab

The engine tab provides a visual interface for the two-pass Gale-Shapley allocation run. It includes a pre-run summary (total attendees, windows, squads, dynamic capacity flags), a real-time log with color-coded phases (init: grey, Pass 1 VIP: amber, Pass 2 GA: blue, finalize: green), and a post-run results panel showing match rates by pass and per-window breakdown.

### 10.4 Buffer Pool Tab

After the engine run, unmatched attendees (estimated ~3% of roster) are surfaced here for manual resolution. Each entry shows the attendee's name, tier, reason for non-match, and affected windows. The operations team manually assigns buffer pool attendees to available seats using the 8-seat buffer reserved per restaurant per window.

### 10.5 Inventory Tab

The inventory tab shows all confirmed venues with their default and effective (expanded) capacities, fill rates, and buffer seat counts. Venues approved for dynamic capacity expansion are flagged with a "Dynamic" badge. The tab includes an explanatory note about the pre-programming capacity review window and the recommendation to complete reviews by May 25, 2026.

### 10.6 Squads & Overrides Tab *(In Development)*

This tab is the administrative counterpart to the attendee-facing Squad Management module. It provides the operations team with full visibility into all active squads and the ability to apply two types of admin-level preference interventions.

#### 10.6.1 Squad Roster View

The squad roster view lists all active squads with their Leader, member count, tier composition, days of coordination, and current status (pending / confirmed / conflict). The operations team can expand any squad to see its full member list, each member's day-level participation, and any unresolved preference conflicts.

#### 10.6.2 Admin Preference States

The admin can set one of two preference states for any attendee or squad, overriding the standard matching engine logic:

**Guided Preference** — The admin sets a preferred chef/venue for a specific attendee and window. This preference is injected into the attendee's ranking as their top-ranked choice, effectively guaranteeing it will be satisfied in Pass 1 (for VIP tier) or treated as the highest-priority preference in Pass 2 (for GA tier). The attendee's other submitted preferences remain intact and are used as fallbacks. This state is visually indicated in the roster with a blue "Guided" badge. It is the lighter-touch intervention — the engine still runs, but with a thumb on the scale.

**Hard Lock** — The admin directly assigns an attendee or squad to a specific chef/venue for a specific window, bypassing the matching engine entirely for that window. The assignment is written directly to the itinerary record and is not subject to capacity constraints in the engine run (the operations team assumes responsibility for confirming the seat exists). This state is indicated with a red lock icon and a "Locked" badge. It is the white-glove intervention for sponsors, major donors, press, and other ultra-important attendees who require a guaranteed, hands-free experience.

The distinction between the two states is intentional and important. Guided Preference works with the engine; Hard Lock bypasses it. The operations team should default to Guided Preference wherever possible and reserve Hard Lock for cases where a specific placement has been committed to outside the platform (e.g., a sponsor contract that guarantees a specific chef experience).

#### 10.6.3 VIP/Sponsor Override Workflow

The override workflow is designed for the "red carpet, hands-free experience" use case — ensuring that sponsors, major donors, and ultra-important attendees are placed exactly where they need to be without requiring any action from the attendee themselves.

The workflow is:

1. The admin searches for the attendee by name or email.
2. The admin selects the target window and chef/venue.
3. The admin chooses the intervention type: Guided Preference or Hard Lock.
4. For Hard Lock: the admin confirms that a physical seat has been reserved at the target venue. The system displays a warning if the venue is at or above capacity.
5. The override is saved with a timestamp, the admin's name, and an optional note (e.g., "Platinum sponsor — confirmed by event director").
6. The attendee's itinerary record is updated immediately. If the attendee has already submitted preferences, a conflict flag is raised for the operations team's awareness — the attendee is not notified automatically.
7. The override log is accessible in the squad/attendee detail view for audit purposes.

#### 10.6.4 Spam-Blocked Attendee Management

A dedicated section within the Squads & Overrides tab surfaces attendees whose email invitations were blocked by spam filters, hard-bounced, or soft-bounced after multiple delivery attempts.

**Blocked attendee states:**
| State | Description |
|-------|-------------|
| Hard bounce | Mailbox does not exist — permanent failure |
| Soft bounce | Inbox full or temporarily unavailable — 3 attempts made |
| Spam filter block | Corporate firewall or spam filter rejected delivery |

**Admin SMS invite workflow:**
1. Admin locates the blocked attendee (searchable by name or email)
2. Admin clicks "Send SMS" to open the SMS invite modal
3. Modal displays: attendee name, email, tier, block reason, and a phone number input (country code + number)
4. Admin enters the attendee's mobile number
5. A preview of the SMS message is shown before sending
6. Admin clicks "Send SMS" to dispatch the invite link via SMS
7. The attendee card is updated to "SMS sent" status with the registered phone number displayed
8. Resend is available for previously contacted attendees

**SMS message content:** Attendee's first name, event name, unique join link, preference portal access code, and opt-out instruction.

A pending count badge on the Squads tab nav item indicates the number of blocked attendees who have not yet received an SMS invite.

#### 10.6.5 Override Audit Log

All admin overrides are recorded in an audit log with the following fields: attendee name, window, original preference (if any), override type (Guided / Hard Lock), target chef/venue, timestamp, admin user, and note. The log is read-only and cannot be edited after the fact. It is accessible from the Squads & Overrides tab and can be exported for post-event review.

---

## 11. Module 6 — Day-of Check-In

**Route:** `/checkin` | **Audience:** Festival staff | **Status:** Prototype complete

### 11.1 Design Context

The check-in tool is a **staff-facing operational tool** used on tablets or phones at each restaurant location during the festival. Speed, clarity, and error-state legibility are paramount. The tool runs in the same Dark Ops Dashboard aesthetic as the rest of the platform, with particular emphasis on large, unmissable status indicators that read clearly in dim restaurant lighting.

### 11.2 Layout

The check-in tool uses a **split-panel layout** on tablet: a collapsible roster list on the left and a large scan/result panel on the right. On mobile, the roster becomes a bottom drawer. The venue and dining window are selected at the top of the screen before scanning begins.

### 11.3 ID Scan & Age Verification

The primary check-in flow is ID scan → age verification → roster match → check-in confirmation. The scan input accepts barcode data from a connected scanner or manual keyboard entry. The system parses the scanned data to extract first name, last name, date of birth, and ID number.

Age verification is performed automatically: attendees under 21 are flagged with a full-screen red "DENIED" state and a toast notification. The underage count is tracked in the session statistics.

### 11.4 Fuzzy Name Matching

The roster match uses a fuzzy matching algorithm that handles common name variations: nicknames (e.g., "Liz" → "Elizabeth"), hyphenated surnames, and minor spelling differences. Match confidence is scored from 0 to 1.0. Exact matches (1.0) and alias matches (≥ 0.9) are confirmed automatically. Fuzzy matches (< 0.9) are presented to the staff member for manual confirmation before check-in is recorded.

### 11.5 Manual Override

Staff can switch to manual lookup mode at any time — a floating action button opens a search input that queries the roster by name. Manual overrides are logged with a "manual" match type for post-event audit.

### 11.6 Allergy & Dietary Flags

Attendees with dietary restrictions or allergy flags in their profile trigger a modal alert when checked in. The staff member must acknowledge the alert before the check-in is confirmed. This ensures front-of-house staff are aware of any requirements before the attendee is seated.

### 11.7 Session Statistics

The check-in panel displays live session statistics: total checked in, total on roster, underage denials, and not-found count. These update in real time as check-ins are processed.

---

## 12. Matching Engine — Two-Pass Allocation

The matching engine runs after the July 30 preference deadline. It implements a **two-pass Gale-Shapley deferred acceptance algorithm** that separates VIP and General Admission populations to ensure the most sought-after experiences are awarded to the highest-tier attendees first.

### 12.1 Pass 1 — VIP Priority

Concierge (S), VVIP (A), and VIP (B) tier attendees are processed in the first pass. The algorithm satisfies each VIP attendee's most desired, highest-ranked chef preference per window before any General Admission inventory is consumed. VIP Squads are matched as a unit in this pass to preserve group integrity.

Admin Hard Lock assignments are written directly to itinerary records before Pass 1 runs and are excluded from the engine's allocation logic. Admin Guided Preferences are injected as the attendee's top-ranked choice before Pass 1 runs.

### 12.2 Pass 2 — GA Best-Fit

After Pass 1 completes, remaining inventory is allocated to General Admission (C tier) attendees using the same algorithm. GA Squads are processed as units. The algorithm guarantees that each GA attendee receives at least their most desired available option if capacity allows.

### 12.3 Post-Match

Attendees who cannot be matched in either pass are placed in a buffer pool for manual resolution. Each buffer pool entry records the reason for non-match and the affected windows.

### 12.4 Satisfaction Targets

| Population | Target — 1st Choice | Target — 1st or 2nd Choice |
|---|---|---|
| VIP (Pass 1) | ≥ 97% | ≥ 99% |
| GA (Pass 2) | ≥ 85% | ≥ 92% |
| Overall | — | ≥ 92% |

---

## 13. Dynamic Venue Capacity

The current planning assumption is a default of **80 physical seats per event** (72 allocated + 8 buffer). This is a planning baseline, not a hard constraint.

**Pre-programming review window (May 4 – June 1, 2026):** Before the chef lineup is locked on June 1, the operations team should evaluate each confirmed venue for seating configuration flexibility. Venues with outdoor terraces, reconfigurable dining rooms, or modular layouts may be approved for expanded capacity. A conservative expansion target of 10–20% above the 80-seat baseline (88–96 seats) is feasible for venues with flexible configurations.

**Recommendation:** Complete venue capacity reviews no later than May 25, 2026, to allow time for confirmation before the June 1 programming lock.

---

## 14. Data Model

### 14.1 Core Entities

| Entity | Key Fields |
|---|---|
| **Attendee** | `id`, `name`, `email`, `tier` (CONCIERGE/VVIP/VIP/GENERAL/LOCAL), `ticketId`, `squadId`, `checkedIn`, `checkedInAt`, `dietaryFlags` |
| **Restaurant/Chef** | `id`, `name` (venue), `chef`, `chefTitle`, `cuisine`, `accolades`, `chefPhoto`, `heroPhoto`, `tags`, `menuHighlights`, `menuStyle`, `highDemand` |
| **DiningWindow** | `id`, `label`, `date`, `type` (dinner/lunch/brunch), `sort` |
| **Preference** | `attendeeId`, `windowId`, `rankings` (ordered array of restaurantId), `submittedAt`, `confirmed` |
| **Squad** | `id`, `leaderId`, `name`, `members` (array of `{attendeeId, days[], status}`), `createdAt` |
| **Allocation** | `attendeeId`, `windowId`, `restaurantId`, `matchType` (pass1/pass2/manual/locked), `adminOverride` |
| **AdminOverride** | `attendeeId`, `windowId`, `restaurantId`, `overrideType` (guided/locked), `adminUser`, `note`, `timestamp` |
| **SquadManager** | `squadId`, `attendeeId`, `phone`, `assignedBy`, `assignedAt` |
| **EmailEvent** | `attendeeId`, `type`, `status` (sent/bounced/blocked), `timestamp`, `blockReason` |
| **SmsEvent** | `attendeeId`, `phone`, `status` (sent/delivered/failed), `timestamp`, `adminUser` |
| **CheckInRecord** | `attendeeId`, `locationId`, `windowId`, `matchType` (exact/alias/fuzzy/manual), `confidence`, `timestamp`, `staffId` |

### 14.2 Venue-to-Window Mapping

Each dining window features a curated subset of chefs. The mapping is defined in `WINDOW_CHEFS` in the data layer. A chef may appear in multiple windows but is treated as an independent allocation unit per window.

### 14.3 Ticket Tier to Window Entitlement

| Tier | Entitled Windows |
|---|---|
| CONCIERGE, VVIP | All 6 windows |
| VIP | Any 2 lunches + any 2 dinners (attendee selects) |
| GENERAL (Signature) | 1 lunch + 2 dinners |
| LOCAL | 1 window (lottery) |

---

## 15. Open Questions & Decisions Required

The following items require client confirmation before production development begins.

| # | Question | Impact |
|---|---|---|
| 1 | **GA minimum selection count:** Should GA attendees be required to rank more than 3 chefs per window (e.g., 5) to increase allocation optionality? | Matching engine configuration |
| 2 | **AMEX card verification:** Should AMEX Centurion and AMEX Platinum tiers require card verification at checkout, or is verification deferred to festival check-in? | Checkout flow, Stripe integration |
| 3 | **Dynamic capacity authority:** Who on the operations team has authority to approve venue capacity expansions, and what is the confirmation workflow before the June 1 programming lock? | Admin Dashboard, Inventory tab |
| 4 | **Stripe production integration:** A backend server is required to create Stripe PaymentIntents server-side. Confirm the target payment processing go-live date relative to the May 4 ticket sales launch. | Infrastructure, checkout |
| 5 | **Admin override notification policy:** When an admin applies a Hard Lock or Guided Preference override, should the affected attendee receive any notification? If so, what is the appropriate communication? | Squad Management, Admin Dashboard |
| 6 | **Squad tier inheritance rule:** The current rule is that a squad inherits the priority tier of its lowest-tier member for shared windows. Confirm whether this is the intended policy, or whether the squad should inherit the Leader's tier. | Matching engine, Squad Management |
| 7 | **Cuisine/venue wildcard feature:** Should unbranded cuisine preference options be introduced to capture demand signals for unannounced events? If so, should GA attendees be required to select at least one wildcard option? | Preference Portal, matching engine |
| 8 | **Chef talent announcement cadence:** Confirm the planned announcement schedule for chef confirmations so the platform's promotional infrastructure (social templates, email triggers) can be designed to support individual spotlight moments. | Marketing, brand |

---

## 16. Changelog

| Version | Date | Summary |
|---|---|---|
| 1.0 | April 12, 2026 | Initial PRD — core platform overview, ticketing tiers, matching engine, six modules |
| 2.0 | April 13, 2026 | Added dynamic venue capacity, WCAG checkout requirements, preference portal add-on mechanics, squad management initial spec |
| 3.0 | April 13, 2026 | Full rewrite incorporating design brief, chef-as-hero brand principle, WCAG AA checkout spec, selection tray tooltip requirements, promoted offers, squad management redesign (two flows, day-level membership, conflict modal), admin Squads & Overrides tab spec (Guided Preference vs Hard Lock, VIP override workflow, audit log), preference submission progress overhaul (per-venue/chef capacity and demand), data model formalization, open questions table |
| 3.1 | April 13, 2026 | Added Squad Manager delegation (§9.6) — phone requirement, permission model, visual indicators; added spam-blocked attendee SMS invite workflow (§10.6.4) — block states, admin SMS modal, resend flow; updated data model with SquadManager, EmailEvent, SmsEvent entities |

---

*Living document — updated with each feature iteration. For questions or revisions, contact the project lead.*
