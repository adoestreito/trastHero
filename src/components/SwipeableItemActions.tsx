"use client";

import { useCallback, useRef, useState } from "react";
import { HoldRepeatButton } from "@/components/HoldRepeatButton";
import { dismissSwipeHint } from "@/components/SwipeHintBanner";

const LEFT_ACTION_WIDTH = 132;
const RIGHT_ACTION_WIDTH = 76;
const SNAP_THRESHOLD = 44;

type SwipeableItemActionsProps = {
  children: React.ReactNode;
  disabled?: boolean;
  quantity: number;
  onAdjust: (delta: number) => boolean;
  onAdjustEnd: () => void;
  onDelete: () => void;
  onEdit: () => void;
  busy?: boolean;
  demoHint?: boolean;
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

function EditIcon() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
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
  onEdit,
  busy,
  demoHint = false,
}: SwipeableItemActionsProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef(0);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startOffset: number;
    axis: "x" | "y" | null;
  } | null>(null);

  const close = useCallback(() => {
    offsetRef.current = 0;
    setOffset(0);
  }, []);

  const applyOffset = useCallback((next: number) => {
    offsetRef.current = next;
    setOffset(next);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || e.pointerType === "mouse") return;
    dismissSwipeHint();
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
      -RIGHT_ACTION_WIDTH,
      Math.min(LEFT_ACTION_WIDTH, drag.startOffset + dx)
    );
    applyOffset(next);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const finalOffset = offsetRef.current;
    dragRef.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (finalOffset < -RIGHT_ACTION_WIDTH * 0.85 && !busy && !disabled) {
      close();
      dismissSwipeHint();
      onEdit();
      return;
    }

    if (finalOffset > SNAP_THRESHOLD) {
      applyOffset(LEFT_ACTION_WIDTH);
    } else if (finalOffset < -SNAP_THRESHOLD) {
      applyOffset(-RIGHT_ACTION_WIDTH);
    } else {
      close();
    }
  };

  const decrease = useCallback(() => onAdjust(-1), [onAdjust]);
  const increase = useCallback(() => onAdjust(1), [onAdjust]);

  const runEdit = () => {
    close();
    dismissSwipeHint();
    onEdit();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute inset-y-0 left-0 z-0 flex w-[8.25rem] items-stretch md:hidden"
        aria-hidden={offset <= 0}
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
        className="absolute inset-y-0 right-0 z-0 flex w-[4.75rem] items-stretch md:hidden"
        aria-hidden={offset >= 0}
      >
        <button
          type="button"
          aria-label="Edit item"
          disabled={disabled || busy}
          onClick={runEdit}
          className="flex flex-1 flex-col items-center justify-center gap-1 bg-highlight text-[11px] font-semibold text-[#0a1628] transition-colors active:opacity-90 disabled:opacity-40"
        >
          <EditIcon />
          Edit
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
        <div className={demoHint ? "fj-swipe-item-demo" : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}
