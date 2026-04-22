import * as React from "react";
import { BiTime } from "react-icons/bi";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

export type CanvasWindowState =
  | "empty"
  | "in-progress"
  | "min-met"
  | "confirmed";

export interface CanvasWindowItem {
  id: string;
  label: string;
  state: CanvasWindowState;
}

export interface CanvasProgressStripProps {
  windows: CanvasWindowItem[];
  /** ID of the window currently in-view (for highlighting the active dot). */
  activeId?: string | null;
  /** Click handler to jump / scroll to a given window band. */
  onJumpTo?: (id: string) => void;
  /** Left-side deadline copy. */
  deadlineLabel: React.ReactNode;
  /** When true, the deadline label renders in destructive tone (<7 days). */
  urgency?: boolean;
  /** Right-side slot for the submit affordance + theme toggle. */
  rightSlot?: React.ReactNode;
  className?: string;
}

const DOT_STATE_CLASS: Record<CanvasWindowState, string> = {
  empty: "bg-transparent ring-1 ring-border",
  "in-progress": "bg-transparent ring-2 ring-accent",
  "min-met": "bg-accent ring-2 ring-accent",
  confirmed: "bg-success ring-2 ring-success",
};

/**
 * Sticky top-of-page multi-window progress strip for the Preference Canvas.
 * Shows the deadline on the left, per-window status dots in the center,
 * and a submit / theme-toggle slot on the right.
 */
export function CanvasProgressStrip({
  windows,
  activeId,
  onJumpTo,
  deadlineLabel,
  urgency = false,
  rightSlot,
  className,
}: CanvasProgressStripProps) {
  return (
    <div
      data-slot="canvas-progress-strip"
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur px-6 md:px-10 xl:px-14 py-3",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 font-mono text-xs uppercase tracking-wider",
          urgency ? "text-destructive" : "text-muted-foreground",
        )}
      >
        <Icon
          as={BiTime}
          size="sm"
          className={urgency ? "text-destructive" : "text-accent"}
        />
        {deadlineLabel}
      </div>

      <nav
        aria-label="Window progress"
        className="flex items-center gap-2 overflow-x-auto"
      >
        {windows.map((w) => {
          const isActive = w.id === activeId;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onJumpTo?.(w.id)}
              aria-label={`${w.label} · ${w.state}`}
              data-state={w.state}
              data-active={isActive ? "true" : "false"}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive ? "bg-muted" : "hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "block h-2.5 w-2.5 rounded-full transition-colors",
                  DOT_STATE_CLASS[w.state],
                )}
              />
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-wider whitespace-nowrap",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {w.label}
              </span>
            </button>
          );
        })}
      </nav>

      {rightSlot && (
        <div className="flex items-center gap-3">{rightSlot}</div>
      )}
    </div>
  );
}
