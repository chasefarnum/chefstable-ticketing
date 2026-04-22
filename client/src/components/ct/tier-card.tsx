import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const tierCardVariants = cva(
  "relative flex flex-col gap-4 p-6 bg-card text-card-foreground ring-1 ring-foreground/10 transition-colors",
  {
    variants: {
      tier: {
        1: "ring-accent/60 bg-gradient-to-br from-accent/10 to-transparent",
        2: "ring-accent/30",
        3: "",
      },
      active: {
        true: "ring-2 ring-accent",
        false: "",
      },
    },
    defaultVariants: { tier: 3, active: false },
  },
);

export interface TierCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof tierCardVariants> {
  tierLabel: string;
  title: React.ReactNode;
  price: string;
  description?: React.ReactNode;
  inclusions?: string[];
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  maxQuantity?: number;
  soldOut?: boolean;
}

export function TierCard({
  tier = 3,
  active,
  tierLabel,
  title,
  price,
  description,
  inclusions,
  quantity = 0,
  onIncrement,
  onDecrement,
  maxQuantity,
  soldOut,
  className,
  ...rest
}: TierCardProps) {
  const isActive = active ?? quantity > 0;
  const disableInc = soldOut || (maxQuantity != null && quantity >= maxQuantity);

  return (
    <div
      data-slot="tier-card"
      data-tier={tier}
      data-active={isActive ? "true" : "false"}
      data-sold-out={soldOut ? "true" : "false"}
      className={cn(tierCardVariants({ tier, active: isActive }), className)}
      {...rest}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {tierLabel}
          </span>
          <h3 className="font-sans text-xl font-light uppercase tracking-tight">
            {title}
          </h3>
        </div>
        <div className="font-mono text-lg tabular-nums">{price}</div>
      </div>

      {description && <p className="font-serif text-base leading-relaxed text-muted-foreground">{description}</p>}

      {inclusions && inclusions.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-sm">
          {inclusions.map(item => (
            <li key={item} className="flex items-start gap-2">
              <i className="bx bx-check text-accent shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border">
        {soldOut ? (
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-destructive">
            Sold Out
          </span>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={`Decrease ${tierLabel}`}
              disabled={quantity === 0}
              onClick={onDecrement}
              className="h-9 w-9 inline-flex items-center justify-center border border-border bg-background text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-accent"
            >
              <i className="bx bx-minus text-lg" />
            </button>
            <span
              aria-live="polite"
              className="font-mono text-base font-semibold tabular-nums w-6 text-center"
            >
              {quantity}
            </span>
            <button
              type="button"
              aria-label={`Increase ${tierLabel}`}
              disabled={disableInc}
              onClick={onIncrement}
              className="h-9 w-9 inline-flex items-center justify-center border border-border bg-background text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-accent"
            >
              <i className="bx bx-plus text-lg" />
            </button>
          </div>
        )}
        {quantity > 0 && !soldOut && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
            In cart
          </span>
        )}
      </div>
    </div>
  );
}
