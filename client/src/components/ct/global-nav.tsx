import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  dropdown?: boolean;
}

export interface GlobalNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: NavItem[];
  cartCount?: number;
  onCartClick?: () => void;
  logoSrc?: string;
  logoAlt?: string;
}

const DEFAULT_ITEMS: NavItem[] = [
  { label: "Tickets", href: "/checkout", dropdown: false },
  { label: "Preferences", href: "/preferences", dropdown: false },
  { label: "Swipe", href: "/swipe", dropdown: false },
  { label: "Concierge", href: "/concierge", dropdown: false },
];

export function GlobalNav({
  items = DEFAULT_ITEMS,
  cartCount = 0,
  onCartClick,
  logoSrc = "/brand/ct-logo.svg",
  logoAlt = "Chef's Table",
  className,
  ...rest
}: GlobalNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header data-slot="global-nav" className={cn("ct-nav", className)} {...rest}>
      <div data-slot="global-nav-inner" className="ct-nav-inner">
        <Link href="/" className="ct-nav-logo" data-slot="global-nav-logo">
          <img src={logoSrc} alt={logoAlt} />
        </Link>
        <nav data-slot="global-nav-links" className="ct-nav-links">
          {items.map(i => (
            <Link key={i.label} href={i.href}>
              {i.label}
              {i.dropdown && <i className="bx bx-chevron-down" />}
            </Link>
          ))}
          <button
            className="ct-btn ct-btn-ghost ct-btn-icon"
            aria-label="Shopping bag"
            onClick={onCartClick}
            style={{ position: "relative" }}
          >
            <i className="bx bx-shopping-bag" style={{ fontSize: 20 }} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  background: "var(--accent)",
                  color: "var(--accent-foreground)",
                  borderRadius: "50%",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </nav>
        <div data-slot="global-nav-mobile-toggle" className="ct-nav-mobile-toggle">
          <button
            className="ct-btn ct-btn-ghost ct-btn-icon"
            aria-label="Cart"
            onClick={onCartClick}
          >
            <i className="bx bx-shopping-bag" style={{ fontSize: 20 }} />
          </button>
          <button
            className="ct-btn ct-btn-ghost ct-btn-icon"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <i className={`bx ${open ? "bx-x" : "bx-menu"}`} style={{ fontSize: 22 }} />
          </button>
        </div>
      </div>
      <nav
        data-slot="global-nav-mobile-menu"
        className={cn("ct-nav-mobile-menu", open && "open")}
      >
        {items.map(i => (
          <Link key={i.label} href={i.href} onClick={() => setOpen(false)}>
            <span>{i.label}</span>
            {i.dropdown && <i className="bx bx-chevron-right" />}
          </Link>
        ))}
      </nav>
    </header>
  );
}
