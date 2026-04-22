// Design: Dark full-screen overlay, centred card, chef's table brand aesthetic
// Blocks all routes until correct password is entered; persists unlock in sessionStorage
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ChevronRight } from "lucide-react";

const SESSION_KEY = "chefs_table_unlocked";
const CORRECT_PASSWORD = "hungryfortickets";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [value, setValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!unlocked) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [unlocked]);

  const attempt = () => {
    if (value === CORRECT_PASSWORD) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      setError(false);
      setUnlocked(true);
    } else {
      setError(true);
      setShaking(true);
      setValue("");
      setTimeout(() => setShaking(false), 600);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") attempt();
    if (error) setError(false);
  };

  if (unlocked) return <>{children}</>;

  return (
    <AnimatePresence>
      <motion.div
        key="gate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 70%)",
        }}
      >
        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />

        <motion.div
          animate={shaking ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-sm mx-4"
        >
          {/* Card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
            {/* Top accent bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

            <div className="px-8 py-10">
              {/* Logo / icon */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground tracking-tight text-center">
                  Chef's Table
                </h1>
                <p className="text-xs text-muted-foreground mt-1 text-center tracking-widest uppercase">
                  Park City · August 13–16
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-border mb-6" />

              <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                This site is private. Enter your access password to continue.
              </p>

              {/* Input */}
              <div className="relative mb-3">
                <input
                  ref={inputRef}
                  type={showPassword ? "text" : "password"}
                  value={value}
                  onChange={(e) => { setValue(e.target.value); if (error) setError(false); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className={`w-full bg-background border rounded-xl px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:ring-2 ${
                    error
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-border focus:border-amber-400/60 focus:ring-amber-400/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 text-center mb-3"
                  >
                    Incorrect password. Please try again.
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <button
                onClick={attempt}
                disabled={value.length === 0}
                className="w-full py-3 bg-amber-400 text-background rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              >
                Enter
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground/40 mt-4">
            Authorised attendees &amp; staff only
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
