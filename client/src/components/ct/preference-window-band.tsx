import * as React from "react";
import { motion } from "framer-motion";
import { BiCheckCircle, BiEditAlt } from "react-icons/bi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Icon } from "./icon";
import { ChefFlipCard, type ChefFlipCardRestaurant } from "./chef-flip-card";
import { RankingSlot } from "./ranking-slot";
import { cn } from "@/lib/utils";

export interface PreferenceWindowBandRankedChoice {
  restaurantId: string;
  rank: number;
}

export interface PreferenceWindowBandProps {
  /** The Accordion item value — usually the window id. */
  value: string;
  /** Stable DOM id used for anchor scrolling from the progress strip. */
  id?: string;
  windowLabel: string;
  windowDate: string;
  pool: ChefFlipCardRestaurant[];
  ranked: PreferenceWindowBandRankedChoice[];
  required: number;
  max: number;
  isVip?: boolean;
  confirmed?: boolean;
  /** ID of the currently expanded chef in this band, or null if none. */
  expandedCardId?: string | null;
  onToggleExpand: (restaurantId: string) => void;
  onAdd: (restaurantId: string) => void;
  onRemove: (restaurantId: string) => void;
  onReorder: (fromRank: number, toRank: number) => void;
  onConfirm?: () => void;
  onEdit?: () => void;
  /** Optional node rendered beneath the pool (e.g. add-on card for this window). */
  afterPool?: React.ReactNode;
  className?: string;
}

/**
 * One window's preference band, rendered as a Radix Accordion item to
 * mirror the DS accordion spec. Each band is a self-contained rounded card
 * with `ring-1 ring-foreground/10`; open/close state is controlled by the
 * parent `<Accordion type="multiple" value={...}>` wrapper.
 *
 * Confirmed windows render as a compact summary row (disabled item, no
 * toggleable content) with an Edit affordance to re-open.
 */
