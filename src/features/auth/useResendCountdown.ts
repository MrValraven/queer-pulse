import { useEffect, useState } from "react";

const TICK_MS = 1000;

/** Whole seconds until `iso` (rounded up), 0 when it is null or already past. */
function secondsUntil(iso: string | null): number {
  if (iso === null) return 0;
  const target = Date.parse(iso);
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.ceil((target - Date.now()) / TICK_MS));
}

interface CountdownState {
  resendAvailableAt: string | null;
  secondsLeft: number;
}

/**
 * Seconds left before "Send a new code" opens again. Ticks once a second only
 * while the count is above zero, so a finished countdown leaves no timer.
 */
export function useResendCountdown(resendAvailableAt: string | null): number {
  const [state, setState] = useState<CountdownState>(() => ({
    resendAvailableAt,
    secondsLeft: secondsUntil(resendAvailableAt),
  }));

  // A new challenge restarts the count during render (React's "adjust state
  // when a prop changes" pattern), so the first frame already shows it.
  if (state.resendAvailableAt !== resendAvailableAt) {
    setState({
      resendAvailableAt,
      secondsLeft: secondsUntil(resendAvailableAt),
    });
  }

  const isCounting = state.secondsLeft > 0;
  useEffect(() => {
    if (!isCounting) return undefined;
    const intervalId = window.setInterval(() => {
      setState((previous) => ({
        ...previous,
        secondsLeft: secondsUntil(previous.resendAvailableAt),
      }));
    }, TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [isCounting, resendAvailableAt]);

  return state.secondsLeft;
}
