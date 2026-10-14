import { STUDIO_LISTENING_LIMITS } from "../../api/studio.types";

export interface LrcLine {
  ms: number;
  text: string;
}

export interface LrcProblem {
  lineNumber: number;
  text: string;
  reason: "noStamp" | "tooLong";
}

export interface LrcParseResult {
  lines: LrcLine[];
  problems: LrcProblem[];
  /** More timed lines than `syncedLyricsMax`: the contract refuses the list. */
  isOverLimit: boolean;
}

const { syncedLyricsMax, syncedLyricTextMax, syncedLyricMsMax } =
  STUDIO_LISTENING_LIMITS;
/** A leading stamp, read with the sticky flag one after another. */
const STAMP = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/y;
const ID_TAG = /^\[([a-zA-Z#]+):([^\]]*)\]$/;
const WORD_STAMP = /<\d{1,3}:\d{2}(?:[.:]\d{1,3})?>/g;

function stampMs(
  minutes: string,
  seconds: string,
  fraction: string | undefined,
) {
  const secondsValue = Number(seconds);
  if (secondsValue >= 60) return null;
  const fractionMs =
    fraction === undefined ? 0 : Number(fraction.padEnd(3, "0"));
  return (Number(minutes) * 60 + secondsValue) * 1000 + fractionMs;
}

function leadingStamps(
  line: string,
): { stamps: number[]; rest: string } | null {
  const stamps: number[] = [];
  let position = 0;
  for (;;) {
    STAMP.lastIndex = position;
    const match = STAMP.exec(line);
    if (!match) break;
    const ms = stampMs(match[1] ?? "0", match[2] ?? "0", match[3]);
    if (ms === null) return null;
    stamps.push(ms);
    position = STAMP.lastIndex;
  }
  return stamps.length === 0 ? null : { stamps, rest: line.slice(position) };
}

/** An optional sign plus digits; anything else is ignored (offset 0). */
const OFFSET_VALUE = /^[+-]?\d+$/;
const offsetOf = (value: string) =>
  OFFSET_VALUE.test(value.trim()) ? Number(value.trim()) : 0;

/** Reads pasted LRC. Never throws: what it cannot use lands in `problems`. */
export function parseLrc(source: string): LrcParseResult {
  let offsetMs = 0;
  const timed: { ms: number; text: string; order: number }[] = [];
  const problems: LrcProblem[] = [];
  source.split(/\r\n?|\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const lineNumber = index + 1;
    const tag = ID_TAG.exec(trimmed);
    if (tag) {
      if (tag[1]?.toLowerCase() === "offset") offsetMs = offsetOf(tag[2] ?? "");
      return;
    }
    const parsed = leadingStamps(trimmed);
    if (!parsed) {
      problems.push({ lineNumber, text: trimmed, reason: "noStamp" });
      return;
    }
    const text = parsed.rest
      .replace(WORD_STAMP, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > syncedLyricTextMax) {
      problems.push({ lineNumber, text: trimmed, reason: "tooLong" });
      return;
    }
    for (const ms of parsed.stamps)
      timed.push({ ms, text, order: timed.length });
  });
  const lines = timed
    .map((entry) => ({
      ...entry,
      ms: Math.min(
        syncedLyricMsMax,
        Math.max(0, Math.round(entry.ms - offsetMs)),
      ),
    }))
    .sort((first, second) => first.ms - second.ms || first.order - second.order)
    .map(({ ms, text }) => ({ ms, text }));
  return { lines, problems, isOverLimit: lines.length > syncedLyricsMax };
}

const twoDigits = (value: number) => String(value).padStart(2, "0");

/** mm:ss.xx, the common LRC form. */
export function formatLrcTime(ms: number): string {
  const centiseconds = Math.round(ms / 10);
  const minutes = Math.floor(centiseconds / 6000);
  const seconds = Math.floor((centiseconds % 6000) / 100);
  return `${twoDigits(minutes)}:${twoDigits(seconds)}.${twoDigits(centiseconds % 100)}`;
}

export const toLrc = (lines: readonly LrcLine[]) =>
  lines.map((line) => `[${formatLrcTime(line.ms)}]${line.text}`).join("\n");

/** The non-empty lines of plain lyrics, trimmed. */
export const lyricLinesOf = (lyrics: string) =>
  lyrics
    .split(/\r\n?|\n/)
    .map((line) => line.trim())
    .filter(Boolean);

/** True when the timed lines (gaps left out) read exactly as the lyrics. */
export function doTimingsMatchLyrics(
  lines: readonly LrcLine[],
  lyrics: string,
): boolean {
  const timedTexts = lines.map((line) => line.text.trim()).filter(Boolean);
  const plainLines = lyricLinesOf(lyrics);
  return (
    timedTexts.length === plainLines.length &&
    timedTexts.every((text, index) => text === plainLines[index])
  );
}

export const lyricsFromTimedLines = (lines: readonly LrcLine[]) =>
  lines
    .map((line) => line.text)
    .filter(Boolean)
    .join("\n");
