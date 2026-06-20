"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const SWIPE_HINT_KEY = "trasthero-swipe-hint-dismissed";

export { SWIPE_HINT_KEY };

export function SwipeHintBanner() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    try {
      setVisible(localStorage.getItem(SWIPE_HINT_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, [isMobile]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(SWIPE_HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!isMobile || !visible) return null;

  return (
    <div
      className="fj-swipe-hint-banner mb-4 flex items-start gap-3 rounded-xl border border-border bg-card/90 p-3 shadow-fj-sm backdrop-blur-sm sm:hidden"
      role="status"
    >
      <div className="fj-swipe-hint-demo relative mt-0.5 h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
        <div className="fj-swipe-hint-card absolute inset-y-1 left-1 right-1 rounded bg-card shadow-fj-sm" />
        <span className="fj-swipe-hint-chevron-left absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-accent">
          ✎
        </span>
        <span className="fj-swipe-hint-chevron-right absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-highlight">
          ±
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">Swipe items for quick actions</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          <span className="text-accent">Swipe left</span> to edit ·{" "}
          <span className="text-highlight">Swipe right</span> for qty &amp; delete
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss swipe hint"
        className="shrink-0 rounded-full px-2 py-1 text-xs text-muted fj-hover-surface hover:text-foreground"
      >
        Got it
      </button>
    </div>
  );
}

export function dismissSwipeHint() {
  try {
    localStorage.setItem(SWIPE_HINT_KEY, "1");
  } catch {
    /* ignore */
  }
}
