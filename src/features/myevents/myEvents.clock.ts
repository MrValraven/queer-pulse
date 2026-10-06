import { DEMO_NOW } from "./myEvents.data";

/**
 * The clock every My events surface reads: the agenda's grouping, the soon bar,
 * the calendar's today cell and the year insights.
 *
 * Demo mode stays pinned to `DEMO_NOW`. Every demo registry is hand-dated
 * around that Monday afternoon, so a moving clock would turn the whole
 * prototype into history within days. Live mode reads the real date and time.
 *
 * `useMyEventsState` sets the mode at the top of the provider's render, so it
 * is in place before any child (or the calendar's first view month) reads it.
 * Until then, which is every unit test that mounts no provider, the demo
 * anchor holds.
 */
let isDemoClock = true;

/** Point the clock at the demo anchor (`true`) or the real time (`false`). */
export function setMyEventsDemoClock(isDemo: boolean): void {
  isDemoClock = isDemo;
}

/** The current instant: the demo anchor in demo mode, the real time live. */
export function clockNow(): Date {
  return isDemoClock ? new Date(DEMO_NOW) : new Date();
}

/** Midnight at the start of `clockNow()`'s day. */
export function clockToday(): Date {
  const startOfDay = clockNow();
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}
