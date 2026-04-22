import { cn } from "@/lib/utils";
import { Reorder } from "framer-motion";

export interface RankingItem {
  id: string;
  label: React.ReactNode;
  meta?: React.ReactNode;
}

export interface RankingTrayProps {
  items: RankingItem[];
  onReorder: (next: RankingItem[]) => void;
  starTopN?: number;
  className?: string;
  emptyState?: React.ReactNode;
}

export function RankingTray({
  items,
  onReorder,
  starTopN = 2,
  className,
  emptyState,
}: RankingTrayProps) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      data-slot="ranking-tray"
      className={cn("flex flex-col gap-2", className)}
    >
      {items.map((item, idx) => (
        <Reorder.Item
          key={item.id}
          value={item}
          data-slot="ranking-tray-item"
          data-rank={idx + 1}
          className={cn(
            "flex items-center gap-4 p-3 bg-card text-card-foreground",
            "ring-1 ring-foreground/10 cursor-grab active:cursor-grabbing select-none",
          )}
        >
          <span className="font-mono text-sm font-semibold tabular-nums w-6 text-center text-muted-foreground">
            {String(idx + 1).padStart(2, "0")}
          </span>
          {idx < starTopN && (
            <i
              className="bx bxs-star text-accent text-lg"
              aria-label={`Top ${starTopN}`}
            />
          )}
          <div className="flex-1 min-w-0">{item.label}</div>
          {item.meta && <div className="shrink-0 text-muted-foreground">{item.meta}</div>}
          <i aria-hidden className="bx bx-menu text-muted-foreground text-xl" />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
