// Design: Dark Culinary Editorial — operations command center, status-forward layout
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, CheckCircle2, AlertTriangle, Users, Calendar,
  BarChart3, Send, RefreshCw, ChevronDown, ChevronUp, Clock, Zap,
  Crown, UserCheck, Layers, Settings2, Info, Shield, Lock,
  MessageSquare, Phone, X, Search, Star, AlertCircle, Mail,
  ChevronRight, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { toast } from "sonner";
import { TIME_WINDOWS, MOCK_ALLOCATION_RESULTS, RESTAURANTS, WINDOW_CHEFS } from "@/lib/mockData";
import { SessionStats } from "@/components/ct";

// ─── Mock data ────────────────────────────────────────────────────────────────

const BUFFER_POOL = [
  { id: "u001", name: "David Park",      tier: 2, reason: "No preferences submitted",          windows: ["fri-dinner", "sat-dinner"] },
  { id: "u002", name: "Anna Kowalski",   tier: 1, reason: "Squad conflict — group too large",   windows: ["sat-lunch"] },
  { id: "u003", name: "James Whitfield", tier: 3, reason: "All choices oversubscribed",         windows: ["fri-dinner"] },
  { id: "u004", name: "Maria Santos",    tier: 2, reason: "Late submission",                    windows: ["thu-dinner", "sun-dinner"] },
  { id: "u005", name: "Kevin Zhang",     tier: 3, reason: "All choices oversubscribed",         windows: ["sat-dinner", "sun-lunch"] },
];

const RESTAURANTS_SAMPLE = [
  { id: "r01", name: "Provisions",      chef: "Thomas Keller",   window: "Fri Dinner", filled: 72, capacity: 72, buffer: 8, dynamicCapacity: null },
  { id: "r02", name: "Sakura Omakase",  chef: "Nobu Matsuhisa",  window: "Fri Dinner", filled: 68, capacity: 72, buffer: 8, dynamicCapacity: null },
  { id: "r08", name: "Nordic Table",    chef: "René Redzepi",    window: "Sat Dinner", filled: 72, capacity: 72, buffer: 8, dynamicCapacity: 96 },
  { id: "r20", name: "The Cellar",      chef: "Massimo Bottura", window: "Sat Dinner", filled: 71, capacity: 72, buffer: 8, dynamicCapacity: null },
  { id: "r24", name: "Umami Lab",       chef: "Ferran Adrià",    window: "Sun Dinner", filled: 72, capacity: 72, buffer: 8, dynamicCapacity: 88 },
];

const TIMELINE_MILESTONES = [
  { date: "May 4, 2026",        label: "Ticket Sales Go-Live",          detail: "Primary checkout opens. Bulk purchase across all 7 tiers. Named attendee assignment available post-purchase.", icon: "ticket" },
  { date: "June 1, 2026",       label: "Full Programming Announced",    detail: "Complete featured chef lineup and event schedule published. Preference portal unlocks for all named attendees.", icon: "programming" },
  { date: "June 1–July 30",     label: "Preference Collection Window",  detail: "Attendees rank chefs per dining window (minimum 3 selections). VIP attendees may see curated early-access prompts.", icon: "preferences" },
  { date: "July 30, 2026",      label: "Preference Deadline",           detail: "Portal closes. Attendees who have not submitted preferences are flagged for buffer pool assignment.", icon: "deadline" },
  { date: "Early August 2026",  label: "Matching Engine Run",           detail: "Two-pass Gale-Shapley: Pass 1 satisfies VIP/VVIP/Concierge first-choice preferences. Pass 2 applies GA population best-fit.", icon: "engine" },
  { date: "August 10, 2026",    label: "Itineraries Delivered",         detail: "Personalized schedules emailed to all matched attendees. Buffer pool manually resolved by operations team.", icon: "delivery" },
  { date: "Aug 13–16, 2026",    label: "Festival",                      detail: "Chef's Table Festival, Park City, Utah.", icon: "festival" },
];

// ─── Admin Squads mock data ───────────────────────────────────────────────────

type OverrideMode = "none" | "guided" | "locked";

interface AdminSquad {
  id: string;
  name: string;
  memberCount: number;
  tierComposition: string;
  squadManager: { name: string; phone: string } | null;
  days: string[];
  overrides: Record<string, { mode: OverrideMode; chef: string; note: string }>;
}

