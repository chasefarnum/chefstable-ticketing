import { BiSun, BiMoon } from "react-icons/bi";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  className?: string;
}

/**
 * Two-button segmented control for flipping between the app's light and dark
 * themes. Ported from `chefs-table-ds/src/components/ds/theme-toggle.tsx` with
 * the next-themes dependency swapped for the app-local `useTheme()` hook.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) return null;

  const isDark = theme === "dark";
  const setTheme = (next: "light" | "dark") => {
    if (next !== theme) toggleTheme();
  };

  return (
    <div
      data-slot="theme-toggle"
      className={cn(
        "flex h-8 items-center gap-0.5 rounded-sm border border-border/20 bg-muted/30 p-0.5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Light mode"
        aria-pressed={!isDark}
        className={cn(
          "flex size-7 items-center justify-center rounded-sm transition-colors",
          !isDark
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <BiSun size={14} />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
        aria-pressed={isDark}
        className={cn(
          "flex size-7 items-center justify-center rounded-sm transition-colors",
          isDark
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <BiMoon size={14} />
      </button>
    </div>
  );
}
