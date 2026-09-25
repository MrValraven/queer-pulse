import type { Formatters } from "../../../../../shared/i18n/format";
import type { TFunction } from "../../../../../shared/i18n/types";
import { formatRelative } from "../../../../../shared/lib/date";
import type {
  OwnerListingHistoryActor,
  OwnerListingHistoryEventDTO,
} from "../../api/listingHistory.api";

const KEY_PREFIX = "marketing:listBusiness.editor.history";

const MAP_PIN_FIELD_KEY = `${KEY_PREFIX}.field.mapPin`;

/** Said for an edit whose fields are unknown to this build, or not recorded. */
export const LISTING_DETAILS_FIELD_KEY = `${KEY_PREFIX}.field.listingDetails`;

/**
 * Catalog key for each `Listing` property an owner edit can change. Keyed by
 * the backend's `OWNER_EDITABLE_FIELD_LABELS`, so every field the audit can
 * record has a name here. The three location columns share one label: an
 * address change re-geocodes and moves the pin, which reads as one thing.
 */
export const HISTORY_FIELD_LABEL_KEYS: Readonly<Record<string, string>> = {
  path: `${KEY_PREFIX}.field.path`,
  name: `${KEY_PREFIX}.field.name`,
  cats: `${KEY_PREFIX}.field.cats`,
  hood: `${KEY_PREFIX}.field.hood`,
  city: `${KEY_PREFIX}.field.city`,
  timezone: `${KEY_PREFIX}.field.timezone`,
  badge: `${KEY_PREFIX}.field.badge`,
  evidence: `${KEY_PREFIX}.field.evidence`,
  price: `${KEY_PREFIX}.field.price`,
  blurb: `${KEY_PREFIX}.field.blurb`,
  tagline: `${KEY_PREFIX}.field.tagline`,
  whatItIs: `${KEY_PREFIX}.field.whatItIs`,
  tags: `${KEY_PREFIX}.field.tags`,
  goodFor: `${KEY_PREFIX}.field.goodFor`,
  accessibilityAnswers: `${KEY_PREFIX}.field.accessibilityAnswers`,
  accessibilityNote: `${KEY_PREFIX}.field.accessibilityNote`,
  services: `${KEY_PREFIX}.field.services`,
  menu: `${KEY_PREFIX}.field.menu`,
  pricingMode: `${KEY_PREFIX}.field.pricingMode`,
  langs: `${KEY_PREFIX}.field.langs`,
  online: `${KEY_PREFIX}.field.online`,
  address: `${KEY_PREFIX}.field.address`,
  geocoded: MAP_PIN_FIELD_KEY,
  latitude: MAP_PIN_FIELD_KEY,
  longitude: MAP_PIN_FIELD_KEY,
  hours: `${KEY_PREFIX}.field.hours`,
  hoursNote: `${KEY_PREFIX}.field.hoursNote`,
  hoursExceptions: `${KEY_PREFIX}.field.hoursExceptions`,
  social: `${KEY_PREFIX}.field.social`,
  photoGallery: `${KEY_PREFIX}.field.photoGallery`,
  rel: `${KEY_PREFIX}.field.rel`,
  ownerName: `${KEY_PREFIX}.field.ownerName`,
  ownerRole: `${KEY_PREFIX}.field.ownerRole`,
  ownerBio: `${KEY_PREFIX}.field.ownerBio`,
  visibility: `${KEY_PREFIX}.field.visibility`,
  linkToProfile: `${KEY_PREFIX}.field.linkToProfile`,
  // No longer collected, but history rows from past edits still name it.
  contactEmail: `${KEY_PREFIX}.field.contactEmail`,
  consentOuting: `${KEY_PREFIX}.field.consentOuting`,
  consentGuide: `${KEY_PREFIX}.field.consentGuide`,
};

/**
 * The catalog keys naming what an event changed, in the order first seen and
 * once each. A field this build does not know, or a row that recorded none,
 * reads as "the listing details" so the sentence always names something.
 */
export function changedFieldLabelKeys(
  changedFields: readonly string[] | null,
): string[] {
  if (!changedFields || changedFields.length === 0) {
    return [LISTING_DETAILS_FIELD_KEY];
  }
  const labelKeys: string[] = [];
  for (const field of changedFields) {
    const labelKey =
      (Object.hasOwn(HISTORY_FIELD_LABEL_KEYS, field)
        ? HISTORY_FIELD_LABEL_KEYS[field]
        : undefined) ?? LISTING_DETAILS_FIELD_KEY;
    if (!labelKeys.includes(labelKey)) labelKeys.push(labelKey);
  }
  return labelKeys;
}

/** The name a row gives whoever acted. Staff stay anonymous as
 *  "QueerPulse moderation". */
