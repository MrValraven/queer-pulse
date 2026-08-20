/**
 * Conversion between an ISO 8601 timestamp (what the API sends/accepts for
 * `PlatformSettingsDTO.announcementExpiresAt`) and the value format an
 * `<input type="datetime-local">` reads/writes — local wall-clock time, no
 * timezone offset, no seconds (`YYYY-MM-DDTHH:mm`).
 */

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** `null`/unparsable -> `""`, which the input renders as empty. */
export function isoToDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/** `""`/unparsable -> `null`, meaning "no expiry". */
export function datetimeLocalValueToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
