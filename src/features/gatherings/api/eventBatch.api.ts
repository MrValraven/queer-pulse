import { apiGet, apiPost } from "../../../shared/api/client";
import type {
  ContentNoteKey,
  CostKind,
  EventAccessibilityAnswer,
  EventCardDTO,
  EventVisibility,
  FormatDetails,
  GatheringFamily,
  GatheringThemeKey,
  RsvpCutoff,
} from "./events.api";

// ── Add a month of events: wire shapes ─────────────────────────────────────
// Mirrors `EventBatchTemplateView` and `CreateEventBatchDto`,
// `queerpulse-backend/src/events/event-batch.ts` and
// `dto/create-event-batch.dto.ts`; edit both together. Dates are
// "YYYY-MM-DD" and times "HH:mm", all wall clock in the template's
// `timezone`: the frontend never turns them into instants.

/** `GET /events/:slug/batch-template`: what the batch copies from the
 *  starting event for this caller, after the server's drop rules. */
export interface EventBatchTemplateDTO {
  slug: string;
  title: string;
  /** Read by the row action "Same as the starting event". */
  description: string;
  /** IANA zone every date and time of the batch is read in. */
  timezone: string;
  /** "HH:mm", the template's start read in `timezone`. */
  startTime: string;
  /** "HH:mm" in `timezone`, null when the template has no end. */
  endTime: string | null;
  /** Display URL for the preview. The page never sends it back: an absent
   *  `shared.coverImageUrl` copies the stored cover server-side. */
  coverImageUrl: string | null;
  gatheringFamily: GatheringFamily | null;
  eventType: string | null;
  formatDetails: FormatDetails | null;
  neighbourhood: string | null;
  venue: string | null;
  /** Null when the directory link was dropped, see `venueListingDropped`. */
  listingId: string | null;
  venueListing: { slug: string; name: string } | null;
  isOnline: boolean;
  onlineUrl: string | null;
  address: string | null;
  arrivalNotes: string | null;
  capacity: number | null;
  language: string | null;
  cost: string | null;
  costKind: CostKind | null;
  paymentUrl: string | null;
  paymentInstructions: string | null;
  accessibility: {
    answers: Record<string, EventAccessibilityAnswer>;
    note: string;
  };
  visibility: EventVisibility;
  /** The community the batch keeps. */
  community: { slug: string; name: string } | null;
  communityDropped: {
    name: string;
    reason: "notModerator" | "unavailable";
  } | null;
  /** The business the batch keeps as "run by". */
  runByListing: { ref: string; slug: string; name: string } | null;
  runByDropped: { name: string; reason: "notManager" | "unavailable" } | null;
  /** True when the venue's directory link cannot be attached any more. */
  venueListingDropped: boolean;
  themes: GatheringThemeKey[];
  contentNotes: ContentNoteKey[];
  houseRules: string | null;
  rsvpCutoff: RsvpCutoff | null;
  rsvpQuestions: { dietary: boolean; pronouns: boolean; access: boolean };
  customRsvpQuestion: string | null;
  allowWaitlist: boolean;
  showAttendeeCount: boolean;
}

/** Overrides on top of the template. An absent key keeps the template's
 *  value, a present key replaces it, and null clears it. */
export interface EventBatchSharedDto {
  // place
  neighbourhood?: string | null;
  venue?: string | null;
  listingId?: string | null;
  isOnline?: boolean;
  onlineUrl?: string | null;
  address?: string | null;
  arrivalNotes?: string | null;
  // cost
  cost?: string | null;
  costKind?: CostKind | null;
  paymentUrl?: string | null;
  paymentInstructions?: string | null;
  // times, wall clock in the template's timezone
  startTime: string;
  /** Absent or null: the events have no end. */
  endTime?: string | null;
  /** Absent: the server copies the template's stored cover. */
  coverImageUrl?: string;
}

/** One date of the batch. Absent times fall back to the shared ones. */
export interface EventBatchRowDto {
  /** "YYYY-MM-DD" in the template's timezone. */
  date: string;
  startTime?: string;
  /** Null: this date has no end, whatever the shared end says. */
  endTime?: string | null;
  title: string;
  description: string;
  /** Absent: the row uses the shared cover. */
  coverImageUrl?: string;
}

