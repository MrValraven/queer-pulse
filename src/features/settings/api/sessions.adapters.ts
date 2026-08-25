import type { TFunction } from "../../../shared/i18n/types";
import type { Formatters } from "../../../shared/i18n/format";
import {
  deviceKindFromUserAgent,
  deviceLabelFromUserAgent,
} from "../../../shared/lib/deviceUserAgent";
import { relativeAgo } from "../../../shared/lib/relativeAgo";
import type { DeviceType, Session } from "../sessions.data";
import type { SessionResponse } from "./account.api";

/**
 * Maps a live `SessionResponse` onto the page's local `Session` shape — the
 * same type `SessionsPage` already renders in demo mode.
 *
 * The guiding rule: **never invent a field the backend doesn't have.** The
 * refresh-token store behind `GET /account/sessions` carries only
 * `id / userAgent / current / createdAt / lastUsedAt / expiresAt`, so:
 *
 * - `location` is left undefined (the card omits the line) rather than filled
 *   with a plausible-looking city.
 * - `lastActivity` comes from `lastUsedAt`, which is a real recorded value: the
 *   last time that device rotated a refresh token. It is coarse, and it is
 *   omitted when it would only repeat `signedIn`.
 * - `variant` is only ever `current` or `normal`. There is no server-side
 *   "this login looks suspicious" signal, so no session is ever badged
 *   `suspect` in live mode — a fake risk badge is worse than none.
 * - `device` is derived from the UA string alone, and degrades to a plain
 *   "Unknown device" when the UA is empty rather than guessing.
 *
 * The UA-parsing itself lives in `shared/lib/deviceUserAgent.ts` — the same
 * two helpers back `PushDevicesPage.tsx`'s device labels, since a push
 * subscription's `userAgent` column is the same kind of raw UA string.
 */

export function deviceTypeFromUserAgent(userAgent: string): DeviceType {
  return deviceKindFromUserAgent(userAgent);
}

/**
 * A human label for a session, from the only two things the backend gives us:
 * an optional `deviceLabel` (always null today) and the raw UA string.
 */
export function deviceLabelFor(dto: SessionResponse): string {
  return deviceLabelFromUserAgent(dto.userAgent ?? "", dto.deviceLabel);
}

const SESSION_AGO_KEYS = {
  justNow: "settings:sessions.ago.justNow",
  unknown: "settings:sessions.ago.unknown",
};

/**
 * "4 hours ago" / "8 days ago" from an ISO timestamp, relative to `now`
 * (injectable so the unit test isn't clock-dependent). Deliberately coarse —
 * this is a "when did this device sign in" hint, not an audit log. Bucketing
 * and locale formatting live in `shared/lib/relativeAgo.ts`, shared with
 * `PushDevicesPage.tsx`'s device timestamps; only the i18n keys are local to
 * sessions.
 */
export function signedInAgo(
  iso: string,
  t: TFunction,
  fmt: Formatters,
  now?: number,
): string {
  return relativeAgo(iso, t, fmt, SESSION_AGO_KEYS, now);
}

/**
 * "Last activity", or undefined when it would say nothing.
 *
 * A device that signed in and never came back has `lastUsedAt` equal to its
 * sign-in, and both bucket to the same phrase — a card reading "Signed in 3
 * days ago · Last activity 3 days ago" implies a second, corroborating
 * observation that does not exist. Dropping the line when the two agree keeps
 * the card honest about how much it actually knows.
 */
export function lastActivityAgo(
  dto: SessionResponse,
  t: TFunction,
  fmt: Formatters,
  now?: number,
): string | undefined {
  if (!dto.lastUsedAt) return undefined;
  const lastUsed = signedInAgo(dto.lastUsedAt, t, fmt, now);
  return lastUsed === signedInAgo(dto.createdAt, t, fmt, now)
    ? undefined
    : lastUsed;
}

export function sessionResponseToSession(
  dto: SessionResponse,
  t: TFunction,
  fmt: Formatters,
  now?: number,
): Session {
  return {
    id: dto.id,
    device: deviceLabelFor(dto),
    variant: dto.current ? "current" : "normal",
    deviceType: deviceTypeFromUserAgent(dto.userAgent ?? ""),
    signedIn: signedInAgo(dto.createdAt, t, fmt, now),
    lastActivity: lastActivityAgo(dto, t, fmt, now),
  };
}
