import * as React from "react";
import { motion } from "framer-motion";
import { BiCheck } from "react-icons/bi";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

export interface WindowTabItem {
  id: string;
  label: string;
  date?: string;
  confirmed?: boolean;
  hasContent?: boolean;
}

export interface WindowTabsProps {
  items: WindowTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  /** Optional id to briefly pulse as attention signal. */
  pulsingId?: string | null;
  className?: string;
}

/**
 * Horizontal segmented tab strip for stepping through ordered windows / days.
 * State per tab: inactive | active | confirmed | has-content (dot). Uses
 * semantic `border-accent` / `text-success` / `bg-muted` tokens only.
 */
export function WindowTabs({
  items,
  activeId,
  onChange,
  pulsingId,
  className,
}: WindowTabsProps) {
  return (
    <div
      data-slot="window-tabs"
      className={cn(
        "border-b border-border bg-background/95 overflow-x-auto",
        className,
      )}
    >
      <div className="flex gap-1 min-w-max px-6">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const isPulsing = pulsingId === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              data-state={
                isActive ? "active" : item.confirmed ? "confirmed" : "inactive"
              }
              animate={
                isPulsing
                  ? { backgroundColor: ["transparent", "var(--muted)", "transparent"] }
                  : {}
              }
              transition={{ duration: 0.6, repeat: 1 }}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-3 text-xs font-medium border-b-2 transition-colors",
                isActive && "border-accent text-foreground",
                !isActive &&
                  item.confirmed &&
                  "border-success/60 text-success",
                !isActive &&
                  !item.confirmed &&
                  "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.confirmed && (
                <Icon as={BiCheck} size="sm" className="text-success" />
              )}
              <span>{item.label}</span>
              {item.date && (
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.date}
                </span>
              )}
              {item.hasContent && !item.confirmed && (
                <span
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  aria-label="in progress"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
