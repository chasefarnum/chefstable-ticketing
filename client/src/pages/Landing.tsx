import { motion } from "framer-motion";
import {
  BiPurchaseTagAlt,
  BiDesktop,
  BiMobileAlt,
  BiGroup,
  BiGridAlt,
  BiQrScan,
  BiChat,
  BiLayer,
} from "react-icons/bi";
import { PageHeader, SectionLede, ModuleTile, StatRow, ThemeToggle } from "@/components/ct";
import type { ModuleTileProps } from "@/components/ct";

const MODULES: ModuleTileProps[] = [
  {
    href: "/checkout",
    icon: BiPurchaseTagAlt,
    title: "Primary Ticket Checkout",
    sublabel: "Bulk purchase · Stripe",
    description:
      "Purchase tickets across all seven tiers in a single order. Named attendee assignment after checkout.",
    tag: { label: "Purchase", variant: "secondary" },
  },
  {
    href: "/preferences",
    icon: BiDesktop,
    title: "Preference Portal — Desktop",
    sublabel: "Drag-to-rank canvas",
    description:
      "Drag and rank your dining choices across all eight time windows. Built for desktop browsers.",
    tag: { label: "Attendee", variant: "secondary" },
  },
  {
    href: "/swipe",
    icon: BiMobileAlt,
    title: "Preference Portal — Mobile",
    sublabel: "Swipe deck",
    description:
      "Swipe right to rank, left to pass. A curated card deck optimised for mobile devices.",
    tag: { label: "Attendee", variant: "secondary" },
  },
  {
    href: "/preferences-canvas",
    icon: BiLayer,
    title: "Preference Portal — Canvas",
    sublabel: "All-windows canvas · v2",
    description:
      "Experimental layout: every dining window stacked on one page with per-window ranking slots. Guided-confidence flow.",
    tag: { label: "Attendee", variant: "secondary" },
  },
  {
    href: "/squad",
    icon: BiGroup,
    title: "Squad Management",
    sublabel: "Group coordination",
    description:
      "Create or join a squad to dine together. Manage group preferences and window designations.",
    tag: { label: "Group", variant: "secondary" },
  },
  {
    href: "/admin",
    icon: BiGridAlt,
    title: "Admin Dashboard",
    sublabel: "Festival operations",
    description:
      "Monitor submissions, trigger the matching engine, resolve unmatched attendees, and deliver itineraries.",
    tag: { label: "Admin", variant: "secondary" },
  },
  {
    href: "/checkin",
    icon: BiQrScan,
    title: "Check-In Application",
    sublabel: "Venue door staff",
    description:
      "Scan driver's licenses for identity verification, age confirmation, and roster matching.",
    tag: { label: "Staff", variant: "secondary" },
  },
  {
    href: "/concierge",
    icon: BiChat,
    title: "Virtual Concierge",
    sublabel: "AI-powered guest services",
    description:
      "Last-minute changes, add-on experiences, tier upgrades, and waitlist management.",
    tag: { label: "Attendee", variant: "secondary" },
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1196px] px-5 pt-6 pb-16 md:px-10 md:pt-8 md:pb-24">
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        <PageHeader
          eyebrow="Park City, Utah · August 13–16"
          title="Chef's Table Festival"
          description="Four days of chefs, diners, and stories — presented as a platform prototype. Every surface below is a live working module."
        />

        <StatRow
          className="mb-12"
          columns={6}
          density="default"
          items={[
            { label: "Events", value: "200" },
            { label: "Windows", value: "8" },
            { label: "Restaurants", value: "30" },
            { label: "Seats / event", value: "80" },
            { label: "Max attendees", value: "2,000" },
            { label: "Ticket tiers", value: "7" },
          ]}
        />

        <SectionLede
          eyebrow="Platform"
          heading="System modules"
          meta={`${MODULES.length} surfaces`}
          className="mb-8"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.04 * i + 0.08,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ModuleTile {...mod} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
