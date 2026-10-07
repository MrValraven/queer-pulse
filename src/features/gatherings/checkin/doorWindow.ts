/**
 * When the door is open, and what to call the gathering's state on it.
 * Pure, so the Manage page's default tab and the Check-in badge agree.
 */
export const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
const DAY_MS = 24 * HOUR_MS;

/** The door opens this long before the start, for early arrivals and setup. */
export const DOOR_OPENS_BEFORE_MS = 3 * HOUR_MS;
/** And stays open this long after the end, for late check-ins and undo. */
export const DOOR_CLOSES_AFTER_END_MS = 2 * HOUR_MS;
/** A gathering with no stated end is treated as this long. */
export const ASSUMED_LENGTH_MS = 8 * HOUR_MS;

export function gatheringEnd(
  startAt: Date,
  endAt: Date | null | undefined,
): Date {
  return endAt ?? new Date(startAt.getTime() + ASSUMED_LENGTH_MS);
}

export function isDoorWindow(
  startAt: Date,
  endAt: Date | null | undefined,
  now: Date,
): boolean {
  const opensAt = startAt.getTime() - DOOR_OPENS_BEFORE_MS;
  const closesAt =
    endAt != null
      ? endAt.getTime() + DOOR_CLOSES_AFTER_END_MS
      : startAt.getTime() + ASSUMED_LENGTH_MS;
  const nowMs = now.getTime();
  return nowMs >= opensAt && nowMs <= closesAt;
}

export type GatheringLiveState =
  | { kind: "upcoming"; startAt: Date }
  | { kind: "startsIn"; hours: number; minutes: number }
  | { kind: "live" }
  | { kind: "ended" };

export function gatheringLiveState(
  startAt: Date,
  endAt: Date | null | undefined,
  now: Date,
): GatheringLiveState {
  const untilStartMs = startAt.getTime() - now.getTime();
  if (untilStartMs > DAY_MS) return { kind: "upcoming", startAt };
  if (untilStartMs > 0) {
    const totalMinutes = Math.ceil(untilStartMs / MINUTE_MS);
    return {
      kind: "startsIn",
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
    };
  }
  if (now.getTime() <= gatheringEnd(startAt, endAt).getTime()) {
    return { kind: "live" };
  }
  return { kind: "ended" };
}
