"use client";

import { useHoldRepeat } from "@/hooks/useHoldRepeat";

type HoldRepeatButtonProps = {
  label: string;
  disabled?: boolean;
  onRepeat: () => boolean | void;
  onRelease?: () => void;
  className?: string;
  children: React.ReactNode;
};

export function HoldRepeatButton({
  label,
  disabled,
  onRepeat,
  onRelease,
  className,
  children,
}: HoldRepeatButtonProps) {
  const { start, stop } = useHoldRepeat(onRepeat, { disabled });

  const handleStop = () => {
    stop();
    onRelease?.();
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={className}
      onPointerDown={(e) => {
        e.preventDefault();
        start();
      }}
      onPointerUp={handleStop}
      onPointerLeave={handleStop}
      onPointerCancel={handleStop}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}
