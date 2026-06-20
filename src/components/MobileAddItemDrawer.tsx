"use client";

import { useCallback, useRef } from "react";
import { btnGhost, btnPrimary } from "@/lib/ui";

const SWIPE_THRESHOLD = 56;

type MobileAddItemDrawerProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  canSubmit: boolean;
  children: React.ReactNode;
  /** Wraps inventory list — swipe left here opens the drawer. */
  surface: React.ReactNode;
};

export function MobileAddItemDrawer({
  open,
  onOpen,
  onClose,
  onSubmit,
  submitting,
  canSubmit,
  children,
  surface,
}: MobileAddItemDrawerProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    axis: "x" | "y" | null;
  } | null>(null);
  const panelDragRef = useRef<{
    startX: number;
    startY: number;
    axis: "x" | "y" | null;
  } | null>(null);

  const onSurfacePointerDown = (e: React.PointerEvent) => {
    if (open || e.pointerType === "mouse") return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      axis: null,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onSurfacePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || open) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.axis) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (drag.axis === "y") return;
    }

    if (drag.axis === "x" && dx < -SWIPE_THRESHOLD) {
      dragRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
      onOpen();
    }
  };

  const onSurfacePointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onPanelPointerDown = (e: React.PointerEvent) => {
    if (!open || e.pointerType === "mouse") return;
    panelDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      axis: null,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPanelPointerMove = (e: React.PointerEvent) => {
    const drag = panelDragRef.current;
    if (!drag || !open) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.axis) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (drag.axis === "y") return;
    }

    if (drag.axis === "x" && dx > SWIPE_THRESHOLD) {
      panelDragRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
      onClose();
    }
  };

  const onPanelPointerUp = (e: React.PointerEvent) => {
    panelDragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onEdgePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (open || e.pointerType === "mouse") return;
      e.preventDefault();
      onOpen();
    },
    [onOpen, open]
  );

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Swipe left to add item"
          onPointerDown={onEdgePointerDown}
          className="fj-add-swipe-tab fixed right-0 top-[42%] z-20 flex w-7 flex-col items-center justify-center gap-0.5 rounded-l-xl border border-r-0 border-border bg-card/95 py-4 shadow-fj-md backdrop-blur-sm sm:hidden"
        >
          <span className="text-lg font-bold leading-none text-accent">+</span>
          <span className="fj-add-swipe-tab-chevron text-[10px] text-muted" aria-hidden>
            ‹
          </span>
        </button>
      )}

      <div
        className="relative sm:contents"
        onPointerDown={onSurfacePointerDown}
        onPointerMove={onSurfacePointerMove}
        onPointerUp={onSurfacePointerUp}
        onPointerCancel={onSurfacePointerUp}
      >
        {surface}
      </div>

      <div
        className={`fixed inset-0 z-40 sm:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close add item"
          onClick={onClose}
          className={`absolute inset-0 bg-background/60 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Add item"
          onPointerDown={onPanelPointerDown}
          onPointerMove={onPanelPointerMove}
          onPointerUp={onPanelPointerUp}
          onPointerCancel={onPanelPointerUp}
          className={`absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col border-l border-border bg-card shadow-fj-lg transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">New item</h2>
              <p className="text-xs text-muted">Swipe right to close</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`${btnGhost} !px-3 !py-1.5 !text-xs`}
            >
              Cancel
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || !canSubmit}
              className={`${btnPrimary} w-full`}
            >
              {submitting ? "Adding…" : "Add to inventory"}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
