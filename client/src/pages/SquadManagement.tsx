// Design: Dark Culinary Editorial — chef-as-hero visual language, amber accent system
// Philosophy: Two distinct squad formation flows; day-level membership granularity;
// conflict-aware preference override modal; Squad Manager delegation with phone capture.

import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Users, Plus, Copy, Check, X, UserPlus,
  Crown, AlertCircle, Mail, Ticket, Calendar, ChevronDown, ChevronUp,
  Send, Info, CheckCircle2, XCircle, Clock, ExternalLink,
  Shield, Phone, Star, Edit2
} from "lucide-react";
import { toast } from "sonner";

// ─── Constants ──────────────────────────────────────────────────────────────

const DAYS = [
  { id: "thu", label: "Thu", full: "Thursday Aug 13", windows: ["thu-dinner"] },
  { id: "fri", label: "Fri", full: "Friday Aug 14",   windows: ["fri-lunch", "fri-dinner"] },
  { id: "sat", label: "Sat", full: "Saturday Aug 15", windows: ["sat-lunch", "sat-dinner"] },
  { id: "sun", label: "Sun", full: "Sunday Aug 16",   windows: ["sun-brunch"] },
];

const MOCK_ROSTER: Record<string, { name: string; tier: string; ticketId: string; days: string[] }> = {
  "j.park@gs.com":      { name: "James Park",    tier: "VIP",  ticketId: "CT-2026-0042", days: ["fri","sat","sun"] },
  "l.chen@gs.com":      { name: "Linda Chen",     tier: "GA",   ticketId: "CT-2026-0117", days: ["fri","sat"] },
  "r.okafor@firm.com":  { name: "Remi Okafor",    tier: "VVIP", ticketId: "CT-2026-0008", days: ["thu","fri","sat","sun"] },
  "t.walsh@corp.com":   { name: "Thomas Walsh",   tier: "GA",   ticketId: "CT-2026-0203", days: ["sat","sun"] },
};

const MOCK_MY_PREFS: Record<string, string> = {
  "fri-lunch":  "Chef Nobu Matsuhisa",
  "fri-dinner": "Chef Thomas Keller",
  "sat-lunch":  "Chef Dominique Crenn",
  "sat-dinner": "Chef René Redzepi",
};

const MOCK_SQUAD_PREFS: Record<string, string> = {
  "fri-lunch":  "Chef Grant Achatz",
  "fri-dinner": "Chef Thomas Keller",
  "sat-lunch":  "Chef Heston Blumenthal",
  "sat-dinner": "Chef René Redzepi",
};

