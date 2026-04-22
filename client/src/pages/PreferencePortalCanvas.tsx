// Preference Canvas — v2 layout.
// All six windows stacked vertically; each band owns its own chef pool +
// ranking slots. Top sticky strip shows deadline, per-window progress dots,
// and the global submit affordance. State / handlers are identical to the
// existing PreferencePortal so both routes can coexist without divergence.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BiArrowBack,
  BiCheck,
  BiSend,
  BiMobileAlt,
} from "react-icons/bi";
import { toast } from "sonner";
import {
  TIME_WINDOWS,
  RESTAURANTS,
  ADD_ON_EXPERIENCES,
  WINDOW_CHEFS,
  REQUIRED_RANKINGS,
  MAX_RANKINGS,
  type Restaurant,
  type AddOnExperience,
} from "@/lib/mockData";
import {
  Icon,
  ThemeToggle,
  PageHeader,
  CanvasProgressStrip,
  PreferenceWindowBand,
  type CanvasWindowItem,
  type CanvasWindowState,
} from "@/components/ct";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const IS_VIP = true;
const DEADLINE = new Date("2026-07-30T23:59:59");

interface RankedChoice {
  restaurantId: string;
  rank: number;
}

function getDaysUntilDeadline() {
  const now = new Date();
  const diff = DEADLINE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ── Add-on RSVP dialog (identical to v1) ───────────────────────────────────
function RSVPDialog({
  addOn,
  open,
  onConfirm,
  onClose,
}: {
  addOn: AddOnExperience | null;
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!addOn) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <div className="relative h-44 overflow-hidden">
          <img
            src={addOn.photo}
            alt={addOn.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge variant="default">{addOn.badge}</Badge>
          </div>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <DialogHeader className="gap-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
              {addOn.sponsor}
            </p>
            <DialogTitle className="font-sans text-lg font-semibold uppercase tracking-wider">
              {addOn.title}
            </DialogTitle>
            <DialogDescription>{addOn.subtitle}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {addOn.description}
          </p>
          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Maybe later
            </Button>
            <Button className="flex-1" onClick={onConfirm}>
              {addOn.rsvpLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Compact add-on card rendered inside a window band ──────────────────────
function BandAddOnCard({
  addOn,
  rsvpd,
  onSelect,
}: {
  addOn: AddOnExperience;
  rsvpd: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border">
        <img
          src={addOn.photo}
          alt={addOn.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{addOn.badge}</Badge>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sponsored · {addOn.sponsor}
          </span>
        </div>
        <p className="font-sans text-sm font-semibold uppercase tracking-wider truncate">
          {addOn.title}
        </p>
        <p className="text-[11px] text-muted-foreground line-clamp-1">
          {addOn.description}
        </p>
      </div>
      <Button
        variant={rsvpd ? "outline" : "default"}
        size="sm"
        onClick={onSelect}
        disabled={rsvpd}
      >
        {rsvpd ? "RSVP'd" : addOn.requiresRSVP ? "RSVP now" : "Add to plan"}
      </Button>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function PreferencePortalCanvas() {
  const [rankings, setRankings] = useState<Record<string, RankedChoice[]>>({});
  const [confirmedWindowsList, setConfirmedWindowsList] = useState<string[]>(
    [],
  );
  const [expandedCards, setExpandedCards] = useState<Record<string, string | null>>({});
  const [openWindowIds, setOpenWindowIds] = useState<string[]>([
    TIME_WINDOWS[0].id,
  ]);
  const [activeWindow, setActiveWindow] = useState(TIME_WINDOWS[0].id);
  const [submitted, setSubmitted] = useState(false);
  const [rsvpModal, setRsvpModal] = useState<AddOnExperience | null>(null);
  const [rsvpdAddOns, setRsvpdAddOns] = useState<string[]>([]);

  const bandRefs = useRef<Record<string, HTMLElement | null>>({});
  const daysLeft = useMemo(() => getDaysUntilDeadline(), []);

  // Scroll-spy: observe which band is in view to keep the progress strip's
  // active dot in sync with the user's scroll position.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).dataset.windowId;
          if (id) setActiveWindow(id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    Object.values(bandRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const windowRanking = (windowId: string): RankedChoice[] =>
    rankings[windowId] || [];

  const windowHasMinimum = (windowId: string) =>
    windowRanking(windowId).length >= REQUIRED_RANKINGS;

  const windowConfirmed = (windowId: string) =>
    confirmedWindowsList.includes(windowId);

  const allConfirmed = TIME_WINDOWS.every((w) => windowConfirmed(w.id));

  const addToRanking = (windowId: string, restaurantId: string) => {
    const current = windowRanking(windowId);
    if (current.some((r) => r.restaurantId === restaurantId)) return;
    if (current.length >= MAX_RANKINGS) return;
    setRankings((prev) => ({
      ...prev,
      [windowId]: [
        ...current,
        { restaurantId, rank: current.length + 1 },
      ],
    }));
  };

  const removeFromRanking = (windowId: string, restaurantId: string) => {
    setRankings((prev) => {
      const filtered = (prev[windowId] || []).filter(
        (r) => r.restaurantId !== restaurantId,
      );
      return {
        ...prev,
        [windowId]: filtered.map((r, i) => ({ ...r, rank: i + 1 })),
      };
    });
  };

  const moveInRanking = (
    windowId: string,
    fromRank: number,
    toRank: number,
  ) => {
    setRankings((prev) => {
      const arr = [...(prev[windowId] || [])];
      const fromIdx = arr.findIndex((r) => r.rank === fromRank);
      const toIdx = arr.findIndex((r) => r.rank === toRank);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return {
        ...prev,
        [windowId]: arr.map((r, i) => ({ ...r, rank: i + 1 })),
      };
    });
  };

  const confirmWindow = (windowId: string) => {
    const windowLabel =
      TIME_WINDOWS.find((w) => w.id === windowId)?.label ?? windowId;
    setConfirmedWindowsList((prev) =>
      prev.includes(windowId) ? prev : [...prev, windowId],
    );
    toast.success(`${windowLabel} confirmed`, {
      description: "Your ranked preferences for this window have been saved.",
      duration: 3000,
    });
  };

  const editWindow = (windowId: string) => {
    setConfirmedWindowsList((prev) => prev.filter((id) => id !== windowId));
    setOpenWindowIds((prev) =>
      prev.includes(windowId) ? prev : [...prev, windowId],
    );
    requestAnimationFrame(() => {
      bandRefs.current[windowId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const jumpTo = (windowId: string) => {
    setOpenWindowIds((prev) =>
      prev.includes(windowId) ? prev : [...prev, windowId],
    );
    requestAnimationFrame(() => {
      bandRefs.current[windowId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleAddOnSelect = (addOn: AddOnExperience) => {
    if (addOn.requiresRSVP) {
      setRsvpModal(addOn);
    } else {
      setRsvpdAddOns((prev) => [...prev, addOn.id]);
      toast.success(`${addOn.title} added to your plan.`);
    }
  };

  const handleRSVPConfirm = () => {
    if (!rsvpModal) return;
    setRsvpdAddOns((prev) => [...prev, rsvpModal.id]);
    toast.success(`RSVP confirmed for ${rsvpModal.title}`, {
      description: "You'll receive a confirmation email before the event.",
      duration: 4000,
    });
    setRsvpModal(null);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast.success(
      "Preferences submitted. Your itinerary will be delivered within 48 hours.",
    );
  };

  const stripWindows: CanvasWindowItem[] = TIME_WINDOWS.map((w) => {
    let state: CanvasWindowState = "empty";
    if (windowConfirmed(w.id)) state = "confirmed";
    else if (windowHasMinimum(w.id)) state = "min-met";
    else if (windowRanking(w.id).length > 0) state = "in-progress";
    return { id: w.id, label: w.label, state };
  });

  // ── Submitted state ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center flex flex-col items-center gap-4"
        >
          <div className="h-16 w-16 rounded-full bg-success/15 border border-success/40 flex items-center justify-center">
            <Icon as={BiCheck} size="md" className="text-success" />
          </div>
          <h2 className="font-sans text-2xl font-light uppercase tracking-tight sm:text-3xl">
            Preferences submitted
          </h2>
          <p className="text-sm text-muted-foreground">
            Your ranked choices have been received. The matching engine runs on
            July 30. Your personalized itinerary arrives within 48 hours.
          </p>
          <Button asChild className="mt-2">
            <Link href="/">Back to home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <CanvasProgressStrip
        windows={stripWindows}
        activeId={activeWindow}
        onJumpTo={jumpTo}
        deadlineLabel={
          <>
            Preferences close in{" "}
            <span className="font-semibold">{daysLeft} days</span> · July 30
          </>
        }
        urgency={daysLeft < 7}
        rightSlot={
          <>
            <ThemeToggle />
            <Button
              size="sm"
              disabled={!allConfirmed}
              onClick={handleSubmit}
            >
              <Icon as={BiSend} size="sm" />
              Review &amp; submit
            </Button>
          </>
        }
      />

      <div className="w-full px-6 md:px-10 xl:px-14 pt-4 pb-24 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" asChild aria-label="Back">
              <Link href="/">
                <Icon as={BiArrowBack} size="sm" />
              </Link>
            </Button>
            <PageHeader
              eyebrow={`Sarah Chen · Tier 1 VIP · ${TIME_WINDOWS.length} windows`}
              title="Rank your chefs"
              size="sm"
              className="mb-0"
              meta={
                <span>
                  {confirmedWindowsList.length} / {TIME_WINDOWS.length} confirmed
                </span>
              }
            />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/swipe">
              <Icon as={BiMobileAlt} size="sm" />
              Mobile view
            </Link>
          </Button>
        </div>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Drag a chef from each window's pool into the slots on the right. Your
          top two per window receive VIP priority weighting in the matching
          engine. Click any day to expand and start ranking.
        </p>

        <Accordion
          type="multiple"
          value={openWindowIds}
          onValueChange={setOpenWindowIds}
          className="rounded-lg ring-1 ring-foreground/10 overflow-hidden [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-border"
        >
          {TIME_WINDOWS.map((window) => {
            const windowChefIds =
              WINDOW_CHEFS[window.id] || RESTAURANTS.map((r) => r.id);
            const pool = windowChefIds
              .map((id) => RESTAURANTS.find((r) => r.id === id))
              .filter((r): r is Restaurant => !!r);
            const ranked = windowRanking(window.id);
            const windowAddOn = ADD_ON_EXPERIENCES.find(
              (a) => a.windowId === window.id,
            );

            return (
              <div
                key={window.id}
                ref={(el) => {
                  bandRefs.current[window.id] = el;
                }}
                data-window-id={window.id}
              >
                <PreferenceWindowBand
                  value={window.id}
                  id={`band-${window.id}`}
                  windowLabel={window.label}
                  windowDate={window.date}
                  pool={pool}
                  ranked={ranked}
                  required={REQUIRED_RANKINGS}
                  max={MAX_RANKINGS}
                  isVip={IS_VIP}
                  confirmed={windowConfirmed(window.id)}
                  expandedCardId={expandedCards[window.id] ?? null}
                  onToggleExpand={(restaurantId) =>
                    setExpandedCards((prev) => ({
                      ...prev,
                      [window.id]:
                        prev[window.id] === restaurantId ? null : restaurantId,
                    }))
                  }
                  onAdd={(restaurantId) =>
                    addToRanking(window.id, restaurantId)
                  }
                  onRemove={(restaurantId) =>
                    removeFromRanking(window.id, restaurantId)
                  }
                  onReorder={(from, to) =>
                    moveInRanking(window.id, from, to)
                  }
                  onConfirm={() => confirmWindow(window.id)}
                  onEdit={() => editWindow(window.id)}
                  afterPool={
                    windowAddOn ? (
                      <BandAddOnCard
                        addOn={windowAddOn}
                        rsvpd={rsvpdAddOns.includes(windowAddOn.id)}
                        onSelect={() => handleAddOnSelect(windowAddOn)}
                      />
                    ) : undefined
                  }
                />
              </div>
            );
          })}
        </Accordion>

        <div className="flex justify-end">
          <Button
            size="lg"
            disabled={!allConfirmed}
            onClick={handleSubmit}
          >
            <Icon as={BiSend} size="sm" />
            Review &amp; submit all
          </Button>
        </div>
      </div>

      <RSVPDialog
        addOn={rsvpModal}
        open={!!rsvpModal}
        onConfirm={handleRSVPConfirm}
        onClose={() => setRsvpModal(null)}
      />
    </div>
  );
}
