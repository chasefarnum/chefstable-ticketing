import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatRowItem {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
}

export interface StatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  items: StatRowItem[];
  /** Grid columns on md and above. Mobile is always 2 columns. */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** "default" = large numeric tile; "compact" = smaller inline tile for end-of-page summary. */
  density?: "default" | "compact";
}

const TONE_CLASS: Record<NonNullable<StatRowItem["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

/**
 * Horizontal row of stat tiles. Numerals are IBM Plex Mono, labels are
 * mono-uppercase. Used as section dividers / end-of-page summaries.
 */
export function StatRow({
  items,
  columns = 4,
  density = "default",
  className,
  ...rest
}: StatRowProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-5",
    6: "grid-cols-3 md:grid-cols-6",
  }[columns];

  return (
    <div
      data-slot="stat-row"
      data-density={density}
      className={cn(
        "grid overflow-hidden rounded-lg border border-border divide-x divide-border",
        gridCols,
        className,
      )}
      {...rest}
    >
      {items.map((it) => (
        <div
          key={it.label}
          data-slot="stat-row-tile"
          className={cn(
            "flex flex-col gap-1",
            density === "default" ? "px-5 py-4" : "px-4 py-3",
          )}
        >
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {it.label}
          </span>
          <span
            className={cn(
              "font-mono font-light tabular-nums",
              density === "default" ? "text-2xl" : "text-xl",
              TONE_CLASS[it.tone ?? "default"],
            )}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}
