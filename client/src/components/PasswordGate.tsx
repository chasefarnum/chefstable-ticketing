// Login gate — pre-auth brand surface. Blocks every route until the correct
// password is entered; persists unlock in sessionStorage. Full DS token
// coverage so the gate flips correctly when the attendee toggles theme.
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiShow, BiHide, BiErrorCircle } from "react-icons/bi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ct";

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
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
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
        data-slot="password-gate"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground p-4"
      >
        <motion.div
          animate={shaking ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[402px]"
        >
          <div className="rounded-lg overflow-hidden">
            <div className="flex flex-col gap-5 px-6 py-7">
              <div className="mx-auto flex w-[240px] flex-col items-center gap-3">
                <img
                  src="/brand/ct-event-logo.svg"
                  alt="Chef's Table"
                  className="w-full h-auto"
                />
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <p className="font-sans font-light text-base uppercase tracking-widest text-foreground">
                    August 13–16, 2026
                  </p>
                  <p className="font-sans font-light text-base uppercase tracking-widest text-muted-foreground">
                    Park City, Utah
                  </p>
                </div>
              </div>

              {/* Password field */}
              <div className="mt-6 flex flex-col gap-2">
                <Label htmlFor="gate-password" className="sr-only">
                  Access password
                </Label>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    id="gate-password"
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      if (error) setError(false);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    aria-invalid={error}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <Icon
                      as={showPassword ? BiHide : BiShow}
                      size="sm"
                    />
                  </Button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      role="alert"
                      className="flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-wider text-destructive"
                    >
                      <Icon as={BiErrorCircle} size="sm" />
                      Incorrect password
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button
                className="w-full"
                disabled={value.length === 0}
                onClick={attempt}
              >
                Login
              </Button>

              <p className="mt-2 text-center font-mono text-xs text-secondary-foreground leading-snug">
                This site is private.
                <br />
                Enter your access password to continue.
              </p>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
