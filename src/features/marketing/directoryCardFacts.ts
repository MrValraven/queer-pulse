import type { TFunction } from "../../shared/i18n/types";
import { PRICES, type DayHours } from "./listBusiness/listBusiness.data";

/**
 * What a directory card works out for itself from data the listing already
 * has, so the owner never ticks it: late hours, Sunday hours, gatherings it
 * has hosted. At most two show, in this order, after the price band and the
 * three highlights (`DirectoryCardPills`).
 */

export type DirectoryCardBadge = "openLate" | "openSundays" | "hostsGatherings";

export const DIRECTORY_CARD_BADGE_ORDER: readonly DirectoryCardBadge[] = [
  "openLate",
  "openSundays",
  "hostsGatherings",
];
export const DIRECTORY_CARD_BADGE_CAP = 2;
export const DIRECTORY_CARD_HIGHLIGHT_CAP = 3;
/** A close at this time or later reads as late. */
export const LATE_CLOSING_TIME = "23:00";

export const DIRECTORY_CARD_BADGE_LABEL_KEYS: Record<
  DirectoryCardBadge,
  string
> = {
  openLate: "marketing:directory.card.badge.openLate",
  openSundays: "marketing:directory.card.badge.openSundays",
  hostsGatherings: "marketing:directory.card.badge.hostsGatherings",
};

/** The card fields the badges read. `hours` is undefined when the listing
 *  has never published hours (`cardHours` keeps `{}` out). */
export interface CardBadgeSource {
  cat: string;
  /** Every category (amendment 1); falls back to `[cat]` when absent. */
  cats?: readonly string[];
  online?: boolean;
  hours?: Record<string, DayHours>;
  hostsGatherings?: boolean;
}

function openWindows(day: DayHours | undefined) {
  return day?.open
    ? day.intervals.filter((interval) => interval.from && interval.to)
    : [];
}

/** Any open window that runs past midnight (`to <= from`) or closes at
 *  23:00 or later, on any day. */
export function isOpenLate(
  hours: Record<string, DayHours> | undefined,
): boolean {
  if (!hours) return false;
  return Object.values(hours).some((day) =>
    openWindows(day).some(
      (interval) =>
        interval.to <= interval.from || interval.to >= LATE_CLOSING_TIME,
    ),
  );
}

export function isOpenSundays(
  hours: Record<string, DayHours> | undefined,
): boolean {
  return hours?.Sun?.open === true;
}

/** Open late is never said of nightlife (late is expected there) and an
 *  online listing has no hours, so it earns Hosts gatherings alone. */
export function directoryCardBadges(
  place: CardBadgeSource,
): DirectoryCardBadge[] {
  const hasHours = place.online !== true;
  const isEarned: Record<DirectoryCardBadge, boolean> = {
    openLate:
      hasHours &&
      !(place.cats ?? [place.cat]).includes("nightlife") &&
      isOpenLate(place.hours),
    openSundays: hasHours && isOpenSundays(place.hours),
    hostsGatherings: place.hostsGatherings === true,
  };
  return DIRECTORY_CARD_BADGE_ORDER.filter((badge) => isEarned[badge]).slice(
    0,
    DIRECTORY_CARD_BADGE_CAP,
  );
}

/** "Free" in the reader's language, a band as its symbols, and any other
 *  stored price text as written. */
export function priceBandLabel(
  t: TFunction,
  price: string | undefined,
): string {
  if (!price) return "";
  const band = PRICES.find((entry) => entry.id === price);
  if (!band) return price;
  return band.id === "Free" ? t(band.labelKey) : band.sym;
}

export function cardHighlights(
  highlights: readonly string[] | undefined,
): string[] {
  return (highlights ?? []).slice(0, DIRECTORY_CARD_HIGHLIGHT_CAP);
}