export function PreferenceWindowBand({
  value,
  id,
  windowLabel,
  windowDate,
  pool,
  ranked,
  required,
  max,
  isVip = false,
  confirmed = false,
  expandedCardId,
  onToggleExpand,
  onAdd,
  onRemove,
  onReorder,
  onConfirm,
  onEdit,
  afterPool,
  className,
}: PreferenceWindowBandProps) {
  const minMet = ranked.length >= required;
  const filledCount = ranked.length;

  const dragItem = React.useRef<string | null>(null);
  const dragSource = React.useRef<"pool" | "slot" | null>(null);
  const [dragOverRank, setDragOverRank] = React.useState<number | null>(null);

  const isInRanking = (restaurantId: string) =>
    ranked.some((r) => r.restaurantId === restaurantId);

  const getRank = (restaurantId: string) =>
    ranked.find((r) => r.restaurantId === restaurantId)?.rank;

  const slots = Array.from({ length: max }, (_, i) => {
    const position = i + 1;
    const choice = ranked.find((r) => r.rank === position);
    const restaurant = choice
      ? pool.find((r) => r.id === choice.restaurantId)
      : undefined;
    return { position, restaurant };
  });

  const handlePoolDragStart = (restaurantId: string) => {
    dragItem.current = restaurantId;
    dragSource.current = "pool";
  };

  const handleSlotDragStart = (restaurantId: string) => {
    dragItem.current = restaurantId;
    dragSource.current = "slot";
  };

  const handleSlotDrop = (targetPosition: number) => {
    if (!dragItem.current) {
      setDragOverRank(null);
      return;
    }
    if (dragSource.current === "pool" && !isInRanking(dragItem.current)) {
      onAdd(dragItem.current);
    } else if (dragSource.current === "slot") {
      const fromRank = getRank(dragItem.current);
      if (fromRank !== undefined && fromRank !== targetPosition) {
        onReorder(fromRank, targetPosition);
      }
    }
    dragItem.current = null;
    dragSource.current = null;
    setDragOverRank(null);
  };

  // ── Collapsed confirmed state — disabled AccordionItem with static summary ─
  if (confirmed) {
    return (
      <AccordionItem
        value={value}
        id={id}
        disabled
        className={cn("px-6", className)}
        data-confirmed="true"
      >
        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon as={BiCheckCircle} size="md" className="text-success" />
              <div>
                <h3 className="font-sans text-sm font-semibold uppercase tracking-widest">
                  {windowLabel}
                </h3>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {windowDate} · {ranked.length} confirmed preferences
                </p>
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Icon as={BiEditAlt} size="sm" />
                Edit
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {ranked
              .slice()
              .sort((a, b) => a.rank - b.rank)
              .map((choice) => {
                const restaurant = pool.find(
                  (r) => r.id === choice.restaurantId,
                );
                if (!restaurant) return null;
                return (
                  <Badge key={choice.restaurantId} variant="outline">
                    <span className="font-mono text-[10px]">#{choice.rank}</span>
                    <span>{restaurant.chef}</span>
                  </Badge>
                );
              })}
          </div>
        </div>
      </AccordionItem>
    );
  }

  // ── Active (unconfirmed) state — standard accordion item ───────────────
  return (
    <AccordionItem
      value={value}
      id={id}
      className={cn("px-6", className)}
      data-confirmed="false"
    >
      <AccordionTrigger className="py-[10px] text-sm font-normal normal-case tracking-normal hover:no-underline">
        <div className="flex flex-1 items-center gap-3 pr-2 min-w-0">
          <div className="flex flex-1 flex-col min-w-0 text-xl leading-8 uppercase tracking-widest">
            <span className="font-sans font-light text-secondary-foreground">
              {windowDate}
            </span>
            <span className="font-sans font-semibold text-foreground truncate group-hover/accordion-trigger:underline underline-offset-4">
              {windowLabel}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {minMet ? (
              <Badge className="bg-success/15 text-success border-success/40">
                <Icon as={BiCheckCircle} size="sm" />
                Min met
              </Badge>
            ) : filledCount === 0 ? (
              <Badge variant="outline">Not started</Badge>
            ) : (
              <Badge variant="outline">
                {required - filledCount} more needed
              </Badge>
            )}
            {isVip && (
              <span className="font-mono text-xs font-medium uppercase tracking-widest leading-4 text-secondary-foreground whitespace-nowrap">
                VIP top 2 priority-weighted
              </span>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pt-0 pb-6">
        <Separator className="mb-6" />
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {pool.length} chefs available
          </span>
          {minMet && onConfirm && (
            <Button size="sm" onClick={onConfirm}>
              <Icon as={BiCheckCircle} size="sm" />
              Confirm window
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_360px] items-start">
            {/* Chef pool */}
            <div className="flex flex-col gap-4">
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {pool.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    draggable={!isInRanking(restaurant.id)}
                    onDragStart={() => handlePoolDragStart(restaurant.id)}
                    onDragEnd={() => {
                      dragItem.current = null;
                      dragSource.current = null;
                    }}
                  >
                    <ChefFlipCard
                      restaurant={restaurant}
                      rank={getRank(restaurant.id)}
                      isRanked={isInRanking(restaurant.id)}
                      isVip={isVip}
                      density="pool"
                      expanded={expandedCardId === restaurant.id}
                      onToggleExpand={() => onToggleExpand(restaurant.id)}
                      onAdd={
                        isInRanking(restaurant.id)
                          ? undefined
                          : () => onAdd(restaurant.id)
                      }
                      onRemove={() => onRemove(restaurant.id)}
                    />
                  </div>
                ))}
              </motion.div>
              {afterPool && <div className="pt-2">{afterPool}</div>}
            </div>

            {/* Ranking slots column */}
            <aside className="flex flex-col gap-3 xl:sticky xl:top-28 xl:self-start">
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-semibold uppercase tracking-wider">
                  Ranking
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {filledCount} / {max}
                </span>
              </div>
              {filledCount === 0 && (
                <p className="text-sm text-muted-foreground leading-5 normal-case">
                  Select at least {required} chefs for this window.{" "}
                  {isVip && "Your top 2 receive priority weighting."}
                </p>
              )}
              <div className="flex flex-col gap-2">
                {slots.map(({ position, restaurant }) => (
                  <RankingSlot
                    key={position}
                    position={position}
                    required={position <= required}
                    vipPriority={isVip}
                    restaurant={restaurant}
                    dropHover={dragOverRank === position}
                    onDragOver={() => setDragOverRank(position)}
                    onDrop={() => handleSlotDrop(position)}
                    onDragStart={() =>
                      restaurant && handleSlotDragStart(restaurant.id)
                    }
                    onRemove={
                      restaurant ? () => onRemove(restaurant.id) : undefined
                    }
                  />
                ))}
              </div>
            </aside>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
