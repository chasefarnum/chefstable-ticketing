import { cn } from "@/lib/utils";

export interface SessionStatItem {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
}

export interface SessionStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SessionStatItem[];
  columns?: 2 | 3 | 4 | 5;
}

const TONE_CLASS: Record<NonNullable<SessionStatItem["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

export function SessionStats({
  items,
  columns = 4,
  className,
  ...rest
}: SessionStatsProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-5",
  }[columns];

  return (
    <div
      data-slot="session-stats"
      className={cn("grid gap-px bg-border", gridCols, className)}
      {...rest}
    >
      {items.map(it => (
        <div
          key={it.label}
          data-slot="session-stats-tile"
          className="bg-card px-5 py-4 flex flex-col gap-1 ring-1 ring-inset ring-foreground/5"
        >
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {it.label}
          </span>
          <span
            className={cn(
              "font-mono text-3xl font-light tabular-nums",
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
