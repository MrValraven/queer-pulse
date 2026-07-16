import type { DeviceType, Session } from "../sessions.data";
import type { SessionResponse } from "./account.api";

/**
 * Maps a live `SessionResponse` onto the page's local `Session` shape — the
 * same type `SessionsPage` already renders in demo mode.
 *
 * The guiding rule: **never invent a field the backend doesn't have.** The
 * refresh-token store behind `GET /account/sessions` carries only
 * `id / userAgent / current / createdAt / expiresAt`, so:
 *
 * - `loc` and `lastActivity` are left undefined (the card omits them) rather
 *   than filled with a plausible-looking city or timestamp.
 * - `variant` is only ever `current` or `normal`. There is no server-side
 *   "this login looks suspicious" signal, so no session is ever badged
 *   `suspect` in live mode — a fake risk badge is worse than none.
 * - `device` is derived from the UA string alone, and degrades to a plain
 *   "Unknown device" when the UA is empty rather than guessing.
 */

/** Coarse UA sniff — enough to pick the phone vs. desktop glyph, nothing more. */
const MOBILE_RE = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i;

/** Ordered longest-match-first so "Edg" doesn't lose to "Chrome", etc. */
const BROWSERS: ReadonlyArray<readonly [RegExp, string]> = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const PLATFORMS: ReadonlyArray<readonly [RegExp, string]> = [
  [/iPhone/, "iPhone"],
  [/iPad/, "iPad"],
  [/Android/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Windows/, "Windows"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

function matchFirst(
  ua: string,
  table: ReadonlyArray<readonly [RegExp, string]>,
): string | undefined {
  for (const [re, label] of table) if (re.test(ua)) return label;
  return undefined;
}

export function deviceTypeFromUserAgent(userAgent: string): DeviceType {
  return MOBILE_RE.test(userAgent) ? "mobile" : "desktop";
}

/**
 * A human label for a session, from the only two things the backend gives us:
 * an optional `deviceLabel` (always null today) and the raw UA string. Falls
 * back through platform-only → browser-only → "Unknown device".
 */
export function deviceLabelFor(dto: SessionResponse): string {
  if (dto.deviceLabel) return dto.deviceLabel;
  const ua = dto.userAgent ?? "";
  const platform = matchFirst(ua, PLATFORMS);
  const browser = matchFirst(ua, BROWSERS);
  if (platform && browser) return `${platform} · ${browser}`;
  return platform ?? browser ?? "Unknown device";
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * "4 hours ago" / "8 days ago" from an ISO timestamp, relative to `now`
 * (injectable so the unit test isn't clock-dependent). Deliberately coarse —
 * this is a "when did this device sign in" hint, not an audit log.
 */
export function signedInAgo(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "unknown";
  const delta = Math.max(0, now - then);
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) {
    const mins = Math.floor(delta / MINUTE);
    return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  }
  if (delta < DAY) {
    const hours = Math.floor(delta / HOUR);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  const days = Math.floor(delta / DAY);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export function sessionResponseToSession(
  dto: SessionResponse,
  now?: number,
): Session {
  return {
    id: dto.id,
    device: deviceLabelFor(dto),
    variant: dto.current ? "current" : "normal",
    deviceType: deviceTypeFromUserAgent(dto.userAgent ?? ""),
    signedIn: signedInAgo(dto.createdAt, now),
  };
}
