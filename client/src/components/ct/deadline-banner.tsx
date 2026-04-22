import * as React from "react";
import { BiTime } from "react-icons/bi";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

export interface DeadlineBannerProps {
  /** Left-side descriptive text. */
  label: React.ReactNode;
  /** Optional right-side status slot (window dots, progress, etc). */
  status?: React.ReactNode;
  className?: string;
}

/**
 * Compact top-of-page banner for conveying deadline / status metadata.
 * Uses semantic `bg-muted` / `text-muted-foreground` so it flips on theme
 * switch without manual intervention.
 */
export function DeadlineBanner({ label, status, className }: DeadlineBannerProps) {
  return (
    <div
      data-slot="deadline-banner"
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border bg-muted/60 px-6 py-2",
        className,
      )}
    >
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <Icon as={BiTime} size="sm" className="text-accent" />
        {label}
      </div>
      {status && <div className="flex items-center gap-2">{status}</div>}
    </div>
  );
}
