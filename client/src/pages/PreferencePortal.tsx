// Preference Portal — dark/light-aware, semantic tokens only, DS primitives.
// Two-panel layout: chef grid (left) + ranking tray (right).
// State, handlers, and matching logic unchanged from prior version.
import { useState, useRef, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  BiArrowBack,
  BiCheck,
  BiCheckCircle,
  BiX,
  BiSolidStar,
  BiMobileAlt,
  BiSend,
  BiRefresh,
  BiMenu,
  BiGroup,
  BiCalendar,
  BiBoltCircle,
  BiPlus,
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
  DeadlineBanner,
  WindowTabs,
  ChefFlipCard,
  type WindowTabItem,
} from "@/components/ct";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const IS_VIP = true;
const DEADLINE = new Date("2026-07-30T23:59:59");

interface RankedChoice {
  restaurantId: string;
  rank: number;
}

type TrayMode = "rank" | "review";

function getDaysUntilDeadline() {
  const now = new Date();
  const diff = DEADLINE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ── Add-On Experience Card ────────────────────────────────────────────────────
function AddOnCard({
  addOn,
  rsvpd,
  onSelect,
}: {
  addOn: AddOnExperience;
  rsvpd: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-1.5">
        <Icon as={BiBoltCircle} size="sm" className="text-accent" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Sponsored · {addOn.sponsor}
        </span>
      </div>

      <div className="flex gap-3 p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border">
          <img src={addOn.photo} alt={addOn.title} className="h-full w-full object-cover" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline">{addOn.badge}</Badge>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground truncate">
              {addOn.capacity}
            </span>
          </div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider leading-tight truncate">
            {addOn.title}
          </h4>
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            {addOn.description}
          </p>
        </div>
      </div>

      <div className="p-3 pt-0">
        {rsvpd ? (
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-success/30 bg-success/10 py-2 font-mono text-[10px] uppercase tracking-wider text-success">
            <Icon as={BiCheckCircle} size="sm" />
            RSVP confirmed
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={onSelect}>
            {addOn.requiresRSVP ? "RSVP now" : "Add to plan"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── RSVP Dialog ───────────────────────────────────────────────────────────────
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
          <img src={addOn.photo} alt={addOn.title} className="h-full w-full object-cover" />
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

          <p className="text-sm text-foreground/90 leading-relaxed">{addOn.description}</p>

          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Icon as={BiGroup} size="sm" className="text-accent" />
              {addOn.capacity}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon as={BiCalendar} size="sm" className="text-accent" />
              {addOn.subtitle}
            </span>
          </div>

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

// ── Main Component ────────────────────────────────────────────────────────────
export default function PreferencePortal() {
  const [activeWindow, setActiveWindow] = useState(TIME_WINDOWS[0].id);
  const [rankings, setRankings] = useState<Record<string, RankedChoice[]>>({});
  const [confirmedWindowsList, setConfirmedWindowsList] = useState<string[]>([]);
  const [trayMode, setTrayMode] = useState<TrayMode>("rank");
  const [showItinerary, setShowItinerary] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [pulsingTab, setPulsingTab] = useState<string | null>(null);
  const [rsvpModal, setRsvpModal] = useState<AddOnExperience | null>(null);
  const [rsvpdAddOns, setRsvpdAddOns] = useState<string[]>([]);
  const [hasReordered, setHasReordered] = useState(false);

  const dragItem = useRef<string | null>(null);
  const dragFromTray = useRef<boolean>(false);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  const daysLeft = useMemo(() => getDaysUntilDeadline(), []);
  const currentRanking = rankings[activeWindow] || [];

  const isRanked = (restaurantId: string) =>
    currentRanking.some((r) => r.restaurantId === restaurantId);

  const getRank = (restaurantId: string) =>
    currentRanking.find((r) => r.restaurantId === restaurantId)?.rank;

  const addToRanking = (restaurantId: string) => {
    if (isRanked(restaurantId) || currentRanking.length >= MAX_RANKINGS) return;
    setRankings((prev) => ({
      ...prev,
      [activeWindow]: [
        ...(prev[activeWindow] || []),
        { restaurantId, rank: (prev[activeWindow] || []).length + 1 },
      ],
    }));
  };

  const removeFromRanking = (restaurantId: string) => {
    setRankings((prev) => {
      const filtered = (prev[activeWindow] || []).filter(
        (r) => r.restaurantId !== restaurantId,
      );
      return {
        ...prev,
        [activeWindow]: filtered.map((r, i) => ({ ...r, rank: i + 1 })),
      };
    });
  };

  const moveInTray = (fromRank: number, toRank: number) => {
    setHasReordered(true);
    setRankings((prev) => {
      const arr = [...(prev[activeWindow] || [])];
      const fromIdx = arr.findIndex((r) => r.rank === fromRank);
      const toIdx = arr.findIndex((r) => r.rank === toRank);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return {
        ...prev,
        [activeWindow]: arr.map((r, i) => ({ ...r, rank: i + 1 })),
      };
    });
  };

  const windowHasMinimum = (windowId: string) =>
    (rankings[windowId] || []).length >= REQUIRED_RANKINGS;

  const windowConfirmed = (windowId: string) =>
    confirmedWindowsList.includes(windowId);

  const allConfirmed = TIME_WINDOWS.every((w) => windowConfirmed(w.id));

  const confirmWindow = () => {
    const windowLabel =
      TIME_WINDOWS.find((w) => w.id === activeWindow)?.label ?? activeWindow;

    setConfirmedWindowsList((prev) => {
      if (prev.includes(activeWindow)) return prev;
      const updated = [...prev, activeWindow];
      const next = TIME_WINDOWS.find(
        (w) => !updated.includes(w.id) && w.id !== activeWindow,
      );
      if (next) {
        setTimeout(() => {
          setActiveWindow(next.id);
          setPulsingTab(next.id);
          setTimeout(() => setPulsingTab(null), 1200);
        }, 0);
      }
      return updated;
    });

    toast.success(`${windowLabel} confirmed`, {
      description: "Your ranked preferences for this window have been saved.",
      duration: 3000,
    });

    setTrayMode("rank");
  };

  const handleReviewClick = () => {
    if (!windowHasMinimum(activeWindow)) {
      toast.error("Add at least 3 chefs before reviewing.");
      return;
    }
    setTrayMode("review");
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast.success(
      "Preferences submitted. Your itinerary will be delivered within 48 hours.",
    );
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

  const currentAddOns = ADD_ON_EXPERIENCES.filter((a) => a.windowId === activeWindow);

  const tabItems: WindowTabItem[] = TIME_WINDOWS.map((w) => ({
    id: w.id,
    label: w.label,
    date: w.date,
    confirmed: windowConfirmed(w.id),
    hasContent: (rankings[w.id] || []).length > 0,
  }));

  // ── Submitted state ─────────────────────────────────────────────────────────
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

  // ── Itinerary Summary state ─────────────────────────────────────────────────
  if (showItinerary) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowItinerary(false)}
              aria-label="Back"
            >
              <Icon as={BiArrowBack} size="sm" />
            </Button>
            <div>
              <h1 className="font-sans text-base font-semibold uppercase tracking-wider">
                Review your preferences
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Sarah Chen · Tier 1 VIP — all {TIME_WINDOWS.length} windows
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={handleSubmit}>
              <Icon as={BiSend} size="sm" />
              Submit preferences
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mx-auto w-full max-w-5xl p-8">
          <div className="mb-6 flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Summary
            </span>
            <h2 className="font-sans text-2xl font-light tracking-tight sm:text-3xl">
              Your ranked choices
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              These are ranked preferences — not confirmed bookings. The matching
              engine allocates seats by availability and tier priority. Top two
              per window are marked VIP Priority.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {TIME_WINDOWS.map((window) => {
              const windowRankings = (rankings[window.id] || []).sort(
                (a, b) => a.rank - b.rank,
              );
              return (
                <motion.div
                  key={window.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      <span className="font-sans text-sm font-semibold uppercase tracking-wider">
                        {window.label}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {window.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {windowRankings.length} preferences
                      </span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setShowItinerary(false);
                          setActiveWindow(window.id);
                          setTrayMode("rank");
                        }}
                      >
                        <Icon as={BiRefresh} size="sm" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {windowRankings.map((choice) => {
                      const restaurant = RESTAURANTS.find(
                        (r) => r.id === choice.restaurantId,
                      );
                      if (!restaurant) return null;
                      const isVipPriority = IS_VIP && choice.rank <= 2;
                      return (
                        <div
                          key={choice.restaurantId}
                          className="flex items-center gap-4 px-5 py-3"
                        >
                          <div
                            className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                              isVipPriority
                                ? "bg-accent/20 border border-accent/50"
                                : "bg-muted border border-border"
                            }`}
                          >
                            {isVipPriority ? (
                              <Icon
                                as={BiSolidStar}
                                size="sm"
                                className="text-accent"
                              />
                            ) : (
                              <span className="font-mono text-xs font-semibold text-muted-foreground">
                                {choice.rank}
                              </span>
                            )}
                          </div>
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border">
                            <img
                              src={restaurant.chefPhoto}
                              alt={restaurant.chef}
                              className="h-full w-full object-cover object-top"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  restaurant.heroPhoto;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-sm font-semibold uppercase tracking-wider truncate">
                              {restaurant.chef}
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                              {restaurant.cuisine} · {restaurant.name}
                            </p>
                          </div>
                          {isVipPriority && (
                            <Badge variant="default">VIP priority</Badge>
                          )}
                        </div>
                      );
                    })}
                    {windowRankings.length === 0 && (
                      <div className="px-5 py-4 text-sm italic text-muted-foreground">
                        No preferences ranked for this window.
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {rsvpdAddOns.length > 0 && (
            <div className="mt-8 flex flex-col gap-3">
              <h3 className="font-sans text-lg font-semibold uppercase tracking-wider">
                Add-on experiences
              </h3>
              {rsvpdAddOns.map((id) => {
                const addOn = ADD_ON_EXPERIENCES.find((a) => a.id === id);
                if (!addOn) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                  >
                    <Icon
                      as={BiCheckCircle}
                      size="md"
                      className="text-success shrink-0"
                    />
                    <div>
                      <p className="font-sans text-sm font-semibold uppercase tracking-wider">
                        {addOn.title}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {addOn.subtitle} · {addOn.sponsor}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main portal ─────────────────────────────────────────────────────────────
  const confirmedCount = confirmedWindowsList.length;

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <DeadlineBanner
        label={
          <>
            Preferences close in{" "}
            <span className="text-accent font-semibold">{daysLeft} days</span>{" "}
            · July 30, 2026
          </>
        }
        status={
          <>
            <div className="flex items-center gap-1.5">
              {TIME_WINDOWS.map((w) => (
                <span
                  key={w.id}
                  className={`h-2 w-2 rounded-full ${
                    windowConfirmed(w.id)
                      ? "bg-success"
                      : w.id === activeWindow
                      ? "bg-accent"
                      : "bg-border"
                  }`}
                  title={w.label}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {confirmedCount} of {TIME_WINDOWS.length} confirmed
            </span>
          </>
        }
      />

      <div className="flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild aria-label="Back">
            <Link href="/">
              <Icon as={BiArrowBack} size="sm" />
            </Link>
          </Button>
          <div>
            <h1 className="font-sans text-base font-semibold uppercase tracking-wider">
              Preference Portal
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Sarah Chen · Tier 1 VIP
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link href="/swipe">
              <Icon as={BiMobileAlt} size="sm" />
              Mobile view
            </Link>
          </Button>
          <Button
            variant={allConfirmed ? "default" : "outline"}
            size="sm"
            disabled={!allConfirmed}
            onClick={() => allConfirmed && setShowItinerary(true)}
          >
            <Icon as={BiCheckCircle} size="sm" />
            {confirmedCount} / {TIME_WINDOWS.length} confirmed
          </Button>
        </div>
      </div>

      <WindowTabs
        items={tabItems}
        activeId={activeWindow}
        pulsingId={pulsingTab}
        onChange={(id) => {
          setActiveWindow(id);
          setTrayMode("rank");
          gridScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="sticky top-[73px] z-10"
      />

      {/* Main split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chef grid */}
        <div ref={gridScrollRef} className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {(WINDOW_CHEFS[activeWindow] || RESTAURANTS.map((r) => r.id)).length}{" "}
                chefs available
              </span>
              <h2 className="font-sans text-2xl font-light tracking-tight sm:text-3xl">
                {TIME_WINDOWS.find((w) => w.id === activeWindow)?.label}
              </h2>
            </div>
            {IS_VIP && (
              <Badge variant="outline">
                <Icon as={BiSolidStar} size="sm" className="text-accent" />
                Top 2 are VIP priority
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {(WINDOW_CHEFS[activeWindow] || RESTAURANTS.map((r) => r.id))
              .map((id) => RESTAURANTS.find((r) => r.id === id))
              .filter((r): r is Restaurant => !!r)
              .map((restaurant) => (
                <ChefFlipCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  rank={getRank(restaurant.id)}
                  isRanked={isRanked(restaurant.id)}
                  isVip={IS_VIP}
                  onAdd={() => addToRanking(restaurant.id)}
                  onRemove={() => removeFromRanking(restaurant.id)}
                  expanded={expandedCard === restaurant.id}
                  onToggleExpand={() =>
                    setExpandedCard(
                      expandedCard === restaurant.id ? null : restaurant.id,
                    )
                  }
                />
              ))}
          </div>
        </div>

        {/* Ranking tray */}
        <aside className="w-80 shrink-0 flex flex-col overflow-hidden border-l border-border bg-card/50">
          <header className="border-b border-border p-4 flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <h3 className="font-sans text-sm font-semibold uppercase tracking-wider">
                Ranking tray
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {currentRanking.length} / {MAX_RANKINGS}
              </span>
            </div>
            <Progress value={(currentRanking.length / MAX_RANKINGS) * 100} className="h-1" />
            {currentRanking.length < REQUIRED_RANKINGS && (
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {REQUIRED_RANKINGS - currentRanking.length} more needed to confirm
              </p>
            )}
            {currentRanking.length >= REQUIRED_RANKINGS &&
              !hasReordered &&
              currentRanking.length < MAX_RANKINGS && (
                <p className="font-mono text-[10px] uppercase tracking-wider text-success">
                  Minimum met · drag to reorder priority
                </p>
              )}
            {currentRanking.length >= REQUIRED_RANKINGS &&
              hasReordered &&
              MAX_RANKINGS - currentRanking.length > 0 && (
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Add up to {MAX_RANKINGS - currentRanking.length} more
                </p>
              )}
          </header>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            <AnimatePresence>
              {trayMode === "rank" && currentRanking.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border px-3 text-center"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Add cards from the grid or drag them here
                  </p>
                </motion.div>
              )}

              {[...currentRanking]
                .sort((a, b) => a.rank - b.rank)
                .map((choice) => {
                  const restaurant = RESTAURANTS.find(
                    (r) => r.id === choice.restaurantId,
                  );
                  if (!restaurant) return null;
                  const isVipPriority = IS_VIP && choice.rank <= 2;
                  return (
                    <motion.div
                      key={choice.restaurantId}
                      layout
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      draggable
                      onDragStart={() => {
                        dragItem.current = choice.restaurantId;
                        dragFromTray.current = true;
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverIndex(choice.rank);
                      }}
                      onDrop={() => {
                        if (dragItem.current && dragFromTray.current) {
                          const fromRank = currentRanking.find(
                            (r) => r.restaurantId === dragItem.current,
                          )?.rank;
                          if (fromRank !== undefined)
                            moveInTray(fromRank, choice.rank);
                        }
                        setDragOverIndex(null);
                        dragItem.current = null;
                        dragFromTray.current = false;
                      }}
                      className={`flex items-center gap-2 rounded-lg border bg-card p-2 cursor-grab active:cursor-grabbing transition-colors ${
                        dragOverIndex === choice.rank
                          ? "border-accent bg-accent/10"
                          : isVipPriority
                          ? "border-accent/30"
                          : "border-border"
                      }`}
                    >
                      <Icon
                        as={BiMenu}
                        size="sm"
                        className="text-muted-foreground shrink-0"
                      />
                      <div
                        className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center ${
                          isVipPriority
                            ? "bg-accent/20 border border-accent/40"
                            : "bg-muted border border-border"
                        }`}
                      >
                        {isVipPriority ? (
                          <Icon as={BiSolidStar} size="sm" className="text-accent" />
                        ) : (
                          <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                            {choice.rank}
                          </span>
                        )}
                      </div>
                      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border">
                        <img
                          src={restaurant.chefPhoto}
                          alt={restaurant.chef}
                          className="h-full w-full object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = restaurant.heroPhoto;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">
                          {restaurant.chef}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                          {restaurant.cuisine}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeFromRanking(choice.restaurantId)}
                        aria-label={`Remove ${restaurant.chef}`}
                      >
                        <Icon as={BiX} size="sm" />
                      </Button>
                    </motion.div>
                  );
                })}
            </AnimatePresence>

            {currentAddOns.length > 0 && (
              <div className="mt-2 pt-3 border-t border-border flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon as={BiBoltCircle} size="sm" className="text-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Sponsored experience
                  </span>
                </div>
                {currentAddOns.map((addOn) => (
                  <AddOnCard
                    key={addOn.id}
                    addOn={addOn}
                    rsvpd={rsvpdAddOns.includes(addOn.id)}
                    onSelect={() => handleAddOnSelect(addOn)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tray footer */}
          <footer className="shrink-0 border-t border-border p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Windows confirmed</span>
              <span className="text-foreground">
                {confirmedCount} / {TIME_WINDOWS.length}
              </span>
            </div>

            {windowConfirmed(activeWindow) ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-success/30 bg-success/10 py-2.5 font-mono text-xs uppercase tracking-wider text-success">
                <Icon as={BiCheckCircle} size="sm" />
                Window confirmed
              </div>
            ) : trayMode === "rank" ? (
              <Button
                className="w-full"
                disabled={!windowHasMinimum(activeWindow)}
                onClick={handleReviewClick}
              >
                <Icon as={BiCheck} size="sm" />
                Review & confirm window
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={confirmWindow}>
                  Confirm & continue
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setTrayMode("rank")}
                >
                  Keep editing this window
                </Button>
              </div>
            )}

            {allConfirmed && (
              <Button
                variant="default"
                className="w-full bg-success text-success-foreground hover:bg-success/90"
                onClick={() => setShowItinerary(true)}
              >
                <Icon as={BiSend} size="sm" />
                Review & submit all
              </Button>
            )}
          </footer>
        </aside>
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
