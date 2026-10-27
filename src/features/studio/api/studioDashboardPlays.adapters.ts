// Studio dashboard upgrade, Part 2: the plays trend and the Top supporters
// card. Every artist-side count reads through toCountView, so a count from
// 1 to 4 stays withheld even when the server forgot to flag it. Supporter
// identities render through the one mapper in studioListening.adapters.ts.
import { toCountView, type StudioCountView } from "./studio.adapters";
import { parsedDate } from "./studioDashboard.adapters";
import {
  STUDIO_TOP_SUPPORTERS_MAX,
  type StudioArtistPlaysDTO,
  type StudioTopSupportersDTO,
} from "./studioDashboard.types";
import {
  toSupporterIdentityView,
  type StudioSupporterIdentityView,
} from "./studioListening.adapters";

export interface StudioArtistPlaysDayView {
  /** The YYYY-MM-DD the server sent; a stable key. */
  dayKey: string;
  /** UTC midnight of the day. */
  day: Date;
  plays: StudioCountView;
  /** The last day kept, today in UTC. */
  isToday: boolean;
}

export interface StudioArtistPlaysView {
  days: StudioArtistPlaysDayView[];
  total: StudioCountView;
  total28d: StudioCountView;
}

export interface StudioTopSupportersView {
  identities: StudioSupporterIdentityView[];
  optedInCount: StudioCountView;
}

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Oldest day first, as sent. A day that cannot be read is dropped, and
 *  the last day kept is today. */
export function toArtistPlaysView(
  dto: StudioArtistPlaysDTO,
): StudioArtistPlaysView {
  const readableDays = dto.days.flatMap((entry) => {
    if (!DAY_PATTERN.test(entry.day)) return [];
    const day = parsedDate(`${entry.day}T00:00:00.000Z`);
    if (!day) return [];
    return [{ dayKey: entry.day, day, plays: toCountView(entry.plays) }];
  });
  return {
    days: readableDays.map((entry, index) => ({
      ...entry,
      isToday: index === readableDays.length - 1,
    })),
    total: toCountView(dto.total),
    total28d: toCountView(dto.total28d),
  };
}

/** The server's ranking, at most STUDIO_TOP_SUPPORTERS_MAX identities; an
 *  identity this build cannot read is dropped. */
export function toTopSupportersView(
  dto: StudioTopSupportersDTO,
): StudioTopSupportersView {
  const identities = dto.items.flatMap((item) => {
    const identity = toSupporterIdentityView(item.identity);
    return identity ? [identity] : [];
  });
  return {
    identities: identities.slice(0, STUDIO_TOP_SUPPORTERS_MAX),
    optedInCount: toCountView(dto.optedInCount),
  };
}
