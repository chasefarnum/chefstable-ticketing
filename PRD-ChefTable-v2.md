# Chef's Table Festival — Platform Product Requirements Document

**Version:** 2.0  
**Date:** April 13, 2026  
**Status:** Working Draft — Client Review

---

## 1. Overview

Chef's Table Festival is a four-day curated dining event held in Park City, Utah from August 13–16, 2026. The platform described in this document manages the complete attendee lifecycle: from initial ticket purchase through chef preference collection, algorithmic seat allocation, and day-of check-in. This PRD reflects the current prototype state and incorporates four new business requirements confirmed on April 13, 2026.

---

## 2. Product Timeline

The platform operates across three distinct phases, each with a hard go-live date that gates the next phase.

| Milestone | Target Date | Description |
|---|---|---|
| **Ticket Sales Go-Live** | Week of May 4, 2026 | Primary checkout opens. Bulk purchase available across all 7 tiers. Named attendee assignment available post-purchase. |
| **Full Programming Announced** | June 1, 2026 | Complete featured chef lineup and event schedule published. Preference portal unlocks for all named attendees. |
| **Preference Collection Window** | June 1 – July 30, 2026 | Attendees rank chefs per dining window (minimum 3 selections). VIP attendees receive curated early-access prompts. |
| **Preference Deadline** | July 30, 2026 | Portal closes. Attendees who have not submitted preferences are flagged for buffer pool assignment. |
| **Matching Engine Run** | Early August 2026 | Two-pass Gale-Shapley allocation. See Section 6 for full logic. |
| **Itineraries Delivered** | August 10, 2026 | Personalized schedules emailed to all matched attendees. Buffer pool manually resolved by operations. |
| **Festival** | August 13–16, 2026 | Chef's Table Festival, Park City, Utah. |

**Pre-programming window (May 4 – June 1):** During this period, tickets are sold but the full chef lineup is not yet published. The platform must support ticket purchase and attendee assignment without exposing preference collection. This window also represents the primary opportunity for dynamic venue capacity review (see Section 7).

---

## 3. Dining Windows

The festival schedule is organized into six dining windows. Each window is an independent allocation unit.

| Window | Day | Meal | Notes |
|---|---|---|---|
| Thu Dinner | Thursday, Aug 13 | Dinner | Opening night |
| Fri Lunch | Friday, Aug 14 | Lunch | |
| Fri Dinner | Friday, Aug 14 | Dinner | VIP Afterparty add-on available |
| Sat Lunch | Saturday, Aug 15 | Lunch | |
| Sat Dinner | Saturday, Aug 15 | Dinner | |
| Sun Brunch | Sunday, Aug 16 | Brunch | Closing event |

---

## 4. Ticketing Tiers

All tickets are sold in bulk at the time of purchase. Named attendee assignment is completed post-purchase via the Attendee Assignment portal. Tickets are non-transferable and non-refundable per festival policy.

| Tier Level | Ticket Type | Price | Dining Experiences | Lottery Priority | Guaranteed 1st Choice | Est. Available |
|---|---|---|---|---|---|---|
| CONCIERGE | Be a Chef | $15,000 | All 3 lunches, all 3 dinners, all 3 VIP after-hours, exclusive hands-on chef experience, private kitchen masterclass | S — First Access | All 6 windows | No cap |
| VVIP | AMEX Centurion | $7,500 | All 3 lunches, all 3 dinners, all 3 VIP after-hours, AMEX Centurion Lounge, exclusive chef experiences | A — Priority Access | All 6 windows | 100 |
| VVIP | Elite | $7,500 | All 3 lunches, all 3 dinners, all 3 VIP after-hours | A — Priority Access | All 6 windows | 100 |
| VIP | AMEX Platinum | $4,000 | 2 lunches, 2 dinners, 2 VIP after-hours, AMEX Platinum Lounge | B — Early Access | Two windows | 200 |
| VIP | Premier | $4,000 | 2 lunches, 2 dinners, 2 VIP after-hours | B — Early Access | One window | 100 |
| GENERAL | Signature | $2,000 | 1 lunch, 2 dinners, 2 after-hours | C — Standard Lottery | None | 600 |
| LOCAL | Local | $100 | 1 lunch or dinner (lottery allocation) | C — Standard Lottery | None | 150 |

**Multi-tier purchase notice:** When a purchaser buys tickets across more than one tier level in a single order, the platform surfaces a toast notification informing them that attendees may not be seated together, as seating is allocated by tier level to ensure a consistent experience for each group.

**Large group notice:** Orders exceeding 16 tickets trigger a notification informing the purchaser that they will have the option to divide tickets into separate dining groups during the attendee assignment phase. This increases the group's odds of securing access to limited-capacity events.

---

## 5. Preference Collection

The preference portal opens on June 1, 2026, concurrent with the full programming announcement. It closes on July 30, 2026.

**Minimum selections:** Each attendee must rank a minimum of **3 chefs per dining window** they are entitled to attend. This minimum applies to all tiers. The platform may be configured to require a higher minimum for General Admission attendees (e.g., 5 selections) to increase optionality in the allocation pass, without changing the VIP minimum.

