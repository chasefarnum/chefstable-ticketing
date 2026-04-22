// =============================================================
// CHEF'S TABLE CHECK-IN — App State Context
// =============================================================

import React, { createContext, useContext, useState, useCallback } from "react";
import { Attendee, Location, MOCK_LOCATIONS } from "@/lib/data";

interface CheckInContextValue {
  locations: Location[];
  activeLocation: Location | null;
  setActiveLocation: (loc: Location) => void;
  checkIn: (attendeeId: string) => void;
  manualOverride: (attendeeId: string, note?: string) => void;
  resetStatus: (attendeeId: string) => void;
  stats: { total: number; checkedIn: number; pending: number };
}

const CheckInContext = createContext<CheckInContextValue | null>(null);

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);

  const activeLocation = locations.find((l) => l.id === activeLocationId) ?? null;

  const setActiveLocation = useCallback((loc: Location) => {
    setActiveLocationId(loc.id);
  }, []);

  const updateAttendee = useCallback(
    (attendeeId: string, updates: Partial<Attendee>) => {
      setLocations((prev) =>
        prev.map((loc) => ({
          ...loc,
          roster: loc.roster.map((a) =>
            a.id === attendeeId ? { ...a, ...updates } : a
          ),
        }))
      );
    },
    []
  );

  const checkIn = useCallback(
    (attendeeId: string) => {
      updateAttendee(attendeeId, {
        status: "checked-in",
        checkedInAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      });
    },
    [updateAttendee]
  );

  const manualOverride = useCallback(
    (attendeeId: string, note?: string) => {
      updateAttendee(attendeeId, {
        status: "checked-in",
        checkedInAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        notes: note ?? "Manual override by staff",
      });
    },
    [updateAttendee]
  );

  const resetStatus = useCallback(
    (attendeeId: string) => {
      updateAttendee(attendeeId, { status: "pending", checkedInAt: undefined, notes: undefined });
    },
    [updateAttendee]
  );

  const stats = activeLocation
    ? {
        total: activeLocation.roster.length,
        checkedIn: activeLocation.roster.filter((a) => a.status === "checked-in").length,
        pending: activeLocation.roster.filter((a) => a.status === "pending").length,
      }
    : { total: 0, checkedIn: 0, pending: 0 };

  return (
    <CheckInContext.Provider
      value={{
        locations,
        activeLocation,
        setActiveLocation,
        checkIn,
        manualOverride,
        resetStatus,
        stats,
      }}
    >
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIn() {
  const ctx = useContext(CheckInContext);
  if (!ctx) throw new Error("useCheckIn must be used within CheckInProvider");
  return ctx;
}