export function historyActorLabel(
  actor: OwnerListingHistoryActor,
  t: TFunction,
): string {
  switch (actor.kind) {
    case "team": {
      const fullName = actor.member
        ? `${actor.member.firstName} ${actor.member.lastName}`.trim()
        : "";
      return fullName || t(`${KEY_PREFIX}.actor.unknownTeamMember`);
    }
    case "previous_team":
      return t(`${KEY_PREFIX}.actor.previousTeam`);
    case "moderation":
      return t(`${KEY_PREFIX}.actor.moderation`);
    default: {
      const exhaustiveCheck: never = actor;
      return exhaustiveCheck;
    }
  }
}

/**
 * The locale-bound text helper a sentence needs. The caller owns the `Intl`
 * locale, so this module stays pure and testable.
 */
export interface HistoryTextFormat {
  /** Joins field names in the reader's language ("the hours and the address"). */
  joinList: (items: string[]) => string;
}

/**
 * What a row says. Most rows are a catalog sentence whose `<strong>` run
 * marks the actor; a co-manager removal (and a join whose actor reads as
 * moderation) shows the platform's own text as it came.
 */
export type HistorySentence =
  | { kind: "catalog"; key: string; values: Record<string, string> }
  | { kind: "platform"; text: string };

const STATUS_SENTENCE_KEYS: Readonly<Record<string, string>> = {
  live: `${KEY_PREFIX}.event.statusLive`,
  review: `${KEY_PREFIX}.event.statusReview`,
  question: `${KEY_PREFIX}.event.statusQuestion`,
};

/** One event as the sentence to render in the reader's language. */
export function describeHistoryEvent(
  event: OwnerListingHistoryEventDTO,
  t: TFunction,
  format: HistoryTextFormat,
): HistorySentence {
  const actor = historyActorLabel(event.actor, t);
  const catalog = (
    keySuffix: string,
    values: Record<string, string> = { actor },
  ): HistorySentence => ({
    kind: "catalog",
    key: `${KEY_PREFIX}.event.${keySuffix}`,
    values,
  });
  const platformOrTeamChanged = (): HistorySentence =>
    event.reason !== null
      ? { kind: "platform", text: event.reason }
      : catalog("teamChanged");
  const fields = () =>
    format.joinList(
      changedFieldLabelKeys(event.changedFields).map((labelKey) => t(labelKey)),
    );
  switch (event.action) {
    case "owner_edited":
      return catalog("ownerEdited", { actor, fields: fields() });
    case "suggestion_applied":
      return catalog("suggestionApplied", { actor, fields: fields() });
    case "directory_paused":
      return catalog("directoryPaused");
    case "directory_resumed":
      return catalog("directoryResumed");
    case "co_manager_added":
      // The actor is the member who accepted the invitation, so the sentence
      // is composed here in the reader's language. A joiner who is off the
      // team again (for example re-invited and still pending) comes back as
      // `moderation`, and the platform's reason still names them correctly.
      return event.actor.kind === "moderation"
        ? platformOrTeamChanged()
        : catalog("coManagerAdded");
    case "co_manager_removed":
      // The platform composes this text and it names the member who left,
      // who is not always the actor.
      return platformOrTeamChanged();
    case "status_changed":
    case "bulk_status": {
      // The target status carries the meaning, so each one has its own
      // sentence and no chip label lands mid-sentence.
      const statusKey = event.toStatus
        ? STATUS_SENTENCE_KEYS[event.toStatus]
        : undefined;
      return statusKey
        ? { kind: "catalog", key: statusKey, values: { actor } }
        : catalog("statusUpdated");
    }
    case "removed":
      return catalog("removed");
    case "question_asked":
      return catalog("questionAsked");
    case "answered":
      return catalog("answered", {});
    case "ownership_transferred":
      return catalog("ownershipTransferred");
    case "staff_created":
      return catalog("staffCreated");
    default: {
      const exhaustiveCheck: never = event.action;
      return exhaustiveCheck;
    }
  }
}

/**
 * Rows shown before the first "Show older". A page holds 20, which is several
 * phone screens in the middle of the editor, so the newest few come first and
 * the first press reveals the rest of the page without a request.
 */
export const INITIAL_VISIBLE_ROWS = 6;

const RELATIVE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * When a row happened, as the row shows it: relative inside the last week
 * ("3 days ago"), then a short date ("2 Jun"), with the year only when it is
 * not the current one ("2 Jun 2025").
 */
export function historyWhen(
  iso: string,
  formatters: Formatters,
  now: number = Date.now(),
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  if (now - date.getTime() < RELATIVE_WINDOW_MS) {
    return formatRelative(iso, formatters);
  }
  const isThisYear = date.getFullYear() === new Date(now).getFullYear();
  return formatters.date(
    date,
    isThisYear
      ? { day: "numeric", month: "short" }
      : { day: "numeric", month: "short", year: "numeric" },
  );
}

/** The full date and time, for the row's tooltip. */
export function historyWhenFull(iso: string, formatters: Formatters): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatters.date(date)}, ${formatters.time(date)}`;
}
