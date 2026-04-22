import * as React from "react";
import { Link } from "wouter";
import type { IconType } from "react-icons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

export interface ModuleTileProps {
  /** Boxicons component from `react-icons/bi`. Rendered at 20px (md). */
  icon: IconType;
  title: string;
  /** Short mono-uppercase subtitle displayed under the title. */
  sublabel?: string;
  description?: string;
  /** Tag shown in the top-right CardAction slot. */
  tag?: {
    label: string;
    variant?: BadgeVariant;
  };
  /** Wouter href. Renders the footer CTA as a Link. */
  href: string;
  ctaLabel?: string;
  className?: string;
}

export function ModuleTile({
  icon,
  title,
  sublabel,
  description,
  tag,
  href,
  ctaLabel = "Open module",
  className,
}: ModuleTileProps) {
  return (
    <Card data-slot="module-tile" className={cn("h-full", className)}>
      <CardHeader>
        <Icon as={icon} size="md" className="text-foreground" />
        <CardTitle className="mt-3">{title}</CardTitle>
        {sublabel && (
          <CardDescription>
            <span className="font-mono text-xs uppercase tracking-wider">
              {sublabel}
            </span>
          </CardDescription>
        )}
        {tag && (
          <CardAction>
            <Badge variant={tag.variant ?? "outline"}>{tag.label}</Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={href}>{ctaLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
