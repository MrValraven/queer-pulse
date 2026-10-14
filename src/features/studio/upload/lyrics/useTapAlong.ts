import { useCallback, useState } from "react";
import type { StudioSyncedLyricView } from "../../api/studio.adapters";
import { STUDIO_LISTENING_LIMITS } from "../../api/studio.types";
import { lyricLinesOf } from "./studioLrc";

const NUDGE_MS = 100;
const { syncedLyricsMax, syncedLyricTextMax } = STUDIO_LISTENING_LIMITS;
export type Stamps = readonly (number | null)[];

/** Times the first untimed line; never earlier than the line before it. */
export function stampNext(stamps: Stamps, ms: number): (number | null)[] {
  const index = stamps.indexOf(null);
  if (index === -1) return [...stamps];
  const previous = stamps
    .slice(0, index)
    .reduce<number>((latest, stamp) => Math.max(latest, stamp ?? 0), 0);
  return stamps.map((stamp, stampIndex) =>
    stampIndex === index ? Math.max(ms, previous) : stamp,
  );
}

export type TapLimitProblem =
  { kind: "overLimit" } | { kind: "tooLong"; lineNumber: number };

/** The contract's limits on a timed list, checked on the lyric lines. */
export function tapLimitProblemOf(
  lyricLines: readonly string[],
): TapLimitProblem | null {
  if (lyricLines.length > syncedLyricsMax) return { kind: "overLimit" };
  const longIndex = lyricLines.findIndex(
    (line) => line.length > syncedLyricTextMax,
  );
  return longIndex === -1
    ? null
    : { kind: "tooLong", lineNumber: longIndex + 1 };
}

/** Moves one line by `deltaMs`, kept between its neighbours. */
export function nudgeStamp(
  stamps: Stamps,
  index: number,
  deltaMs: number,
): (number | null)[] {
  const current = stamps[index];
  if (current === null || current === undefined) return [...stamps];
  const lower = index > 0 ? (stamps[index - 1] ?? 0) : 0;
  const upper = stamps[index + 1] ?? Number.POSITIVE_INFINITY;
  const moved = Math.min(upper, Math.max(lower, current + deltaMs));
  return stamps.map((stamp, stampIndex) =>
    stampIndex === index ? moved : stamp,
  );
}

/** Saved timings fill the stamps only when their lines are these lyrics. */
export function initialStampsFor(
  lyricLines: readonly string[],
  saved: readonly StudioSyncedLyricView[] | null,
): (number | null)[] {
  const timed = (saved ?? []).filter((line) => line.text.trim());
  const isMatch =
    timed.length === lyricLines.length &&
    timed.every((line, index) => line.text.trim() === lyricLines[index]);
  return lyricLines.map((_line, index) =>
    isMatch ? (timed[index]?.ms ?? null) : null,
  );
}

export function useTapAlong(
  lyricLines: readonly string[],
  saved: readonly StudioSyncedLyricView[] | null,
) {
  const [stamps, setStamps] = useState(() =>
    initialStampsFor(lyricLines, saved),
  );
  const nextIndex = stamps.indexOf(null);
  return {
    stamps,
    nextIndex: nextIndex === -1 ? stamps.length : nextIndex,
    isComplete: stamps.length > 0 && nextIndex === -1,
    stamp: useCallback(
      (ms: number) => setStamps((previous) => stampNext(previous, ms)),
      [],
    ),
    nudge: useCallback(
      (index: number, direction: -1 | 1) =>
        setStamps((previous) =>
          nudgeStamp(previous, index, direction * NUDGE_MS),
        ),
      [],
    ),
    clear: useCallback(
      () => setStamps((previous) => previous.map(() => null)),
      [],
    ),
    /** The timed lines once every line has a time, else null. */
    toLines: (): StudioSyncedLyricView[] | null =>
      nextIndex === -1 && stamps.length > 0
        ? lyricLines.map((text, index) => ({ ms: stamps[index] ?? 0, text }))
        : null,
  };
}

export type TapAlong = ReturnType<typeof useTapAlong>;
export { lyricLinesOf };
