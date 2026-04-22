import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

import { cn } from "@/lib/utils";

/**
 * Accordion primitive ported from the Atelier Design System spec
 * (`chefs-table-ds/src/components/ui/accordion.tsx`). Key DS details:
 *   - Trigger text: `font-semibold uppercase tracking-widest`
 *   - Dual Boxicons chevron: `BiChevronDown` (collapsed) / `BiChevronUp` (open)
 *   - 2px radius focus ring (gold, via tokens)
 *   - `not-last:border-b` separator between items
 * Consumers can override via `className` when a richer trigger layout is needed.
 */

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b border-border", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-center justify-between gap-3 rounded-lg border border-transparent py-2.5 text-left text-sm font-semibold uppercase tracking-widest transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        <span
          data-slot="accordion-trigger-icon"
          aria-hidden
          className="pointer-events-none inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover/accordion-trigger:bg-muted group-hover/accordion-trigger:text-foreground dark:group-hover/accordion-trigger:bg-muted/50 [&_svg]:size-5"
        >
          <BiChevronDown className="group-data-[state=open]/accordion-trigger:hidden" />
          <BiChevronUp className="hidden group-data-[state=open]/accordion-trigger:inline" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pt-0 pb-2.5", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
