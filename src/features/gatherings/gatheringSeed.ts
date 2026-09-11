import { HOODS } from "./createGathering.data";
import type { GatheringDetail } from "./data";
import type { GatheringFormSeed } from "./useGatheringForm";
import { familyForLegacyLabel, findFormat } from "./gatheringCatalog";
import {
  DEFAULT_RSVP_QUESTIONS,
  sanitizeContentNotes,
  sanitizeThemes,
  type CostKind,
} from "./gatheringExtras";
import { normalizeAccessibilityAnswers } from "../marketing/listBusiness/listingAccessibility.data";

/**
 * The `"HH:MM"` wall clock an instant shows in the gathering's own zone.
 *
 * "Same time as last time" means the clock the host scheduled on, whichever
 * zone the browser doing the copying sits in. A gathering with no zone, or one
 * `Intl` cannot use, reads in the viewer's own zone instead. `hourCycle: "h23"`
 * so midnight reads `"00"`.
 */
function wallClockTime(
  at: Date | undefined,
  timezone: string | undefined,
): string | undefined {
  if (!at || Number.isNaN(at.getTime())) return undefined;
  const partsIn = (timeZone: string | undefined) =>
    new Intl.DateTimeFormat("en-GB", {
      ...(timeZone ? { timeZone } : {}),
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(at);
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = partsIn(timezone);
  } catch {
    parts = partsIn(undefined);
  }
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;
  return hour && minute ? `${hour}:${minute}` : undefined;
}

/**
 * The cost kind a gathering carries, or the closest reading of an older one.
 *
 * A gathering written before the field existed has only its free-text `cost`.
 * Reading that as "free" would make the payload builder drop the text on the
 * copy (a free gathering sends no cost), so a cost the server does not read as
 * free comes across as `fixed`, with the host's own words still beside it.
 */
function seedCostKind(gathering: GatheringDetail): CostKind {
  if (gathering.costKind) return gathering.costKind;
  return gathering.cost?.trim() && gathering.isFree === false
    ? "fixed"
    : "free";
}

/**
 * The "Online" neighbourhood's canonical stored value.
 *
 * `GatheringDetail.hood` is a DISPLAY string and is now translated for an
 * online gathering (DES-130), so a duplicate cannot read it back into the
 * wizard's `hood` select — in PT it would match no option and the copy would
 * silently lose the fact that it happens online. `isOnline` is the fact; this
 * is the value the select stores for it.
 */
const ONLINE_HOOD =
  HOODS.find((hood) => hood.value === "Online")?.value ?? "Online";

/**
 * An existing gathering → the create wizard's starting state (PRD-190).
 *
 * WHAT IS DEPENDENT ON WHO IS COPYING. `address`, `arrivalNotes` and
 * `onlineUrl` are disclosed by the server only to organisers and confirmed
 * attendees, so on a detail fetched by anyone else they arrive as `null` and
 * simply come through empty. In practice the only surface offering this is the
 * manage dashboard, where the viewer is by definition an organiser.
 *
 * WHAT IS NOT COPIED: the date and the two publish confirmations, see
 * `GatheringFormSeed`. The start and end clock ride along as `startTime` and
 * `endTime` for "same as last time"; the duplicate flow leaves them unread.
 */
export function gatheringToFormSeed(
  gathering: GatheringDetail,
): GatheringFormSeed {
  const isOnline = gathering.isOnline === true;
  // The live detail carries both halves. When it does not (a demo record, or
  // a row written before families existed) fall back to reading the stored
  // format string: the catalog first, then the eight-label legacy map.
  const family =
    gathering.gatheringFamily ??
    findFormat(gathering.type)?.family ??
    familyForLegacyLabel(gathering.type) ??
    null;
  const startTime = wallClockTime(gathering.date, gathering.timezone);
  const endTime = wallClockTime(gathering.endAt, gathering.timezone);
  return {
    family,
    format: findFormat(gathering.type)?.key ?? null,
    otherText: findFormat(gathering.type) ? "" : (gathering.type ?? ""),
    formatDetails: gathering.formatDetails ?? null,
    showAttendeeCount: gathering.showAttendeeCount,
    // Not the title verbatim: two gatherings with the identical name are
    // indistinguishable in every list, in search, and in the host's own
    // dashboard. The host is dropped into the wizard's first step with the
    // name to edit, which is where a duplicate wants their attention anyway.
    title: gathering.title,
    description: gathering.body,
    hood: isOnline ? ONLINE_HOOD : (gathering.neighbourhood ?? ""),
    venue: isOnline ? "" : (gathering.venue ?? ""),
    venueListingId: isOnline ? null : (gathering.venueListingId ?? null),
    venueListing: isOnline ? null : (gathering.venueListing ?? null),
    address: gathering.address ?? "",
    directions: gathering.arrivalNotes ?? "",
    onlineUrl: gathering.onlineUrl ?? "",
    capacity: gathering.capacity != null ? String(gathering.capacity) : "",
    language: gathering.language ?? "",
    cost: gathering.cost ?? "",
    // Through the normalizer, not a cast: `GatheringDetail` types these as the
    // wire `EventAccessibilityAnswers` (a loose string map), and the wizard
    // needs the complete six-question `AccessibilityAnswerMap`. Normalizing
    // fills any question the source gathering never answered with a real
    // `unknown` rather than leaving a hole the review step would misread.
    accessibilityAnswers: normalizeAccessibilityAnswers(
      gathering.accessibilityAnswers,
    ),
    accessNotes: gathering.accessibilityNote ?? "",
    audienceScope: gathering.visibility ?? "members",
    communitySlug: gathering.communitySlug ?? "",
    // ── Care and access (Create Gathering v2) ─────────────────────────────
    // Themes are narrowed against the family the copy starts on, so a theme
    // that family already asks about as a detail (ruling R6) is dropped here,
    // before it could sit hidden on a chip the host cannot see to remove.
    themes: sanitizeThemes(gathering.themes, family),
    contentNotes: sanitizeContentNotes(gathering.contentNotes),
    houseRules: gathering.houseRules ?? "",
    costKind: seedCostKind(gathering),
    // Passed through as it stands. `undefined` (a demo record without the
    // field) leaves the family default to the wizard; `null` (a live gathering
    // whose RSVPs stay open until it ends) is copied as that answer.
    rsvpCutoff: gathering.rsvpCutoff,
    rsvpQuestions: gathering.rsvpQuestions ?? DEFAULT_RSVP_QUESTIONS,
    customRsvpQuestion: gathering.customRsvpQuestion ?? "",
    allowWaitlist: gathering.allowWaitlist ?? true,
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
  };
}
