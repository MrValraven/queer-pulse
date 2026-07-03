import { useCallback, useEffect, useState } from "react";
import { HOLD_SECONDS } from "./checkout.data";

export function fmtClock(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ":" + (sec < 10 ? "0" : "") + sec;
}

/** Counts a 10-minute seat hold down to zero; pauses once paid. */
export function useSeatHold(paused: boolean) {
  const [left, setLeft] = useState(HOLD_SECONDS);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setLeft((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  const reHold = useCallback(() => setLeft(HOLD_SECONDS), []);

  return { left, expired: left <= 0, reHold };
}
