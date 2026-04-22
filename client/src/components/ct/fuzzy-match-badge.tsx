import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FuzzyConfidence = "exact" | "alias" | "fuzzy" | "manual";

export interface FuzzyMatchBadgeProps
  extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  confidence?: FuzzyConfidence;
}

const CONFIDENCE_VARIANT: Record<
  FuzzyConfidence,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  exact: "default",
  alias: "secondary",
  fuzzy: "outline",
  manual: "outline",
};

const CONFIDENCE_TONE: Partial<Record<FuzzyConfidence, string>> = {
  exact: "bg-success text-success-foreground",
  alias: "bg-info/20 text-info",
  fuzzy: "border-caution text-caution-foreground",
};

const LABELS: Record<FuzzyConfidence, string> = {
  exact: "Exact",
  alias: "Alias",
  fuzzy: "Fuzzy",
  manual: "Manual",
};

export function FuzzyMatchBadge({
  confidence = "exact",
  className,
  children,
  ...rest
}: FuzzyMatchBadgeProps) {
  return (
    <Badge
      data-confidence={confidence}
      variant={CONFIDENCE_VARIANT[confidence]}
      className={cn(CONFIDENCE_TONE[confidence], className)}
      {...rest}
    >
      {children ?? LABELS[confidence]}
    </Badge>
  );
}
