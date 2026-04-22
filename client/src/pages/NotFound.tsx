import { Link, useLocation } from "wouter";
import { ComboHeader } from "@/components/ct";

export default function NotFound() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-2xl px-6 py-20 flex flex-col items-center text-center gap-8">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          404 · route {location}
        </span>

        <ComboHeader first="Not" last="Found" size="lg" />

        <p className="font-serif text-base leading-relaxed text-muted-foreground max-w-md">
          The surface you requested is off the menu tonight. It may have moved, or it may never have existed.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-foreground ring-1 ring-foreground hover:bg-foreground hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <i className="bx bx-home" />
          Return to the hub
        </Link>
      </div>
    </div>
  );
}
