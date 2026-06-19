"use client";

import { useTheme } from "@/components/ThemeProvider";
import type { Theme } from "@/lib/theme";

const optionClass = (active: boolean) =>
  `rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-3.5 sm:text-sm ${
    active
      ? "fj-pill-active"
      : "text-muted fj-hover-surface hover:text-foreground"
  }`;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  return (
    <div
      className={`flex rounded-full border border-border bg-card/60 p-1 shadow-fj-sm backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Color theme"
    >
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={optionClass(theme === value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
