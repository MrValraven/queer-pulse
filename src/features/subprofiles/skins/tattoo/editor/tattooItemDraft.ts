import type {
  FlashDayEventRef,
  ItemStructured,
  TattooPhotoFlags,
} from "../../../api/subprofiles.api";
import type { SubprofileItemView } from "../../../api/subprofiles.adapters";
import { hasNewItemImages } from "../tattooItemImages";
import {
  TATTOO_COVER_UP_TYPES,
  TATTOO_GUEST_SPOT_TYPES,
  TATTOO_LIMITS,
  TATTOO_PRICE_PATTERN,
  TATTOO_SCAR_WORK_TYPES,
  TATTOO_SHOP_PRODUCT_TYPES,
  isCalendarDate,
  isTattooBodyPhotoSection,
} from "../tattooVocab.data";

/**
 * Drawer draft rules for the tattoo artist item sections. Every function is
 * pure: it reads a draft and returns a value or a `Partial<SubprofileItemView>`
 * patch the drawer spreads over its draft.
 */

const STATUS_KEY_PREFIX = "subprofiles:tattooItem.status.";

type TattooItemStatus =
  | "needsAfterPhoto"
  | "needsBeforePhoto"
  | "needsSession"
  | "tooManySessions"
  | "needsDate"
  | "needsType"
  | "endBeforeStart"
  | "needsBuyLink"
  | "priceInvalid"
  | "needsConsent";

const statusKey = (status: TattooItemStatus): string =>
  `${STATUS_KEY_PREFIX}${status}`;

const isListedValue = (
  list: readonly string[],
  value: string | undefined,
): boolean => value !== undefined && list.includes(value);

const isBlank = (value: string | null | undefined): boolean =>
  (value ?? "").trim() === "";

/** A missing photo, session, date or type for this section, else null. */
function missingFieldStatus(
  draft: SubprofileItemView,
  isNew: boolean,
): TattooItemStatus | null {
  const structured = draft.structured;
  switch (draft.section) {
    case "cover_ups": {
      if (isBlank(draft.imageUrl)) return "needsAfterPhoto";
      const coverUp = structured?.coverUp;
      if (!coverUp || !isListedValue(TATTOO_COVER_UP_TYPES, coverUp.type)) {
        return "needsType";
      }
      // A stored cover-up whose before photo reads "" still saves: the
      // backend accepts it, and the owner nudge asks for the photo. A
      // before photo key that is absent altogether is refused by the backend.
      const beforeImageUrl = coverUp.beforeImageUrl as string | undefined;
      if (beforeImageUrl === undefined) return "needsBeforePhoto";
      if (isNew && isBlank(beforeImageUrl)) return "needsBeforePhoto";
      return null;
    }
    case "in_progress": {
      const sessions = structured?.sessions ?? [];
      const hasEverySessionPhoto =
        sessions.length > 0 &&
        sessions.every((session) => !isBlank(session.imageUrl));
      if (!hasEverySessionPhoto) return "needsSession";
      return sessions.length > TATTOO_LIMITS.sessionsMax
        ? "tooManySessions"
        : null;
    }
    case "scar_work":
      return isListedValue(TATTOO_SCAR_WORK_TYPES, structured?.scarWork?.type)
        ? null
        : "needsType";
    case "guest_spots":
      if (!isCalendarDate(draft.date)) return "needsDate";
      return isListedValue(TATTOO_GUEST_SPOT_TYPES, structured?.spot?.type)
        ? null
        : "needsType";
    case "flash_days":
      return isCalendarDate(draft.date) ? null : "needsDate";
    case "shop":
      return isListedValue(TATTOO_SHOP_PRODUCT_TYPES, structured?.shop?.type)
        ? null
        : "needsType";
    default:
      return null;
  }
}

/** A guest spot whose last day is set and either is no calendar date or falls before its first day. */
function hasEndBeforeStart(draft: SubprofileItemView): boolean {
  if (draft.section !== "guest_spots") return false;
  const endDate = draft.structured?.spot?.endDate ?? "";
  if (endDate === "") return false;
  return !isCalendarDate(endDate) || endDate < draft.date;
}

function hasInvalidPrice(draft: SubprofileItemView): boolean {
  const flashPrice = draft.structured?.flash?.price ?? "";
  const shopPrice = draft.structured?.shop?.price ?? "";
  return !isTattooPrice(flashPrice) || !isTattooPrice(shopPrice);
}

/** The first thing stopping this item's Save, as a drawer status key, else null. Order: a missing photo, session, date or type,
 *  an end before the start, a buy link, a price off the pattern, then the consent tick (so the tick is the last step). */
