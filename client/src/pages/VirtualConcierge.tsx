// Virtual Concierge — Chef's Table Festival
// Design: Mobile-first (max-w-sm), dark brand aesthetic, chef-hat avatar
// Rules engine: 3 phases (Pre-Plan / Late-Comer / Last-Ditch) gate capabilities
// Five scripted scenario flows + opening prompt with example chips

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ChefHat, ArrowLeft, Clock, Sparkles, CreditCard,
  XCircle, Users, Bell, CheckCircle2, ExternalLink,
  Send, RotateCcw, Info, CalendarDays, MapPin, Star,
  Utensils, Wine, Music, ChevronRight, Plus,
} from "lucide-react";

// ── Phase definitions ────────────────────────────────────────────────────────
type Phase = "preplan" | "latecomer" | "lastditch";

const PHASES: { id: Phase; label: string; sublabel: string; color: string }[] = [
  { id: "preplan",   label: "Pre-Plan",    sublabel: ">7 days out",   color: "text-blue-400 border-blue-400/40 bg-blue-400/10" },
  { id: "latecomer", label: "Late-Comer",  sublabel: "3–7 days out",  color: "text-amber-400 border-amber-400/40 bg-amber-400/10" },
  { id: "lastditch", label: "Last-Ditch",  sublabel: "<3 days / week", color: "text-red-400 border-red-400/40 bg-red-400/10" },
];

const PHASE_CAPABILITIES: Record<Phase, string[]> = {
  preplan:   ["waitlist", "faq", "upgrade"],
  latecomer: ["waitlist", "faq", "upgrade", "timeslot", "addon"],
  lastditch: ["waitlist", "faq", "upgrade", "timeslot", "addon", "cancel", "waitlist_convert"],
};

// ── Message types ────────────────────────────────────────────────────────────
type Sender = "bot" | "user" | "system";
type ChipAction = { label: string; action: string };

interface Message {
  id: string;
  sender: Sender;
  text: string;
  chips?: ChipAction[];
  card?: React.ReactNode;
  timestamp: Date;
  typing?: boolean;
}

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USER = { name: "Sarah Chen", email: "sarah.chen@example.com", tier: 1, booking: "CTF-2024-A01", squad: null };
const WAITLIST_USER = { name: "Marcus Webb", email: "marcus.webb@example.com", tier: 2 };

const AVAILABLE_SLOTS = [
  { time: "7:00 PM", venue: "Provisions", chef: "Thomas Keller", available: false },
  { time: "7:30 PM", venue: "Altitude",   chef: "Elena Arzak",   available: true  },
  { time: "8:00 PM", venue: "Lumière",    chef: "Daniel Humm",   available: true  },
  { time: "8:30 PM", venue: "The Hearth", chef: "Sean Brock",    available: true  },
];

// Opening example requests — map to scenario triggers
const EXAMPLE_REQUESTS: { icon: React.ReactNode; label: string; action: string; phaseRequired?: Phase[] }[] = [
  {
    icon: <Clock className="w-4 h-4" />,
    label: "I can't make my 7:00 PM seating — can I move?",
    action: "scenario_timeslot",
    phaseRequired: ["latecomer", "lastditch"],
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    label: "What's happening this evening?",
    action: "scenario_addon",
    phaseRequired: ["latecomer", "lastditch"],
  },
  {
    icon: <CreditCard className="w-4 h-4" />,
    label: "I want to upgrade my ticket to join a squad.",
    action: "scenario_upgrade",
  },
  {
    icon: <XCircle className="w-4 h-4" />,
    label: "I need to cancel my reservation.",
    action: "scenario_cancel",
    phaseRequired: ["lastditch"],
  },
  {
    icon: <Users className="w-4 h-4" />,
    label: "Can I still get in? The event shows sold out.",
    action: "scenario_waitlist",
  },
  {
    icon: <CalendarDays className="w-4 h-4" />,
    label: "Show me my itinerary.",
    action: "scenario_itinerary",
  },
];

// ── Scenario scripts ─────────────────────────────────────────────────────────
// Each scenario is a generator-style step machine keyed by action strings

type ScenarioStep = {
  botText: string;
  chips?: ChipAction[];
  card?: "slot_picker" | "addon_card" | "upgrade_card" | "cancel_confirm" | "waitlist_confirm" | "waitlist_notify" | "itinerary_timeline";
  delay?: number;
};