const INITIAL_SQUADS: AdminSquad[] = [
  {
    id: "sq-001",
    name: "APEX Capital",
    memberCount: 6,
    tierComposition: "2× Concierge · 4× VIP",
    squadManager: { name: "Rachel Okafor", phone: "+1 (212) 555-0192" },
    days: ["thu","fri","sat","sun"],
    overrides: {
      "thu-dinner":  { mode: "locked",  chef: "Thomas Keller",   note: "Sponsor commitment — confirmed with events team" },
      "fri-dinner":  { mode: "guided",  chef: "René Redzepi",    note: "Strong preference noted in pre-event survey" },
      "sat-dinner":  { mode: "none",    chef: "",                note: "" },
      "sun-brunch":  { mode: "none",    chef: "",                note: "" },
    },
  },
  {
    id: "sq-002",
    name: "Goldman Sachs VIP",
    memberCount: 4,
    tierComposition: "4× VVIP",
    squadManager: { name: "James Park", phone: "+1 (646) 555-0847" },
    days: ["fri","sat"],
    overrides: {
      "fri-lunch":   { mode: "locked",  chef: "Nobu Matsuhisa",  note: "Client entertainment — pre-arranged with chef" },
      "fri-dinner":  { mode: "locked",  chef: "Massimo Bottura", note: "Sponsor package inclusion" },
      "sat-lunch":   { mode: "guided",  chef: "Daniel Humm",     note: "Dietary preference — plant-based group" },
      "sat-dinner":  { mode: "none",    chef: "",                note: "" },
    },
  },
  {
    id: "sq-003",
    name: "Media & Press Block",
    memberCount: 8,
    tierComposition: "8× GA",
    squadManager: null,
    days: ["fri","sat","sun"],
    overrides: {
      "fri-dinner":  { mode: "guided",  chef: "Dominique Crenn", note: "Press feature — narrative cuisine aligns with coverage angle" },
      "sat-dinner":  { mode: "none",    chef: "",                note: "" },
      "sun-brunch":  { mode: "none",    chef: "",                note: "" },
    },
  },
];

// ─── Spam-blocked attendees mock data ────────────────────────────────────────

interface BlockedAttendee {
  id: string;
  name: string;
  email: string;
  tier: number;
  blockReason: string;
  phone?: string;
  smsSent?: boolean;
}

const BLOCKED_ATTENDEES: BlockedAttendee[] = [
  { id: "b01", name: "Marcus Webb",    email: "marcus.webb@example.com",   tier: 2, blockReason: "Hard bounce — mailbox does not exist" },
  { id: "b02", name: "Tyler Young",    email: "tyler.young@example.com",   tier: 3, blockReason: "Spam filter block — corporate firewall" },
  { id: "b03", name: "Hannah Brooks",  email: "hannah.brooks@example.com", tier: 3, blockReason: "Soft bounce — inbox full (3 attempts)" },
];

// ─── Per-window chef demand data ──────────────────────────────────────────────

function buildWindowDemand() {
  return TIME_WINDOWS.map((w) => {
    const chefIds = WINDOW_CHEFS[w.id] ?? [];
    const chefs = chefIds.map((rid, i) => {
      const r = RESTAURANTS.find((x) => x.id === rid);
      if (!r) return null;
      const capacity = 72;
      const buffer = 8;
      // Simulate demand: high-demand chefs get more first-choice votes
      const baseDemand = r.highDemand ? 95 + Math.floor(i * 3) : 45 + Math.floor(i * 8);
      const demand = Math.min(baseDemand, 160);
      const pressure: "over" | "balanced" | "under" =
        demand > capacity + 10 ? "over" : demand < capacity - 15 ? "under" : "balanced";
      return { id: rid, chef: r.chef, venue: r.name, capacity, buffer, demand, pressure };
    }).filter(Boolean) as { id: string; chef: string; venue: string; capacity: number; buffer: number; demand: number; pressure: "over" | "balanced" | "under" }[];
    const totalCapacity = chefs.reduce((a, c) => a + c.capacity, 0);
    const totalDemand = chefs.reduce((a, c) => a + c.demand, 0);
    const submissionPct = 85 + Math.floor(w.sort * 2.5);
    return { window: w, chefs, totalCapacity, totalDemand, submissionPct };
  });
}

const WINDOW_DEMAND = buildWindowDemand();

// ─── Types ────────────────────────────────────────────────────────────────────

type EngineState = "idle" | "running" | "complete";
type AdminTab = "overview" | "allocation" | "buffer" | "inventory" | "squads" | "timeline";

// ─── SMS Modal ────────────────────────────────────────────────────────────────

