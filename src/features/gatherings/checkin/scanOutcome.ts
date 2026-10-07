import type { AttendeeRow } from "../api/events.adapters";

/** A returned stamp older than this, relative to when the request left,
 *  belongs to an earlier check-in: the server's check-in is idempotent and
 *  hands back the original time. */
export const REPEAT_ARRIVAL_THRESHOLD_MS = 10_000;
/** One card held still in the frame reads many times a second. */
export const SAME_CARD_COOLDOWN_MS = 4_000;
/** How long a scan's result card stays up before the scanner resumes. */
export const SCAN_RESULT_VISIBLE_MS = 2_500;

export type ScanOutcome =
  | { kind: "welcome"; attendee: AttendeeRow }
  | { kind: "repeat"; attendee: AttendeeRow }
  | { kind: "refused"; message: string }
  | { kind: "closed" };

export function isRepeatArrival(
  checkedInAt: Date | null | undefined,
  requestStartedAt: Date,
): boolean {
  if (!checkedInAt) return false;
  return (
    requestStartedAt.getTime() - checkedInAt.getTime() >
    REPEAT_ARRIVAL_THRESHOLD_MS
  );
}

/**
 * Welcome or "already arrived" for one card read. A held card re-reads once
 * the scan gate's cooldown passes, inside the repeat threshold, so the stamp's
 * age alone would welcome the same check-in twice. The server hands back the
 * original stamp for a check-in that still stands, so a read whose stamp
 * matches the one this tab recorded is that same check-in. A different, fresh
 * stamp is a new check-in (another host undid the earlier one on their own
 * device) and welcomes the guest again.
 *
 * `recordedStampMs` is the stamp of this tab's last check-in for the guest, by
 * card welcome or by name: `undefined` when this tab has recorded none, `null`
 * when the server sent that check-in back without a stamp. Without both stamps
 * the reads cannot be told apart, so the held-card guard wins and the read is
 * a repeat.
 */
export function classifyCardScan(
  checkedInAt: Date | null | undefined,
  requestStartedAt: Date,
  recordedStampMs: number | null | undefined,
): "welcome" | "repeat" {
  if (isRepeatArrival(checkedInAt, requestStartedAt)) return "repeat";
  if (recordedStampMs === undefined) return "welcome";
  if (!checkedInAt || recordedStampMs === null) return "repeat";
  return checkedInAt.getTime() === recordedStampMs ? "repeat" : "welcome";
}

/**
 * The guest's recorded stamp once a card read is classified, `undefined` for
 * no record. A welcome records the stamp it came back with. A repeat for a
 * guest this tab has recorded takes the returned stamp when there is one, so a
 * check-in first recorded without a stamp becomes comparable on the next read.
 */
export function recordedStampAfterScan(
  kind: "welcome" | "repeat",
  checkedInAt: Date | null | undefined,
  recordedStampMs: number | null | undefined,
): number | null | undefined {
  const returnedStampMs = checkedInAt?.getTime() ?? null;
  if (kind === "welcome") return returnedStampMs;
  if (recordedStampMs === undefined) return undefined;
  return returnedStampMs ?? recordedStampMs;
}

export interface ScanGate {
  shouldAccept: (token: string, nowMs: number) => boolean;
}

export function createScanGate(
  cooldownMs: number = SAME_CARD_COOLDOWN_MS,
): ScanGate {
  const lastAcceptedAt = new Map<string, number>();
  return {
    shouldAccept(token, nowMs) {
      const previous = lastAcceptedAt.get(token);
      if (previous !== undefined && nowMs - previous < cooldownMs) return false;
      lastAcceptedAt.set(token, nowMs);
      return true;
    },
  };
}
