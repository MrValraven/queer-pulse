import {
  toPressContactView,
  type StudioArtistStatsView,
  type StudioPressKitOwnerView,
  type StudioPressKitView,
} from "./api/studio.adapters";
import {
  STUDIO_PRESS,
  type UpdateStudioPressKitBody,
} from "./api/studio.types";

export interface StudioPressQuoteFormEntry {
  quote: string;
  source: string;
  /** A stable key for the row while it is on screen; never sent. */
  rowKey?: string;
}

export interface StudioPressKitForm {
  pitch: string;
  pressBio: string;
  featuredTrackIds: string[];
  quotes: StudioPressQuoteFormEntry[];
  contact: string;
}

export interface StudioPressKitFormErrors {
  pitch?: string;
  pressBio?: string;
  contact?: string;
  /** One entry per quote row, in order. */
  quotes: { quote?: string; source?: string }[];
}

export interface PressTrackOption {
  id: string;
  title: string;
  releaseTitle: string;
}

/** Where the picker's track list stands: the persona's numbers load it. */
export type PressTrackListStatus = "loading" | "error" | "ready";

/** A chosen track as the picker shows it: playable with its option, still
 *  loading, or no longer playable (Remove only). */
export type PressTrackRow =
  | { id: string; state: "playable"; option: PressTrackOption }
  | { id: string; state: "pending" }
  | { id: string; state: "unavailable" };

export function formFromOwner(
  owner: StudioPressKitOwnerView | null,
): StudioPressKitForm {
  return {
    pitch: owner?.pitch ?? "",
    pressBio: owner?.pressBio ?? "",
    featuredTrackIds: owner?.featuredTrackIds ?? [],
    quotes:
      owner?.quotes.map((entry, index) => ({
        quote: entry.quote,
        source: entry.source,
        rowKey: `saved-${index}`,
      })) ?? [],
    contact: owner?.contact ?? "",
  };
}

/** The same rule the press page reads a contact with (https or mailto), and
 *  a mailto carries a whole address with an @. */
const MAILTO_ADDRESS = /^mailto:[^\s@]+@[^\s@]+$/i;
const isPressContact = (value: string) =>
  toPressContactView(value) !== null &&
  (!/^mailto:/i.test(value) || MAILTO_ADDRESS.test(value));

const quoteErrorOf = (quote: string) => {
  const trimmed = quote.trim();
  if (!trimmed) return "studio:pressEdit.quoteRequired";
  return trimmed.length > STUDIO_PRESS.quoteMax
    ? "studio:pressEdit.quoteTooLong"
    : undefined;
};

const sourceErrorOf = (source: string) => {
  const trimmed = source.trim();
  if (!trimmed) return "studio:pressEdit.quoteSourceRequired";
  return trimmed.length > STUDIO_PRESS.sourceMax
    ? "studio:pressEdit.quoteSourceTooLong"
    : undefined;
};

export function studioPressKitFormErrors(
  form: StudioPressKitForm,
): StudioPressKitFormErrors {
  const errors: StudioPressKitFormErrors = { quotes: [] };
  if (form.pitch.trim().length > STUDIO_PRESS.pitchMax)
    errors.pitch = "studio:pressEdit.pitchTooLong";
  if (form.pressBio.trim().length > STUDIO_PRESS.bioMax)
    errors.pressBio = "studio:pressEdit.bioTooLong";
  const contact = form.contact.trim();
  if (
    contact.length > STUDIO_PRESS.contactMax ||
    (contact && !isPressContact(contact))
  )
    errors.contact = "studio:pressEdit.contactInvalid";
  errors.quotes = form.quotes.map((entry) => ({
    quote: quoteErrorOf(entry.quote),
    source: sourceErrorOf(entry.source),
  }));
  return errors;
}

export function hasStudioPressKitFormErrors(
  errors: StudioPressKitFormErrors,
): boolean {
  return Boolean(
    errors.pitch ||
    errors.pressBio ||
    errors.contact ||
    errors.quotes.some((entry) => entry.quote || entry.source),
  );
}

/** Every key, as the PUT requires: trimmed, null for an empty field. */
export function bodyFromPressForm(
  form: StudioPressKitForm,
): UpdateStudioPressKitBody {
  return {
    pitch: form.pitch.trim() || null,
    pressBio: form.pressBio.trim() || null,
    featuredTrackIds: form.featuredTrackIds.slice(0, STUDIO_PRESS.featuredMax),
    quotes: form.quotes.slice(0, STUDIO_PRESS.quotesMax).map((entry) => ({
      quote: entry.quote.trim(),
      source: entry.source.trim(),
    })),
    contact: form.contact.trim() || null,
  };
}

/** A new array with one item moved by one place; unchanged at an edge. */
export function moveItem<Item>(
  list: Item[],
  index: number,
  offset: -1 | 1,
): Item[] {
  const target = index + offset;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(index, 1);
  if (moved === undefined) return list;
  next.splice(target, 0, moved);
  return next;
}

/** The persona's published tracks with audio, release by release. */
export function trackOptionsFromStats(
  stats: StudioArtistStatsView | null,
): PressTrackOption[] {
  if (!stats) return [];
  return stats.releases
    .filter((row) => row.status === "published")
    .flatMap((row) =>
      row.tracks
        .filter((trackRow) => trackRow.track.hasAudio)
        .map((trackRow) => ({
          id: trackRow.track.id,
          title: trackRow.track.title,
          releaseTitle: row.release.title,
        })),
    );
}

/** The saved picks the server still plays, read from the press kit itself,
 *  so they show by name before the numbers arrive (or when they fail). */
export function savedTrackOptions(
  pressKit: StudioPressKitView,
): PressTrackOption[] {
  if (pressKit.isFeaturedFallback) return [];
  return pressKit.featuredTracks.map((track) => ({
    id: track.id,
    title: track.title,
    releaseTitle: track.release.title,
  }));
}

/** Each chosen id with what the picker can say about it. A pick reads "No
 *  longer available" only once the track list has an answer. */
export function pressTrackRows(
  trackIds: string[],
  options: PressTrackOption[],
  status: PressTrackListStatus,
): PressTrackRow[] {
  const byId = new Map(options.map((option) => [option.id, option]));
  return trackIds.map((id): PressTrackRow => {
    const option = byId.get(id);
    if (option) return { id, state: "playable", option };
    return status === "loading"
      ? { id, state: "pending" }
      : { id, state: "unavailable" };
  });
}
