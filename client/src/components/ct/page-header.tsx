import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  size?: "default" | "sm";
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  size = "default",
  className,
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      data-size={size}
      className={cn(
        "flex flex-col gap-3",
        size === "default" ? "mb-16 md:mb-20" : "mb-10 md:mb-12",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-3">
          {eyebrow && (
            <span
              data-slot="page-header-eyebrow"
              className="font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground"
            >
              {eyebrow}
            </span>
          )}
          <h1
            data-slot="page-header-title"
            className={cn(
              "font-sans font-light tracking-tight",
              size === "default"
                ? "text-3xl sm:text-4xl md:text-5xl"
                : "text-2xl sm:text-3xl",
            )}
          >
            {title}
          </h1>
        </div>
        {meta && (
          <div
            data-slot="page-header-meta"
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
          >
            {meta}
          </div>
        )}
      </div>
      {description && (
        <p
          data-slot="page-header-description"
          className="max-w-2xl text-sm text-muted-foreground md:text-base"
        >
          {description}
        </p>
      )}
    </div>
  );
}
