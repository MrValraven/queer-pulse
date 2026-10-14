const CHAPTER_TIME = /^\s*(?:(\d{1,2}):)?(\d{1,3}):(\d{2})\s*$/;

/** Seconds from "m:ss", "mm:ss" or "h:mm:ss"; null when it is not a time. */
export function parseChapterTime(value: string): number | null {
  const match = CHAPTER_TIME.exec(value);
  if (!match) return null;
  const hasHours = match[1] !== undefined;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (seconds >= 60 || (hasHours && minutes >= 60)) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatChapterTime(totalSeconds: number): string {
  const whole = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = String(whole % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
}
