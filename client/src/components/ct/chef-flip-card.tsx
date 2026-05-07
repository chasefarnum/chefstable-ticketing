import * as React from "react";
import { BiSolidStar, BiPlus } from "react-icons/bi";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

/**
 * Minimal shape required by ChefFlipCard — compatible with the `Restaurant`
 * type from `@/lib/mockData` but kept local so the component stays decoupled.
 */
export interface ChefFlipCardRestaurant {
  id: string;
  chef: string;
  chefTitle: string;
  name: string;
  chefPhoto: string;
  heroPhoto: string;
  description: string;
  tags: string[];
  menuHighlights: string[];
  menuStyle: string;
  accolades: string;
  highDemand?: boolean;
}

export type ChefFlipCardDensity = "full" | "pool";

export interface ChefFlipCardProps {
  restaurant: ChefFlipCardRestaurant;
  /** Current ranking position (1-based). If set and `isRanked`, the rank pill shows in the top-left. */
  rank?: number;
  /** Whether this chef is currently in the attendee's ranking. */
  isRanked: boolean;
  /** Whether the attendee is a VIP tier (controls the star on rank ≤ 2). */
  isVip?: boolean;
  /** Which side of the card to render: "front" (portrait + name) or "back" (menu detail). */
  expanded: boolean;
  /** `full` = card with large portrait + full footer buttons. `pool` = compact variant (no footer buttons, overlay `+` on hover). */
  density?: ChefFlipCardDensity;
  onToggleExpand: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * Preference-portal chef card with front (portrait + name + tags) and back
 * (restaurant name + menu style + Michelin stars + signature dishes) states.
 *
 * Figma reference: node 430:1449 ("Card / Preference"). Uses only semantic
 * DS tokens so it flips correctly between light/dark themes.
 */
export function ChefFlipCard({
  restaurant,
  rank,
  isRanked,
  isVip = false,
  expanded,
  density = "full",
  onToggleExpand,
  onAdd,
  onRemove,
  className,
}: ChefFlipCardProps) {
  const isPool = density === "pool";
  const michelinStars = getMichelinStars(restaurant.accolades);
  const [isHoveringViewMenu, setIsHoveringViewMenu] = React.useState(false);

  return (
    <div className={cn("h-full", className)}>
      <Card
        data-slot="chef-flip-card"
        data-state={expanded ? "back" : "front"}
        data-density={density}
        className={cn(
          "group/chef-flip-card h-full p-5 gap-4 has-data-[slot=card-footer]:pb-5",
          isRanked
            ? "ring-2 ring-inset ring-foreground bg-card dark:bg-card"
            : "dark:bg-background",
        )}
      >
        {!expanded ? (
          <>
            <div className="relative aspect-square w-full overflow-hidden border border-border bg-muted">
              <img
                src={restaurant.chefPhoto}
                alt={restaurant.chef}
                className="h-full w-full object-cover object-[center_15%]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = restaurant.heroPhoto;
                }}
              />
              {isRanked && rank !== undefined && (
                <div className="absolute top-2 left-2 z-20 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-mono text-xs font-semibold">
                  {rank}
                </div>
              )}
              {isVip && isRanked && rank !== undefined && rank <= 2 && (
                <div className="absolute top-2 right-2 z-20">
                  <Icon
                    as={BiSolidStar}
                    size="sm"
                    className="text-caution drop-shadow"
                  />
                </div>
              )}
              {restaurant.highDemand && !isRanked && (
                <div className="absolute top-2 right-2 z-20">
                  <Badge className="bg-caution text-caution-foreground border-transparent">
                    High demand
                  </Badge>
                </div>
              )}
              {isPool && !isRanked && onAdd && (
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200",
                    "bg-background/60 opacity-0 group-hover/chef-flip-card:opacity-100 has-[button:focus-visible]:opacity-100",
                    isHoveringViewMenu && "!opacity-0",
                  )}
                >
                  <Button
                    size="lg"
                    className="pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd();
                    }}
                    aria-label={`Add ${restaurant.chef} to ranking`}
                  >
                    <Icon as={BiPlus} size="sm" />
                    Add
                  </Button>
                </div>
              )}
            </div>

            <CardContent className="p-0 flex flex-col gap-4">
              <div className="flex flex-col gap-[7px]">
                <h3 className="font-sans text-2xl font-semibold uppercase tracking-wider leading-none">
                  {restaurant.chef}
                </h3>
                <div className="flex flex-col gap-1 font-mono text-xs uppercase tracking-wider">
                  <p className="text-foreground">
                    {restaurant.chefTitle.split(",")[0].trim()}
                  </p>
                  <p className="text-secondary-foreground">{restaurant.name}</p>
                </div>
              </div>

              {restaurant.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {restaurant.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="p-0 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-sans text-2xl font-semibold uppercase tracking-wider leading-none">
                {restaurant.name}
              </h3>
              <p className="font-mono text-xs uppercase tracking-wider text-foreground">
                {restaurant.menuStyle}
              </p>
              {michelinStars > 0 ? (
                <div
                  className="flex items-center gap-0.5 pt-2"
                  aria-label={`${michelinStars} Michelin ${
                    michelinStars === 1 ? "Star" : "Stars"
                  }`}
                >
                  {Array.from({ length: michelinStars }).map((_, i) => (
                    <Icon
                      key={i}
                      as={BiSolidStar}
                      size="sm"
                      className="text-caution"
                    />
                  ))}
                </div>
              ) : (
                <p className="pt-2 font-mono text-[10px] uppercase tracking-wider text-secondary-foreground">
                  {restaurant.accolades}
                </p>
              )}
            </div>

            <p className="text-sm leading-5 text-secondary-foreground">
              {restaurant.description}
            </p>

            <div className="flex flex-col gap-3">
              <p className="font-sans text-sm font-semibold uppercase tracking-wider">
                Signature dishes
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-sm leading-5 text-secondary-foreground">
                {restaurant.menuHighlights.map((dish, i) => (
                  <li key={i}>{dish}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}

        {!isPool && (
          <CardFooter className="p-0 pt-10 mt-auto border-0 bg-transparent flex-col gap-3 items-stretch">
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              {expanded ? "Hide menu" : "View menu"}
            </Button>
            {isRanked ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.();
                }}
              >
                Remove
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd?.();
                }}
              >
                <Icon as={BiPlus} size="sm" />
                Add to ranking
              </Button>
            )}
          </CardFooter>
        )}

        {isPool && (
          <CardFooter className="p-0 pt-4 mt-auto border-0 bg-transparent flex-col gap-3 items-stretch">
            <Separator />
            <Button
              variant="ghost"
              size="xs"
              className="w-full"
              onMouseEnter={() => setIsHoveringViewMenu(true)}
              onMouseLeave={() => setIsHoveringViewMenu(false)}
              onFocus={() => setIsHoveringViewMenu(true)}
              onBlur={() => setIsHoveringViewMenu(false)}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              {expanded ? "Hide menu" : "View menu"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

/**
 * Parse Michelin star count from an accolades string like "3 Michelin Stars".
 * Caps at 3 (per-restaurant max) so "21 Michelin Stars" doesn't render 21 icons.
 */
function getMichelinStars(accolades: string): number {
  const match = accolades.match(/(\d+)\s+Michelin\s+Stars?/i);
  if (!match) return 0;
  return Math.min(3, parseInt(match[1], 10) || 0);
}
