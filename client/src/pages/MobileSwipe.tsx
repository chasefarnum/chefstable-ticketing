// Design: Full-screen portrait cards, dark background, swipe physics
// Chef-first hierarchy: chef portrait → name → cuisine pills → expandable menu detail
// Windows: Thu Dinner | Fri Lunch+Dinner | Sat Lunch+Dinner | Sun Brunch
// Add-ons: Sponsored RSVP card shown after deck exhausted for Fri Dinner
import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, RotateCcw, ThumbsUp, ThumbsDown, ChevronUp, ChevronRight,
  Monitor, Star, GripVertical, CheckCircle2, X, Send, Sparkles,
  Users, Calendar, Award, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { TIME_WINDOWS, RESTAURANTS, ADD_ON_EXPERIENCES, WINDOW_CHEFS, REQUIRED_RANKINGS, MAX_RANKINGS, type AddOnExperience } from "@/lib/mockData";

const DECK_SIZE = 10;
const IS_VIP = true;

interface RankedItem {
  restaurantId: string;
  rank: number;
  chef: string;
  chefPhoto: string;
  heroPhoto: string;
  cuisine: string;
  name: string;
}

// ── RSVP Modal ─────────────────────────────────────────────────────────────────
function RSVPModal({
  addOn,
  onConfirm,
  onClose,
}: {
  addOn: AddOnExperience;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-md bg-card border-t border-border rounded-t-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-44 overflow-hidden">
          <img src={addOn.photo} alt={addOn.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-amber-400 text-background text-[10px] font-bold tracking-wide">
            {addOn.badge}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/60 backdrop-blur flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-1">{addOn.sponsor}</p>
          <h3 className="font-display text-lg font-bold text-foreground mb-1">{addOn.title}</h3>
          <p className="text-xs text-muted-foreground mb-3">{addOn.subtitle}</p>

          <p className="text-sm text-foreground/80 leading-relaxed mb-4">{addOn.description}</p>

          <div className="flex items-center gap-4 mb-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400/70" />
              <span>{addOn.capacity}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
              <span>{addOn.subtitle}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-sm text-muted-foreground"
            >
              Maybe Later
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-amber-400 text-background text-sm font-semibold hover:bg-amber-300 transition-colors"
            >
              {addOn.rsvpLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MobileSwipe() {
  const [activeWindow, setActiveWindow] = useState(TIME_WINDOWS[0].id);
  const [deckIndex, setDeckIndex] = useState(0);
  const [rankings, setRankings] = useState<Record<string, RankedItem[]>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAction, setLastAction] = useState<"yes" | "no" | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);
  // Review screen state
  const [reviewWindow, setReviewWindow] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  // Add-on RSVP
  const [rsvpModal, setRsvpModal] = useState<AddOnExperience | null>(null);
  const [rsvpdAddOns, setRsvpdAddOns] = useState<string[]>([]);
  const [showAddOnPrompt, setShowAddOnPrompt] = useState(false);
  const [skippedWindows, setSkippedWindows] = useState<string[]>([]);

  const dragReviewItem = useRef<string | null>(null);
  const dragOverReviewItem = useRef<string | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const yesOpacity = useTransform(x, [30, 120], [0, 1]);
  const noOpacity = useTransform(x, [-120, -30], [1, 0]);
  const cardScale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const windowChefIds = WINDOW_CHEFS[activeWindow] || RESTAURANTS.slice(0, DECK_SIZE).map(r => r.id);
  const windowRestaurants = windowChefIds.map(id => RESTAURANTS.find(r => r.id === id)).filter(Boolean) as typeof RESTAURANTS;
  const currentDeck = showMore ? windowRestaurants : windowRestaurants.slice(0, Math.min(DECK_SIZE, windowRestaurants.length));
  const currentCard = currentDeck[deckIndex];
  const currentRanking = rankings[activeWindow] || [];

  const windowComplete = (windowId: string) => (rankings[windowId] || []).length >= REQUIRED_RANKINGS;
  const windowDone = (windowId: string) => windowComplete(windowId) || skippedWindows.includes(windowId);
  const allComplete = TIME_WINDOWS.every((w) => windowDone(w.id));

  const skipWindow = (windowId: string) => {
    const updatedSkipped = [...skippedWindows.filter(id => id !== windowId), windowId];
    setSkippedWindows(updatedSkipped);
    toast(`Window skipped`, { description: `You can return to ${TIME_WINDOWS.find(w => w.id === windowId)?.label ?? windowId} anytime before the deadline.`, duration: 3000 });
    // Check if all windows are now done after skipping
    const allDoneNow = TIME_WINDOWS.every((w) => (rankings[w.id] || []).length >= REQUIRED_RANKINGS || updatedSkipped.includes(w.id));
    if (allDoneNow) {
      setTimeout(() => setSubmitted(true), 400);
      return;
    }
    const nextIncomplete = TIME_WINDOWS.find((w) => !windowDone(w.id) && w.id !== windowId && !updatedSkipped.includes(w.id));
    if (nextIncomplete) {
      setActiveWindow(nextIncomplete.id);
      setDeckIndex(0);
      setShowMore(false);
    }
  };

  // Add-ons for current window
  const currentAddOns = ADD_ON_EXPERIENCES.filter((a) => a.windowId === activeWindow);
  void currentAddOns;

  const swipeRight = () => {
    if (!currentCard || currentRanking.length >= MAX_RANKINGS) return;
    const newRanking: RankedItem[] = [
      ...(rankings[activeWindow] || []),
      {
        restaurantId: currentCard.id,
        rank: (rankings[activeWindow] || []).length + 1,
        chef: currentCard.chef,
        chefPhoto: currentCard.chefPhoto,
        heroPhoto: currentCard.heroPhoto,
        cuisine: currentCard.cuisine,
        name: currentCard.name,
      },
    ];
    setRankings((prev) => ({ ...prev, [activeWindow]: newRanking }));
    setLastAction("yes");
    setDeckIndex((i) => i + 1);
    x.set(0);
    setExpandedInfo(false);
    const newCount = newRanking.length;
    if (newCount >= REQUIRED_RANKINGS && newCount === REQUIRED_RANKINGS) {
      setTimeout(() => setReviewWindow(activeWindow), 400);
    } else {
      toast.success(`${currentCard.chef} added as preference #${newCount}`, { duration: 1200 });
    }
  };

  const swipeLeft = () => {
    if (!currentCard) return;
    setLastAction("no");
    setDeckIndex((i) => i + 1);
    x.set(0);
    setExpandedInfo(false);
  };

  const undoLast = () => {
    if (deckIndex === 0) return;
    setDeckIndex((i) => i - 1);
    if (lastAction === "yes") {
      setRankings((prev) => {
        const arr = [...(prev[activeWindow] || [])];
        arr.pop();
        return { ...prev, [activeWindow]: arr.map((r, i) => ({ ...r, rank: i + 1 })) };
      });
    }
    setLastAction(null);
    setExpandedInfo(false);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) swipeRight();
    else if (info.offset.x < -100) swipeLeft();
    else x.set(0);
  };

  // Review screen drag helpers
  const handleReviewDragStart = (restaurantId: string) => {
    dragReviewItem.current = restaurantId;
  };
  const handleReviewDragEnter = (restaurantId: string) => {
    dragOverReviewItem.current = restaurantId;
  };
  const handleReviewDrop = (windowId: string) => {
    if (!dragReviewItem.current || !dragOverReviewItem.current) return;
    if (dragReviewItem.current === dragOverReviewItem.current) return;
    setRankings((prev) => {
      const arr = [...(prev[windowId] || [])];
      const fromIdx = arr.findIndex((r) => r.restaurantId === dragReviewItem.current);
      const toIdx = arr.findIndex((r) => r.restaurantId === dragOverReviewItem.current);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return { ...prev, [windowId]: arr.map((r, i) => ({ ...r, rank: i + 1 })) };
    });
    dragReviewItem.current = null;
    dragOverReviewItem.current = null;
  };

  const confirmReview = (windowId: string) => {
    setReviewWindow(null);
    const windowLabel = TIME_WINDOWS.find((w) => w.id === windowId)?.label ?? "";
    toast.success(`${windowLabel} confirmed ✓`, { duration: 2500 });

    // Check if this window has add-ons to prompt
    const addOns = ADD_ON_EXPERIENCES.filter((a) => a.windowId === windowId);
    if (addOns.length > 0 && !rsvpdAddOns.includes(addOns[0].id)) {
      setTimeout(() => setShowAddOnPrompt(true), 600);
      return;
    }

    // After confirming, check if ALL windows are now done
    const allDoneNow = TIME_WINDOWS.every((w) => windowDone(w.id) || w.id === windowId);
    if (allDoneNow) {
      setTimeout(() => setSubmitted(true), 400);
      return;
    }

    const nextIncomplete = TIME_WINDOWS.find((w) => !windowDone(w.id) && w.id !== windowId);
    if (nextIncomplete) {
      setActiveWindow(nextIncomplete.id);
      setDeckIndex(0);
      setShowMore(false);
    }
  };

  const handleAddOnConfirm = (addOn: AddOnExperience) => {
    setRsvpdAddOns((prev) => [...prev, addOn.id]);
    toast.success(`RSVP confirmed for ${addOn.title}!`, {
      description: "You'll receive a confirmation email before the event.",
      duration: 4000,
    });
    setRsvpModal(null);
    setShowAddOnPrompt(false);
    // Check if all windows are done after add-on
    const allDoneNow = TIME_WINDOWS.every((w) => windowDone(w.id));
    if (allDoneNow) {
      setTimeout(() => setSubmitted(true), 400);
      return;
    }
    const nextIncomplete = TIME_WINDOWS.find((w) => !windowComplete(w.id));
    if (nextIncomplete) {
      setActiveWindow(nextIncomplete.id);
      setDeckIndex(0);
      setShowMore(false);
    }
  };

  const dismissAddOnPrompt = () => {
    setShowAddOnPrompt(false);
    // Check if all windows are done after dismissing add-on
    const allDoneNow = TIME_WINDOWS.every((w) => windowDone(w.id));
    if (allDoneNow) {
      setTimeout(() => setSubmitted(true), 400);
      return;
    }
    const nextIncomplete = TIME_WINDOWS.find((w) => !windowDone(w.id));
    if (nextIncomplete) {
      setActiveWindow(nextIncomplete.id);
      setDeckIndex(0);
      setShowMore(false);
    }
  };

  // ── REVIEW SCREEN ──────────────────────────────────────────────────────────
  if (reviewWindow) {
    const reviewRanking = rankings[reviewWindow] || [];
    const windowLabel = TIME_WINDOWS.find((w) => w.id === reviewWindow)?.label ?? "";
    return (
      <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
        <div className="px-4 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => setReviewWindow(null)} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Review Your Preferences</h1>
              <p className="text-xs text-muted-foreground">{windowLabel}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Drag to reorder. The matching engine will use this ranked list to find the best fit for you.
          </p>
          {IS_VIP && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/30">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                <span className="font-semibold">VIP Priority:</span> Your top 2 preferences carry priority weighting.
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {reviewRanking.map((item, idx) => {
            const isVipPriority = IS_VIP && idx < 2;
            return (
              <div
                key={item.restaurantId}
                draggable
                onDragStart={() => handleReviewDragStart(item.restaurantId)}
                onDragEnter={() => handleReviewDragEnter(item.restaurantId)}
                onDragEnd={() => handleReviewDrop(reviewWindow)}
                onDragOver={(e) => e.preventDefault()}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none ${
                  isVipPriority ? "bg-amber-400/8 border-amber-400/40" : "bg-card border-border"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative ${
                  isVipPriority ? "bg-amber-400/20 border border-amber-400/50" : "bg-surface border border-border"
                }`}>
                  <span className={`font-display text-sm font-bold ${isVipPriority ? "text-amber-400" : "text-muted-foreground"}`}>
                    {item.rank}
                  </span>
                  {isVipPriority && (
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 absolute -top-1 -right-1" />
                  )}
                </div>

                {/* Chef portrait */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-border">
                  <img
                    src={item.chefPhoto}
                    alt={item.chef}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => { (e.target as HTMLImageElement).src = item.heroPhoto; }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.chef}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.cuisine} · {item.name}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isVipPriority && (
                    <span className="text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded">
                      Priority
                    </span>
                  )}
                  <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>
            );
          })}
        </div>

        {IS_VIP && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Priority match (Tier 1)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GripVertical className="w-3 h-3" />
                <span>Drag to reorder</span>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 pb-6 pt-2 border-t border-border">
          <button
            onClick={() => confirmReview(reviewWindow)}
            className="w-full py-3.5 bg-amber-400 text-background rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirm Preferences for {windowLabel}
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            You can update these until the preference window closes.
          </p>
        </div>
      </div>
    );
  }

  // ── ADD-ON PROMPT (shown after confirming a window that has add-ons) ────────
  if (showAddOnPrompt) {
    const addOns = ADD_ON_EXPERIENCES.filter((a) => !rsvpdAddOns.includes(a.id));
    const addOn = addOns[0];
    if (!addOn) {
      setShowAddOnPrompt(false);
      return null;
    }
    return (
      <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
        {/* Header */}
        <div className="px-4 pt-5 pb-4 border-b border-border flex items-center gap-3 flex-shrink-0">
          <button onClick={dismissAddOnPrompt} className="p-1.5 rounded-lg hover:bg-surface transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold text-foreground">Featured Experience</h1>
            <p className="text-xs text-muted-foreground">Available for Friday Dinner</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Sponsor strip */}
          <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-400">Sponsored Experience</span>
            <span className="text-xs text-amber-400/60 ml-auto truncate">{addOn.sponsor}</span>
          </div>

          {/* Hero image — stacked, full width, fixed aspect */}
          <div className="relative mx-4 mt-3 rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <img src={addOn.photo} alt={addOn.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {/* Badge top-left */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-400 text-background text-[10px] font-bold tracking-wide">
              {addOn.badge}
            </div>
          </div>

          {/* Content block — fully stacked, no side-by-side columns */}
          <div className="px-4 pt-4 pb-6 space-y-4">
            {/* Title + subtitle */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground leading-tight">{addOn.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{addOn.subtitle}</p>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
                <span>{addOn.capacity}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
                <span>{addOn.subtitle}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-foreground/80 leading-relaxed">{addOn.description}</p>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  if (addOn.requiresRSVP) {
                    setRsvpModal(addOn);
                  } else {
                    handleAddOnConfirm(addOn);
                  }
                }}
                className="w-full py-3.5 bg-amber-400 text-background rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {addOn.rsvpLabel}
              </button>
              <button
                onClick={dismissAddOnPrompt}
                className="w-full py-3 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>

        {/* RSVP Modal */}
        <AnimatePresence>
          {rsvpModal && (
            <RSVPModal
              addOn={rsvpModal}
              onConfirm={() => handleAddOnConfirm(rsvpModal)}
              onClose={() => setRsvpModal(null)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── SUBMITTED SCREEN ───────────────────────────────────────────────────────
  if (submitted) {
    const confirmedCount = TIME_WINDOWS.filter((w) => windowComplete(w.id)).length;
    const skippedCount = skippedWindows.length;
    return (
      <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
        {/* Header */}
        <div className="px-4 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Preferences Submitted</h1>
              <p className="text-xs text-muted-foreground">{confirmedCount} confirmed · {skippedCount} skipped</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            The matching engine will use your ranked preferences to build your personalised itinerary. You'll receive your confirmed schedule by email once allocation runs.
          </p>
          {IS_VIP && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/30">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300"><span className="font-semibold">VIP Priority:</span> Your top 2 preferences per window carry priority weighting in the matching engine.</p>
            </div>
          )}
        </div>

        {/* Per-window summary */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {TIME_WINDOWS.map((w) => {
            const windowRanking = rankings[w.id] || [];
            const isSkipped = skippedWindows.includes(w.id);
            const isConfirmed = windowComplete(w.id);
            return (
              <div key={w.id} className="space-y-2">
                {/* Window header */}
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isConfirmed ? "bg-emerald-500/20 border border-emerald-500/40" :
                    isSkipped ? "bg-muted-foreground/10 border border-border" :
                    "bg-amber-400/20 border border-amber-400/40"
                  }`}>
                    {isConfirmed ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> :
                     isSkipped ? <X className="w-3 h-3 text-muted-foreground" /> :
                     <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                    isConfirmed ? "text-emerald-400" : isSkipped ? "text-muted-foreground" : "text-amber-400"
                  }`}>{w.label}</h3>
                  {isSkipped && <span className="text-[10px] text-muted-foreground/60 ml-auto">Skipped</span>}
                </div>

                {isSkipped ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface/50">
                    <p className="text-xs text-muted-foreground italic">No preference submitted for this window.</p>
                  </div>
                ) : windowRanking.length === 0 ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface/50">
                    <p className="text-xs text-muted-foreground italic">No selections made.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {windowRanking.map((item, idx) => {
                      const isVipPriority = IS_VIP && idx < 2;
                      return (
                        <div
                          key={item.restaurantId}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${
                            isVipPriority ? "bg-amber-400/8 border-amber-400/40" : "bg-card border-border"
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative ${
                            isVipPriority ? "bg-amber-400/20 border border-amber-400/50" : "bg-surface border border-border"
                          }`}>
                            <span className={`font-display text-xs font-bold ${
                              isVipPriority ? "text-amber-400" : "text-muted-foreground"
                            }`}>{item.rank}</span>
                            {isVipPriority && <Star className="w-2 h-2 text-amber-400 fill-amber-400 absolute -top-0.5 -right-0.5" />}
                          </div>
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border">
                            <img src={item.chefPhoto} alt={item.chef} className="w-full h-full object-cover object-top"
                              onError={(e) => { (e.target as HTMLImageElement).src = item.heroPhoto; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{item.chef}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.cuisine} · {item.name}</p>
                          </div>
                          {isVipPriority && (
                            <span className="text-[10px] font-medium text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded flex-shrink-0">Priority</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 pb-8 pt-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
            <Send className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-300">Preferences locked in. Allocation runs in July 2026.</p>
          </div>
          <Link href="/">
            <button className="w-full py-3 bg-amber-400 text-background rounded-xl font-semibold text-sm hover:bg-amber-300 transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── ALL-COMPLETE BANNER (shown on main screen when all windows done but not yet submitted) ──
  const AllCompleteBanner = allComplete && !submitted ? (
    <div className="mx-4 mb-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p className="text-xs font-semibold text-emerald-400 truncate">All windows complete!</p>
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="flex-shrink-0 px-3 py-1.5 bg-amber-400 text-background rounded-lg text-xs font-bold hover:bg-amber-300 transition-colors flex items-center gap-1.5"
      >
        <Send className="w-3 h-3" />
        Submit
      </button>
    </div>
  ) : null;

  // ── MAIN SWIPE SCREEN ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 z-10">
        <Link href="/">
          <button className="p-2 rounded-lg hover:bg-surface transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        </Link>
        <div className="text-center">
          <h1 className="font-display text-sm font-semibold text-foreground">
            {TIME_WINDOWS.find((w) => w.id === activeWindow)?.label}
          </h1>
          <p className="text-xs text-muted-foreground">{currentRanking.length} of {MAX_RANKINGS} preferences</p>
        </div>
        <Link href="/preferences">
          <button className="p-2 rounded-lg hover:bg-surface transition-colors">
            <Monitor className="w-4 h-4 text-muted-foreground" />
          </button>
        </Link>
      </div>

      {/* Window selector pills — horizontal scroll + swipe gesture to navigate windows */}
      <div
        className="relative pb-3"
        onTouchStart={(e) => { (e.currentTarget as HTMLDivElement).dataset.touchX = String(e.touches[0].clientX); }}
        onTouchEnd={(e) => {
          const startX = parseFloat((e.currentTarget as HTMLDivElement).dataset.touchX || "0");
          const diff = startX - e.changedTouches[0].clientX;
          if (Math.abs(diff) < 40) return; // ignore small movements
          const currentIdx = TIME_WINDOWS.findIndex((w) => w.id === activeWindow);
          if (diff > 0 && currentIdx < TIME_WINDOWS.length - 1) {
            // swipe left → next window
            const next = TIME_WINDOWS[currentIdx + 1];
            if (windowComplete(next.id)) { setReviewWindow(next.id); }
            else { setActiveWindow(next.id); setDeckIndex(0); setExpandedInfo(false); }
          } else if (diff < 0 && currentIdx > 0) {
            // swipe right → previous window
            const prev = TIME_WINDOWS[currentIdx - 1];
            if (windowComplete(prev.id)) { setReviewWindow(prev.id); }
            else { setActiveWindow(prev.id); setDeckIndex(0); setExpandedInfo(false); }
          }
        }}
      >
        <div
          className="flex gap-1.5 overflow-x-auto px-4 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {TIME_WINDOWS.map((w) => {
            const isSkipped = skippedWindows.includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => {
                  if (windowComplete(w.id)) {
                    setReviewWindow(w.id);
                  } else {
                    setActiveWindow(w.id);
                    setDeckIndex(0);
                    setExpandedInfo(false);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeWindow === w.id
                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                    : windowComplete(w.id)
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : isSkipped
                    ? "bg-surface text-muted-foreground/50 border border-border/50 line-through"
                    : "bg-surface text-muted-foreground border border-border"
                }`}
              >
                {windowComplete(w.id) && <CheckCircle2 className="w-3 h-3" />}
                {isSkipped && <X className="w-3 h-3" />}
                {w.label.replace("Thursday ", "Thu ").replace("Friday ", "Fri ").replace("Saturday ", "Sat ").replace("Sunday ", "Sun ")}
              </button>
            );
          })}
        </div>
        {/* Right fade indicator */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* All-complete submit banner */}
      {AllCompleteBanner}

      {/* Card Stack */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 relative">
        {currentCard ? (
          <>
            {/* Background card hint */}
            {currentDeck[deckIndex + 1] && (
              <div className="absolute inset-x-4 top-0 bottom-20 rounded-2xl overflow-hidden scale-95 opacity-40">
                <img
                  src={currentDeck[deckIndex + 1].chefPhoto}
                  alt=""
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).src = currentDeck[deckIndex + 1].heroPhoto; }}
                />
              </div>
            )}

            {/* Main swipe card */}
            <motion.div
              className="absolute inset-x-4 top-0 bottom-20 rounded-2xl overflow-hidden shadow-2xl"
              style={{ x, rotate, scale: cardScale }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              {/* Chef portrait as card background — object-[center_15%] anchors on face/shoulders */}
              <img
                src={currentCard.chefPhoto}
                alt={currentCard.chef}
                className="w-full h-full object-cover object-[center_15%]"
                onError={(e) => { (e.target as HTMLImageElement).src = currentCard.heroPhoto; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

              {/* Swipe overlays */}
              <motion.div
                className="absolute top-8 left-6 px-4 py-2 rounded-xl border-2 border-emerald-400 text-emerald-400 font-bold text-xl rotate-[-15deg] flex items-center gap-2"
                style={{ opacity: yesOpacity }}
              >
                <ThumbsUp className="w-5 h-5" /> PREFER
              </motion.div>
              <motion.div
                className="absolute top-8 right-6 px-4 py-2 rounded-xl border-2 border-rose-400 text-rose-400 font-bold text-xl rotate-[15deg] flex items-center gap-2"
                style={{ opacity: noOpacity }}
              >
                PASS <ThumbsDown className="w-5 h-5" />
              </motion.div>

              {/* High demand badge */}
              {currentCard.highDemand && (
                <div className="absolute top-4 left-4 px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[10px] font-semibold">
                  High Demand
                </div>
              )}

              {/* Progress counter */}
              <div className="absolute top-4 right-4 bg-black/50 rounded-full px-2.5 py-1 text-xs text-white/80">
                {deckIndex + 1} / {currentDeck.length}
              </div>

              {/* Card info — chef-first */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {/* Chef name — PRIMARY */}
                <h2 className="font-display text-2xl font-bold text-white leading-tight">{currentCard.chef}</h2>
                {/* Chef title */}
                <p className="text-amber-300 text-xs font-medium mt-0.5">{currentCard.chefTitle}</p>

                {/* Cuisine pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentCard.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/20">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Venue name — secondary */}
                <p className="text-white/50 text-xs mt-2">{currentCard.name} · {currentCard.cuisine}</p>

                {/* Expandable menu detail */}
                <button
                  className="mt-2 flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-400 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setExpandedInfo(!expandedInfo); }}
                >
                  {expandedInfo ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  {expandedInfo ? "Hide menu" : "View menu"}
                </button>

                <AnimatePresence>
                  {expandedInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Award className="w-3 h-3 text-amber-400/60" />
                          <span className="text-[10px] text-white/50">{currentCard.accolades}</span>
                          <span className="text-[10px] text-amber-400/60 ml-auto italic">{currentCard.menuStyle}</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed mb-2">{currentCard.description}</p>
                        <div className="space-y-1">
                          {currentCard.menuHighlights.slice(0, 3).map((dish, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-400/60 text-[9px] mt-0.5">·</span>
                              <span className="text-[10px] text-white/60">{dish}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Skip this window */}
            <div className="absolute bottom-[5.5rem] left-0 right-0 flex justify-center">
              <button
                onClick={() => skipWindow(activeWindow)}
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground underline underline-offset-2 transition-colors px-3 py-1"
              >
                Skip this window
              </button>
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-5 px-4">
              <button
                onClick={undoLast}
                className="w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center hover:border-amber-400/50 transition-colors"
                title="Undo last"
              >
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </button>

              <button
                onClick={swipeLeft}
                className="w-16 h-16 rounded-full bg-rose-500/15 border-2 border-rose-500/40 flex flex-col items-center justify-center gap-0.5 hover:bg-rose-500/25 transition-colors"
                title="Not for me"
              >
                <ThumbsDown className="w-6 h-6 text-rose-400" />
                <span className="text-rose-400/70 text-[9px] font-medium tracking-wide">PASS</span>
              </button>

              <button
                onClick={swipeRight}
                disabled={currentRanking.length >= MAX_RANKINGS}
                className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex flex-col items-center justify-center gap-0.5 hover:bg-emerald-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="I'd enjoy this"
              >
                <ThumbsUp className="w-6 h-6 text-emerald-400" />
                <span className="text-emerald-400/70 text-[9px] font-medium tracking-wide">PREFER</span>
              </button>

              <button
                onClick={() => setDrawerOpen(true)}
                className="w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center hover:border-amber-400/50 transition-colors relative"
                title="View rankings"
              >
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                {currentRanking.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-background text-xs flex items-center justify-center font-bold">
                    {currentRanking.length}
                  </span>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Deck exhausted */
          <div className="text-center px-6">
            {!showMore ? (
              <>
                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">Top 10 reviewed</h3>
                <p className="text-muted-foreground text-sm mb-1">
                  {currentRanking.length} of {MAX_RANKINGS} chefs ranked (min {REQUIRED_RANKINGS}).
                </p>
                <p className="text-muted-foreground text-sm mb-4">Ready to move on, or want to see more chefs?</p>

                {(() => {
                  const nextWindow = TIME_WINDOWS.find((w) => !windowDone(w.id) && w.id !== activeWindow);
                  if (nextWindow) {
                    return (
                      <button
                        onClick={() => { setActiveWindow(nextWindow.id); setDeckIndex(0); setShowMore(false); }}
                        className="w-full px-5 py-3.5 bg-amber-400 text-background rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors mb-3"
                      >
                        <ChevronRight className="w-4 h-4" />
                        Next: {nextWindow.label}
                      </button>
                    );
                  }
                  if (allComplete) {
                    return (
                      <button
                        onClick={() => setSubmitted(true)}
                        className="w-full px-5 py-3.5 bg-amber-400 text-background rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors mb-3"
                      >
                        <Send className="w-4 h-4" />
                        Submit All Preferences
                      </button>
                    );
                  }
                  return null;
                })()}

                <button
                  onClick={() => { setShowMore(true); setDeckIndex(Math.min(DECK_SIZE, windowRestaurants.length)); }}
                  className="w-full px-5 py-2.5 bg-surface border border-border rounded-xl text-sm text-muted-foreground hover:border-amber-400/50 hover:text-foreground transition-colors mb-3"
                >
                  See 5 more chefs for this window
                </button>

                <button
                  onClick={() => skipWindow(activeWindow)}
                  className="w-full px-5 py-2.5 border border-border/50 rounded-xl text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-6"
                >
                  Skip this window
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">All chefs reviewed</h3>
                <p className="text-muted-foreground text-sm mb-1">{currentRanking.length} preferences noted for this window.</p>
                <div className="flex flex-col gap-2 mt-4">
                  {TIME_WINDOWS.filter((w) => !windowDone(w.id) && w.id !== activeWindow).slice(0, 1).map((w) => (
                    <button
                      key={w.id}
                      onClick={() => { setActiveWindow(w.id); setDeckIndex(0); setShowMore(false); }}
                      className="px-4 py-2 bg-amber-400 text-background rounded-lg text-sm font-medium"
                    >
                      Next: {w.label}
                    </button>
                  ))}
                  {allComplete && (
                    <button
                      onClick={() => setSubmitted(true)}
                      className="px-4 py-2 bg-amber-400 text-background rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit All
                    </button>
                  )}
                  <button
                    onClick={() => skipWindow(activeWindow)}
                    className="px-4 py-2 border border-border/50 rounded-lg text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    Skip this window
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Ranked List Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 max-w-md mx-auto bg-card border-t border-border rounded-t-2xl z-50 max-h-[82vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Your Preferences — {TIME_WINDOWS.find((w) => w.id === activeWindow)?.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Preference signals, not confirmed bookings</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-3 py-3">
              {currentRanking.length === 0 ? (
                <div className="text-center py-8">
                  <ThumbsUp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No preferences yet. Swipe right to signal interest!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentRanking.sort((a, b) => a.rank - b.rank).map((item, idx) => {
                    const isVipPriority = IS_VIP && idx < 2;
                    return (
                      <div
                        key={item.restaurantId}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${
                          isVipPriority ? "bg-amber-400/8 border-amber-400/40" : "bg-surface border-border"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative ${
                          isVipPriority ? "bg-amber-400/20 border border-amber-400/50" : "bg-card border border-border"
                        }`}>
                          <span className={`font-display text-xs font-bold ${isVipPriority ? "text-amber-400" : "text-muted-foreground"}`}>
                            {item.rank}
                          </span>
                          {isVipPriority && (
                            <Star className="w-2 h-2 text-amber-400 fill-amber-400 absolute -top-0.5 -right-0.5" />
                          )}
                        </div>
                        {/* Chef portrait */}
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-border">
                          <img
                            src={item.chefPhoto}
                            alt={item.chef}
                            className="w-full h-full object-cover object-top"
                            onError={(e) => { (e.target as HTMLImageElement).src = item.heroPhoto; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{item.chef}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.cuisine}</p>
                        </div>
                        {isVipPriority && (
                          <span className="text-[10px] font-medium text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded flex-shrink-0">
                            Priority
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* CTA footer — always visible, enabled when minimum met */}
            <div className="flex-shrink-0 px-3 py-3 border-t border-border">
              {windowComplete(activeWindow) ? (
                <div className="w-full py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Minimum Reached — Ready to Confirm
                </div>
              ) : (
                <>
                  <button
                    onClick={() => { if (currentRanking.length >= REQUIRED_RANKINGS) { setDrawerOpen(false); setReviewWindow(activeWindow); } }}
                    disabled={currentRanking.length < REQUIRED_RANKINGS}
                    title={currentRanking.length < REQUIRED_RANKINGS ? `${REQUIRED_RANKINGS - currentRanking.length} more needed` : ""}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      currentRanking.length >= REQUIRED_RANKINGS
                        ? "bg-amber-400 text-background"
                        : "bg-surface border border-border text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Review & Confirm Preferences
                  </button>
                  {currentRanking.length >= REQUIRED_RANKINGS && currentRanking.length < MAX_RANKINGS && (
                    <p className="text-[11px] text-emerald-400/80 mt-1">Min met · swipe right to add up to {MAX_RANKINGS - currentRanking.length} more</p>
                  )}
                  {currentRanking.length < REQUIRED_RANKINGS && (
                    <p className="text-center text-[10px] text-muted-foreground mt-1.5">
                      {REQUIRED_RANKINGS - currentRanking.length} more selection{REQUIRED_RANKINGS - currentRanking.length !== 1 ? "s" : ""} needed
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RSVP Modal (triggered from add-on prompt) */}
      <AnimatePresence>
        {rsvpModal && (
          <RSVPModal
            addOn={rsvpModal}
            onConfirm={() => handleAddOnConfirm(rsvpModal)}
            onClose={() => setRsvpModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
