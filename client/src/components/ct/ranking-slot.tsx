import * as React from "react";
import { BiSolidStar, BiX, BiPlus, BiInfoCircle } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

export interface RankingSlotRestaurant {
  id: string;
  chef: string;
  chefPhoto: string;
  heroPhoto: string;
  highDemand?: boolean;
}

export interface RankingSlotProps {
  /** 1-based slot position. */
  position: number;
  /** Whether the slot counts toward the required-minimum (usually positions 1..required). */
  required?: boolean;
  /** If VIP and position is 1 or 2, a star icon + priority tooltip are shown. */
  vipPriority?: boolean;
  /** The chef currently sitting in this slot; undefined renders the empty state. */
  restaurant?: RankingSlotRestaurant;
  /** Visual highlight while a draggable is hovering. */
  dropHover?: boolean;
  onRemove?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
}

/**
 * A single drop-target slot in a ranking tray. Empty state shows a dashed
 * outline + position number + mono-caps hint. Filled state shows a compact
 * chef strip (portrait + name + remove button) with a VIP priority star on
 * positions 1–2 when `vipPriority` is true.
 */
export function RankingSlot({
  position,
  required = false,
  vipPriority = false,
  restaurant,
  dropHover = false,
  onRemove,
  onDragOver,
  onDrop,
  onDragStart,
  className,
}: RankingSlotProps) {
  const isFilled = !!restaurant;
  const showPriorityStar = vipPriority && position <= 2;

  return (
    <div
      data-slot="ranking-slot"
      data-position={position}
      data-filled={isFilled ? "true" : "false"}
      data-priority={showPriorityStar ? "true" : "false"}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e);
      }}
      onDrop={onDrop}
      className={cn(
        "relative flex items-center gap-3 rounded-lg p-2 transition-colors",
        isFilled
          ? "bg-card ring-1 ring-foreground/10"
          : required
          ? "border border-dashed border-border"
          : "border border-dashed border-border/50",
        dropHover && "ring-2 ring-accent bg-accent/5",
        showPriorityStar && isFilled && "ring-accent/60",
        className,
      )}
      draggable={isFilled}
      onDragStart={onDragStart}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          showPriorityStar
            ? "bg-accent/15 ring-1 ring-accent/50"
            : "bg-muted ring-1 ring-border",
        )}
      >
        {showPriorityStar ? (
          <Icon as={BiSolidStar} size="sm" className="text-accent" />
        ) : (
          <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
            {position}
          </span>
        )}
      </div>

      {isFilled ? (
        <>
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
            <img
              src={restaurant.chefPhoto}
              alt={restaurant.chef}
              className="h-full w-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).src = restaurant.heroPhoto;
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-semibold uppercase tracking-wider truncate">
              {restaurant.chef}
            </p>
            {restaurant.highDemand && position > 2 && (
              <p className="font-mono text-[10px] uppercase tracking-wider text-caution">
                High demand · rank higher
              </p>
            )}
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onRemove}
              aria-label={`Remove ${restaurant.chef} from slot ${position}`}
            >
              <Icon as={BiX} size="sm" />
            </Button>
          )}
        </>
      ) : (
        <>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Icon
              as={BiPlus}
              size="sm"
              className="text-muted-foreground"
            />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {required ? `Rank ${position}` : `Optional slot ${position}`}
            </span>
          </div>
        </>
      )}

      {showPriorityStar && isFilled && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="VIP priority weighting info"
                className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Icon as={BiInfoCircle} size="sm" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[220px]">
              Your top 2 choices are weighted as priority selections in the
              matching engine. Choose the experiences you most want to attend.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