export function tattooItemBlockReasonKey(
  draft: SubprofileItemView,
  original: SubprofileItemView,
  isNew: boolean,
): string | null {
  const missingStatus = missingFieldStatus(draft, isNew);
  if (missingStatus) return statusKey(missingStatus);
  if (hasEndBeforeStart(draft)) return statusKey("endBeforeStart");
  if (draft.section === "shop" && shopDomain(draft.url) === null) {
    return statusKey("needsBuyLink");
  }
  if (hasInvalidPrice(draft)) return statusKey("priceInvalid");
  const needsConsent =
    isTattooBodyPhotoSection(draft.section) &&
    hasNewItemImages(draft, original, isNew) &&
    draft.structured?.photo?.hasClientConsent !== true;
  return needsConsent ? statusKey("needsConsent") : null;
}

/** Sets one `structured` key; null removes the key, and an emptied blob reads null. */
export function withStructuredKey<Key extends keyof ItemStructured>(
  draft: SubprofileItemView,
  key: Key,
  value: ItemStructured[Key] | null,
): Partial<SubprofileItemView> {
  const nextStructured: ItemStructured = { ...(draft.structured ?? {}) };
  if (value === null) {
    delete nextStructured[key];
  } else {
    nextStructured[key] = value;
  }
  const hasAnyKey = Object.keys(nextStructured).length > 0;
  return { structured: hasAnyKey ? nextStructured : null };
}

/** Merges consent and blur flags into `structured.photo`. */
export function withPhotoFlags(
  draft: SubprofileItemView,
  flags: Partial<TattooPhotoFlags>,
): Partial<SubprofileItemView> {
  return withStructuredKey(draft, "photo", {
    ...(draft.structured?.photo ?? {}),
    ...flags,
  });
}

/** Applies a patch that may change images; when it brings in an image the draft did not hold, photo.hasClientConsent becomes false.
 *  Removing a photo keeps the tick, since no new client photo arrived (the backend's consent rule reads the same way). */
export function withImagesChanged(
  draft: SubprofileItemView,
  patch: Partial<SubprofileItemView>,
): Partial<SubprofileItemView> {
  const patched: SubprofileItemView = { ...draft, ...patch };
  const isNewImageAdded = hasNewItemImages(patched, draft, false);
  if (!isNewImageAdded || !isTattooBodyPhotoSection(patched.section)) {
    return patch;
  }
  return {
    ...patch,
    ...withPhotoFlags(patched, { hasClientConsent: false }),
  };
}

/** The local calendar day of an ISO timestamp as YYYY-MM-DD, else "". */
export function localCalendarDate(timestamp: string): string {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return "";
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${parsed.getFullYear()}-${month}-${day}`;
}

/** Picks an event: date = local YYYY-MM-DD of startsAt, subtitle = venue, else neighbourhood, else the current subtitle; flashDay.eventSlug = slug; cause kept. */
export function withFlashDayEvent(
  draft: SubprofileItemView,
  event: FlashDayEventRef,
): Partial<SubprofileItemView> {
  const place = [event.venue, event.neighbourhood].find(
    (candidate) => !isBlank(candidate),
  );
  return {
    date: localCalendarDate(event.startsAt) || draft.date,
    subtitle: place ?? draft.subtitle,
    linkedEvent: event,
    ...withStructuredKey(draft, "flashDay", {
      ...(draft.structured?.flashDay ?? {}),
      eventSlug: event.slug,
    }),
  };
}

/** Removes the link and keeps the date and place as the entry's own text. */
export function withoutFlashDayEvent(
  draft: SubprofileItemView,
): Partial<SubprofileItemView> {
  const remainingFlashDay = { ...(draft.structured?.flashDay ?? {}) };
  delete remainingFlashDay.eventSlug;
  const hasRemainingFields = Object.keys(remainingFlashDay).length > 0;
  return {
    linkedEvent: null,
    ...withStructuredKey(
      draft,
      "flashDay",
      hasRemainingFields ? remainingFlashDay : null,
    ),
  };
}

/** The host of a link that starts with "https://" exactly as typed (the backend's
 *  case-sensitive check on the untrimmed value), with "www." dropped, else null. */
export function shopDomain(url: string): string | null {
  if (!url.startsWith("https://")) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const host = parsed.hostname.replace(/^www\./i, "");
  return host === "" ? null : host;
}

/** Comma split, trimmed, blanks and case-insensitive repeats dropped, at most 8, each cut to 40. */
export function parsePlacements(raw: string): string[] {
  const placements: string[] = [];
  const seenPlacements = new Set<string>();
  for (const entry of raw.split(",")) {
    const placement = entry.trim().slice(0, TATTOO_LIMITS.placementMax).trim();
    const comparable = placement.toLowerCase();
    if (placement === "" || seenPlacements.has(comparable)) continue;
    seenPlacements.add(comparable);
    placements.push(placement);
    if (placements.length === TATTOO_LIMITS.placementsMax) break;
  }
  return placements;
}

/** True for "" (no price) or a price on TATTOO_PRICE_PATTERN. */
export function isTattooPrice(value: string): boolean {
  return value === "" || TATTOO_PRICE_PATTERN.test(value);
}
