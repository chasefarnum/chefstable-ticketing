import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ComboHeader } from "./combo-header";

export interface SwipeCardProps {
  firstName: string;
  lastName: string;
  imageSrc: string;
  venue?: string;
  description?: string;
  onYes?: () => void;
  onNo?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeCard({
  firstName,
  lastName,
  imageSrc,
  venue,
  description,
  onYes,
  onNo,
  threshold = 120,
  className,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const yesOpacity = useTransform(x, [0, threshold], [0, 1]);
  const noOpacity = useTransform(x, [-threshold, 0], [1, 0]);
  const [exited, setExited] = useState(false);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > threshold) {
      setExited(true);
      onYes?.();
    } else if (info.offset.x < -threshold) {
      setExited(true);
      onNo?.();
    }
  };

  return (
    <motion.div
      data-slot="swipe-card"
      drag={exited ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, touchAction: "none", userSelect: "none" }}
      animate={exited ? { x: x.get() > 0 ? 800 : -800, opacity: 0 } : undefined}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative w-full max-w-sm mx-auto aspect-[3/4] bg-card text-card-foreground overflow-hidden",
        "ring-1 ring-foreground/10 shadow-lg cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      <img
        src={imageSrc}
        alt={`${firstName} ${lastName}`}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        draggable={false}
      />
      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent text-white pointer-events-none">
        {venue && (
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/70">
            {venue}
          </p>
        )}
        <div className="mt-1">
          <ComboHeader first={firstName} last={lastName} size="sm" className="text-white" />
        </div>
        {description && (
          <p className="mt-2 font-serif text-sm leading-relaxed text-white/90 line-clamp-2">
            {description}
          </p>
        )}
      </div>
      {/* YES overlay */}
      <motion.div
        aria-hidden
        style={{ opacity: yesOpacity }}
        className="absolute inset-0 flex items-start justify-start p-6 bg-success/30 ring-4 ring-success pointer-events-none"
      >
        <span className="font-sans text-4xl font-bold uppercase tracking-widest text-success-foreground rotate-[-12deg] mt-8 ml-2 px-3 py-1 border-4 border-success-foreground">
          Yes
        </span>
      </motion.div>
      {/* NO overlay */}
      <motion.div
        aria-hidden
        style={{ opacity: noOpacity }}
        className="absolute inset-0 flex items-start justify-end p-6 bg-destructive/30 ring-4 ring-destructive pointer-events-none"
      >
        <span className="font-sans text-4xl font-bold uppercase tracking-widest text-destructive-foreground rotate-[12deg] mt-8 mr-2 px-3 py-1 border-4 border-destructive-foreground">
          No
        </span>
      </motion.div>
    </motion.div>
  );
}
