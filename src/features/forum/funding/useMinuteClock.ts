import { useEffect, useState } from "react";

const MINUTE_MS = 60 * 1000;
/** One second past the deadline, so the tick lands on the closed side. */
const PAST_DEADLINE_MS = 1000;
/** The longest delay a browser timer holds; a longer one fires at once. */
const MAX_TIMER_DELAY_MS = 2 ** 31 - 1;

/** The current time, refreshed once a minute, for countdowns that must not
 *  outlive their deadline on an open page. With `untilMs`, it also ticks one
 *  second after that instant, so a countdown turns over right on time. */
export function useMinuteClock(untilMs?: number | null): number {
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), MINUTE_MS);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (untilMs === undefined || untilMs === null) return;
    if (!Number.isFinite(untilMs)) return;
    const delayMs = untilMs + PAST_DEADLINE_MS - Date.now();
    if (delayMs <= 0) return;
    const timer = window.setTimeout(
      () => setNowMs(Date.now()),
      Math.min(delayMs, MAX_TIMER_DELAY_MS),
    );
    return () => window.clearTimeout(timer);
  }, [untilMs]);
  return nowMs;
}
