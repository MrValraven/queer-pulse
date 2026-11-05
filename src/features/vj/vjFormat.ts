const BYTES_PER_KILOBYTE = 1024;
const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * 1024;
const ONE_DECIMAL_BELOW_MEGABYTES = 10;
const SECONDS_PER_MINUTE = 60;

/** A clip length as minutes and seconds, minutes unpadded: 8000 gives "0:08". */
export function formatVjDuration(durationMs: number): string {
  const totalSeconds = Number.isFinite(durationMs)
    ? Math.max(0, Math.round(durationMs / 1000))
    : 0;
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** A file size, 1024-based. Under 1 MB whole KB (at least 1), under 10 MB one
 *  decimal of MB, from there whole MB. */
export function formatVjBytes(bytes: number): string {
  const safeBytes = Number.isFinite(bytes) ? Math.max(0, bytes) : 0;
  const kilobytes = Math.max(1, Math.round(safeBytes / BYTES_PER_KILOBYTE));
  if (kilobytes < BYTES_PER_KILOBYTE) return `${kilobytes} KB`;
  const megabytes = safeBytes / BYTES_PER_MEGABYTE;
  const roundedToTenth = Math.round(megabytes * 10) / 10;
  if (roundedToTenth < ONE_DECIMAL_BELOW_MEGABYTES) {
    return `${roundedToTenth.toFixed(1)} MB`;
  }
  return `${Math.round(megabytes)} MB`;
}
