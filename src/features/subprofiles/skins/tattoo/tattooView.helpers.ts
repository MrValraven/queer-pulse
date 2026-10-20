import type { Language } from "../../../../shared/i18n/types";
import type { SubprofileItemView } from "../../api/subprofiles.adapters";
import { cleanList } from "../therapist/therapistView.helpers";
import {
  TATTOO_PRICE_PATTERN,
  TATTOO_STYLES,
  type TattooBookingRoute,
  type TattooStyle,
} from "./tattooVocab.data";

/** Today as YYYY-MM-DD in the viewer's own timezone (never the UTC date). */
export function localIsoDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const TATTOO_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** The one date format of the tattoo page: day, short month and year in the
 *  viewer's language ("18 Oct 2026", "18 out 2026"). Reads the first ten
 *  characters, so a full timestamp works too; "" stays "" and any other
 *  text comes back as given. */
export function formatTattooDay(isoDate: string, language: Language): string {
  const dayText = isoDate.slice(0, 10);
  if (!TATTOO_DAY_PATTERN.test(dayText)) return isoDate;
  const year = Number(dayText.slice(0, 4));
  const monthIndex = Number(dayText.slice(5, 7)) - 1;
  const dayOfMonth = Number(dayText.slice(8, 10));
  const date = new Date(year, monthIndex, dayOfMonth);
  if (date.getMonth() !== monthIndex || date.getDate() !== dayOfMonth) {
    return isoDate;
  }
  const locale = language === "pt" ? "pt-PT" : "en-GB";
  const monthName = new Intl.DateTimeFormat(locale, { month: "short" })
    .format(date)
    .replace(/\.$/, "");
  return `${dayOfMonth} ${monthName} ${year}`;
}

/** A price the artist typed ("25", "25,5") as a localized number for the
 *  catalog's currency string. Text off the editor's price pattern comes
 *  back as typed. */
export function tattooAmountText(
  price: string,
  formatNumber: (value: number) => string,
): string {
  const trimmed = price.trim();
  if (!TATTOO_PRICE_PATTERN.test(trimmed)) return trimmed;
  const amount = Number(trimmed.replace(",", "."));
  return Number.isFinite(amount) ? formatNumber(amount) : trimmed;
}

function isTattooStyle(entry: string): entry is TattooStyle {
  return (TATTOO_STYLES as readonly string[]).includes(entry);
}

/** The i18n key of a stored style entry: a `TattooStyle` id has one, the
 *  artist's own words render as written (null). */
export function styleLabelKey(entry: string): string | null {
  return isTattooStyle(entry) ? `subprofiles:tattoo.style.${entry}` : null;
}

/** Keeps the listed values of a stored list, in stored order and once each.
 *  `skin_data` held no server schema before this feature, so anything that
 *  is not a list, or is outside the vocabulary, is dropped. */
export function listedValues<Value extends string>(
  values: readonly Value[],
  stored: unknown,
): Value[] {
  if (!Array.isArray(stored)) return [];
  const kept: Value[] = [];
  for (const entry of stored) {
    const listed = values.find((value) => value === entry);
    if (listed !== undefined && !kept.includes(listed)) kept.push(listed);
  }
  return kept;
}

/** One listed value of a stored single choice, else null. */
export function listedValue<Value extends string>(
  values: readonly Value[],
  stored: unknown,
): Value | null {
  return values.find((value) => value === stored) ?? null;
}

/** Owner-typed text, trimmed; a stored non-string reads as "". */
export function safeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Trimmed, non-empty text entries of a stored list of unknown shape. */
export function storedTexts(stored: unknown): string[] {
  if (!Array.isArray(stored)) return [];
  return cleanList(
    stored.filter((entry): entry is string => typeof entry === "string"),
  );
}

function spotStartDate(item: SubprofileItemView): string {
  return item.date.slice(0, 10);
}

function spotLastDate(item: SubprofileItemView): string {
  const endDate = item.structured?.spot?.endDate ?? "";
  return (endDate || item.date).slice(0, 10);
}

/** Upcoming = the spot's last day (`spot.endDate`, else `date`) is today or
 *  later, soonest first; past newest first. `next` is the soonest upcoming. */
export function splitGuestSpots(
  items: readonly SubprofileItemView[],
  today: string,
): {
  upcoming: SubprofileItemView[];
  past: SubprofileItemView[];
  next: SubprofileItemView | null;
} {
  const upcoming: SubprofileItemView[] = [];
  const past: SubprofileItemView[] = [];
  for (const item of items) {
    const lastDate = spotLastDate(item);
    (lastDate !== "" && lastDate >= today ? upcoming : past).push(item);
  }
  upcoming.sort((first, second) =>
    spotStartDate(first).localeCompare(spotStartDate(second)),
  );
  past.sort((first, second) =>
    spotStartDate(second).localeCompare(spotStartDate(first)),
  );
  return { upcoming, past, next: upcoming[0] ?? null };
}

/** The booking route when it can be used right now (contract "How to book:
 *  route availability"), else null. */
export function usableBookingRoute(
  route: TattooBookingRoute | null,
  {
    email,
    formUrl,
    instagramHref,
    isPublished,
  }: {
    email: string;
    formUrl: string;
    instagramHref: string | null;
    isPublished: boolean;
  },
): TattooBookingRoute | null {
  if (route === null) return null;
  const isUsable: Record<TattooBookingRoute, boolean> = {
    message: isPublished,
    email: email !== "",
    form_link: formUrl.startsWith("https://"),
    instagram: instagramHref !== null,
  };
  return isUsable[route] ? route : null;
}
