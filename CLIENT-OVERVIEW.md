# Chef's Table Festival — Digital Experience Prototype
### Client Preview · April 2026

---

## Access

**URL:** [chefcheckin.com](https://chefcheckin.com)
**Password:** `hungryfortickets`

This is a working interactive prototype. All data is simulated — no real bookings, payments, or emails are sent. The purpose of this preview is to walk through the attendee and operations experience end-to-end and collect your feedback before we move into production design and development.

---

## What You're Looking At

### 1. Landing Page
The entry point for all attendees. From here, guests navigate to every part of their festival experience — purchasing tickets, submitting dining preferences, managing their squad, and accessing the concierge. This is also where the overall brand tone is established: chef-forward, editorial, and premium.

---

### 2. Ticket Checkout
A streamlined purchase flow covering all four ticket tiers — Standard, Premium, VIP, and Patron. The checkout collects attendee details, dietary restrictions, and accessibility needs. It is designed to meet WCAG 2.1 AA accessibility standards so every guest can complete their purchase independently. After purchase, the attendee receives a confirmation and is directed into the preference portal.

---

### 3. Preference Portal (Desktop)
The primary tool for attendees to rank their chef and dining preferences ahead of the festival. The portal presents each dining window (Thursday through Sunday, lunch and dinner) as a separate selection task. Attendees drag and rank their top choices, and the system surfaces contextual tooltips — chef bios, cuisine style, dietary notes — to help them decide. Promoted and sponsored experiences appear as highlighted cards within the selection tray. Once all windows are ranked, the attendee submits their preferences to the matching engine.

---

### 4. Preference Portal (Mobile — Swipe View)
The same preference-setting experience, rebuilt for mobile. Attendees swipe right to prefer a chef or left to pass, building their ranked list one card at a time. The day-window strip at the top is swipeable left-to-right for quick navigation. After ranking, a review screen lets the attendee reorder before confirming. Featured and sponsored experiences surface between windows as full-screen cards with an RSVP option. Once all six windows are confirmed, the attendee reaches a final submission screen.

---

### 5. Squad Management
Designed for guests who want to coordinate their festival experience as a group. There are two formation paths:

**Path A — Bulk ticket holder:** If you purchased multiple tickets, you assign each ticket to a named attendee, select which days they join the squad, and send them an access link. You can also designate one member as the **Squad Manager**, giving them preference authority over the group and edit rights on attendee information. The Squad Manager role requires a mobile phone number for event-day coordination.

**Path B — Cross-ticket invite:** If your guest purchased their own ticket separately, you invite them by email. The system checks whether they have a booking — if not, it warns you and provides a checkout link. If they do, you select which days to coordinate and send them joining instructions directly from the portal.

In both cases, the system handles day-level membership (not all guests attend all days) and surfaces a conflict resolution step when a new member's existing preferences clash with the squad's selections.

---

### 6. Admin Dashboard
The operations command center. The dashboard gives the Chef's Table team full visibility across five areas:

- **Overview** — live submission progress by dining window, with per-chef and per-venue capacity and demand data. Ops staff can see at a glance which chefs are oversubscribed and where buffer seats remain.
- **Inventory** — ticket tier breakdown, sold counts, and remaining availability.
- **Timeline** — key operational milestones from ticket sale open through post-event wrap.
- **Squads & Overrides** — the white-glove management layer for VIP and sponsor guests. Admins can set a **Guided Preference** (a weighted suggestion in the matching engine) or a **Hard Lock** (a direct assignment that bypasses the lottery entirely) for any squad, on any dining window. Each override is documented with an ops note for the audit trail. A separate section surfaces attendees whose email invitations were blocked by spam filters, allowing the admin to generate and send a one-time SMS invite link instead.
- **Concierge Log** *(planned)* — a real-time feed of concierge requests by type.

---

### 7. Virtual Concierge
A chat-based assistant available to attendees after itineraries are confirmed. The concierge is designed for last-minute changes and questions, with its capabilities expanding as the event approaches across three rule phases:

| Phase | When | What the concierge can do |
|---|---|---|
| Pre-Plan | More than 7 days out | Waitlist, FAQ, ticket upgrade URL |
| Late-Comer | 3–7 days out | + Time-slot changes, add-on RSVPs |
| Last-Ditch | Event week | + Cancellations, waitlist-to-seat conversion, any swap |

The prototype demonstrates five live scenarios: moving a seating time, discovering and RSVPing to an evening add-on, upgrading a ticket tier to join a squad, cancelling a reservation (which automatically notifies the waitlist), and a waitlist holder receiving a real-time seat offer when a cancellation occurs. Attendees can also ask the concierge to **show their full itinerary** — a visual day-by-day timeline with confirmed seatings, free-time windows, and contextual add-on opportunities woven in.

---

## Suggested Testing Path

To get the most out of your review session, we recommend walking through the experience in this order:

1. **Land on the home screen** and explore the module cards to get a feel for the overall navigation and brand tone.
2. **Go through Ticket Checkout** — select a VIP tier and complete the form to see the full purchase flow and confirmation state.
3. **Open the Desktop Preference Portal** — submit preferences for two or three dining windows, including dragging the ranking tray and reading a chef tooltip.
4. **Switch to the Mobile Swipe view** — swipe through a full window, confirm preferences, and interact with the Featured Experience card. Continue through all six windows to reach the submission screen.
5. **Visit Squad Management** — assign a ticket to a guest (Flow 1), then try inviting someone by email using `j.park@gs.com` as the test address (Flow 2) to see the conflict resolution modal.
6. **Open the Admin Dashboard** — click into the Squads & Overrides tab, apply a Hard Lock override to a window, and find the spam-blocked attendee section.
7. **Use the Virtual Concierge** — try the "Show me my itinerary" chip first (use `Sarah Chen` / `sarah.chen@example.com` for identity verification), then switch to Last-Ditch phase and run the cancellation scenario to see the waitlist broadcast in action.

---

## Next Steps

| # | Action | Owner | Target |
|---|---|---|---|
| 1 | Review prototype and provide feedback on flows, priorities, and any missing requirements | **Chef's Table team** | Today |
| 2 | Design and engineering team evaluation — architecture review and effort estimation | **Our team** | Today or tomorrow |
| 3 | Dependency list delivered to Chef's Table team — design assets, program details, content, and data requirements we will need to proceed | **Our team** | Thursday |
| 4 | Updated estimation and refined low-fidelity designs delivered | **Our team** | End of week |

---

*This prototype was built to think through the experience in full before committing to production. Every screen, flow, and interaction is open for discussion. Nothing is precious — if something does not feel right, that is exactly the feedback we need.*
