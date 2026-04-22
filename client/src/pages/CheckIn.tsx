// Chef's Table Festival — Check-In Application
// Design: Dark Ops Dashboard — staff-facing, high-contrast, large status indicators
// Simulates: ID scan (barcode parse), age verification, fuzzy name matching, manual override
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ScanLine, CheckCircle2, XCircle, AlertTriangle,
  Search, Users, Clock, ChevronDown, Shield, Camera, RefreshCw, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_ROSTER, fuzzyMatchName, TIME_WINDOWS } from "@/lib/mockData";
import { SessionStats, StatusPill, FuzzyMatchBadge, DeniedOverlay } from "@/components/ct";

type CheckInResult = "success" | "fuzzy" | "not-found" | "underage" | null;

interface ScanResult {
  firstName: string;
  lastName: string;
  dob: string;
  idNumber: string;
  age: number;
  isAdult: boolean;
}

interface MatchResult {
  attendee: typeof MOCK_ROSTER[0];
  confidence: number;
  matchType: "exact" | "alias" | "fuzzy" | "manual";
}

// Simulate a set of "scanned" IDs for the demo
const DEMO_SCANS: Record<string, ScanResult> = {
  "sarah": { firstName: "Sarah", lastName: "Chen", dob: "1988-03-15", idNumber: "UT-8842-9921", age: 37, isAdult: true },
  "bill": { firstName: "Bill", lastName: "Foster", dob: "1979-11-02", idNumber: "UT-3341-7712", age: 45, isAdult: true },
  "liz": { firstName: "Liz", lastName: "Park", dob: "2006-07-20", idNumber: "UT-9981-2234", age: 19, isAdult: true },
  "young": { firstName: "Tyler", lastName: "Young", dob: "2008-04-10", idNumber: "UT-1122-4456", age: 17, isAdult: false },
  "unknown": { firstName: "Marcus", lastName: "Webb", dob: "1990-05-22", idNumber: "UT-5567-8891", age: 35, isAdult: true },
};

const VENUES = [
  { id: "r01", name: "Provisions", chef: "Thomas Keller" },
  { id: "r02", name: "Sakura Omakase", chef: "Nobu Matsuhisa" },
  { id: "r08", name: "Nordic Table", chef: "René Redzepi" },
];

