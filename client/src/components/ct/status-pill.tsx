import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusPillStatus =
  | "checked-in"
  | "underage"
  | "pending"
  | "manual"
  | "denied"
  | "warning"
  | "neutral";

export interface StatusPillProps
  extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  status?: StatusPillStatus;
  icon?: string;
}

const STATUS_VARIANT: Record<
  StatusPillStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  "checked-in": "default",
  underage: "destructive",
  pending: "outline",
  manual: "secondary",
  denied: "destructive",
  warning: "outline",
  neutral: "outline",
};

const STATUS_TONE: Partial<Record<StatusPillStatus, string>> = {
  "checked-in": "bg-success text-success-foreground",
  pending: "border-caution text-caution-foreground",
  warning: "border-warning text-warning-foreground",
  manual: "bg-info/20 text-info",
};

export function StatusPill({
  status = "neutral",
  icon,
  className,
  children,
  ...rest
}: StatusPillProps) {
  return (
    <Badge
      data-status={status}
      variant={STATUS_VARIANT[status]}
      className={cn(STATUS_TONE[status], className)}
      {...rest}
    >
      {icon && <i className={`bx ${icon}`} style={{ fontSize: 12 }} />}
      {children}
    </Badge>
  );
}
