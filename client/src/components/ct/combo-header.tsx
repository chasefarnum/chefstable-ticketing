import { cn } from "@/lib/utils";

export type ComboHeaderSize = "xs" | "sm" | "md" | "lg";

export interface ComboHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  first: React.ReactNode;
  last: React.ReactNode;
  size?: ComboHeaderSize;
}

export function ComboHeader({
  first,
  last,
  size = "xs",
  className,
  ...rest
}: ComboHeaderProps) {
  return (
    <div
      data-slot="combo-header"
      data-size={size}
      className={cn("ct-combo", `ct-combo-${size}`, className)}
      {...rest}
    >
      <span data-slot="combo-header-first" className="f">{first}</span>
      <span data-slot="combo-header-last" className="l">{last}</span>
    </div>
  );
}
