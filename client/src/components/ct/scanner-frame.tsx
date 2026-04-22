import { cn } from "@/lib/utils";

export interface ScannerFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  scanning?: boolean;
  label?: string;
  children?: React.ReactNode;
}

export function ScannerFrame({
  scanning = true,
  label = "Align QR within frame",
  className,
  children,
  ...rest
}: ScannerFrameProps) {
  return (
    <div
      data-slot="scanner-frame"
      data-scanning={scanning ? "true" : "false"}
      className={cn(
        "relative aspect-square w-full max-w-md mx-auto bg-black overflow-hidden",
        "ring-1 ring-foreground/20",
        className,
      )}
      {...rest}
    >
      {children}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          scanning && "ring-2 ring-accent/60",
          scanning && "animate-[pulse_1.8s_ease-in-out_infinite]",
        )}
      />
      {/* Four corner reticles */}
      <span aria-hidden className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-accent" />
      <span aria-hidden className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-accent" />
      <span aria-hidden className="absolute left-4 bottom-4 h-6 w-6 border-l-2 border-b-2 border-accent" />
      <span aria-hidden className="absolute right-4 bottom-4 h-6 w-6 border-r-2 border-b-2 border-accent" />
      {label && (
        <div className="absolute inset-x-0 bottom-0 px-4 py-3 text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-white/80">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