export default function CheckIn() {
  const [selectedVenue, setSelectedVenue] = useState(VENUES[0]);
  const [selectedWindow, setSelectedWindow] = useState(TIME_WINDOWS[2]); // Fri Dinner
  const [roster, setRoster] = useState(MOCK_ROSTER);
  const [scanInput, setScanInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInResult>(null);
  const [manualSearch, setManualSearch] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [stats, setStats] = useState({ checked: 3, total: 15, underage: 0, notFound: 0 });
  const [allergyModal, setAllergyModal] = useState<{ attendeeId: string; attendee: typeof MOCK_ROSTER[0] } | null>(null);
  const [allergyAcknowledged, setAllergyAcknowledged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus scan input on mount
  useEffect(() => {
    if (!manualMode) inputRef.current?.focus();
  }, [manualMode]);

  const simulateScan = (key: string) => {
    setScanning(true);
    setScanResult(null);
    setMatchResult(null);
    setCheckInResult(null);

    setTimeout(() => {
      const scan = DEMO_SCANS[key] || DEMO_SCANS["unknown"];
      setScanResult(scan);
      setScanning(false);

      if (!scan.isAdult) {
        setCheckInResult("underage");
        setStats((s) => ({ ...s, underage: s.underage + 1 }));
        toast.error(`Age verification failed — ${scan.firstName} ${scan.lastName} is ${scan.age} years old`);
        return;
      }

      // Fuzzy match against roster
      const fullName = `${scan.firstName} ${scan.lastName}`;
      let bestMatch: MatchResult | null = null;

      for (const attendee of roster) {
        if (attendee.checkedIn) continue;
        const score = fuzzyMatchName(fullName, attendee.name);
        if (score > 0 && (!bestMatch || score > bestMatch.confidence)) {
          bestMatch = {
            attendee,
            confidence: score,
            matchType: score === 1.0 ? "exact" : score >= 0.9 ? "alias" : "fuzzy",
          };
        }
      }

      if (bestMatch && bestMatch.confidence >= 0.75) {
        setMatchResult(bestMatch);
        setCheckInResult(bestMatch.confidence === 1.0 ? "success" : "fuzzy");
      } else {
        setCheckInResult("not-found");
        setStats((s) => ({ ...s, notFound: s.notFound + 1 }));
        toast.error(`No match found for ${fullName}`);
      }
    }, 800);
  };

  const confirmCheckIn = (attendeeId: string) => {
    const attendee = roster.find((a) => a.id === attendeeId);
    // If the attendee has allergies and we haven't acknowledged yet, show the modal
    if (attendee?.allergies?.length && !allergyAcknowledged) {
      setAllergyModal({ attendeeId, attendee });
      return;
    }
    // Proceed with check-in
    setRoster((prev) =>
      prev.map((a) =>
        a.id === attendeeId
          ? { ...a, checkedIn: true, checkedInAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }
          : a
      )
    );
    setStats((s) => ({ ...s, checked: s.checked + 1 }));
    const name = roster.find((a) => a.id === attendeeId)?.name;
    toast.success(`✓ ${name} checked in`);
    setAllergyAcknowledged(false);
    setAllergyModal(null);
    resetScan();
  };

  const acknowledgeAllergyAndCheckIn = () => {
    if (!allergyModal) return;
    setAllergyAcknowledged(true);
    const { attendeeId, attendee } = allergyModal;
    setRoster((prev) =>
      prev.map((a) =>
        a.id === attendeeId
          ? { ...a, checkedIn: true, checkedInAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }
          : a
      )
    );
    setStats((s) => ({ ...s, checked: s.checked + 1 }));
    toast.success(`✓ ${attendee.name} checked in — allergy alert acknowledged`);
    setAllergyModal(null);
    setAllergyAcknowledged(false);
    resetScan();
  };

  const resetScan = () => {
    setScanResult(null);
    setMatchResult(null);
    setCheckInResult(null);
    setScanInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const manualCheckIn = (attendeeId: string) => {
    const attendee = roster.find((a) => a.id === attendeeId);
    if (attendee?.allergies?.length) {
      setAllergyModal({ attendeeId, attendee });
      return;
    }
    setRoster((prev) =>
      prev.map((a) =>
        a.id === attendeeId
          ? { ...a, checkedIn: true, checkedInAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }
          : a
      )
    );
    setStats((s) => ({ ...s, checked: s.checked + 1 }));
    toast.success(`✓ ${attendee?.name} manually checked in`);
  };

  const filteredRoster = roster.filter((a) =>
    manualSearch === "" ||
    a.name.toLowerCase().includes(manualSearch.toLowerCase())
  );

  const pct = Math.round((stats.checked / stats.total) * 100);

  return (
    <>
    <DeniedOverlay
      open={checkInResult === "underage" && !!scanResult}
      onDismiss={resetScan}
      title="Denied"
      reason={scanResult ? `${scanResult.firstName} ${scanResult.lastName} is ${scanResult.age} years old` : "Underage guest"}
      detail="Alcohol service requires 21+"
      dismissLabel="Scan next guest"
    />
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
            <h1 className="font-display text-lg font-semibold text-foreground">Check-In</h1>
            <p className="text-xs text-muted-foreground">Door Staff · {selectedVenue.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Venue selector */}
          <select
            value={selectedVenue.id}
            onChange={(e) => setSelectedVenue(VENUES.find((v) => v.id === e.target.value) || VENUES[0])}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
          >
            {VENUES.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          {/* Window selector */}
          <select
            value={selectedWindow.id}
            onChange={(e) => setSelectedWindow(TIME_WINDOWS.find((w) => w.id === e.target.value) || TIME_WINDOWS[0])}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
          >
            {TIME_WINDOWS.map((w) => (
              <option key={w.id} value={w.id}>{w.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Scan Panel */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {/* Stats bar */}
          <SessionStats
            columns={4}
            className="mb-6"
            items={[
              { label: "Checked In", value: stats.checked, tone: "success" },
              { label: "Remaining", value: stats.total - stats.checked },
              { label: "Underage", value: stats.underage, tone: "destructive" },
              { label: "Not Found", value: stats.notFound, tone: "warning" },
            ]}
          />

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Check-in progress</span>
              <span className="text-amber-400 font-medium">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-amber-400"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => { setManualMode(false); resetScan(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !manualMode ? "bg-amber-400/15 text-amber-400 border border-amber-400/30" : "bg-surface text-muted-foreground border border-border"
              }`}
            >
              <ScanLine className="w-4 h-4" />
              ID Scan
            </button>
            <button
              onClick={() => setManualMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                manualMode ? "bg-amber-400/15 text-amber-400 border border-amber-400/30" : "bg-surface text-muted-foreground border border-border"
              }`}
            >
              <Search className="w-4 h-4" />
              Manual Lookup
            </button>
          </div>

          {/* SCAN MODE */}
          {!manualMode && (
            <div className="space-y-5">
              {/* Scan input area */}
              <div
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                  scanning ? "border-amber-400 bg-amber-400/5" : checkInResult === "success" ? "border-emerald-400 bg-emerald-400/5" : checkInResult === "underage" || checkInResult === "not-found" ? "border-rose-400 bg-rose-400/5" : "border-border hover:border-amber-400/40"
                }`}
                onClick={() => inputRef.current?.focus()}
              >
                <input
                  ref={inputRef}
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && scanInput) {
                      simulateScan(scanInput.toLowerCase());
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  placeholder="Scan barcode..."
                />
                {scanning ? (
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />
                    <p className="text-amber-400 font-medium">Parsing ID barcode...</p>
                  </div>
                ) : checkInResult ? null : (
                  <div className="flex flex-col items-center gap-3">
                    <ScanLine className="w-10 h-10 text-muted-foreground" />
                    <p className="text-muted-foreground">Scan driver's license barcode</p>
                    <p className="text-xs text-muted-foreground/60">or type a demo key below</p>
                  </div>
                )}
              </div>

              {/* Demo trigger buttons */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Demo scan scenarios:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "sarah", label: "Sarah Chen (exact match)", color: "border-emerald-400/30 text-emerald-400" },
                    { key: "bill", label: "Bill Foster (alias: William)", color: "border-amber-400/30 text-amber-400" },
                    { key: "liz", label: "Liz Park (alias: Elizabeth)", color: "border-amber-400/30 text-amber-400" },
                    { key: "young", label: "Tyler Young (underage)", color: "border-rose-400/30 text-rose-400" },
                    { key: "unknown", label: "Marcus Webb (not found)", color: "border-border text-muted-foreground" },
                  ].map((demo) => (
                    <button
                      key={demo.key}
                      onClick={() => simulateScan(demo.key)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80 transition-opacity ${demo.color}`}
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan result */}
              <AnimatePresence>
                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-4"
                  >
                    {/* ID Card */}
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center">
                            <Shield className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-display text-lg font-bold text-foreground">
                              {scanResult.firstName} {scanResult.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">DOB: {scanResult.dob} · Age: {scanResult.age}</p>
                            <p className="text-xs font-mono text-muted-foreground/60">{scanResult.idNumber}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                          scanResult.isAdult
                            ? "bg-emerald-400/15 border border-emerald-400/30 text-emerald-400"
                            : "bg-rose-400/15 border border-rose-400/30 text-rose-400"
                        }`}>
                          {scanResult.isAdult ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {scanResult.isAdult ? "21+ Verified" : "Under 21"}
                        </div>
                      </div>
                    </div>

                    {/* Match result */}
                    {checkInResult === "success" && matchResult && (
                      <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <FuzzyMatchBadge confidence="exact" />
                              <span className="text-xs text-success/80 font-mono uppercase tracking-widest">100% confidence</span>
                            </div>
                            <p className="font-display text-base font-bold text-foreground">{matchResult.attendee.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                matchResult.attendee.tier === 1 ? "tier-1" : matchResult.attendee.tier === 2 ? "tier-2" : "tier-3"
                              }`}>Tier {matchResult.attendee.tier}</span>
                              {matchResult.attendee.squadId && (
                                <span className="text-xs text-blue-400 flex items-center gap-1">
                                  <Users className="w-3 h-3" /> Squad {matchResult.attendee.squadId}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={resetScan} className="px-3 py-2 bg-surface border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                              Cancel
                            </button>
                            <button
                              onClick={() => confirmCheckIn(matchResult.attendee.id)}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors"
                            >
                              Confirm Check-In
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {checkInResult === "fuzzy" && matchResult && (
                      <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <FuzzyMatchBadge confidence={matchResult.matchType === "alias" ? "alias" : "fuzzy"} />
                              <span className="text-xs text-amber-400/70 font-mono uppercase tracking-widest">{Math.round(matchResult.confidence * 100)}% confidence</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Scanned: <span className="text-foreground font-medium">{scanResult.firstName} {scanResult.lastName}</span>
                              {" → "}
                              Roster: <span className="text-foreground font-medium">{matchResult.attendee.name}</span>
                              {matchResult.matchType === "alias" && (
                                <span className="text-amber-400"> (known alias)</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                matchResult.attendee.tier === 1 ? "tier-1" : matchResult.attendee.tier === 2 ? "tier-2" : "tier-3"
                              }`}>Tier {matchResult.attendee.tier}</span>
                              {matchResult.attendee.squadId && (
                                <span className="text-xs text-blue-400 flex items-center gap-1">
                                  <Users className="w-3 h-3" /> Squad {matchResult.attendee.squadId}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button
                              onClick={() => confirmCheckIn(matchResult.attendee.id)}
                              className="px-4 py-2 bg-amber-400 text-background rounded-lg text-sm font-semibold hover:bg-amber-300 transition-colors"
                            >
                              Confirm Match
                            </button>
                            <button onClick={resetScan} className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {checkInResult === "underage" && (
                      <div className="bg-rose-400/10 border border-rose-400/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <XCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
                          <div>
                            <p className="text-rose-400 font-bold text-lg">Entry Denied — Under 21</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {scanResult.firstName} {scanResult.lastName} is {scanResult.age} years old. Alcohol service requires 21+.
                            </p>
                          </div>
                        </div>
                        <button onClick={resetScan} className="mt-3 w-full py-2 bg-surface border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Scan Next Guest
                        </button>
                      </div>
                    )}

                    {checkInResult === "not-found" && (
                      <div className="bg-rose-400/10 border border-rose-400/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                          <div>
                            <p className="text-rose-400 font-semibold">Not on Roster</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {scanResult.firstName} {scanResult.lastName} was not found on this venue's roster.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setManualMode(true); setManualSearch(`${scanResult.firstName} ${scanResult.lastName}`); }}
                            className="flex-1 py-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-400/20 transition-colors"
                          >
                            Search roster manually
                          </button>
                          <button onClick={resetScan} className="px-4 py-2 bg-surface border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* MANUAL MODE */}
          {manualMode && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400/50"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                {filteredRoster.map((attendee) => (
                  <div
                    key={attendee.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      attendee.checkedIn ? "bg-surface/50 border-border opacity-50" : "bg-card border-border hover:border-amber-400/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                        attendee.tier === 1 ? "tier-1" : attendee.tier === 2 ? "tier-2" : "tier-3"
                      }`}>
                        {attendee.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{attendee.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">Tier {attendee.tier}</span>
                          {attendee.squadId && (
                            <span className="text-xs text-blue-400 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {attendee.squadId}
                            </span>
                          )}
                          {attendee.checkedIn && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {attendee.checkedInAt}
                            </span>
                          )}
                          {attendee.allergies?.length ? (
                            <span className="text-xs text-red-400 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> {attendee.allergies.join(", ")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {!attendee.checkedIn ? (
                      <button
                        onClick={() => manualCheckIn(attendee.id)}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
                          attendee.allergies?.length
                            ? "bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20"
                            : "bg-amber-400/10 border-amber-400/30 text-amber-400 hover:bg-amber-400/20"
                        }`}
                      >
                        {attendee.allergies?.length ? "⚠ Check In" : "Check In"}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400">✓ In</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Roster */}
        <div className="w-72 border-l border-border bg-surface flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-foreground">Live Roster</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedVenue.name} · {selectedWindow.label}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {roster.map((attendee) => (
              <div
                key={attendee.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all ${
                  attendee.checkedIn ? "bg-emerald-400/8 border border-emerald-400/20" : "bg-card border border-border"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                  attendee.tier === 1 ? "tier-1" : attendee.tier === 2 ? "tier-2" : "tier-3"
                }`}>
                  {attendee.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-medium truncate ${attendee.checkedIn ? "text-emerald-400" : "text-foreground"}`}>
                      {attendee.name}
                    </p>
                    {attendee.allergies?.length ? (
                      <span title={attendee.allergies.join(", ")}>
                        <ShieldAlert className="w-3 h-3 text-red-400 flex-shrink-0" />
                      </span>
                    ) : null}
                  </div>
                  {attendee.checkedIn && (
                    <p className="text-xs text-emerald-400/60">{attendee.checkedInAt}</p>
                  )}
                  {!attendee.checkedIn && attendee.allergies?.length ? (
                    <p className="text-[10px] text-red-400/80 truncate">{attendee.allergies.join(" · ")}</p>
                  ) : null}
                </div>
                {attendee.checkedIn ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* ── Allergy Acknowledgment Modal ─────────────────────────────────────── */}
    <AnimatePresence>
      {allergyModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="bg-card border-2 border-red-500 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-red-400">Allergy Alert</h2>
                <p className="text-xs text-muted-foreground">Staff acknowledgment required before check-in</p>
              </div>
            </div>

            {/* Attendee */}
            <div className="bg-surface border border-border rounded-xl p-3 mb-4">
              <p className="text-sm font-semibold text-foreground">{allergyModal.attendee.name}</p>
              <p className="text-xs text-muted-foreground">Tier {allergyModal.attendee.tier}</p>
            </div>

            {/* Allergy tags */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Reported Allergens</p>
              <div className="flex flex-wrap gap-2">
                {allergyModal.attendee.allergies?.map((a) => (
                  <span key={a} className="px-2.5 py-1 bg-red-500/15 border border-red-500/40 text-red-300 rounded-full text-xs font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            {allergyModal.attendee.allergyNotes && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-3 mb-5">
                <p className="text-xs text-red-300 leading-relaxed">{allergyModal.attendee.allergyNotes}</p>
              </div>
            )}

            {/* Acknowledgment instruction */}
            <p className="text-xs text-muted-foreground mb-4">
              By proceeding, you confirm that you have reviewed this attendee’s allergy information and will communicate it to the service team at their assigned dining experience.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setAllergyModal(null)}
                className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={acknowledgeAllergyAndCheckIn}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-400 transition-colors flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                I Acknowledge — Check In
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
