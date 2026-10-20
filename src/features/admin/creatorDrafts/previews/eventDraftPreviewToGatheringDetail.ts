import type { EventDraftPreview } from "../../api/adminCreatorDrafts.api";
import type { GatheringDetail } from "../../../gatherings/data";
import type { EventVisibility } from "../../../gatherings/api/events.api";
import {
  findFamily,
  OTHER_FORMAT_KEY,
  stripDisallowedDetails,
} from "../../../gatherings/gatheringCatalog";
import {
  DEFAULT_RSVP_QUESTIONS,
  isCostKind,
  isRsvpCutoff,
  normalizeRsvpQuestions,
  sanitizeContentNotes,
  sanitizeThemes,
} from "../../../gatherings/gatheringExtras";
import { normalizeAccessibilityAnswers } from "../../../marketing/listBusiness/listingAccessibility.data";

/** The neighbourhood value the wizard's payload builder reads as online. */
const ONLINE_HOOD = "Online";

/** The slug the preview renders under: no public page exists for a draft. */
const DRAFT_PREVIEW_SLUG = "draft-preview";

const EVENT_VISIBILITY_VALUES = [
  "public",
  "members",
  "extended_network",
  "network",
  "community",
  "invite_only",
] as const satisfies readonly EventVisibility[];

/** A wizard clock: two digits, a colon, two digits. */
const CLOCK_PATTERN = /^\d{2}:\d{2}/;

/** The value when it is a string, else "". A staff preview is read as it
 *  arrives, so a field of the wrong type never reaches a `.trim()`. */
function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Trimmed text, or null when nothing is left. */
function textOrNull(value: unknown): string | null {
  const trimmed = textOf(value).trim();
  return trimmed === "" ? null : trimmed;
}

function booleanOrUndefined(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function listOf(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

/** A wizard date and clock as one local instant, or null when the date does
 *  not parse. A missing clock reads as midnight. */
function draftInstant(date: unknown, time: unknown): Date | null {
  const dateText = textOf(date);
  if (dateText === "") return null;
  const clock = textOf(time);
  const instant = new Date(
    `${dateText}T${CLOCK_PATTERN.test(clock) ? clock : "00:00"}`,
  );
  return Number.isNaN(instant.getTime()) ? null : instant;
}

/** Whether the draft holds a real start day, and a real start clock on it.
 *  The page leaves out a part the host has not filled in yet, where the
 *  view model carries today or midnight. */
export function eventDraftPreviewSchedule(preview: EventDraftPreview): {
  hasDate: boolean;
  hasTime: boolean;
} {
  const hasDate = draftInstant(preview.date, preview.time) !== null;
  return {
    hasDate,
    hasTime: hasDate && CLOCK_PATTERN.test(textOf(preview.time)),
  };
}

/** The stored format the way the wire carries it: a catalog key, or the
 *  host's own words when they picked "Something else". */
function draftFormat(preview: EventDraftPreview): string {
  const format = textOf(preview.format);
  return format === OTHER_FORMAT_KEY
    ? textOf(preview.otherText).trim()
    : format;
}

function draftCommunity(
  value: unknown,
): GatheringDetail["community"] | undefined {
  if (!isRecord(value) || typeof value.name !== "string") return undefined;
  return { slug: textOf(value.slug), name: value.name, accessTier: "public" };
}

function draftVenueListing(value: unknown): GatheringDetail["venueListing"] {
  if (!isRecord(value) || typeof value.name !== "string") return null;
  return { slug: textOf(value.slug), name: value.name };
}

function draftVisibility(value: unknown): EventVisibility {
  return (
    EVENT_VISIBILITY_VALUES.find((visibility) => visibility === value) ??
    "members"
  );
}

/**
 * A staff preview of an event draft, read as the public event page's view
 * model. Only the allow-listed draft keys are read (`EVENT_DRAFT_PREVIEW_KEYS`
 * plus `community`), so the door details the server withholds stay absent
 * here too: the address, the arrival directions and the online link are
 * always null. Staff read the page as a member who has not RSVP'd, so no
 * organiser rights ride along. Each field is checked for its type first, so
 * a malformed payload renders as a sparser page.
 */
export function eventDraftPreviewToGatheringDetail(
  preview: EventDraftPreview,
  hostName: string,
): GatheringDetail {
  const startAt = draftInstant(preview.date, preview.time) ?? new Date();
  const endAt =
    textOf(preview.endDate) && CLOCK_PATTERN.test(textOf(preview.endTime))
      ? draftInstant(preview.endDate, preview.endTime)
      : null;
  const family = findFamily(textOf(preview.family))?.key ?? null;
  const isOnline = preview.hood === ONLINE_HOOD;
  const capacity = Number.parseInt(String(preview.cap ?? ""), 10);
  const costKind = isCostKind(preview.costKind) ? preview.costKind : null;
  return {
    slug: DRAFT_PREVIEW_SLUG,
    type: draftFormat(preview),
    gatheringFamily: family,
    formatDetails: isRecord(preview.formatDetails)
      ? stripDisallowedDetails(
          family,
          preview.formatDetails,
          textOf(preview.format),
        )
      : null,
    date: startAt,
    ...(endAt ? { endAt } : {}),
    title: textOf(preview.title).trim(),
    hood: textOf(preview.hood),
    host: hostName,
    hostSlug: "",
    spots: { key: "gatherings:spots.openToAll" },
    ctaKey: "gatherings:cta.rsvp",
    body: textOf(preview.description),
    viewerIsOrganizer: false,
    capacity: Number.isFinite(capacity) ? capacity : null,
    showAttendeeCount: booleanOrUndefined(preview.showAttendeeCount),
    allowWaitlist: booleanOrUndefined(preview.allowWaitlist),
    visibility: draftVisibility(preview.audienceScope),
    communitySlug: textOf(preview.communitySlug) || undefined,
    community: draftCommunity(preview.community),
    venueListing: isOnline ? null : draftVenueListing(preview.venueListing),
    venue: isOnline ? null : textOrNull(preview.venue),
    neighbourhood: isOnline ? null : textOrNull(preview.hood),
    isOnline,
    language: textOrNull(preview.lang),
    accessibilityAnswers: normalizeAccessibilityAnswers(
      isRecord(preview.accessibilityAnswers)
        ? preview.accessibilityAnswers
        : null,
    ),
    accessibilityNote: textOf(preview.accessNotes).trim(),
    cost: costKind === "free" ? null : textOrNull(preview.cost),
    costKind,
    isFree: costKind === null || costKind === "free",
    themes: sanitizeThemes(listOf(preview.themes), family),
    contentNotes: sanitizeContentNotes(listOf(preview.contentNotes)),
    houseRules: textOrNull(preview.houseRules),
    rsvpCutoff: isRsvpCutoff(preview.rsvpCutoff) ? preview.rsvpCutoff : null,
    rsvpQuestions: {
      ...normalizeRsvpQuestions(
        isRecord(preview.rsvpQuestions) ? preview.rsvpQuestions : null,
        DEFAULT_RSVP_QUESTIONS,
      ),
      access: true,
    },
    customRsvpQuestion: textOrNull(preview.customRsvpQuestion),
    announcements: [],
    address: null,
    arrivalNotes: null,
    onlineUrl: null,
    locationPrecision: "venue",
  };
}