const COUNTRY_CODES = [
  { code: "+1",  label: "US/CA" },
  { code: "+44", label: "UK" },
  { code: "+61", label: "AU" },
  { code: "+33", label: "FR" },
  { code: "+49", label: "DE" },
  { code: "+81", label: "JP" },
  { code: "+86", label: "CN" },
  { code: "+971", label: "UAE" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type MemberStatus = "pending" | "accepted" | "declined";

interface TicketSlot {
  id: string;
  assignedName: string;
  assignedEmail: string;
  days: string[];
  status: MemberStatus;
  isSquadManager: boolean;
  phone: string; // only required if isSquadManager
}

interface ExternalInvite {
  email: string;
  foundRecord: typeof MOCK_ROSTER[string] | null;
  days: string[];
  status: MemberStatus;
  instructionsSent: boolean;
}

interface ConflictWindow {
  windowId: string;
  windowLabel: string;
  myPref: string;
  squadPref: string;
  choice: "mine" | "squad" | null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DayPills({
  availableDays,
  selectedDays,
  onChange,
  compact = false,
}: {
  availableDays: string[];
  selectedDays: string[];
  onChange: (days: string[]) => void;
  compact?: boolean;
}) {
  const toggle = (id: string) => {
    if (!availableDays.includes(id)) return;
    onChange(
      selectedDays.includes(id)
        ? selectedDays.filter((d) => d !== id)
        : [...selectedDays, id]
    );
  };
  return (
    <div className="flex gap-1.5 flex-wrap">
      {DAYS.map((d) => {
        const available = availableDays.includes(d.id);
        const selected = selectedDays.includes(d.id);
        return (
          <button
            key={d.id}
            onClick={() => toggle(d.id)}
            disabled={!available}
            title={available ? d.full : `Not attending ${d.full}`}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
              !available
                ? "border-border/30 text-muted-foreground/30 cursor-not-allowed"
                : selected
                ? "bg-amber-400 border-amber-400 text-background"
                : "border-border text-muted-foreground hover:border-amber-400/50 hover:text-amber-400"
            } ${compact ? "text-[11px] px-2 py-0.5" : ""}`}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: MemberStatus }) {
  if (status === "accepted") return (
    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
    </span>
  );
  if (status === "declined") return (
    <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
      <XCircle className="w-3.5 h-3.5" /> Declined
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
      <Clock className="w-3.5 h-3.5" /> Invited
    </span>
  );
}

// ─── Squad Manager Delegation Modal ──────────────────────────────────────────

function SquadManagerModal({
  slotName,
  currentPhone,
  onConfirm,
  onCancel,
}: {
  slotName: string;
  currentPhone: string;
  onConfirm: (phone: string) => void;
  onCancel: () => void;
}) {
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState(currentPhone.replace(/^\+\d+\s?/, ""));

  const handleConfirm = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    onConfirm(`${countryCode} ${phone.trim()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-card border border-amber-400/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">Assign Squad Manager</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                <strong className="text-foreground">{slotName}</strong> will become the Squad Manager. Their dining selections will take precedence for all coordinated windows, and they will be able to update attendee information.
              </p>
            </div>
          </div>
        </div>

        {/* Phone input */}
        <div className="p-5 space-y-4">
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
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} {c.label}</option>
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
              Required for operations coordination. The admin team may contact the Squad Manager directly if schedule changes arise.
            </p>
          </div>

          {/* Permissions summary */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground mb-2">Squad Manager permissions</p>
            {[
              { icon: Star,       label: "Preference authority — their selections prevail for coordinated windows" },
              { icon: Edit2,      label: "Can update name, email, and day selections for any squad member" },
              { icon: Calendar,   label: "Can adjust which days each member participates in the squad" },
              { icon: Phone,      label: "Reachable by ops team via the registered mobile number" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:border-amber-400/30 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-amber-400 text-background text-sm font-semibold hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-3.5 h-3.5" /> Assign Manager
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Conflict Override Modal ──────────────────────────────────────────────────

function ConflictModal({
  memberName,
  conflicts,
  onResolve,
  onCancel,
}: {
  memberName: string;
  conflicts: ConflictWindow[];
  onResolve: (resolved: ConflictWindow[]) => void;
  onCancel: () => void;
}) {
  const [local, setLocal] = useState<ConflictWindow[]>(conflicts);
  const allResolved = local.every((c) => c.choice !== null);

  const setChoice = (windowId: string, choice: "mine" | "squad") => {
    setLocal((prev) => prev.map((c) => c.windowId === windowId ? { ...c, choice } : c));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-card border border-amber-400/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-5 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">Preference Conflict</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                <strong className="text-foreground">{memberName}</strong> has already submitted preferences for some of these windows.
                Choose which preference applies for each conflicting window.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border max-h-72 overflow-y-auto">
          {local.map((c) => (
            <div key={c.windowId} className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{c.windowLabel}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setChoice(c.windowId, "mine")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    c.choice === "mine"
                      ? "bg-blue-500/15 border-blue-400/60 ring-1 ring-blue-400/40"
                      : "bg-surface border-border hover:border-blue-400/30"
                  }`}
                >
                  <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1">My preference</p>
                  <p className="text-xs text-foreground font-medium leading-snug">{c.myPref}</p>
                  {c.choice === "mine" && <Check className="w-3.5 h-3.5 text-blue-400 mt-1.5" />}
                </button>
                <button
                  onClick={() => setChoice(c.windowId, "squad")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    c.choice === "squad"
                      ? "bg-amber-400/15 border-amber-400/60 ring-1 ring-amber-400/40"
                      : "bg-surface border-border hover:border-amber-400/30"
                  }`}
                >
                  <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide mb-1">Squad preference</p>
                  <p className="text-xs text-foreground font-medium leading-snug">{c.squadPref}</p>
                  {c.choice === "squad" && <Check className="w-3.5 h-3.5 text-amber-400 mt-1.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:border-amber-400/30 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!allResolved}
            onClick={() => onResolve(local)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              allResolved
                ? "bg-amber-400 text-background hover:bg-amber-300"
                : "bg-amber-400/20 text-amber-400/40 cursor-not-allowed"
            }`}
          >
            Confirm choices
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Email Instructions Modal ─────────────────────────────────────────────────

function InstructionsModal({
  member,
  onClose,
  onSent,
}: {
  member: { name: string; email: string; days: string[] };
  onClose: () => void;
  onSent: () => void;
}) {
  const dayLabels = member.days.map((d) => DAYS.find((x) => x.id === d)?.full).filter(Boolean).join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <h2 className="font-display text-base font-bold text-foreground">Join Instructions</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-foreground mb-3">Preview of the email that will be sent to <strong className="text-foreground">{member.email}</strong>:</p>
          <div className="bg-surface border border-border rounded-xl p-4 text-sm space-y-3">
            <p className="font-semibold text-foreground">You've been invited to join a Chef's Table Squad</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              <strong className="text-foreground">{member.name}</strong>, you have been added to a dining squad for the following days:
            </p>
            <p className="text-amber-400 text-xs font-medium">{dayLabels}</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              As a squad member, your dining preferences for these windows will be coordinated with your group. You may accept or decline per-day participation in your attendee portal.
            </p>
            <div className="bg-background border border-border rounded-lg p-3 text-xs font-mono text-foreground">
              Join link: <span className="text-amber-400">https://ct2026.com/squad/join/ALPHA1</span>
            </div>
            <p className="text-muted-foreground text-xs">
              If you have already submitted preferences for any of these windows, you will be prompted to resolve any conflicts when you accept.
            </p>
          </div>
        </div>
        <div className="p-4 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:border-amber-400/30 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onSent(); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-amber-400 text-background text-sm font-semibold hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" /> Send email
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SquadManagement() {
  const [activeTab, setActiveTab] = useState<"flow1" | "flow2">("flow1");

  // ── Flow 1 state ──
  const [ticketSlots, setTicketSlots] = useState<TicketSlot[]>([
    { id: "host", assignedName: "Sarah Chen (you)", assignedEmail: "sarah.chen@gs.com", days: ["thu","fri","sat","sun"], status: "accepted", isSquadManager: false, phone: "" },
    { id: "t001", assignedName: "", assignedEmail: "", days: ["fri","sat","sun"], status: "pending", isSquadManager: false, phone: "" },
    { id: "t002", assignedName: "", assignedEmail: "", days: ["fri","sat","sun"], status: "pending", isSquadManager: false, phone: "" },
    { id: "t003", assignedName: "", assignedEmail: "", days: ["fri","sat","sun"], status: "pending", isSquadManager: false, phone: "" },
  ]);
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<{ id: string; name: string; email: string } | null>(null);
  const [squadManagerModal, setSquadManagerModal] = useState<{ slotId: string; slotName: string; currentPhone: string } | null>(null);

  // ── Flow 2 state ──
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<"idle" | "not-found" | "found">("idle");
  const [foundRecord, setFoundRecord] = useState<typeof MOCK_ROSTER[string] | null>(null);
  const [externalInvites, setExternalInvites] = useState<ExternalInvite[]>([]);
  const [pendingInviteDays, setPendingInviteDays] = useState<string[]>([]);
  const [showInstructionsModal, setShowInstructionsModal] = useState<ExternalInvite | null>(null);

  // ── Conflict modal ──
  const [conflictModal, setConflictModal] = useState<{
    memberName: string;
    conflicts: ConflictWindow[];
    onResolve: (resolved: ConflictWindow[]) => void;
  } | null>(null);

  const currentManagerId = ticketSlots.find((s) => s.isSquadManager)?.id ?? null;

  // ─── Flow 1 helpers ──────────────────────────────────────────────────────

  const saveSlotAssignment = (id: string) => {
    if (!editingSlot || !editingSlot.name.trim() || !editingSlot.email.trim()) {
      toast.error("Please enter both name and email.");
      return;
    }
    setTicketSlots((prev) =>
      prev.map((s) => s.id === id ? { ...s, assignedName: editingSlot.name, assignedEmail: editingSlot.email } : s)
    );
    setEditingSlot(null);
    toast.success(`Ticket assigned to ${editingSlot.name} — invite link ready to send.`);
  };

  const sendSlotInvite = (slot: TicketSlot) => {
    if (!slot.assignedEmail) { toast.error("Assign a person first."); return; }
    toast.success(`Invite sent to ${slot.assignedEmail}`);
  };

  const updateSlotDays = (id: string, days: string[]) => {
    setTicketSlots((prev) => prev.map((s) => s.id === id ? { ...s, days } : s));
  };

  const openSquadManagerModal = (slot: TicketSlot) => {
    setSquadManagerModal({ slotId: slot.id, slotName: slot.assignedName, currentPhone: slot.phone });
  };

  const confirmSquadManager = (phone: string) => {
    if (!squadManagerModal) return;
    setTicketSlots((prev) =>
      prev.map((s) => ({
        ...s,
        isSquadManager: s.id === squadManagerModal.slotId,
        phone: s.id === squadManagerModal.slotId ? phone : s.phone,
      }))
    );
    const name = ticketSlots.find((s) => s.id === squadManagerModal.slotId)?.assignedName ?? "";
    toast.success(`${name} is now the Squad Manager`);
    setSquadManagerModal(null);
  };

  const removeSquadManager = (slotId: string) => {
    setTicketSlots((prev) =>
      prev.map((s) => s.id === slotId ? { ...s, isSquadManager: false, phone: "" } : s)
    );
    toast.info("Squad Manager role removed. The host's preferences will now prevail.");
  };

  // ─── Flow 2 helpers ──────────────────────────────────────────────────────

  const handleEmailSearch = () => {
    const email = searchEmail.trim().toLowerCase();
    if (!email) return;
    const record = MOCK_ROSTER[email] ?? null;
    if (record) {
      setFoundRecord(record);
      setPendingInviteDays([...record.days]);
      setSearchResult("found");
    } else {
      setFoundRecord(null);
      setSearchResult("not-found");
    }
  };

  const buildConflicts = (days: string[]): ConflictWindow[] => {
    const windows = days.flatMap((d) => DAYS.find((x) => x.id === d)?.windows ?? []);
    return windows
      .filter((w) => MOCK_MY_PREFS[w] && MOCK_SQUAD_PREFS[w] && MOCK_MY_PREFS[w] !== MOCK_SQUAD_PREFS[w])
      .map((w) => ({
        windowId: w,
        windowLabel: w.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        myPref: MOCK_MY_PREFS[w],
        squadPref: MOCK_SQUAD_PREFS[w],
        choice: null,
      }));
  };

  const addExternalInvite = () => {
    if (!foundRecord) return;
    const email = searchEmail.trim().toLowerCase();
    if (externalInvites.find((i) => i.email === email)) {
      toast.info("This person is already in your squad.");
      return;
    }
    const conflicts = buildConflicts(pendingInviteDays);
    const doAdd = (resolvedConflicts?: ConflictWindow[]) => {
      setExternalInvites((prev) => [
        ...prev,
        { email, foundRecord, days: pendingInviteDays, status: "pending", instructionsSent: false },
      ]);
      if (resolvedConflicts) {
        const overrides = resolvedConflicts.filter((c) => c.choice === "squad").map((c) => c.windowLabel);
        if (overrides.length) toast.info(`Squad preference applied for: ${overrides.join(", ")}`);
      }
      toast.success(`${foundRecord!.name} added — send them join instructions below.`);
      setSearchEmail("");
      setSearchResult("idle");
      setFoundRecord(null);
    };

    if (conflicts.length > 0) {
      setConflictModal({
        memberName: foundRecord.name,
        conflicts,
        onResolve: (resolved) => { setConflictModal(null); doAdd(resolved); },
      });
    } else {
      doAdd();
    }
  };

  const removeExternalInvite = (email: string) => {
    setExternalInvites((prev) => prev.filter((i) => i.email !== email));
    toast.info("Member removed from squad.");
  };

  const updateExternalDays = (email: string, days: string[]) => {
    setExternalInvites((prev) => prev.map((i) => i.email === email ? { ...i, days } : i));
  };

  const markInstructionsSent = (email: string) => {
    setExternalInvites((prev) => prev.map((i) => i.email === email ? { ...i, instructionsSent: true } : i));
    toast.success("Join instructions sent!");
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur z-20">
        <Link href="/">
          <button className="p-2 rounded-lg hover:bg-surface transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-lg font-semibold text-foreground">Squad Management</h1>
          <p className="text-xs text-muted-foreground">Coordinate group dining preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {currentManagerId ? (
            <div className="flex items-center gap-1.5 text-xs bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-full px-3 py-1.5">
              <Shield className="w-3.5 h-3.5" />
              Manager assigned
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-surface border border-border rounded-full px-3 py-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Squad Leader
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {/* How squads work */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-2xl p-5 mb-6"
        >
          <h2 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" /> How Squad Dining Works
          </h2>
          <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
            <p>Squads allow groups to coordinate dining preferences so the matching engine places you together. You elect which <strong className="text-foreground">days</strong> each member joins the squad — members not in the squad for a given day submit their own preferences independently.</p>
            <p>The ticket purchaser is the default Squad Leader. You may delegate the <strong className="text-foreground">Squad Manager</strong> role to any assigned attendee — their selections will then prevail for coordinated windows, and they can update attendee information on behalf of the group.</p>
            <p className="text-amber-400/80">Your squad inherits the priority tier of its lowest-tier member for shared windows.</p>
          </div>
        </motion.div>

        {/* Flow selector */}
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab("flow1")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "flow1" ? "bg-amber-400 text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Ticket className="w-4 h-4" />
            I bought multiple tickets
          </button>
          <button
            onClick={() => setActiveTab("flow2")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "flow2" ? "bg-amber-400 text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Invite someone by email
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* ═══ FLOW 1 ═══ */}
          {activeTab === "flow1" && (
            <motion.div
              key="flow1"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-4">
                <h2 className="font-display text-base font-semibold text-foreground">Your Ticket Pool</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You purchased 4 tickets. Assign each ticket to an attendee, select their days, and optionally delegate the Squad Manager role.
                </p>
              </div>

              <div className="space-y-3">
                {ticketSlots.map((slot, idx) => {
                  const isHost = slot.id === "host";
                  const isExpanded = expandedSlot === slot.id;
                  const isEditing = editingSlot?.id === slot.id;
                  const hasAssignee = !!slot.assignedName;
                  const isManager = slot.isSquadManager;

                  return (
                    <motion.div
                      key={slot.id}
                      layout
                      className={`bg-card border rounded-2xl overflow-hidden transition-colors ${
                        isManager
                          ? "border-amber-400/50"
                          : isHost
                          ? "border-amber-400/30"
                          : hasAssignee
                          ? "border-border"
                          : "border-dashed border-border"
                      }`}
                    >
                      {/* Slot header */}
                      <div
                        className="flex items-center gap-3 p-4 cursor-pointer"
                        onClick={() => !isHost && setExpandedSlot(isExpanded ? null : slot.id)}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isHost
                            ? "bg-amber-400 text-background"
                            : isManager
                            ? "bg-amber-400/20 border border-amber-400/50 text-amber-400"
                            : hasAssignee
                            ? "bg-surface border border-border text-foreground"
                            : "bg-surface border border-dashed border-border text-muted-foreground/40"
                        }`}>
                          {isHost ? <Crown className="w-4 h-4" /> : isManager ? <Shield className="w-4 h-4" /> : hasAssignee ? slot.assignedName[0] : <Plus className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-medium truncate ${hasAssignee ? "text-foreground" : "text-muted-foreground"}`}>
                              {hasAssignee ? slot.assignedName : `Ticket ${idx + 1} — Unassigned`}
                            </p>
                            {isHost && <span className="text-xs text-amber-400 font-medium">You · Leader</span>}
                            {isManager && (
                              <span className="flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                                <Shield className="w-2.5 h-2.5" /> Squad Manager
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {hasAssignee ? slot.assignedEmail : "Click to assign"}
                          </p>
                          {isManager && slot.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5" /> {slot.phone}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {hasAssignee && <StatusBadge status={slot.status} />}
                          {!isHost && (
                            isExpanded
                              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {isExpanded && !isHost && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 border-t border-border space-y-4">

                              {/* Name + email */}
                              {isEditing ? (
                                <div className="space-y-2 pt-4">
                                  <input
                                    autoFocus
                                    placeholder="Full name"
                                    value={editingSlot?.name ?? ""}
                                    onChange={(e) => setEditingSlot((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400/60"
                                  />
                                  <input
                                    placeholder="Email address"
                                    value={editingSlot?.email ?? ""}
                                    onChange={(e) => setEditingSlot((prev) => prev ? { ...prev, email: e.target.value } : prev)}
                                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400/60"
                                  />
                                  <div className="flex gap-2">
                                    <button onClick={() => setEditingSlot(null)} className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:border-amber-400/30 transition-colors">Cancel</button>
                                    <button onClick={() => saveSlotAssignment(slot.id)} className="flex-1 py-2 rounded-xl bg-amber-400 text-background text-sm font-semibold hover:bg-amber-300 transition-colors">Save</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="pt-4">
                                  {hasAssignee ? (
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        <p className="text-sm font-medium text-foreground">{slot.assignedName}</p>
                                        <p className="text-xs text-muted-foreground">{slot.assignedEmail}</p>
                                      </div>
                                      <button
                                        onClick={() => setEditingSlot({ id: slot.id, name: slot.assignedName, email: slot.assignedEmail })}
                                        className="text-xs text-muted-foreground hover:text-amber-400 transition-colors underline underline-offset-2"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setEditingSlot({ id: slot.id, name: "", email: "" })}
                                      className="w-full py-2.5 mb-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-amber-400/40 hover:text-amber-400 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <UserPlus className="w-4 h-4" /> Assign attendee
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Day selector */}
                              {!isEditing && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Days in squad</p>
                                  <DayPills
                                    availableDays={["thu","fri","sat","sun"]}
                                    selectedDays={slot.days}
                                    onChange={(days) => updateSlotDays(slot.id, days)}
                                  />
                                  <p className="text-[11px] text-muted-foreground mt-1.5">Only selected days will be coordinated as a group.</p>
                                </div>
                              )}

                              {/* Squad Manager section */}
                              {!isEditing && hasAssignee && (
                                <div className={`rounded-xl border p-3 ${isManager ? "bg-amber-400/5 border-amber-400/30" : "bg-surface border-border"}`}>
                                  {isManager ? (
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                                          <p className="text-xs font-semibold text-amber-400">Squad Manager</p>
                                        </div>
                                        <button
                                          onClick={() => removeSquadManager(slot.id)}
                                          className="text-[11px] text-muted-foreground hover:text-rose-400 transition-colors underline underline-offset-2"
                                        >
                                          Remove role
                                        </button>
                                      </div>
                                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        This person's selections prevail for all coordinated windows. They can update attendee information on behalf of the group.
                                      </p>
                                      {slot.phone && (
                                        <p className="text-[11px] text-amber-400/80 mt-1.5 flex items-center gap-1">
                                          <Phone className="w-2.5 h-2.5" /> {slot.phone}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-xs font-medium text-foreground">Delegate Squad Manager</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Give this person preference authority over the group</p>
                                      </div>
                                      <button
                                        onClick={() => openSquadManagerModal(slot)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-xs text-amber-400 font-medium hover:bg-amber-400/20 transition-colors"
                                      >
                                        <Shield className="w-3 h-3" /> Assign
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Send invite */}
                              {!isEditing && hasAssignee && (
                                <button
                                  onClick={() => sendSlotInvite(slot)}
                                  className="w-full py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 text-sm font-medium hover:bg-amber-400/20 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Send className="w-3.5 h-3.5" /> Send access link
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Host day pills */}
                      {isHost && (
                        <div className="px-4 pb-4 flex items-center gap-3">
                          <p className="text-[11px] text-muted-foreground shrink-0">All days:</p>
                          <DayPills availableDays={["thu","fri","sat","sun"]} selectedDays={slot.days} onChange={() => {}} compact />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Squad Manager summary banner */}
              {currentManagerId && currentManagerId !== "host" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start gap-3 p-4 bg-amber-400/10 border border-amber-400/30 rounded-2xl"
                >
                  <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-400">
                      {ticketSlots.find((s) => s.id === currentManagerId)?.assignedName} is the Squad Manager
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Their dining selections will prevail for all coordinated windows. The operations team may contact them at {ticketSlots.find((s) => s.id === currentManagerId)?.phone} if schedule changes arise.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Squad invite link */}
              <div className="mt-6 bg-surface border border-border rounded-2xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Squad invite link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-muted-foreground truncate">
                    https://ct2026.com/squad/join/ALPHA1
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText("https://ct2026.com/squad/join/ALPHA1").catch(() => {}); toast.success("Link copied"); }}
                    className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">Anyone with this link can join your squad. They will be prompted to select their days and resolve any preference conflicts.</p>
              </div>
            </motion.div>
          )}

          {/* ═══ FLOW 2 ═══ */}
          {activeTab === "flow2" && (
            <motion.div
              key="flow2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-4">
                <h2 className="font-display text-base font-semibold text-foreground">Invite by Email</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The person you want to invite purchased their own ticket. Enter their email to look them up and send join instructions.
                </p>
              </div>

              {/* Email search */}
              <div className="bg-card border border-border rounded-2xl p-5 mb-5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Attendee email address</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="e.g. j.park@gs.com"
                    value={searchEmail}
                    onChange={(e) => { setSearchEmail(e.target.value); setSearchResult("idle"); setFoundRecord(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailSearch()}
                    className="flex-1 bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400/60"
                  />
                  <button
                    onClick={handleEmailSearch}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 text-background text-sm font-semibold hover:bg-amber-300 transition-colors"
                  >
                    Look up
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Try: j.park@gs.com · l.chen@gs.com · r.okafor@firm.com · t.walsh@corp.com
                </p>

                <AnimatePresence>
                  {searchResult === "not-found" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-400">No booking found</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <strong className="text-foreground">{searchEmail}</strong> does not appear on the attendee roster. They must purchase a ticket before they can join your squad.
                        </p>
                        <button
                          onClick={() => { navigator.clipboard.writeText("https://ct2026.com/checkout").catch(() => {}); toast.success("Checkout link copied"); }}
                          className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Copy ticket purchase link
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {searchResult === "found" && foundRecord && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 space-y-4"
                    >
                      <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0">
                          {foundRecord.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{foundRecord.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-medium border border-amber-400/30">{foundRecord.tier}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{searchEmail} · {foundRecord.ticketId}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Select days for squad coordination</p>
                        <DayPills availableDays={foundRecord.days} selectedDays={pendingInviteDays} onChange={setPendingInviteDays} />
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                          Grey days are not on {foundRecord.name.split(" ")[0]}'s ticket. Only selected days will be coordinated as a group.
                        </p>
                      </div>

                      {buildConflicts(pendingInviteDays).length > 0 && (
                        <div className="flex items-start gap-2.5 p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-amber-400">{buildConflicts(pendingInviteDays).length} preference conflict{buildConflicts(pendingInviteDays).length > 1 ? "s" : ""} detected</strong> for the selected days. You'll be asked to resolve them window-by-window before adding {foundRecord.name.split(" ")[0]}.
                          </p>
                        </div>
                      )}

                      <button
                        disabled={pendingInviteDays.length === 0}
                        onClick={addExternalInvite}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          pendingInviteDays.length > 0
                            ? "bg-amber-400 text-background hover:bg-amber-300"
                            : "bg-amber-400/20 text-amber-400/40 cursor-not-allowed"
                        }`}
                      >
                        <UserPlus className="w-4 h-4" /> Add to squad
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* External invite list */}
              {externalInvites.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Squad Members</h3>
                  <div className="space-y-3">
                    {externalInvites.map((inv) => (
                      <motion.div key={inv.email} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-sm font-bold text-foreground flex-shrink-0">
                              {inv.foundRecord?.name[0] ?? "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium text-foreground">{inv.foundRecord?.name}</p>
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">{inv.foundRecord?.tier}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{inv.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={inv.status} />
                              <button onClick={() => removeExternalInvite(inv.email)} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
                                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <p className="text-[11px] text-muted-foreground shrink-0">Days:</p>
                            <DayPills availableDays={inv.foundRecord?.days ?? []} selectedDays={inv.days} onChange={(days) => updateExternalDays(inv.email, days)} compact />
                          </div>
                          <div className="mt-3 flex gap-2">
                            {inv.instructionsSent ? (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Instructions sent
                              </div>
                            ) : (
                              <button onClick={() => setShowInstructionsModal(inv)} className="flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-medium">
                                <Mail className="w-3.5 h-3.5" /> Send join instructions
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {externalInvites.length === 0 && searchResult === "idle" && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>No squad members yet.</p>
                  <p className="text-xs mt-1">Search for an attendee above to get started.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {squadManagerModal && (
          <SquadManagerModal
            slotName={squadManagerModal.slotName}
            currentPhone={squadManagerModal.currentPhone}
            onConfirm={confirmSquadManager}
            onCancel={() => setSquadManagerModal(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {conflictModal && (
          <ConflictModal
            memberName={conflictModal.memberName}
            conflicts={conflictModal.conflicts}
            onResolve={conflictModal.onResolve}
            onCancel={() => setConflictModal(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstructionsModal && (
          <InstructionsModal
            member={{ name: showInstructionsModal.foundRecord?.name ?? "", email: showInstructionsModal.email, days: showInstructionsModal.days }}
            onClose={() => setShowInstructionsModal(null)}
            onSent={() => markInstructionsSent(showInstructionsModal.email)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
