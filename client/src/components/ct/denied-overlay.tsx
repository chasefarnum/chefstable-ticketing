import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DeniedOverlayProps {
  open: boolean;
  onDismiss?: () => void;
  title?: string;
  reason?: string;
  detail?: string;
  dismissLabel?: string;
  className?: string;
}

export function DeniedOverlay({
  open,
  onDismiss,
  title = "Denied",
  reason = "Underage guest",
  detail,
  dismissLabel = "Dismiss",
  className,
}: DeniedOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="alertdialog"
          aria-modal
          aria-label={`${title}: ${reason}`}
          data-slot="denied-overlay"
          className={cn(
            "fixed inset-0 z-[200] flex flex-col items-center justify-center",
            "bg-destructive text-destructive-foreground p-8",
            className,
          )}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: [0, -4, 4, -4, 4, 0],
            transition: { opacity: { duration: 0.15 }, x: { duration: 0.4 } },
          }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <span className="font-mono text-xs font-semibold uppercase tracking-widest opacity-80">
            Check-in
          </span>
          <h1 className="mt-4 font-sans font-light text-6xl md:text-8xl uppercase tracking-tight">
            {title}
          </h1>
          <p className="mt-6 font-serif text-xl md:text-2xl text-center max-w-xl">
            {reason}
          </p>
          {detail && (
            <p className="mt-3 font-mono text-xs uppercase tracking-widest opacity-80">
              {detail}
            </p>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={cn(
                "mt-10 inline-flex items-center justify-center h-11 px-6",
                "font-sans text-sm font-semibold uppercase tracking-widest",
                "bg-transparent text-destructive-foreground border border-destructive-foreground/60",
                "hover:bg-destructive-foreground/10 transition-colors",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-destructive-foreground/40",
              )}
              autoFocus
            >
              {dismissLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
