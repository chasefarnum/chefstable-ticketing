import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SquadSeat {
  id: string;
  label: string;
  day: string;
  disabled?: boolean;
  conflict?: string;
}

export interface SquadDayOption {
  value: string;
  label: string;
  capacity?: number;
  remaining?: number;
}

export interface SquadSeatAssignmentProps {
  seat: SquadSeat;
  days: SquadDayOption[];
  onChange: (nextDay: string) => void;
  className?: string;
}

export function SquadSeatAssignment({
  seat,
  days,
  onChange,
  className,
}: SquadSeatAssignmentProps) {
  return (
    <div
      data-slot="squad-seat-assignment"
      data-has-conflict={seat.conflict ? "true" : "false"}
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4",
        "bg-card ring-1 ring-foreground/10",
        seat.conflict && "ring-destructive/60",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Seat {seat.id}
        </span>
        <span className="font-sans text-base font-medium">{seat.label}</span>
        {seat.conflict && (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-destructive">
            <i className="bx bx-error-circle mr-1" />
            {seat.conflict}
          </span>
        )}
      </div>
      <div className="shrink-0">
        <Select value={seat.day} onValueChange={onChange} disabled={seat.disabled}>
          <SelectTrigger className="w-[220px] font-mono text-xs uppercase tracking-widest">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {days.map(d => {
              const full = d.remaining != null && d.remaining <= 0;
              return (
                <SelectItem
                  key={d.value}
                  value={d.value}
                  disabled={full}
                  className="font-mono text-xs uppercase tracking-widest"
                >
                  <span className="flex items-center justify-between w-full gap-4">
                    <span>{d.label}</span>
                    {d.remaining != null && (
                      <span className={cn("tabular-nums", full && "text-destructive")}>
                        {d.remaining}/{d.capacity}
                      </span>
                    )}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
