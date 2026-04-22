// =============================================================
// CHEF'S TABLE CHECK-IN — Fuzzy Name Matching Engine
// Uses Fuse.js for fuzzy search + nickname alias expansion
// =============================================================

import Fuse from "fuse.js";
import { Attendee, NAME_ALIASES } from "./data";

export interface MatchResult {
  attendee: Attendee;
  score: number; // 0–100, higher = better match
  matchType: "exact" | "alias" | "fuzzy";
  matchedOn: string; // what field triggered the match
}

/** Normalize a name to lowercase, trimmed */
function normalize(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Given a first name, return all known canonical forms and aliases.
 * e.g. "Bill" → ["bill", "william"] (canonical + all aliases that include "bill")
 */
export function expandAliases(firstName: string): string[] {
  const norm = normalize(firstName);
  const expanded = new Set<string>([norm]);

  // Direct: is this name a key in the alias map?
  if (NAME_ALIASES[norm]) {
    NAME_ALIASES[norm].forEach((a) => expanded.add(a));
  }

  // Reverse: is this name listed as an alias of another canonical name?
  for (const [canonical, aliases] of Object.entries(NAME_ALIASES)) {
    if (aliases.includes(norm)) {
      expanded.add(canonical);
      aliases.forEach((a) => expanded.add(a));
    }
  }

  return Array.from(expanded);
}

/**
 * Main matching function.
 * Given a scanned first name, last name, and a roster of attendees,
 * returns ranked matches.
 */
export function matchAttendee(
  scannedFirst: string,
  scannedLast: string,
  roster: Attendee[]
): MatchResult[] {
  const results: MatchResult[] = [];
  const normFirst = normalize(scannedFirst);
  const normLast = normalize(scannedLast);
  const firstAliases = expandAliases(scannedFirst);

  for (const attendee of roster) {
    const aFirst = normalize(attendee.firstName);
    const aLast = normalize(attendee.lastName);
    const aFirstAliases = expandAliases(attendee.firstName);

    // 1. Exact full name match
    if (aFirst === normFirst && aLast === normLast) {
      results.push({ attendee, score: 100, matchType: "exact", matchedOn: "full name" });
      continue;
    }

    // 2. Alias match on first name + exact last name
    const firstOverlap =
      firstAliases.some((a) => aFirstAliases.includes(a)) ||
      aFirstAliases.includes(normFirst) ||
      firstAliases.includes(aFirst);

    if (firstOverlap && aLast === normLast) {
      results.push({ attendee, score: 90, matchType: "alias", matchedOn: "nickname alias + last name" });
      continue;
    }

    // 3. Alias match on first name + fuzzy last name
    if (firstOverlap) {
      const lastSim = stringSimilarity(normLast, aLast);
      if (lastSim >= 0.75) {
        results.push({
          attendee,
          score: Math.round(75 + lastSim * 15),
          matchType: "alias",
          matchedOn: "nickname alias + fuzzy last name",
        });
        continue;
      }
    }

    // 4. Fuzzy match on last name only (high threshold)
    const lastSim = stringSimilarity(normLast, aLast);
    const firstSim = stringSimilarity(normFirst, aFirst);
    const combined = lastSim * 0.6 + firstSim * 0.4;

    if (combined >= 0.72) {
      results.push({
        attendee,
        score: Math.round(combined * 80),
        matchType: "fuzzy",
        matchedOn: `fuzzy (first: ${Math.round(firstSim * 100)}%, last: ${Math.round(lastSim * 100)}%)`,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Also run a Fuse.js search for broader fuzzy matching as a fallback.
 */
export function fuseSearch(query: string, roster: Attendee[]): MatchResult[] {
  const fuse = new Fuse(roster, {
    keys: ["firstName", "lastName"],
    threshold: 0.45,
    includeScore: true,
  });

  return fuse.search(query).map((r) => ({
    attendee: r.item,
    score: Math.round((1 - (r.score ?? 0)) * 70),
    matchType: "fuzzy" as const,
    matchedOn: "full-text fuzzy search",
  }));
}

/** Levenshtein-based string similarity, returns 0–1 */
function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/** Calculate age from DOB string (YYYY-MM-DD or MM/DD/YYYY) */
export function calculateAge(dob: string): number | null {
  let date: Date | null = null;

  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    date = new Date(dob);
  }
  // Try MM/DD/YYYY
  else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
    const [m, d, y] = dob.split("/");
    date = new Date(`${y}-${m}-${d}`);
  }
  // Try MMDDYYYY (from PDF417 barcode)
  else if (/^\d{8}$/.test(dob)) {
    const m = dob.slice(0, 2);
    const d = dob.slice(2, 4);
    const y = dob.slice(4, 8);
    date = new Date(`${y}-${m}-${d}`);
  }

  if (!date || isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

/** Parse a raw OCR text block from a driver's license */
export function parseIDText(raw: string): { firstName: string; lastName: string; dob: string } {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  let firstName = "";
  let lastName = "";
  let dob = "";

  for (const line of lines) {
    // Last name line: "LN SMITH" or "LAST NAME: SMITH"
    const lnMatch = line.match(/^(?:LN|LAST\s*NAME)[:\s]+([A-Z'-]+)/i);
    if (lnMatch) { lastName = lnMatch[1]; continue; }

    // First name line: "FN JOHN" or "FIRST NAME: JOHN"
    const fnMatch = line.match(/^(?:FN|FIRST\s*NAME)[:\s]+([A-Z'-]+)/i);
    if (fnMatch) { firstName = fnMatch[1]; continue; }

    // DOB line: "DOB 01/15/1990" or "DATE OF BIRTH: 01/15/1990"
    const dobMatch = line.match(/(?:DOB|DATE\s*OF\s*BIRTH)[:\s]+(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{8})/i);
    if (dobMatch) { dob = dobMatch[1]; continue; }

    // Fallback: bare date pattern
    if (!dob) {
      const bareDate = line.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
      if (bareDate) { dob = bareDate[1]; }
    }
  }

  return { firstName, lastName, dob };
}
