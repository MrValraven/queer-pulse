import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjLoopMode,
} from "../../../shared/contracts/vj";

/** The part of a video that loops, in ms from its start. */
export interface VjLoopSpan {
  inMs: number;
  outMs: number;
}

function clampNumber(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

/**
 * The stored points as a span over the clip; null for a GIF or a clip with no
 * duration. A null point reads as the clip's own end (contract 3: `in` alone
 * loops to the end, `out` alone loops from 0). A video shorter than
 * `VJ_LIMITS.loopMinLengthMs` has no span either: it can only loop whole.
 */
export function vjLoopSpanOf(
  clip: Pick<VjClipDTO, "mediaKind" | "durationMs" | "loopInMs" | "loopOutMs">,
): VjLoopSpan | null {
  const durationMs = clip.durationMs;
  if (clip.mediaKind !== "video" || durationMs === null) return null;
  if (durationMs < VJ_LIMITS.loopMinLengthMs) return null;
  return {
    inMs: clampNumber(clip.loopInMs ?? 0, 0, durationMs),
    outMs: clampNumber(clip.loopOutMs ?? durationMs, 0, durationMs),
  };
}

/**
 * Moves one handle and keeps the span at least `VJ_LIMITS.loopMinLengthMs`
 * inside `0..durationMs`. The moved handle yields: it stops short of the other
 * one, and only at the clip's very ends does the other handle make room.
 */
export function clampVjLoopSpan(
  span: VjLoopSpan,
  moved: "in" | "out",
  durationMs: number,
): VjLoopSpan {
  const minLengthMs = Math.min(VJ_LIMITS.loopMinLengthMs, durationMs);
  let inMs = clampNumber(Math.round(span.inMs), 0, durationMs);
  let outMs = clampNumber(Math.round(span.outMs), 0, durationMs);
  if (moved === "in") {
    inMs = Math.min(inMs, durationMs - minLengthMs, outMs - minLengthMs);
    inMs = Math.max(inMs, 0);
    outMs = Math.max(outMs, inMs + minLengthMs);
  } else {
    outMs = Math.max(outMs, minLengthMs, inMs + minLengthMs);
    outMs = Math.min(outMs, durationMs);
    inMs = Math.min(inMs, outMs - minLengthMs);
  }
  return { inMs, outMs };
}

/** The PATCH body for a span: a start at 0 and an end at the duration are
 *  sent as null, so the whole clip has one stored form. */
export function vjLoopPatchOf(
  span: VjLoopSpan,
  durationMs: number,
): { loopInMs: number | null; loopOutMs: number | null } {
  return {
    loopInMs: span.inMs <= 0 ? null : Math.round(span.inMs),
    loopOutMs: span.outMs >= durationMs ? null : Math.round(span.outMs),
  };
}

/** Where the playhead sits `elapsedMs` after the loop started, at `speed`,
 *  for loop (back to the start at the end) or ping-pong (back and forth). */
export function vjLoopPlayheadMs(
  elapsedMs: number,
  span: VjLoopSpan,
  mode: VjLoopMode,
  speed: number,
): number {
  const lengthMs = span.outMs - span.inMs;
  if (lengthMs <= 0) return span.inMs;
  const travelledMs = Math.max(0, elapsedMs) * speed;
  if (mode === "loop") return span.inMs + (travelledMs % lengthMs);
  const phaseMs = travelledMs % (lengthMs * 2);
  return phaseMs <= lengthMs
    ? span.inMs + phaseMs
    : span.outMs - (phaseMs - lengthMs);
}

const decimalSeparatorCache = new Map<string, string>();

/** The locale's decimal mark ("." in English, "," in pt-PT), cached because
 *  the readouts re-render on every scrub frame. */
function decimalSeparatorOf(locale: string): string {
  const cached = decimalSeparatorCache.get(locale);
  if (cached !== undefined) return cached;
  const separator =
    new Intl.NumberFormat(locale)
      .formatToParts(1.5)
      .find((part) => part.type === "decimal")?.value ?? ".";
  decimalSeparatorCache.set(locale, separator);
  return separator;
}

/** "0:01.2": minutes, seconds, tenths. With a `locale` the tenths follow its
 *  decimal mark, so pt-PT reads "0:01,2" beside its "0,25x" speeds. */
export function formatVjLoopTime(ms: number, locale?: string): string {
  const tenths = Math.floor(Math.max(0, ms) / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  const separator = locale === undefined ? "." : decimalSeparatorOf(locale);
  return `${minutes}:${String(seconds).padStart(2, "0")}${separator}${tenths % 10}`;
}