// ── Itinerary data ───────────────────────────────────────────────────────────
type ItineraryEntry =
  | { type: "dining"; day: string; time: string; venue: string; chef: string; cuisine: string; status: "confirmed" | "pending"; tier: number }
  | { type: "gap"; day: string; startTime: string; endTime: string }
  | { type: "addon"; day: string; time: string; title: string; sponsor: string; venue: string; capacity: number; spotsLeft: number; icon: "wine" | "music" | "star"; action: string };

const MOCK_ITINERARY: ItineraryEntry[] = [
  { type: "dining", day: "Thu Aug 14", time: "7:00 PM", venue: "Provisions", chef: "Thomas Keller", cuisine: "French Laundry Classics", status: "confirmed", tier: 1 },
  { type: "gap",    day: "Thu Aug 14", startTime: "9:00 PM", endTime: "11:59 PM" },
  { type: "dining", day: "Fri Aug 15", time: "12:30 PM", venue: "Lumière",    chef: "Daniel Humm",   cuisine: "Plant-Forward Fine Dining", status: "confirmed", tier: 1 },
  { type: "dining", day: "Fri Aug 15", time: "7:30 PM",  venue: "Altitude",   chef: "Elena Arzak",   cuisine: "Modern Basque", status: "confirmed", tier: 1 },
  { type: "gap",    day: "Fri Aug 15", startTime: "9:30 PM", endTime: "2:00 AM" },
  { type: "addon",  day: "Fri Aug 15", time: "10:00 PM", title: "VIP Afterparty — Rooftop at The Montage", sponsor: "Dom Pérignon", venue: "The Montage Rooftop", capacity: 50, spotsLeft: 12, icon: "music", action: "scenario_addon" },
  { type: "dining", day: "Sat Aug 16", time: "12:00 PM", venue: "The Hearth", chef: "Sean Brock",    cuisine: "Southern Heritage", status: "confirmed", tier: 1 },
  { type: "gap",    day: "Sat Aug 16", startTime: "2:00 PM", endTime: "6:00 PM" },
  { type: "addon",  day: "Sat Aug 16", time: "3:00 PM",  title: "Reserve Wine Pairing & Cellar Tour", sponsor: "Jordan Vineyard", venue: "Deer Valley Wine Cave", capacity: 24, spotsLeft: 5, icon: "wine", action: "scenario_addon" },
  { type: "dining", day: "Sat Aug 16", time: "7:00 PM",  venue: "Ember",      chef: "René Redzepi",  cuisine: "New Nordic", status: "pending", tier: 1 },
  { type: "dining", day: "Sun Aug 17", time: "11:00 AM", venue: "Summit",     chef: "Dominique Crenn", cuisine: "Poetic Culinaria", status: "confirmed", tier: 1 },
];