/** `POST /events/batch` body. */
export interface CreateEventBatchDto {
  templateSlug: string;
  shared: EventBatchSharedDto;
  rows: EventBatchRowDto[];
}

export interface CreatedEventBatchEventDTO {
  slug: string;
  title: string;
  /** ISO 8601. */
  startAt: string;
}

/** `POST /events/batch` answer, in date order (ties keep request order). */
export interface CreatedEventBatchDTO {
  events: CreatedEventBatchEventDTO[];
}

/** Every coded refusal of the two batch routes (contract section 7). */
export type EventBatchErrorCode =
  | "EVENT_BATCH_TEMPLATE_NOT_FOUND"
  | "EVENT_BATCH_TEMPLATE_COMMUNITY_ONLY"
  | "EVENT_BATCH_TOO_MANY_DATES"
  | "EVENT_BATCH_DUPLICATE_DATE"
  | "EVENT_BATCH_DATE_IN_PAST"
  | "EVENT_BATCH_DATE_TOO_FAR"
  | "EVENT_BATCH_ROW_INVALID"
  | "EVENT_BATCH_VENUE_NOT_FOUND";

/** The row a row-coded refusal names. `rowIndex` is 0-based into the
 *  request's `rows`; `date` is that row's "YYYY-MM-DD". */
export type EventBatchRowError = {
  code: EventBatchErrorCode;
  rowIndex: number;
  field: "date" | "startTime" | "endTime";
  date: string;
};

/** One picker row, read off a hosting-list card. Frontend-only. */
export interface EventBatchTemplateOption {
  slug: string;
  title: string;
  /** ISO 8601. */
  startAt: string;
  timezone: string | null;
  /** Venue, else neighbourhood, else "". Empty for an online event: the
   *  picker prints "Online" for it. */
  place: string;
  isOnline: boolean;
  coverImageUrl: string | null;
}

/** The picker row for a hosting-list card, or null for a cancelled event
 *  (the template routes refuse those). */
export function eventBatchTemplateOptionOf(
  card: EventCardDTO,
): EventBatchTemplateOption | null {
  if (card.status === "cancelled") return null;
  const isOnline = card.isOnline === true;
  return {
    slug: card.slug,
    title: card.title,
    startAt: card.startAt,
    timezone: card.timezone ?? null,
    place: isOnline ? "" : (card.venue ?? card.neighbourhood ?? ""),
    isOnline,
    coverImageUrl: card.coverImageUrl ?? null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Tripwire for shape drift on the template read: the page builds its
 *  summary, its times and every date around these three fields. */
function validateEventBatchTemplate(data: unknown): EventBatchTemplateDTO {
  if (!isRecord(data)) {
    throw new Error("expected the batch template to be an object");
  }
  for (const field of ["slug", "timezone", "startTime"] as const) {
    if (typeof data[field] !== "string") {
      throw new Error(
        `expected "${field}" of the batch template to be a string`,
      );
    }
  }
  return data as unknown as EventBatchTemplateDTO;
}

/** What a batch would copy from one of the caller's events. */
export const getEventBatchTemplate = (
  slug: string,
): Promise<EventBatchTemplateDTO> =>
  apiGet<EventBatchTemplateDTO>(
    `/events/${encodeURIComponent(slug)}/batch-template`,
    undefined,
    validateEventBatchTemplate,
  );

/** How long a publish waits for its answer. A month of up to 31 events
 *  commits in one transaction, which can outlast the shared 15 second
 *  ceiling, so this request gets a minute. */
export const EVENT_BATCH_PUBLISH_TIMEOUT_MS = 60_000;

/** Publishes every row in one all-or-nothing request. The answer carries
 *  no validator: the month is already published by the time it arrives, and
 *  a shape refusal here would read as a failure and invite a second publish.
 *  The results list tolerates a missing or empty `events`. */
export const createEventBatch = (
  dto: CreateEventBatchDto,
): Promise<CreatedEventBatchDTO> =>
  apiPost<CreatedEventBatchDTO>(
    "/events/batch",
    dto,
    EVENT_BATCH_PUBLISH_TIMEOUT_MS,
  );
