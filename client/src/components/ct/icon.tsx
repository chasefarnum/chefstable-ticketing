import * as React from "react";
import type { IconType, IconBaseProps } from "react-icons";
import { cn } from "@/lib/utils";

export type IconSize = "sm" | "md";

export interface IconProps extends Omit<IconBaseProps, "size"> {
  /** Icon component from `react-icons/bi` (Boxicons). */
  as: IconType;
  /** `sm` = 16px (size-4), `md` = 20px (size-5). Two canonical sizes only. */
  size?: IconSize;
}

const SIZE_CLASS: Record<IconSize, string> = {
  sm: "size-4",
  md: "size-5",
};

/**
 * Icon wrapper that enforces the Chef's Table Atelier DS icon rules:
 *   - Only Boxicons (`react-icons/bi`) allowed
 *   - Exactly two sizes: 16px (sm) and 20px (md)
 *   - Inherits currentColor — set color via `text-*` on the wrapping element
 *
 * Example:
 *   <Icon as={BiQrScan} size="md" className="text-foreground" />
 */
export function Icon({
  as: IconComponent,
  size = "md",
  className,
  ...rest
}: IconProps) {
  return (
    <IconComponent
      data-slot="icon"
      data-size={size}
      className={cn(SIZE_CLASS[size], className)}
      {...rest}
    />
  );
}
