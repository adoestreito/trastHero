"use client";

import { useCallback, useRef, useState } from "react";
import { HoldRepeatButton } from "@/components/HoldRepeatButton";

const ACTION_WIDTH = 132;
const SNAP_THRESHOLD = 44;

type SwipeableItemActionsProps = {
  children: React.ReactNode;
  disabled?: boolean;
  quantity: number;
  onAdjust: (delta: number) => boolean;
  onAdjustEnd: () => void;
  onDelete: () => void;
  busy?: boolean;
};

function TrashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function SwipeableItemActions({
  children,
  disabled,
  quantity,
  onAdjust,
  onAdjustEnd,
  onDelete,
  busy,
}: SwipeableItemActionsProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startOffset: number;
    axis: "x" | "y" | null;
  } | null>(null);

  const close = useCallback(() => setOffset(0), []);

  const snap = useCallback(() => {
    setOffset((current) => (current > SNAP_THRESHOLD ? ACTION_WIDTH : 0));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || e.pointerType === "mouse") return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffset: offset,
      axis: null,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || disabled) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (drag.axis === "y") return;
    }

    if (drag.axis !== "x") return;

    e.preventDefault();
    const next = Math.max(
      0,
      Math.min(ACTION_WIDTH, drag.startOffset + dx)
    );
    setOffset(next);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    snap();
  };

  const decrease = useCallback(() => onAdjust(-1), [onAdjust]);
  const increase = useCallback(() => onAdjust(1), [onAdjust]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute inset-y-0 left-0 z-0 flex w-[8.25rem] items-stretch md:hidden"
        aria-hidden={offset === 0}
      >
        <HoldRepeatButton
          label="Decrease quantity"
          disabled={disabled || busy || quantity <= 0}
          onRepeat={decrease}
          onRelease={onAdjustEnd}
          className="flex flex-1 select-none items-center justify-center bg-accent/90 text-lg font-semibold text-accent-foreground transition-colors active:bg-accent disabled:opacity-40"
        >
          −
        </HoldRepeatButton>
        <HoldRepeatButton
          label="Increase quantity"
          disabled={disabled || busy}
          onRepeat={increase}
          onRelease={onAdjustEnd}
          className="flex flex-1 select-none items-center justify-center bg-accent text-lg font-semibold text-accent-foreground transition-colors active:bg-accent-hover disabled:opacity-40"
        >
          +
        </HoldRepeatButton>
        <button
          type="button"
          aria-label="Delete item"
          disabled={disabled || busy}
          onClick={() => {
            close();
            onDelete();
          }}
          className="flex flex-1 items-center justify-center bg-danger text-accent-foreground transition-colors hover:bg-danger/90 disabled:opacity-40"
        >
          <TrashIcon />
        </button>
      </div>

      <div
        className={`relative z-10 touch-pan-y ${dragging ? "" : "transition-transform duration-200 ease-out"}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}