// ── Itinerary Timeline Card component ───────────────────────────────────────
function ItineraryTimelineCard({ onAddOn }: { onAddOn: (action: string, label: string) => void }) {
  const days = Array.from(new Set(MOCK_ITINERARY.map(e => e.day)));
  const [expandedDay, setExpandedDay] = useState<string | null>(days[0]);
  const [rsvpd, setRsvpd] = useState<Set<string>>(new Set());

  return (
    <div className="w-full rounded-2xl border border-border bg-card/80 overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-border bg-amber-400/5 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-amber-400" />
        <div>
          <p className="text-sm font-semibold text-foreground">Your Festival Itinerary</p>
          <p className="text-[10px] text-muted-foreground">Chef's Table · Aug 14–17 · Park City</p>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[9px] text-green-400 font-medium">4 confirmed</span>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-none">
        {days.map(day => {
          const short = day.split(" ").slice(0, 2).join(" ");
          const hasAddon = MOCK_ITINERARY.some(e => e.day === day && e.type === "addon");
          return (
            <button key={day} onClick={() => setExpandedDay(expandedDay === day ? null : day)}
              className={`flex-shrink-0 px-3 py-2 text-[11px] font-medium border-r border-border last:border-r-0 transition-colors relative ${
                expandedDay === day ? "bg-amber-400/10 text-amber-300" : "text-muted-foreground hover:text-foreground"
              }`}>
              {short}
              {hasAddon && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          );
        })}
      </div>

      {/* Timeline entries for selected day */}
      {expandedDay && (
        <div className="px-4 py-3 space-y-0">
          {MOCK_ITINERARY.filter(e => e.day === expandedDay).map((entry, i) => (
            <div key={i} className="flex gap-3">
              {/* Timeline spine */}
              <div className="flex flex-col items-center flex-shrink-0 w-5">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 border-2 ${
                  entry.type === "dining" ? (entry.status === "confirmed" ? "bg-amber-400 border-amber-400" : "bg-muted border-border") :
                  entry.type === "addon" ? "bg-amber-400/40 border-amber-400/60" :
                  "bg-transparent border-border/30"
                }`} />
                {i < MOCK_ITINERARY.filter(e => e.day === expandedDay).length - 1 && (
                  <div className="w-px flex-1 bg-border/40 my-0.5" style={{ minHeight: 20 }} />
                )}
              </div>

              {/* Entry content */}
              <div className="pb-3 flex-1 min-w-0">
                {entry.type === "dining" && (
                  <div className={`rounded-xl border p-3 ${
                    entry.status === "confirmed" ? "border-amber-400/20 bg-amber-400/5" : "border-border bg-card/40"
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Utensils className="w-3 h-3 text-amber-400/70 flex-shrink-0" />
                          <span className="text-[10px] text-amber-400/70 font-medium uppercase tracking-wide">{entry.time}</span>
                          {entry.status === "pending" && (
                            <span className="text-[9px] bg-muted/40 text-muted-foreground border border-border rounded-full px-1.5 py-0.5">Pending</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{entry.chef}</p>
                        <p className="text-xs text-muted-foreground">{entry.venue}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{entry.cuisine}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {entry.status === "confirmed" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground/40" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {entry.type === "gap" && (
                  <div className="py-1">
                    <p className="text-[10px] text-muted-foreground/40 italic">{entry.startTime} – {entry.endTime} · Free time</p>
                  </div>
                )}

                {entry.type === "addon" && (() => {
                  const key = `${entry.day}-${entry.time}`;
                  const isRsvpd = rsvpd.has(key);
                  return (
                    <div className="rounded-xl border border-amber-400/30 bg-amber-400/8 p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                          {entry.icon === "wine" ? <Wine className="w-3.5 h-3.5 text-amber-400" /> :
                           entry.icon === "music" ? <Music className="w-3.5 h-3.5 text-amber-400" /> :
                           <Star className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-[9px] text-amber-400/70 font-medium uppercase tracking-wide">Featured · {entry.time}</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{entry.title}</p>
                          <p className="text-[10px] text-muted-foreground/70">Presented by {entry.sponsor}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{entry.venue}</span>
                        <span className="ml-auto text-amber-400/70 font-medium">{entry.spotsLeft} spots left</span>
                      </div>
                      {isRsvpd ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-green-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Added to your itinerary</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setRsvpd(prev => new Set(Array.from(prev).concat(key))); onAddOn(entry.action, `RSVP: ${entry.title}`); }}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-400 text-background text-[11px] font-semibold hover:bg-amber-300 transition-colors">
                          <Plus className="w-3 h-3" />
                          Add to itinerary
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border bg-card/40 flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground/50">Tap any day to expand · Add-ons shown in amber</p>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
let msgCounter = 0;
function mkId() { return `msg-${++msgCounter}-${Date.now()}`; }

function uid(): string { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

// ── Main component ───────────────────────────────────────────────────────────
export default function VirtualConcierge() {
  const [phase, setPhase] = useState<Phase>("preplan");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [scenario, setScenario] = useState<string | null>(null);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [waitlistNotified, setWaitlistNotified] = useState(false);
  const [showNotificationBubble, setShowNotificationBubble] = useState(false);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [pendingIdentityAction, setPendingIdentityAction] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Opening greeting
  useEffect(() => {
    const greeting: Message = {
      id: mkId(),
      sender: "bot",
      text: "What can I do for you today?",
      timestamp: new Date(),
    };
    setTimeout(() => setMessages([greeting]), 400);
  }, []);

  const capabilities = PHASE_CAPABILITIES[phase];

  const addBotMessage = useCallback((text: string, chips?: ChipAction[], card?: Message["card"], delay = 900) => {
    setTyping(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, { id: mkId(), sender: "bot", text, chips, card, timestamp: new Date() }]);
        resolve();
      }, delay);
    });
  }, []);

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: mkId(), sender: "user", text, timestamp: new Date() }]);
  }, []);

  const addSystemMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: mkId(), sender: "system", text, timestamp: new Date() }]);
  }, []);

  const resetConversation = () => {
    setMessages([]);
    setScenario(null);
    setScenarioStep(0);
    setTyping(false);
    setIdentityConfirmed(false);
    setPendingIdentityAction(null);
    setWaitlistNotified(false);
    setShowNotificationBubble(false);
    msgCounter = 0;
    setTimeout(() => {
      setMessages([{ id: mkId(), sender: "bot", text: "What can I do for you today?", timestamp: new Date() }]);
    }, 300);
  };

  // ── Identity verification flow ───────────────────────────────────────────
  const runIdentityCheck = async (nextAction: string) => {
    setPendingIdentityAction(nextAction);
    await addBotMessage(
      "I'll need to verify your identity first. Could you share the name and email address associated with your booking?",
      undefined, undefined, 700
    );
  };

  const handleIdentityInput = async (text: string) => {
    const lower = text.toLowerCase();
    const nameMatch = lower.includes("sarah") || lower.includes("chen");
    const emailMatch = lower.includes("sarah.chen") || lower.includes("example.com");
    if (nameMatch || emailMatch) {
      setIdentityConfirmed(true);
      await addBotMessage(
        `Identity confirmed ✓ — Welcome back, **${MOCK_USER.name}**. Booking reference **${MOCK_USER.booking}**, Tier ${MOCK_USER.tier}.`,
        undefined, undefined, 800
      );
      if (pendingIdentityAction) {
        const action = pendingIdentityAction;
        setPendingIdentityAction(null);
        await runScenario(action, true);
      }
    } else {
      await addBotMessage(
        "I wasn't able to match that to a booking. Please try your full name or the email address you used to purchase.",
        [{ label: "Try again", action: "identity_retry" }],
        undefined, 700
      );
    }
  };

  // ── Scenario runners ─────────────────────────────────────────────────────
  const runScenario = async (action: string, skipIdentity = false) => {
    setScenario(action);
    setScenarioStep(0);

    switch (action) {

      // ── Scenario 1: Time-slot change ────────────────────────────────────
      case "scenario_timeslot": {
        if (!capabilities.includes("timeslot")) {
          await addBotMessage(
            "Time-slot changes aren't available yet — this service opens 7 days before the event. In the meantime, I can add you to a change request queue and notify you when the window opens.",
            [{ label: "Add me to the queue", action: "queue_timeslot" }, { label: "No thanks", action: "end" }]
          );
          return;
        }
        if (!skipIdentity && !identityConfirmed) { await runIdentityCheck(action); return; }
        await addBotMessage("Is this change for your full party, or just yourself?",
          [{ label: "Just me", action: "ts_solo" }, { label: "Full party", action: "ts_party" }]);
        break;
      }
      case "ts_solo":
      case "ts_party": {
        const partyNote = action === "ts_party" ? " I've flagged this as a full-party change." : "";
        await addBotMessage(
          `Got it.${partyNote} Your current booking is **Thursday Dinner at 7:00 PM — Provisions with Thomas Keller**. Here are available alternatives:`,
          undefined, undefined, 800
        );
        await addBotMessage(
          "Select an available slot below:",
          [
            { label: "7:30 PM — Elena Arzak at Altitude", action: "ts_confirm_730" },
            { label: "8:00 PM — Daniel Humm at Lumière",  action: "ts_confirm_800" },
            { label: "8:30 PM — Sean Brock at The Hearth", action: "ts_confirm_830" },
          ],
          undefined, 600
        );
        break;
      }
      case "ts_confirm_730":
      case "ts_confirm_800":
      case "ts_confirm_830": {
        const slotMap: Record<string, string> = {
          ts_confirm_730: "7:30 PM with Elena Arzak at Altitude",
          ts_confirm_800: "8:00 PM with Daniel Humm at Lumière",
          ts_confirm_830: "8:30 PM with Sean Brock at The Hearth",
        };
        const slot = slotMap[action];
        await addBotMessage(
          `Your reservation has been moved to **${slot}** on Thursday, August 13. A confirmation has been sent to ${MOCK_USER.email}. Your itinerary has been updated.`,
          [{ label: "What else can I help with?", action: "restart_prompt" }],
          undefined, 1000
        );
        addSystemMessage(`✓ Booking updated — ${slot}`);
        break;
      }

      // ── Scenario 2: Evening add-on ───────────────────────────────────────
      case "scenario_addon": {
        if (!capabilities.includes("addon")) {
          await addBotMessage(
            "Add-on experiences become available closer to the event. Check back in the Late-Comer window (7 days out) for curated evening options.",
            [{ label: "Remind me when available", action: "addon_remind" }, { label: "Back", action: "restart_prompt" }]
          );
          return;
        }
        await addBotMessage(
          "There's one exclusive experience available this evening that you may be eligible for:",
          undefined, undefined, 700
        );
        await addBotMessage(
          "**VIP Afterparty — Rooftop at The Montage**\nPresented by Dom Pérignon · Friday Night · 10 PM – 2 AM\n\nAn exclusive late-night gathering for Tier 1 & 2 guests. Live DJ, Champagne service, and surprise chef appearances. Strictly limited to 50 guests.",
          [
            { label: "Add to my itinerary", action: "addon_confirm" },
            { label: "Tell me more", action: "addon_more" },
            { label: "Not tonight", action: "end" },
          ],
          undefined, 900
        );
        break;
      }
      case "addon_more": {
        await addBotMessage(
          "The rooftop terrace at The Montage offers panoramic views of the Wasatch Mountains. Dress code is smart-casual. Dom Pérignon will be pouring their 2015 vintage alongside a late-night bites menu curated by a surprise guest chef. Doors open at 10 PM sharp — entry is by wristband only.",
          [{ label: "Add to my itinerary", action: "addon_confirm" }, { label: "No thanks", action: "end" }],
          undefined, 1100
        );
        break;
      }
      case "addon_confirm": {
        await addBotMessage(
          "Done — the **VIP Afterparty at The Montage** has been added to your Friday itinerary. Your wristband will be waiting at the main check-in desk. See you on the rooftop! 🥂",
          [{ label: "What else can I help with?", action: "restart_prompt" }],
          undefined, 900
        );
        addSystemMessage("✓ Add-on confirmed — VIP Afterparty, Friday 10 PM");
        break;
      }

      // ── Scenario 3: Tier upgrade ─────────────────────────────────────────
      case "scenario_upgrade": {
        const upgradeRef = `UPG-${uid()}`;
        await addBotMessage(
          "To join a squad booking, you'll need to be on the same ticket tier as the squad host, or at least Tier 2.",
          undefined, undefined, 700
        );
        await addBotMessage(
          `Your current tier is **Tier 3**. Upgrading to **Tier 2** unlocks squad coordination, priority matching, and access to the VIP add-on experiences.\n\nUpgrade cost: **$350** (difference only).\n\nUse the secure link below to complete your upgrade and transfer:`,
          [
            { label: "Open upgrade portal →", action: "upgrade_open" },
            { label: "Not right now", action: "end" },
          ],
          undefined, 1000
        );
        addSystemMessage(`Upgrade reference: ${upgradeRef} · expires in 24 hrs`);
        break;
      }
      case "upgrade_open": {
        await addBotMessage(
          "Opening the upgrade portal in a new tab. Once payment is complete, your tier will update automatically and you'll receive a squad join link within 5 minutes.",
          [{ label: "I've completed the upgrade", action: "upgrade_done" }, { label: "I'll do it later", action: "end" }],
          undefined, 700
        );
        // Simulate opening a URL
        setTimeout(() => window.open("https://chefcheckin.com/checkout?upgrade=tier2&ref=concierge", "_blank"), 500);
        break;
      }
      case "upgrade_done": {
        await addBotMessage(
          "Payment confirmed ✓ — your account has been upgraded to **Tier 2**. A squad join link has been sent to your email. Welcome to the squad!",
          [{ label: "What else can I help with?", action: "restart_prompt" }],
          undefined, 800
        );
        addSystemMessage("✓ Tier upgraded: 3 → 2");
        break;
      }

      // ── Scenario 4: Cancellation + waitlist broadcast ────────────────────
      case "scenario_cancel": {
        if (!capabilities.includes("cancel")) {
          await addBotMessage(
            "Cancellations aren't processed through this channel until the Last-Ditch window (3 days before the event). For earlier cancellations, please contact our support team at support@chefstablefestival.com.",
            [{ label: "Back", action: "restart_prompt" }]
          );
          return;
        }
        if (!skipIdentity && !identityConfirmed) { await runIdentityCheck(action); return; }
        await addBotMessage(
          "I can process your cancellation. Just to confirm — you'd like to cancel your **full reservation** for Chef's Table Festival (August 13–16, all dining windows)?",
          [
            { label: "Yes, cancel everything", action: "cancel_confirm" },
            { label: "Just one window", action: "cancel_partial" },
            { label: "Actually, never mind", action: "end" },
          ],
          undefined, 800
        );
        break;
      }
      case "cancel_partial": {
        await addBotMessage(
          "Which dining window would you like to cancel?",
          [
            { label: "Thursday Dinner", action: "cancel_window_thu" },
            { label: "Friday Dinner",   action: "cancel_window_fri" },
            { label: "Saturday Dinner", action: "cancel_window_sat" },
          ],
          undefined, 700
        );
        break;
      }
      case "cancel_window_thu":
      case "cancel_window_fri":
      case "cancel_window_sat": {
        const windowMap: Record<string, string> = {
          cancel_window_thu: "Thursday Dinner",
          cancel_window_fri: "Friday Dinner",
          cancel_window_sat: "Saturday Dinner",
        };
        const w = windowMap[action];
        await addBotMessage(
          `Your **${w}** reservation has been cancelled. The seat has been released back to the pool. A confirmation has been sent to ${MOCK_USER.email}.`,
          [{ label: "What else can I help with?", action: "restart_prompt" }],
          undefined, 900
        );
        addSystemMessage(`✓ ${w} cancelled — seat released`);
        break;
      }
      case "cancel_confirm": {
        await addBotMessage(
          "Cancellation confirmed. Your reservation has been fully cancelled and your seat released back to the pool. A refund of **$1,200** will appear on your card within 5–7 business days.",
          undefined, undefined, 1000
        );
        addSystemMessage("✓ Full reservation cancelled — seat pool updated");
        // Trigger waitlist notification after a short delay
        setTimeout(async () => {
          setShowNotificationBubble(true);
          await addBotMessage(
            `📣 **Waitlist notification sent** — A guest on the waitlist has been notified of the available seat.`,
            undefined, undefined, 400
          );
          setTimeout(async () => {
            setShowNotificationBubble(false);
            setWaitlistNotified(true);
            await addBotMessage(
              `**${WAITLIST_USER.name}** (${WAITLIST_USER.email}) was next on the waitlist for a 2-ticket request. They've received an offer to claim your spot and have 30 minutes to confirm.`,
              [{ label: "What else can I help with?", action: "restart_prompt" }],
              undefined, 600
            );
          }, 3000);
        }, 1500);
        break;
      }

      // ── Scenario 5: Waitlist → seat conversion ───────────────────────────
      case "scenario_waitlist": {
        if (!capabilities.includes("waitlist_convert") || !waitlistNotified) {
          // Pre-plan / late-comer: add to waitlist
          await addBotMessage(
            "The event is currently sold out for your requested dates. I've added you to the waitlist — you're **#3 in queue** for a 2-ticket request.",
            undefined, undefined, 800
          );
          await addBotMessage(
            "You'll receive an SMS and email notification the moment a cancellation matching your request becomes available. Response window is 30 minutes.",
            [{ label: "Got it, thanks", action: "end" }, { label: "What else can I help with?", action: "restart_prompt" }],
            undefined, 700
          );
          if (!capabilities.includes("waitlist_convert")) {
            addSystemMessage(`✓ Waitlist entry created — position #3, 2 tickets`);
          }
        } else {
          // Last-ditch + cancellation already happened: offer the freed seat
          await addBotMessage(
            "🎉 Great news — a cancellation just came through that matches your 2-ticket request!",
            undefined, undefined, 600
          );
          await addBotMessage(
            "**1 × 2-ticket allocation** is available for **Thursday Dinner, August 13**. This offer is reserved for you for the next **28 minutes**.",
            [
              { label: "Claim these tickets →", action: "waitlist_claim" },
              { label: "Pass — offer to next person", action: "waitlist_pass" },
            ],
            undefined, 800
          );
        }
        break;
      }
      case "waitlist_claim": {
        const claimRef = `CTF-2024-W${uid()}`;
        await addBotMessage(
          `Your 2 tickets have been confirmed ✓ — booking reference **${claimRef}**. A confirmation and your digital tickets have been sent to your email. Welcome to Chef's Table Festival!`,
          [{ label: "What else can I help with?", action: "restart_prompt" }],
          undefined, 1000
        );
        addSystemMessage(`✓ Waitlist → confirmed booking ${claimRef}`);
        break;
      }
      case "waitlist_pass": {
        await addBotMessage(
          "No problem — I've passed the offer to the next person on the waitlist. You'll remain on the list for future cancellations.",
          [{ label: "Back", action: "restart_prompt" }],
          undefined, 700
        );
        break;
      }

      // ── Utility actions ──────────────────────────────────────────────────
      case "restart_prompt": {
        await addBotMessage("Is there anything else I can help you with today?",
          undefined, undefined, 500);
        break;
      }
      case "queue_timeslot": {
        await addBotMessage(
          "Done — you're on the change request queue. We'll notify you by email when the time-slot change window opens.",
          [{ label: "What else can I help with?", action: "restart_prompt" }],
          undefined, 700
        );
        addSystemMessage("✓ Added to time-slot change queue");
        break;
      }
      case "addon_remind": {
        await addBotMessage(
          "Set. You'll receive a push notification when add-on experiences become available for your dates.",
          [{ label: "What else can I help with?", action: "restart_prompt" }],
          undefined, 700
        );
        break;
      }
      case "identity_retry": {
        setPendingIdentityAction(pendingIdentityAction);
        await addBotMessage(
          "No problem — please share your full name and the email address used at checkout.",
          undefined, undefined, 500
        );
        break;
      }
      case "end": {
        await addBotMessage(
          "Of course. If you need anything else before or during the event, I'm here 24/7. Enjoy the festival! 🍽️",
          undefined, undefined, 600
        );
        break;
      }
      // ── Scenario 6: Show itinerary ──────────────────────────────────────
      case "scenario_itinerary": {
        if (!skipIdentity && !identityConfirmed) { await runIdentityCheck(action); return; }
        await addBotMessage(
          `Here's your full festival itinerary, **${MOCK_USER.name}**. I've highlighted add-on experiences available during your free windows — tap any to RSVP directly.`,
          undefined, undefined, 800
        );
        // Inject the timeline card as a special message
        setMessages(prev => [...prev, {
          id: mkId(),
          sender: "bot",
          text: "__itinerary_card__",
          card: "itinerary_card" as unknown as React.ReactNode,
          timestamp: new Date(),
        }]);
        await addBotMessage(
          "Need to make any changes? I can move a seating, add an experience, or help with anything else.",
          [
            { label: "Move a seating", action: "scenario_timeslot" },
            { label: "What's on tonight?", action: "scenario_addon" },
            { label: "All good, thanks!", action: "end" },
          ],
          undefined, 1000
        );
        break;
      }

      default:
        break;
    }
  };

  // ── Handle chip tap or example request ──────────────────────────────────
  const handleAction = async (action: string, label?: string) => {
    if (label) addUserMessage(label);
    await runScenario(action);
  };

  // ── Handle free-text input ───────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addUserMessage(text);

    // If waiting for identity
    if (pendingIdentityAction) {
      await handleIdentityInput(text);
      return;
    }

    // Simple keyword routing for free-text
    const lower = text.toLowerCase();
    if (lower.includes("itinerary") || lower.includes("schedule") || lower.includes("my plan") || lower.includes("what do i have")) {
      await runScenario("scenario_itinerary"); return;
    }
    if (lower.includes("cancel")) { await runScenario("scenario_cancel"); return; }
    if (lower.includes("upgrade") || lower.includes("tier")) { await runScenario("scenario_upgrade"); return; }
    if (lower.includes("7:00") || lower.includes("7pm") || lower.includes("move") || lower.includes("slot") || lower.includes("seating")) {
      await runScenario("scenario_timeslot"); return;
    }
    if (lower.includes("tonight") || lower.includes("evening") || lower.includes("party") || lower.includes("add-on") || lower.includes("addon")) {
      await runScenario("scenario_addon"); return;
    }
    if (lower.includes("sold out") || lower.includes("waitlist") || lower.includes("wait list") || lower.includes("get in")) {
      await runScenario("scenario_waitlist"); return;
    }

    await addBotMessage(
      "I didn't quite catch that. Here's what I can help you with:",
      EXAMPLE_REQUESTS
        .filter(r => !r.phaseRequired || r.phaseRequired.includes(phase))
        .map(r => ({ label: r.label, action: r.action })),
      undefined, 700
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const currentPhase = PHASES.find(p => p.id === phase)!;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-4 px-2"
      style={{ backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 70%)" }}>

      {/* Outer mobile shell */}
      <div className="w-full max-w-sm flex flex-col" style={{ height: "calc(100dvh - 2rem)", minHeight: 600 }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm rounded-t-2xl">
          <Link href="/">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="w-9 h-9 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">Virtual Concierge</p>
            <p className="text-xs text-amber-400/80 leading-tight">Chef's Table Festival · Always on</p>
          </div>
          <button onClick={resetConversation} title="Reset conversation"
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* ── Phase selector ───────────────────────────────────────────── */}
        <div className="px-4 py-2 bg-card/60 border-b border-border flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground/60 mr-1 flex-shrink-0">Rules phase:</p>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {PHASES.map(p => (
              <button key={p.id} onClick={() => setPhase(p.id)}
                className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full border font-medium transition-all ${
                  phase === p.id ? p.color : "text-muted-foreground/50 border-border/50 bg-transparent"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phase capability hint */}
        <AnimatePresence mode="wait">
          <motion.div key={phase}
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className={`px-4 py-1.5 text-[10px] border-b border-border ${
              phase === "preplan" ? "bg-blue-950/30 text-blue-300/70" :
              phase === "latecomer" ? "bg-amber-950/30 text-amber-300/70" :
              "bg-red-950/30 text-red-300/70"
            }`}>
            {phase === "preplan" && "Pre-Plan: waitlist, FAQ, and tier upgrades only. Time-slot changes and cancellations not yet available."}
            {phase === "latecomer" && "Late-Comer: time-slot changes and add-on RSVPs now open. Cancellations still restricted."}
            {phase === "lastditch" && "Last-Ditch: all services active — cancellations, waitlist conversions, and emergency slot swaps enabled."}
          </motion.div>
        </AnimatePresence>

        {/* ── Message list ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background/50">

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"} gap-2`}>

                {/* System message */}
                {msg.sender === "system" && (
                  <div className="flex items-center gap-1.5 bg-green-950/40 border border-green-500/20 rounded-full px-3 py-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] text-green-400/80">{msg.text}</span>
                  </div>
                )}

                {/* Bot message */}
                {msg.sender === "bot" && (
                  <div className="flex gap-2 w-full">
                    <div className="w-7 h-7 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      {msg.text !== "__itinerary_card__" && (
                        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </div>
                      )}
                      {msg.text === "__itinerary_card__" && (
                        <ItineraryTimelineCard onAddOn={(action, label) => handleAction(action, label)} />
                      )}
                      {/* Quick-reply chips */}
                      {msg.chips && msg.chips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {msg.chips.map((chip) => (
                            <button key={chip.action} onClick={() => handleAction(chip.action, chip.label)}
                              className="text-xs px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/8 text-amber-300 hover:bg-amber-400/20 transition-colors flex items-center gap-1">
                              {chip.label.includes("→") && <ExternalLink className="w-3 h-3" />}
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* User message */}
                {msg.sender === "user" && (
                  <div className="max-w-[75%] bg-amber-400 text-background rounded-2xl rounded-tr-sm px-3.5 py-2.5">
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div key="typing"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/60"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Waitlist notification bubble */}
          <AnimatePresence>
            {showNotificationBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="flex justify-center">
                <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-2 shadow-lg">
                  <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="text-xs text-amber-300 font-medium">Sending waitlist notification to {WAITLIST_USER.name}…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* ── Example request chips (shown when conversation is at opening) ── */}
        <AnimatePresence>
          {messages.length <= 1 && !typing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="px-4 pb-2 bg-background/50 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest pt-2 pb-1.5">Common requests</p>
              <div className="flex flex-col gap-1.5">
                {EXAMPLE_REQUESTS.map((req) => {
                  const locked = req.phaseRequired && !req.phaseRequired.includes(phase);
                  return (
                    <button key={req.action}
                      onClick={() => !locked && handleAction(req.action, req.label)}
                      disabled={!!locked}
                      className={`flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-xl border transition-all text-sm ${
                        locked
                          ? "border-border/30 text-muted-foreground/30 bg-card/20 cursor-not-allowed"
                          : "border-border bg-card/60 text-foreground hover:border-amber-400/40 hover:bg-amber-400/5 active:scale-[0.98]"
                      }`}>
                      <span className={`flex-shrink-0 ${locked ? "text-muted-foreground/30" : "text-amber-400/70"}`}>
                        {req.icon}
                      </span>
                      <span className="leading-snug">{req.label}</span>
                      {locked && (
                        <span className="ml-auto text-[9px] text-muted-foreground/40 flex-shrink-0">
                          {req.phaseRequired?.includes("latecomer") ? "Late-Comer+" : "Last-Ditch only"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input bar ────────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-border bg-card/80 backdrop-blur-sm rounded-b-2xl">
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-amber-400/40 transition-colors">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none min-w-0" />
            <button onClick={handleSend} disabled={!input.trim()}
              className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-300 transition-colors">
              <Send className="w-3.5 h-3.5 text-background" />
            </button>
          </div>
          <p className="text-[9px] text-muted-foreground/30 text-center mt-1.5">
            Virtual Concierge · Chef's Table Festival 2024
          </p>
        </div>

      </div>
    </div>
  );
}