function SmsInviteModal({
  attendee,
  onClose,
  onSent,
}: {
  attendee: BlockedAttendee;
  onClose: () => void;
  onSent: (phone: string) => void;
}) {
  const [phone, setPhone] = useState(attendee.phone ?? "");
  const [countryCode, setCountryCode] = useState("+1");

  const handleSend = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) { toast.error("Please enter a valid phone number."); return; }
    onSent(`${countryCode} ${phone.trim()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-card border border-rose-400/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-5 border-b border-border flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-400/20 border border-rose-400/40 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">Send SMS Invite Link</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Email to <strong className="text-foreground">{attendee.email}</strong> is blocked. Send the join link via SMS instead.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Block reason */}
          <div className="flex items-start gap-2.5 p-3 bg-rose-400/10 border border-rose-400/20 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-rose-400">Block reason:</strong> {attendee.blockReason}
            </p>
          </div>

          {/* Attendee info */}
          <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-sm font-bold text-amber-400 flex-shrink-0">
              {attendee.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{attendee.name}</p>
              <p className="text-xs text-muted-foreground">{attendee.email} · Tier {attendee.tier}</p>
            </div>
          </div>

          {/* Phone input */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Mobile phone number <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-400/60 shrink-0"
              >
                {["+1 US/CA","+44 UK","+61 AU","+33 FR","+49 DE","+81 JP","+86 CN","+971 UAE"].map((c) => (
                  <option key={c} value={c.split(" ")[0]}>{c}</option>
                ))}
              </select>
              <input
                autoFocus
                type="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400/60"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              The attendee will receive a text message with their unique squad join link and preference portal access code.
            </p>
          </div>

          {/* Message preview */}
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">SMS Preview</p>
            <p className="text-xs text-foreground leading-relaxed font-mono">
              Chef's Table Festival: Hi {attendee.name.split(" ")[0]}, your invite link is ready. Access your preference portal: ct2026.com/join/[TOKEN] — Reply STOP to opt out.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:border-amber-400/30 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-2.5 rounded-xl bg-rose-400 text-white text-sm font-semibold hover:bg-rose-300 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Send SMS
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Override Row ─────────────────────────────────────────────────────────────

function OverrideRow({
  windowId,
  windowLabel,
  override,
  chefOptions,
  onChange,
}: {
  windowId: string;
  windowLabel: string;
  override: { mode: OverrideMode; chef: string; note: string };
  chefOptions: string[];
  onChange: (updated: { mode: OverrideMode; chef: string; note: string }) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${
      override.mode === "locked"  ? "border-amber-400/50 bg-amber-400/5" :
      override.mode === "guided"  ? "border-blue-400/40 bg-blue-400/5" :
      "border-border bg-transparent"
    }`}>
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-foreground">{windowLabel}</p>
            {override.mode === "locked" && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" /> Hard Lock
              </span>
            )}
            {override.mode === "guided" && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-400/15 border border-blue-400/30 px-2 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5" /> Guided
              </span>
            )}
            {override.mode === "none" && (
              <span className="text-[10px] text-muted-foreground">No override</span>
            )}
          </div>
          {override.chef && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{override.chef}</p>
          )}
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-border space-y-3">
              {/* Mode selector */}
              <div className="pt-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Override type</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: "none",    label: "None",        desc: "Lottery applies",          color: "border-border text-muted-foreground" },
                    { value: "guided",  label: "Guided",      desc: "Strong suggestion",         color: "border-blue-400/40 text-blue-400 bg-blue-400/10" },
                    { value: "locked",  label: "Hard Lock",   desc: "Bypasses lottery",          color: "border-amber-400/50 text-amber-400 bg-amber-400/10" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onChange({ ...override, mode: opt.value as OverrideMode, chef: opt.value === "none" ? "" : override.chef })}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        override.mode === opt.value
                          ? opt.color + " ring-1 ring-inset ring-current/30"
                          : "border-border text-muted-foreground hover:border-amber-400/20"
                      }`}
                    >
                      <p className="text-[10px] font-semibold">{opt.label}</p>
                      <p className="text-[9px] opacity-70 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chef selector */}
              {override.mode !== "none" && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    {override.mode === "locked" ? "Assigned chef / venue" : "Preferred chef / venue"}
                  </p>
                  <select
                    value={override.chef}
                    onChange={(e) => onChange({ ...override, chef: e.target.value })}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-400/60"
                  >
                    <option value="">— Select chef —</option>
                    {chefOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Ops note */}
              {override.mode !== "none" && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Ops note (audit trail)</p>
                  <input
                    placeholder="Reason for override…"
                    value={override.note}
                    onChange={(e) => onChange({ ...override, note: e.target.value })}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400/60"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [engineProgress, setEngineProgress] = useState(0);
  const [engineLog, setEngineLog] = useState<{ msg: string; phase: string }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const [showResults, setShowResults] = useState(false);
  const [assignedBuffer, setAssignedBuffer] = useState<string[]>([]);
  const [itinerarySent, setItinerarySent] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Squads & Overrides state
  const [squads, setSquads] = useState<AdminSquad[]>(INITIAL_SQUADS);
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null);
  const [squadSearch, setSquadSearch] = useState("");

  // Spam-blocked state
  const [blockedAttendees, setBlockedAttendees] = useState<BlockedAttendee[]>(BLOCKED_ATTENDEES);
  const [smsModal, setSmsModal] = useState<BlockedAttendee | null>(null);
  const [blockedSearch, setBlockedSearch] = useState("");

  // Overview: expanded windows
  const [expandedWindow, setExpandedWindow] = useState<string | null>(null);

  const selectedSquad = squads.find((s) => s.id === selectedSquadId) ?? null;

  const updateOverride = (squadId: string, windowId: string, updated: { mode: OverrideMode; chef: string; note: string }) => {
    setSquads((prev) =>
      prev.map((s) =>
        s.id === squadId
          ? { ...s, overrides: { ...s.overrides, [windowId]: updated } }
          : s
      )
    );
  };

  const getChefOptionsForWindow = (windowId: string) =>
    (WINDOW_CHEFS[windowId] ?? [])
      .map((rid) => RESTAURANTS.find((r) => r.id === rid)?.chef)
      .filter(Boolean) as string[];

  const runEngine = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setEngineState("running");
    setEngineProgress(0);
    setEngineLog([]);
    setShowResults(false);

    const steps = [
      { pct: 5,   msg: "[INIT] Loading attendee roster — 1,847 records across 7 tiers", phase: "init" },
      { pct: 10,  msg: "[INIT] Loading event inventory — 6 windows · chef lineup locked June 1", phase: "init" },
      { pct: 15,  msg: "[INIT] Validating Squad configurations — 142 Squads · 614 members", phase: "init" },
      { pct: 20,  msg: "[INIT] Applying admin Hard Lock overrides — 3 squads · 4 locked windows", phase: "init" },
      { pct: 26,  msg: "[PASS 1 — VIP] Isolating VIP population: Concierge (S) + VVIP (A) + VIP (B) — 312 attendees", phase: "vip" },
      { pct: 32,  msg: "[PASS 1 — VIP] Thu Dinner: matching 312 VIP first-choice preferences against 5 chefs...", phase: "vip" },
      { pct: 38,  msg: "[PASS 1 — VIP] Fri Lunch + Fri Dinner: VIP first-choice satisfied — 98.4% match rate", phase: "vip" },
      { pct: 44,  msg: "[PASS 1 — VIP] Sat Lunch + Sat Dinner: processing VIP Squads as units — 38 squads", phase: "vip" },
      { pct: 50,  msg: "[PASS 1 — VIP] Sun Brunch: VIP pass complete — 307 of 312 VIP attendees matched to first choice", phase: "vip" },
      { pct: 56,  msg: "[PASS 2 — GA] Remaining inventory after VIP pass: 1,535 GA attendees · seats available per window", phase: "ga" },
      { pct: 62,  msg: "[PASS 2 — GA] Thu Dinner: running Gale-Shapley on GA population — high demand: Thomas Keller", phase: "ga" },
      { pct: 68,  msg: "[PASS 2 — GA] Fri Dinner: high demand detected — Provisions, Nordic Table. Applying best-fit fallback.", phase: "ga" },
      { pct: 74,  msg: "[PASS 2 — GA] Sat Lunch + Sat Dinner: GA Squads processed as units — 104 squads", phase: "ga" },
      { pct: 80,  msg: "[PASS 2 — GA] Sun Brunch: GA pass complete — ensuring each GA attendee receives at least top-ranked available choice", phase: "ga" },
      { pct: 88,  msg: "[FINALIZE] Identifying unmatched attendees — 56 flagged for buffer pool (3.0% of roster)", phase: "finalize" },
      { pct: 94,  msg: "[FINALIZE] Generating 1,791 personalized itinerary records", phase: "finalize" },
      { pct: 100, msg: "[COMPLETE] Match complete — VIP 98.4% first-choice · GA 89.1% first or second choice · Overall 92.4%", phase: "finalize" },
    ];

    let i = 0;
    intervalRef.current = setInterval(() => {
      const step = steps[i];
      if (!step) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setEngineState("complete");
        setShowResults(true);
        toast.success("Matching engine complete — 1,791 attendees matched");
        return;
      }
      setEngineProgress(step.pct);
      setEngineLog((prev) => [...prev, { msg: step.msg, phase: step.phase }]);
      i++;
      if (i >= steps.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setEngineState("complete");
        setShowResults(true);
        toast.success("Matching engine complete — 1,791 attendees matched");
      }
    }, 350);
  };

  const assignBufferAttendee = (id: string, restaurantName: string) => {
    setAssignedBuffer((prev) => [...prev, id]);
    toast.success(`Assigned to ${restaurantName}`);
  };

  const filteredSquads = squads.filter((s) =>
    s.name.toLowerCase().includes(squadSearch.toLowerCase()) ||
    (s.squadManager?.name ?? "").toLowerCase().includes(squadSearch.toLowerCase())
  );

  const filteredBlocked = blockedAttendees.filter((a) =>
    a.name.toLowerCase().includes(blockedSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(blockedSearch.toLowerCase())
  );

  const handleSmsSent = (attendeeId: string, phone: string) => {
    setBlockedAttendees((prev) =>
      prev.map((a) => a.id === attendeeId ? { ...a, phone, smsSent: true } : a)
    );
    toast.success("SMS invite link sent successfully");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-2 rounded-lg hover:bg-surface transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Chef's Table Festival · Operations</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
          engineState === "complete"
            ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
            : engineState === "running"
            ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
            : "bg-surface border-border text-muted-foreground"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            engineState === "complete" ? "bg-emerald-400" :
            engineState === "running" ? "bg-amber-400 animate-pulse" :
            "bg-muted-foreground"
          }`} />
          {engineState === "complete" ? "Match Complete" : engineState === "running" ? "Engine Running" : "Pre-Match"}
        </div>
      </div>

      {/* Tab Nav */}
      <div className="border-b border-border px-6 overflow-x-auto">
        <div className="flex gap-1 py-2 min-w-max">
          {[
            { id: "overview",    label: "Overview",         icon: BarChart3 },
            { id: "squads",      label: "Squads & Overrides", icon: Shield },
            { id: "allocation",  label: "Matching Engine",  icon: Zap },
            { id: "buffer",      label: "Buffer Pool",      icon: AlertTriangle },
            { id: "inventory",   label: "Inventory",        icon: Calendar },
            { id: "timeline",    label: "Timeline",         icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-amber-400/15 text-amber-400 border border-amber-400/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === "buffer" && engineState === "complete" && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-400/20 text-rose-400 text-xs">
                  {BUFFER_POOL.length - assignedBuffer.length}
                </span>
              )}
              {tab.id === "squads" && blockedAttendees.filter((a) => !a.smsSent).length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-400/20 text-rose-400 text-xs">
                  {blockedAttendees.filter((a) => !a.smsSent).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* KPI Cards */}
            <SessionStats
              columns={4}
              items={[
                { label: "Total Attendees",       value: "1,847" },
                { label: "Preferences Submitted", value: "1,791", tone: "success" },
                { label: "Active Squads",         value: "142",   tone: "info" },
                { label: "Days to Festival",      value: "23",    tone: "warning" },
              ]}
            />

            {/* Preference Submission Progress — per venue/chef */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">Preference Submission Progress</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Expand each window to see per-chef demand and capacity pressure</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-rose-400" /> Over</span>
                  <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-emerald-400" /> Balanced</span>
                  <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3 text-blue-400" /> Under</span>
                </div>
              </div>

              <div className="divide-y divide-border">
                {WINDOW_DEMAND.map(({ window: w, chefs, totalCapacity, totalDemand, submissionPct }) => {
                  const isExpanded = expandedWindow === w.id;
                  const overallPressure = totalDemand > totalCapacity * 1.1 ? "over" : totalDemand < totalCapacity * 0.85 ? "under" : "balanced";
                  return (
                    <div key={w.id}>
                      {/* Window summary row */}
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface/50 transition-colors"
                        onClick={() => setExpandedWindow(isExpanded ? null : w.id)}
                      >
                        <div className="w-36 shrink-0">
                          <p className="text-xs font-semibold text-foreground">{w.label}</p>
                          <p className="text-[10px] text-muted-foreground">{w.date}</p>
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${submissionPct}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full rounded-full bg-amber-400"
                          />
                        </div>
                        <div className="text-xs text-muted-foreground w-10 text-right font-mono">{submissionPct}%</div>
                        <div className={`flex items-center gap-1 text-[10px] font-medium w-20 justify-end ${
                          overallPressure === "over" ? "text-rose-400" :
                          overallPressure === "under" ? "text-blue-400" :
                          "text-emerald-400"
                        }`}>
                          {overallPressure === "over" ? <TrendingUp className="w-3 h-3" /> : overallPressure === "under" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {totalDemand}/{totalCapacity}
                        </div>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                      </div>

                      {/* Expanded per-chef table */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 bg-surface/30">
                              {/* Table header */}
                              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide border-b border-border mb-1">
                                <span>Chef / Venue</span>
                                <span className="text-right w-16">Capacity</span>
                                <span className="text-right w-16">Buffer</span>
                                <span className="text-right w-20">1st-Choice</span>
                                <span className="text-right w-20">Pressure</span>
                              </div>
                              {chefs.map((c) => (
                                <div key={c.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center px-3 py-2.5 rounded-lg hover:bg-surface transition-colors">
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">{c.chef}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{c.venue}</p>
                                  </div>
                                  <div className="text-xs font-mono text-foreground text-right w-16">{c.capacity}</div>
                                  <div className="text-xs font-mono text-muted-foreground text-right w-16">+{c.buffer}</div>
                                  <div className="text-xs font-mono text-right w-20">
                                    <span className={c.demand > c.capacity ? "text-rose-400" : "text-foreground"}>{c.demand}</span>
                                  </div>
                                  <div className={`flex items-center justify-end gap-1 text-[10px] font-semibold w-20 ${
                                    c.pressure === "over"     ? "text-rose-400" :
                                    c.pressure === "under"    ? "text-blue-400" :
                                    "text-emerald-400"
                                  }`}>
                                    {c.pressure === "over"    ? <TrendingUp className="w-3 h-3" /> :
                                     c.pressure === "under"   ? <TrendingDown className="w-3 h-3" /> :
                                     <Minus className="w-3 h-3" />}
                                    {c.pressure === "over" ? "Over" : c.pressure === "under" ? "Under" : "OK"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab("allocation")}
                disabled={engineState === "running"}
                className="p-5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-left hover:bg-amber-400/15 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {engineState === "running" ? (
                  <div className="w-6 h-6 mb-3 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                ) : (
                  <Zap className="w-6 h-6 text-amber-400 mb-3" />
                )}
                <p className="font-semibold text-foreground group-hover:text-amber-400 transition-colors">
                  {engineState === "running" ? "Engine Running…" : "Run Matching Engine"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {engineState === "running" ? "Gale-Shapley in progress" : "Execute Gale-Shapley allocation across all 8 windows"}
                </p>
              </button>
              <button
                onClick={() => setActiveTab("squads")}
                className="p-5 bg-surface border border-border rounded-xl text-left hover:border-amber-400/30 transition-colors group"
              >
                <Shield className="w-6 h-6 text-amber-400 mb-3" />
                <p className="font-semibold text-foreground">Squads & Overrides</p>
                <p className="text-xs text-muted-foreground mt-1">Manage VIP assignments and Hard Lock overrides</p>
              </button>
              <button
                onClick={() => {
                  if (engineState !== "complete") { toast.error("Run the matching engine first"); return; }
                  setItinerarySent(true);
                  toast.success("Itineraries queued for delivery — 1,791 emails");
                }}
                className="p-5 bg-surface border border-border rounded-xl text-left hover:border-amber-400/30 transition-colors group"
              >
                <Send className={`w-6 h-6 mb-3 ${itinerarySent ? "text-emerald-400" : "text-blue-400"}`} />
                <p className="font-semibold text-foreground">{itinerarySent ? "Itineraries Sent ✓" : "Deliver Itineraries"}</p>
                <p className="text-xs text-muted-foreground mt-1">Email personalized schedules to all matched attendees</p>
              </button>
            </div>
          </motion.div>
        )}

        {/* ══ SQUADS & OVERRIDES TAB ══ */}
        {activeTab === "squads" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Legend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-400/5 border border-amber-400/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Hard Lock</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Admin directly assigns a chef/venue for a specific window. This <strong className="text-foreground">bypasses the lottery entirely</strong> — the squad is guaranteed that placement regardless of demand. Reserved for sponsors, VIP commitments, and red carpet arrangements.
                </p>
              </div>
              <div className="bg-blue-400/5 border border-blue-400/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-blue-400" />
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Guided Preference</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Admin sets a strong preference that acts as a <strong className="text-foreground">weighted signal in the matching engine</strong> — equivalent to a top-ranked first choice. The squad may still be displaced if capacity is exhausted, but they receive priority treatment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Squad list */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2">
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    placeholder="Search squads…"
                    value={squadSearch}
                    onChange={(e) => setSquadSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                {filteredSquads.map((squad) => {
                  const lockedCount = Object.values(squad.overrides).filter((o) => o.mode === "locked").length;
                  const guidedCount = Object.values(squad.overrides).filter((o) => o.mode === "guided").length;
                  return (
                    <button
                      key={squad.id}
                      onClick={() => setSelectedSquadId(squad.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedSquadId === squad.id
                          ? "border-amber-400/50 bg-amber-400/5"
                          : "border-border bg-card hover:border-amber-400/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{squad.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{squad.tierComposition}</p>
                          <p className="text-xs text-muted-foreground">{squad.memberCount} members · {squad.days.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(", ")}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-end flex-shrink-0">
                          {lockedCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-medium">
                              <Lock className="w-2.5 h-2.5" /> {lockedCount}
                            </span>
                          )}
                          {guidedCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full font-medium">
                              <Star className="w-2.5 h-2.5" /> {guidedCount}
                            </span>
                          )}
                        </div>
                      </div>
                      {squad.squadManager && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Shield className="w-2.5 h-2.5 text-amber-400" />
                          {squad.squadManager.name} · {squad.squadManager.phone}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Override panel */}
              <div className="lg:col-span-3">
                {selectedSquad ? (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-border">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-base font-semibold text-foreground">{selectedSquad.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{selectedSquad.tierComposition} · {selectedSquad.memberCount} members</p>
                        </div>
                        {selectedSquad.squadManager && (
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 text-xs text-amber-400 justify-end">
                              <Shield className="w-3 h-3" />
                              <span className="font-medium">{selectedSquad.squadManager.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end mt-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {selectedSquad.squadManager.phone}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Window Overrides</p>
                      {Object.entries(selectedSquad.overrides).map(([windowId, override]) => {
                        const windowLabel = TIME_WINDOWS.find((w) => w.id === windowId)?.label ?? windowId;
                        const chefOptions = getChefOptionsForWindow(windowId);
                        return (
                          <OverrideRow
                            key={windowId}
                            windowId={windowId}
                            windowLabel={windowLabel}
                            override={override}
                            chefOptions={chefOptions}
                            onChange={(updated) => updateOverride(selectedSquad.id, windowId, updated)}
                          />
                        );
                      })}

                      <button
                        onClick={() => toast.success(`Overrides saved for ${selectedSquad.name}`)}
                        className="w-full mt-2 py-2.5 rounded-xl bg-amber-400 text-background text-sm font-semibold hover:bg-amber-300 transition-colors"
                      >
                        Save overrides
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center py-20 text-center text-muted-foreground">
                    <div>
                      <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Select a squad to manage overrides</p>
                      <p className="text-xs mt-1 opacity-60">Hard Lock and Guided Preference settings appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Spam-blocked attendees */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-foreground">Email-Blocked Attendees</h3>
                    {blockedAttendees.filter((a) => !a.smsSent).length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-400 text-xs font-medium border border-rose-400/20">
                        {blockedAttendees.filter((a) => !a.smsSent).length} pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Attendees whose email invites were blocked by spam filters or bounced. Send their join link via SMS instead.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 shrink-0">
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    placeholder="Search…"
                    value={blockedSearch}
                    onChange={(e) => setBlockedSearch(e.target.value)}
                    className="w-32 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-border">
                {filteredBlocked.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>No blocked attendees found</p>
                  </div>
                )}
                {filteredBlocked.map((attendee) => (
                  <div key={attendee.id} className="p-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-rose-400/20 border border-rose-400/30 flex items-center justify-center text-sm font-bold text-rose-400 flex-shrink-0">
                      {attendee.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{attendee.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">Tier {attendee.tier}</span>
                        {attendee.smsSent ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> SMS sent
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-rose-400 font-medium">
                            <AlertCircle className="w-3 h-3" /> Email blocked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{attendee.email}</p>
                      <p className="text-[10px] text-rose-400/70 mt-0.5">{attendee.blockReason}</p>
                      {attendee.smsSent && attendee.phone && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {attendee.phone}
                        </p>
                      )}
                    </div>
                    {!attendee.smsSent ? (
                      <button
                        onClick={() => setSmsModal(attendee)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-400/10 border border-rose-400/30 text-rose-400 text-xs font-medium hover:bg-rose-400/20 transition-colors flex-shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Send SMS
                      </button>
                    ) : (
                      <button
                        onClick={() => setSmsModal(attendee)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-muted-foreground text-xs font-medium hover:border-amber-400/30 transition-colors flex-shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Resend
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ ALLOCATION TAB ══ */}
        {activeTab === "allocation" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="font-display text-base font-semibold text-foreground">Two-Pass Matching Logic</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-amber-400/30 rounded-xl p-4 bg-amber-400/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Pass 1 — VIP Priority</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Concierge (S), VVIP (A), and VIP (B) tier attendees are processed first. Hard Lock overrides are applied before any preference matching begins. Squads in this tier are matched as a unit.
                  </p>
                </div>
                <div className="border border-blue-400/30 rounded-xl p-4 bg-blue-400/5">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Pass 2 — GA Best-Fit</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Remaining inventory is allocated to General Admission using Gale-Shapley deferred acceptance. Guided Preference overrides act as weighted first-choice signals in this pass.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-surface border border-border">
                <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">Admin overrides:</span> Hard Lock assignments are injected before Pass 1 and consume inventory from the general pool. Guided Preferences are weighted as top-ranked first choices in Pass 2 but do not guarantee placement.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-display text-base font-semibold text-foreground">Gale-Shapley Matching Engine</h3>
                <p className="text-xs text-muted-foreground mt-1">Two-pass deferred acceptance — Pass 1 satisfies VIP + Hard Lock, Pass 2 applies GA best-fit</p>
              </div>
              <div className="p-5">
                {engineState === "idle" && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-7 h-7 text-amber-400" />
                    </div>
                    <p className="text-foreground font-medium mb-1">Ready to run</p>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      1,847 attendees · 200 events · 8 windows · 142 Squads · 4 Hard Lock overrides. Estimated runtime: ~4 seconds.
                    </p>
                    <button onClick={runEngine} className="px-8 py-3 bg-amber-400 text-background rounded-xl font-semibold hover:bg-amber-300 transition-colors flex items-center gap-2 mx-auto">
                      <Play className="w-4 h-4" /> Run Matching Engine
                    </button>
                  </div>
                )}

                {engineState === "running" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Processing...</span>
                      <span className="text-sm text-amber-400 font-mono">{engineProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden mb-4">
                      <motion.div className="h-full rounded-full bg-amber-400" style={{ width: `${engineProgress}%` }} transition={{ duration: 0.3 }} />
                    </div>
                    <div className="bg-surface rounded-xl p-4 font-mono text-xs text-muted-foreground space-y-1 max-h-56 overflow-y-auto">
                      {engineLog.map((entry, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                          <span className={`flex-shrink-0 ${entry.phase === 'vip' ? 'text-amber-400' : entry.phase === 'ga' ? 'text-blue-400' : entry.phase === 'finalize' ? 'text-emerald-400' : 'text-muted-foreground/60'}`}>›</span>
                          <span className={`${entry.phase === 'vip' ? 'text-amber-300/90' : entry.phase === 'ga' ? 'text-blue-300/90' : entry.phase === 'finalize' ? 'text-emerald-300/90' : ''}`}>{entry.msg}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {engineState === "complete" && showResults && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Match Complete</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Pass 1 — VIP</p>
                        </div>
                        <p className="font-display text-2xl font-bold text-amber-400">98.4%</p>
                        <p className="text-xs text-muted-foreground mt-0.5">first-choice satisfaction</p>
                        <p className="text-xs text-muted-foreground">307 / 312 VIP attendees matched</p>
                      </div>
                      <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Pass 2 — GA</p>
                        </div>
                        <p className="font-display text-2xl font-bold text-blue-400">89.1%</p>
                        <p className="text-xs text-muted-foreground mt-0.5">first or second choice</p>
                        <p className="text-xs text-muted-foreground">1,484 / 1,535 GA attendees matched</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      {[
                        { label: "Total Matched",   value: MOCK_ALLOCATION_RESULTS.matched.toLocaleString(), color: "text-emerald-400" },
                        { label: "Buffer Pool",      value: MOCK_ALLOCATION_RESULTS.unmatched.toString(),     color: "text-rose-400" },
                        { label: "1st Choice",       value: MOCK_ALLOCATION_RESULTS.firstChoice.toLocaleString(), color: "text-amber-400" },
                        { label: "Overall Quality",  value: `${MOCK_ALLOCATION_RESULTS.matchQuality}%`,       color: "text-blue-400" },
                      ].map((s) => (
                        <div key={s.label} className="bg-surface rounded-xl p-3 text-center">
                          <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {MOCK_ALLOCATION_RESULTS.byWindow.map((w) => (
                        <div key={w.windowId} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                          <div className="w-36 text-xs text-muted-foreground">{w.windowLabel}</div>
                          <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(w.matched / (w.matched + w.unmatched)) * 100}%` }} />
                          </div>
                          <div className="text-xs text-foreground w-16 text-right">{w.matched} matched</div>
                          {w.unmatched > 0 && <div className="text-xs text-rose-400 w-16 text-right">{w.unmatched} unmatched</div>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button onClick={runEngine} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> Re-run
                      </button>
                      <button onClick={() => setActiveTab("buffer")} className="flex items-center gap-2 px-4 py-2 bg-rose-400/10 border border-rose-400/30 rounded-lg text-sm text-rose-400 hover:bg-rose-400/20 transition-colors">
                        <AlertTriangle className="w-3.5 h-3.5" /> Resolve {MOCK_ALLOCATION_RESULTS.unmatched} unmatched
                      </button>
                      <button onClick={() => { setItinerarySent(true); toast.success("Itineraries queued — 1,791 emails"); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-400/10 border border-emerald-400/30 rounded-lg text-sm text-emerald-400 hover:bg-emerald-400/20 transition-colors">
                        <Send className="w-3.5 h-3.5" /> {itinerarySent ? "Resend Itineraries" : "Deliver Itineraries"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ BUFFER POOL TAB ══ */}
        {activeTab === "buffer" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-3xl">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">Buffer Pool</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {BUFFER_POOL.length - assignedBuffer.length} unmatched attendees · 8 reserved seats per restaurant available
                  </p>
                </div>
                {engineState !== "complete" && (
                  <span className="text-xs text-muted-foreground bg-surface border border-border px-3 py-1.5 rounded-lg">Run engine first to populate</span>
                )}
              </div>
              <div className="divide-y divide-border">
                {BUFFER_POOL.map((person) => {
                  const isAssigned = assignedBuffer.includes(person.id);
                  return (
                    <div key={person.id} className={`p-4 transition-opacity ${isAssigned ? "opacity-40" : ""}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                            person.tier === 1 ? "bg-amber-400/20 text-amber-400" : person.tier === 2 ? "bg-blue-400/20 text-blue-400" : "bg-surface text-muted-foreground"
                          }`}>
                            {person.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{person.name}</p>
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">Tier {person.tier}</span>
                            </div>
                            <p className="text-xs text-rose-400 mt-0.5">{person.reason}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {person.windows.map((w) => (
                                <span key={w} className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">
                                  {TIME_WINDOWS.find((tw) => tw.id === w)?.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {!isAssigned ? (
                          <button
                            onClick={() => assignBufferAttendee(person.id, "Provisions")}
                            className="px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-400/20 transition-colors flex-shrink-0"
                          >
                            Assign manually
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Assigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ INVENTORY TAB ══ */}
        {activeTab === "inventory" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">Event Inventory</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Default: 72 allocated + 8 buffer = 80 physical seats per event</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-xs text-blue-400 font-medium flex-shrink-0">
                    <Settings2 className="w-3 h-3" /> 2 dynamic
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-surface border border-border">
                  <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-foreground font-medium">Dynamic capacity review:</span> Before the June 1 programming lock, venues with flexible seating may be approved for expanded capacity. Expanding a venue increases both VIP and GA seat pools and improves overall match quality.
                  </p>
                </div>
              </div>
              <div className="divide-y divide-border">
                {RESTAURANTS_SAMPLE.map((event) => {
                  const effectiveCapacity = event.dynamicCapacity ?? event.capacity;
                  const pct = (event.filled / effectiveCapacity) * 100;
                  const isFull = event.filled >= effectiveCapacity;
                  const isDynamic = event.dynamicCapacity !== null;
                  return (
                    <div key={event.id + event.window} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{event.name}</p>
                            {isFull && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">Full</span>}
                            {isDynamic && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-400 border border-blue-400/30 flex items-center gap-1">
                                <Settings2 className="w-2.5 h-2.5" /> Dynamic
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{event.chef} · {event.window}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-foreground">{event.filled}/{effectiveCapacity}</p>
                          {isDynamic ? <p className="text-xs text-blue-400">expanded from {event.capacity}</p> : <p className="text-xs text-muted-foreground">+{event.buffer} buffer</p>}
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isFull ? "bg-amber-400" : isDynamic ? "bg-blue-400" : "bg-emerald-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ TIMELINE TAB ══ */}
        {activeTab === "timeline" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-3xl">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-display text-base font-semibold text-foreground">Project Timeline</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Key milestones from ticket sales through festival delivery</p>
              </div>
              <div className="p-5">
                <div className="relative">
                  <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border" />
                  <div className="space-y-6">
                    {TIMELINE_MILESTONES.map((m, i) => (
                      <div key={i} className="flex gap-5 relative">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${m.icon === 'festival' ? 'bg-amber-400 border-amber-400' : 'bg-card border-border'}`}>
                          {m.icon === 'ticket'      && <span className="text-[10px]">🎟</span>}
                          {m.icon === 'programming' && <span className="text-[10px]">📋</span>}
                          {m.icon === 'preferences' && <span className="text-[10px]">⭐</span>}
                          {m.icon === 'deadline'    && <span className="text-[10px]">⏰</span>}
                          {m.icon === 'engine'      && <Zap className="w-3 h-3 text-amber-400" />}
                          {m.icon === 'delivery'    && <Send className="w-3 h-3 text-blue-400" />}
                          {m.icon === 'festival'    && <span className="text-[10px]">🍽</span>}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-foreground">{m.label}</p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">{m.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* SMS Modal */}
      <AnimatePresence>
        {smsModal && (
          <SmsInviteModal
            attendee={smsModal}
            onClose={() => setSmsModal(null)}
            onSent={(phone) => handleSmsSent(smsModal.id, phone)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
