import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionLedeProps {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned metadata slot (mono, uppercase). */
  meta?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * Section-level heading lockup. Pairs an optional eyebrow label with an
 * Inter-Light h2 and optional right-side metadata (counts, status).
 * Use above grids, lists, and feature sections.
 */
export function SectionLede({
  eyebrow,
  heading,
  description,
  meta,
  align = "left",
  className,
}: SectionLedeProps) {
  return (
    <div
      data-slot="section-lede"
      className={cn(
        "flex items-end justify-between gap-6",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <span
            data-slot="section-lede-eyebrow"
            className="font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            {eyebrow}
          </span>
        )}
        <h2
          data-slot="section-lede-heading"
          className="font-sans text-2xl font-light tracking-tight sm:text-3xl"
        >
          {heading}
        </h2>
        {description && (
          <p
            data-slot="section-lede-description"
            className="mt-2 max-w-2xl text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
      </div>
      {meta && (
        <div
          data-slot="section-lede-meta"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          {meta}
        </div>
      )}
    </div>
  );
}
