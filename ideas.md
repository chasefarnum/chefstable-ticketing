# Chef's Table Check-In App — Design Brainstorm

## Context
This is a **staff-facing operational tool** used by event staff at each restaurant location during the festival. It runs on tablets or phones. The primary interaction is: scan an ID → see a match result → check in the guest. Speed, clarity, and error-state legibility are paramount. It should feel premium and on-brand with Chef's Table (culinary, refined, hospitality-forward) without sacrificing operational clarity.

---

<response>
<probability>0.07</probability>
<idea>

**Design Movement:** Brutalist Hospitality — the tension between raw operational utility and fine-dining refinement.

**Core Principles:**
1. Maximum signal-to-noise: every pixel serves the check-in task.
2. High-contrast states: green/red/amber results are unmistakable even in dim restaurant lighting.
3. Monospace data, serif brand — ID data in monospace, Chef's Table branding in a refined serif.
4. Asymmetric grid: roster list on the left, scan/result panel dominating the right.

**Color Philosophy:** Near-black background (#0f0e0d) with warm cream text (#f5f0e8). Status colors are pure and saturated — emerald green, signal red, amber — so they read instantly across a crowded room.

**Layout Paradigm:** Split-panel. Left: scrollable roster list with search. Right: large scan viewport + result card. No tabs, no navigation — everything on one screen.

**Signature Elements:**
1. A thick horizontal rule in warm gold separating the header from the work area.
2. Monospace font for all ID-extracted data (name, DOB, age).
3. Full-bleed status overlays (green/red) that flash on match/fail.

**Interaction Philosophy:** Zero-click confirmation for high-confidence matches. Manual override is always one tap away. Every state is named and colored, never ambiguous.

**Animation:** Status result slides up from the bottom with a spring. Green/red overlay fades in over 200ms. Roster row highlights pulse once on match.

**Typography System:** Display — Playfair Display (serif, brand). Data — JetBrains Mono (monospace). Body — Inter (neutral, readable).

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

**Design Movement:** Clinical Luxury — the aesthetic of a Michelin-starred kitchen: spotless white, precise, no decoration that doesn't serve a function.

**Core Principles:**
1. White-dominant, high-contrast: white cards on a very light warm gray background.
2. Typography does the heavy lifting — no icons, no gradients, just weight and scale.
3. Status is communicated through border color + background tint, not full-bleed overlays.
4. Generous padding — nothing feels cramped.

**Color Philosophy:** Background: warm white (#faf9f7). Cards: pure white. Primary accent: deep forest green (#1a3a2a) for confirmed states. Destructive: terracotta (#c0392b). Neutral: slate gray for secondary text.

**Layout Paradigm:** Stacked single-column on mobile/tablet. The scan area is a large rounded card at the top. Result card appears below it, pushing the roster list down. No sidebars.

**Signature Elements:**
1. A thin green left-border on confirmed attendee rows.
2. The Chef's Table wordmark in a refined serif at the top.
3. Subtle paper texture on the background.

**Interaction Philosophy:** Confirmations require a single deliberate tap. The "override" flow is a bottom sheet, not a separate page.

**Animation:** Cards fade in with a 150ms ease-out. Status border color transitions smoothly. Bottom sheet slides up from the bottom.

**Typography System:** Display — Cormorant Garamond (elegant, culinary). Body — DM Sans (clean, modern). Data — DM Mono.

</idea>
</response>

<response>
<probability>0.08</probability>
<idea>

**Design Movement:** Dark Ops Dashboard — the aesthetic of a high-end nightclub or private members' club: dark, atmospheric, but hyper-functional.

**Core Principles:**
1. Dark background with warm amber/gold accents — feels like candlelight in a dark restaurant.
2. Status cards are large and unmissable.
3. The roster is a sidebar that can be collapsed to maximize the scan area.
4. Every interactive element has a visible active state.

**Color Philosophy:** Background: very dark warm gray (#1c1917). Cards: slightly lighter (#292524). Primary accent: warm amber (#d97706). Success: emerald (#10b981). Danger: rose (#f43f5e). Text: warm off-white (#fafaf9).

**Layout Paradigm:** Sidebar roster (collapsible) + main scan panel. On mobile, roster becomes a bottom drawer.

**Signature Elements:**
1. Amber glow on the active scan border.
2. Large, bold age verification badge (21+ confirmed / DENIED) that dominates the result card.
3. Subtle scanline texture on the camera viewport.

**Interaction Philosophy:** The scan viewport is always the hero. Results are immediate and unmistakable. Manual lookup is a floating action button.

**Animation:** Camera border pulses amber while scanning. Result card drops in from the top with a slight bounce. Denied state shakes horizontally.

**Typography System:** Display — Space Grotesk (geometric, modern). Data — Space Mono. Body — Inter.

</idea>
</response>

---

## Selected Approach

**Dark Ops Dashboard** — chosen for its operational clarity in dim restaurant environments, unmissable status states, and the premium dark aesthetic that aligns with Chef's Table's high-end brand. The amber/gold accent color evokes candlelight and warmth without sacrificing the high-contrast legibility required for fast staff check-ins.
