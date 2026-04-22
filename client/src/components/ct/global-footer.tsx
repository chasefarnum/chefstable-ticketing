import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FooterPolicy {
  label: string;
  href: string;
}

export interface GlobalFooterProps extends React.HTMLAttributes<HTMLElement> {
  policies?: FooterPolicy[];
  onSubscribe?: (email: string) => void;
  logoSrc?: string;
  logoAlt?: string;
  copy?: string;
}

const DEFAULT_POLICIES: FooterPolicy[] = [
  { label: "FAQ", href: "#faq" },
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Return Policy", href: "#returns" },
  { label: "Shipping Policy", href: "#shipping" },
  { label: "Terms of Use", href: "#terms" },
];

export function GlobalFooter({
  policies = DEFAULT_POLICIES,
  onSubscribe,
  logoSrc = "/brand/logo.svg",
  logoAlt = "Chef's Table",
  copy = `© ${new Date().getFullYear()} Chef's Table. All rights reserved.`,
  className,
  ...rest
}: GlobalFooterProps) {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && onSubscribe) onSubscribe(email);
    setEmail("");
  };

  return (
    <footer data-slot="global-footer" className={cn("ct-footer", className)} {...rest}>
      <div data-slot="global-footer-inner" className="ct-footer-inner">
        <div className="ct-footer-main">
          <div data-slot="global-footer-brand" className="ct-footer-brand">
            <img src={logoSrc} alt={logoAlt} />
          </div>
          <div className="ct-footer-right">
            <nav data-slot="global-footer-policies" className="ct-footer-policies">
              {policies.map(p => (
                <a key={p.label} href={p.href} className="ct-btn ct-btn-link">
                  {p.label}
                </a>
              ))}
            </nav>
            <form
              data-slot="global-footer-subscribe"
              className="ct-footer-subscribe"
              onSubmit={submit}
            >
              <label htmlFor="footer-subscribe-email" className="sr-only">
                Your email address
              </label>
              <input
                id="footer-subscribe-email"
                className="ct-input"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button className="ct-btn ct-btn-default" type="submit">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="ct-sep" role="separator" />
        <p className="ct-footer-copy">{copy}</p>
      </div>
    </footer>
  );
}
