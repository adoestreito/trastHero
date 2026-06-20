"use client";

import { useTheme } from "@/components/ThemeProvider";
import type { Theme } from "@/lib/theme";

const optionClass = (active: boolean, compact: boolean) =>
  `rounded-full font-medium transition-all ${
    compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs sm:px-3.5 sm:text-sm"
  } ${
    active
      ? "fj-pill-active"
      : "text-muted fj-hover-surface hover:text-foreground"
  }`;

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon?: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <SunIcon /> },
    { value: "dark", label: "Dark", icon: <MoonIcon /> },
  ];

  return (
    <div
      className={`flex rounded-full border border-border bg-card/60 p-0.5 shadow-fj-sm backdrop-blur-sm sm:p-1 ${className}`}
      role="group"
      aria-label="Color theme"
    >
      {options.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className={optionClass(theme === value, compact)}
        >
          {compact ? icon : label}
        </button>
      ))}
    </div>
  );
}
