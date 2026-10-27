import { ApiError } from "../../../shared/api/client";
import type {
  StudioArtistPlaysDTO,
  StudioTopSupportersDTO,
} from "./studioDashboard.types";
import { STUDIO_STATS_THRESHOLD, type StudioCountDTO } from "./studio.types";
import {
  DEMO_DAILY_PLAYS,
  DEMO_OPTED_IN_SUPPORTERS,
  DEMO_TOP_SUPPORTERS,
  DEMO_TRACK_PLAYS,
} from "./studioDemoDashboard.data";
import { isDemoOwnedPersona } from "./studioDemoFormats.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** The server's floor rule: 1 to 4 is withheld, 0 stays a real zero. */
export function demoFlooredCount(total: number): StudioCountDTO {
  return total > 0 && total < STUDIO_STATS_THRESHOLD
    ? { value: null, isBelowThreshold: true }
    : { value: total, isBelowThreshold: false };
}

const sumOf = (values: readonly number[]) =>
  values.reduce((total, value) => total + value, 0);

let cachedPlays28d: Readonly<Record<string, number>> | null = null;

/** Each track's share of the 28-day total by largest remainder over its
 *  all-time plays, capped at those plays, so the shares add up to the days. */
function playsOverTwentyEightDays(): Readonly<Record<string, number>> {
  if (cachedPlays28d) return cachedPlays28d;
  const windowTotal = sumOf(DEMO_DAILY_PLAYS);
  const allTimeTotal = sumOf(Object.values(DEMO_TRACK_PLAYS));
  const shares = Object.entries(DEMO_TRACK_PLAYS).map(([trackId, plays]) => {
    const quota = allTimeTotal > 0 ? (plays * windowTotal) / allTimeTotal : 0;
    return { trackId, plays, whole: Math.floor(quota), remainder: quota % 1 };
  });
  let leftover = windowTotal - sumOf(shares.map((share) => share.whole));
  const byRemainder = [...shares].sort(
    (left, right) =>
      right.remainder - left.remainder ||
      left.trackId.localeCompare(right.trackId),
  );
  const result: Record<string, number> = {};
  for (const share of shares) result[share.trackId] = share.whole;
  for (const share of byRemainder) {
    if (leftover <= 0) break;
    const current = result[share.trackId] ?? 0;
    if (current < share.plays) {
      result[share.trackId] = current + 1;
      leftover -= 1;
    }
  }
  cachedPlays28d = result;
  return result;
}

/** One track's all-time and 28-day plays; a track off the list has none. */
export function demoTrackPlaysOf(trackId: string): {
  plays: number;
  plays28d: number;
} {
  return {
    plays: DEMO_TRACK_PLAYS[trackId] ?? 0,
    plays28d: playsOverTwentyEightDays()[trackId] ?? 0,
  };
}

/** GET /studio/artists/:id/plays in the demo: 28 UTC days ending on the
 *  day of `now`, oldest first. Only Mariana has plays. */
export function demoStudioArtistPlays(
  subprofileId: string,
  now: Date = new Date(),
): StudioArtistPlaysDTO {
  if (!isDemoOwnedPersona(subprofileId)) throw new ApiError(404, "Not found");
  const hasPlays = subprofileId === DEMO_ARTIST_MARIANA.id;
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const dayCount = DEMO_DAILY_PLAYS.length;
  const days = DEMO_DAILY_PLAYS.map((plays, index) => ({
    day: new Date(today - (dayCount - 1 - index) * MILLISECONDS_PER_DAY)
      .toISOString()
      .slice(0, 10),
    plays: demoFlooredCount(hasPlays ? plays : 0),
  }));
  return {
    days,
    total: demoFlooredCount(
      hasPlays ? sumOf(Object.values(DEMO_TRACK_PLAYS)) : 0,
    ),
    total28d: demoFlooredCount(hasPlays ? sumOf(DEMO_DAILY_PLAYS) : 0),
  };
}

/** GET /studio/artists/:id/supporters in the demo: Mariana's ranked list,
 *  none for the other owned persona, a 404 for any other. */
export function demoStudioTopSupporters(
  subprofileId: string,
): StudioTopSupportersDTO {
  if (!isDemoOwnedPersona(subprofileId)) throw new ApiError(404, "Not found");
  const isMariana = subprofileId === DEMO_ARTIST_MARIANA.id;
  return {
    items: isMariana
      ? DEMO_TOP_SUPPORTERS.map((identity) => ({ identity }))
      : [],
    optedInCount: demoFlooredCount(isMariana ? DEMO_OPTED_IN_SUPPORTERS : 0),
  };
}
