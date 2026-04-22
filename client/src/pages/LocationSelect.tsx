// =============================================================
// CHEF'S TABLE CHECK-IN — Location Selector Page
// Design: Dark Ops Dashboard — amber/gold accents, Space Grotesk
// =============================================================

import { useCheckIn } from "@/contexts/CheckInContext";
import { Location } from "@/lib/data";
import { MapPin, Users, Clock, ChevronRight } from "lucide-react";

const TIER_COLORS: Record<number, string> = {
  1: "text-amber-400",
  2: "text-slate-300",
  3: "text-slate-500",
};

interface LocationCardProps {
  location: Location;
  onSelect: (loc: Location) => void;
}

function LocationCard({ location, onSelect }: LocationCardProps) {
  const checkedIn = location.roster.filter((a) => a.status === "checked-in").length;
  const pct = Math.round((checkedIn / location.roster.length) * 100);

  return (
    <button
      onClick={() => onSelect(location)}
      className="w-full text-left group relative overflow-hidden rounded-xl border border-white/10 bg-card hover:border-amber-500/40 hover:bg-white/5 transition-all duration-200 p-5"
    >
      {/* Amber glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top left, oklch(0.72 0.16 75 / 0.06) 0%, transparent 70%)" }} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-data text-amber-400/70 uppercase tracking-widest">
              {location.window}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground truncate">{location.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Chef {location.chef}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-400 transition-colors shrink-0 mt-1" />
      </div>

      <div className="mt-4 flex items-center gap-5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {location.roster.length} guests
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Cap. {location.capacity}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {checkedIn} checked in
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-500/60 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  );
}

export default function LocationSelect() {
  const { locations, setActiveLocation } = useCheckIn();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono-data text-amber-400/70 uppercase tracking-widest mb-0.5">
            Chef's Table Festival
          </p>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Event Check-In
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Staff Portal</p>
          <p className="text-xs font-mono-data text-amber-400/60">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Select Your Location</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Choose the restaurant you are staffing to load the guest roster.
          </p>
        </div>

        <div className="space-y-3">
          {locations.map((loc) => (
            <LocationCard key={loc.id} location={loc} onSelect={setActiveLocation} />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Contact event operations if your location is not listed.
        </p>
      </main>
    </div>
  );
}
