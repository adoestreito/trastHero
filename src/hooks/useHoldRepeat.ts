"use client";

import { useCallback, useEffect, useRef } from "react";

type UseHoldRepeatOptions = {
  disabled?: boolean;
  /** Delay before repeating starts after the initial tick. */
  initialDelay?: number;
  /** Fastest interval between repeats (ms). */
  minInterval?: number;
  /** Starting repeat interval after the initial delay (ms). */
  startInterval?: number;
};

export function useHoldRepeat(
  onRepeat: () => boolean | void,
  {
    disabled = false,
    initialDelay = 350,
    minInterval = 55,
    startInterval = 220,
  }: UseHoldRepeatOptions = {}
) {
  const activeRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRepeatRef = useRef(onRepeat);
  onRepeatRef.current = onRepeat;

  const clear = useCallback(() => {
    activeRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(
    (iteration: number) => {
      if (!activeRef.current) return;

      const delay = Math.max(
        minInterval,
        startInterval - iteration * 18
      );

      timeoutRef.current = setTimeout(() => {
        if (!activeRef.current) return;

        const keepGoing = onRepeatRef.current();
        if (keepGoing === false) {
          clear();
          return;
        }

        scheduleNext(iteration + 1);
      }, delay);
    },
    [clear, minInterval, startInterval]
  );

  const start = useCallback(() => {
    if (disabled) return;

    clear();
    activeRef.current = true;

    const keepGoing = onRepeatRef.current();
    if (keepGoing === false) {
      clear();
      return;
    }

    timeoutRef.current = setTimeout(() => {
      scheduleNext(0);
    }, initialDelay);
  }, [clear, disabled, initialDelay, scheduleNext]);

  const stop = useCallback(() => {
    clear();
  }, [clear]);

  useEffect(() => clear, [clear]);

  return { start, stop };
}
