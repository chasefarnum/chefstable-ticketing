import { cn } from "@/lib/utils";
import { ComboHeader } from "./combo-header";

export interface ChefCardProps extends React.HTMLAttributes<HTMLDivElement> {
  firstName: string;
  lastName: string;
  portraitSrc: string;
  venue?: string;
  cuisines?: string[];
  rank?: number;
  starred?: boolean;
  selected?: boolean;
}

export function ChefCard({
  firstName,
  lastName,
  portraitSrc,
  venue,
  cuisines,
  rank,
  starred,
  selected,
  className,
  ...rest
}: ChefCardProps) {
  return (
    <article
      data-slot="chef-card"
      data-selected={selected ? "true" : "false"}
      className={cn(
        "group relative flex flex-col bg-card text-card-foreground overflow-hidden",
        "ring-1 ring-foreground/10 transition-colors",
        selected && "ring-2 ring-accent",
        className,
      )}
      {...rest}
    >
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
        <img
          src={portraitSrc}
          alt={`${firstName} ${lastName}`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        {starred && (
          <span
            aria-label="Top pick"
            className="absolute top-3 right-3 inline-flex items-center justify-center h-8 w-8 bg-accent text-accent-foreground"
          >
            <i className="bx bxs-star text-base" />
          </span>
        )}
        {typeof rank === "number" && (
          <span className="absolute top-3 left-3 inline-flex items-center justify-center h-8 w-8 bg-background/90 text-foreground font-mono text-xs font-semibold tabular-nums">
            {rank}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 p-5">
        <ComboHeader first={firstName} last={lastName} size="sm" />
        {venue && (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {venue}
          </p>
        )}
        {cuisines && cuisines.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {cuisines.map(c => (
              <span
                key={c}
                className="inline-flex items-center h-5 px-2 font-mono text-[10px] font-medium uppercase tracking-widest rounded-full bg-secondary text-secondary-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