**Chef-first information hierarchy:** The preference portal presents chefs as the primary selection unit. Each chef card features a portrait photograph, the chef's name as the primary heading, cuisine category pills, and an expandable menu detail view showing venue name, menu style, accolades, and signature dishes.

**Add-on experiences:** Certain dining windows may feature sponsored add-on experiences (e.g., a VIP Afterparty for Friday Dinner). These are surfaced in the ranking tray sidebar on desktop and as a full-screen interstitial on mobile, visually separated from chef selections. Add-on RSVPs are collected independently of the chef preference ranking.

**Cuisine and venue wildcards (deferred):** A future iteration may introduce unbranded cuisine or venue preference options per window to capture demand signals for events not yet announced at the time of preference polling. This feature is deferred from the current release.

---

## 6. Matching Engine — Two-Pass Allocation

The matching engine runs after the July 30 preference deadline. It implements a **two-pass Gale-Shapley deferred acceptance algorithm** that separates VIP and General Admission populations to ensure the most sought-after experiences are awarded to the highest-tier attendees first.

### Pass 1 — VIP Priority

Concierge (S), VVIP (A), and VIP (B) tier attendees are processed in the first pass. The algorithm satisfies each VIP attendee's **most desired, highest-ranked chef preference** per window before any General Admission inventory is consumed. VIP Squads (groups) are matched as a unit in this pass to preserve group integrity.

The target outcome for Pass 1 is that every VIP attendee receives their first-choice chef for every window they are entitled to attend, subject only to hard capacity constraints.

### Pass 2 — GA Best-Fit

After Pass 1 completes, the remaining inventory per window is allocated to General Admission (C tier) attendees using the same Gale-Shapley algorithm. The algorithm **guarantees that each GA attendee receives at least their most desired premier option** if capacity allows. Subsequent windows apply best-fit logic across remaining preferences. GA Squads are processed as units in this pass.

### Post-match

Attendees who cannot be matched in either pass (estimated at approximately 3% of the total roster) are placed in a buffer pool for manual resolution by the operations team. Each buffer pool entry records the reason for non-match (no preferences submitted, all choices oversubscribed, squad conflict, late submission) and the windows affected.

### Satisfaction targets

| Population | Target — 1st Choice | Target — 1st or 2nd Choice |
|---|---|---|
| VIP (Pass 1) | ≥ 97% | ≥ 99% |
| GA (Pass 2) | ≥ 85% | ≥ 92% |
| Overall | — | ≥ 92% |

---

## 7. Dynamic Venue Capacity

The current planning assumption is a default of **80 physical seats per event** (72 allocated + 8 buffer). This assumption is treated as a planning baseline, not a hard constraint.

**Pre-programming review window (May 4 – June 1, 2026):** Before the chef lineup is locked on June 1, the operations team should evaluate each confirmed venue for seating configuration flexibility. Venues with outdoor terraces, reconfigurable dining rooms, or modular layouts may be approved for expanded capacity. Expanding a venue's allocation increases both the VIP and GA seat pools and directly improves overall match quality and first-choice satisfaction rates.

**Operational implications:** Any venue approved for dynamic capacity expansion must be flagged in the inventory management system before the matching engine runs. The engine reads the effective capacity (expanded or default) per venue at runtime. Expanded venues are visually distinguished in the Admin Dashboard inventory view.

**Recommendation:** The operations team should conduct venue capacity reviews no later than May 25, 2026, to allow time for confirmation before the June 1 programming lock. A conservative expansion target of 10–20% above the 80-seat baseline (i.e., 88–96 seats) is feasible for venues with flexible configurations without compromising the curated dining experience.

---

## 8. Platform Modules

The platform prototype comprises six modules, each accessible from the landing page.

| Module | Route | Audience | Status |
|---|---|---|---|
| Primary Ticket Checkout | `/checkout` | Public — ticket purchasers | Prototype complete |
| Preference Portal — Desktop | `/preferences` | Attendees (desktop) | Prototype complete |
| Preference Portal — Mobile | `/swipe` | Attendees (mobile) | Prototype complete |
| Admin Dashboard | `/admin` | Operations team | Prototype complete |
| Squad Management | `/squads` | Attendees | Prototype complete |
| Day-of Check-In | `/checkin` | Festival staff | Prototype complete |

---

## 9. Open Questions

The following items require client confirmation before development of production-ready features begins.

1. **GA minimum selection count:** Should GA attendees be required to rank more than 3 chefs per window (e.g., 5) to increase allocation optionality? This can be configured independently of the VIP minimum.
2. **Cuisine/venue wildcard feature:** Should unbranded cuisine preference options be introduced in a future iteration of the preference portal to capture demand signals for unannounced events? If so, should GA attendees be required to select at least one wildcard option?
3. **AMEX card verification:** Should the AMEX Centurion and AMEX Platinum tiers require card verification at checkout, or is verification deferred to festival check-in?
4. **Dynamic capacity authority:** Who on the operations team has authority to approve venue capacity expansions, and what is the confirmation workflow before the June 1 programming lock?
5. **Stripe production integration:** The current checkout prototype uses a simulated payment flow. A backend server is required to create Stripe PaymentIntents server-side. Confirm the target payment processing go-live date relative to the May 4 ticket sales launch.

---

*Document prepared by the platform prototype team. For questions or revisions, contact the project lead.*
