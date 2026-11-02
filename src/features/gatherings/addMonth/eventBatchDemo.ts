import { ApiError } from "../../../shared/api/client";
import type { MyEvent } from "../../myevents/myEvents.types";
import type {
  CreateEventBatchDto,
  CreatedEventBatchDTO,
  EventBatchErrorCode,
  EventBatchRowDto,
  EventBatchRowError,
  EventBatchSharedDto,
  EventBatchTemplateDTO,
  EventBatchTemplateOption,
} from "../api/eventBatch.api";
import { gatheringDetails, type GatheringDetail } from "../data";
import {
  EVENT_BATCH_MAX_MONTHS_AHEAD,
  EVENT_BATCH_MAX_ROWS,
} from "./addMonth.data";
import { isEndNextDay, lastAllowedDate, wallClockNow } from "./addMonthDates";
import {
  DEMO_EVENT_BATCH_ONLINE_VENUE,
  DEMO_EVENT_BATCH_TEMPLATE_EXTRAS,
  DEMO_EVENT_BATCH_TEMPLATE_SLUGS,
  DEMO_EVENT_BATCH_TIMEZONE,
} from "./eventBatchDemo.data";

/**
 * Demo stand-in for `GET /events/:slug/batch-template` and `POST
 * /events/batch`. It answers the way the server does (contract sections 6
 * and 7): the same refusal codes, bodies and messages, the same check order,
 * and nothing written when a check fails.
 *
 * What it creates lives for the tab's session, like the other demo overlays.
 * Each new event is registered in `gatheringDetails`, which is what makes the
 * results links open the right event: `resolveGathering` falls back to the
 * supper club for a slug it does not know. Each one also joins the demo
 * hosting list My Events reads, and the starting-event picker.
 */

/** The shared place and cost fields a month can override. */
const PLACE_AND_COST_FIELDS = [
  "neighbourhood",
  "venue",
  "listingId",
  "isOnline",
  "onlineUrl",
  "address",
  "arrivalNotes",
  "cost",
  "costKind",
  "paymentUrl",
  "paymentInstructions",
] as const;

type PlaceAndCostOverrides = Partial<
  Pick<EventBatchSharedDto, (typeof PLACE_AND_COST_FIELDS)[number]>
>;

/** Where a created demo event came from, so it can serve as a template too:
 *  its source template, its own times, and the place and cost it was
 *  published with on top of that template. */
interface CreatedDemoEventSource {
  templateSlug: string;
  startTime: string;
  endTime: string | null;
  placeAndCost: PlaceAndCostOverrides;
}

const createdHostingEvents: MyEvent[] = [];
const createdEventSources = new Map<string, CreatedDemoEventSource>();

const TEMPLATE_NOT_FOUND_MESSAGE =
  "We couldn't find that event among the events you host or co-host, or it was cancelled.";

/** Milliseconds since the epoch for a wall-clock reading taken as UTC. */
function utcMillisecondsOf(date: string, time: string): number {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute);
}

/** The instant a wall clock in `timezone` reads `date` at `time`. Two passes
 *  settle the zone offset, also across a clock change. */
function wallClockInstant(date: string, time: string, timezone: string): Date {
  const target = utcMillisecondsOf(date, time);
  let instant = target;
  for (let pass = 0; pass < 2; pass += 1) {
    const reading = wallClockNow(timezone, new Date(instant));
    instant += target - utcMillisecondsOf(reading.date, reading.time);
  }
  return new Date(instant);
}

/** The day after a "YYYY-MM-DD" date. */
function nextDate(date: string): string {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1))
    .toISOString()
    .slice(0, 10);
}

/** The local "YYYY-MM-DD" day of a demo detail's start. */
function localIsoDate(at: Date): string {
  const month = String(at.getMonth() + 1).padStart(2, "0");
  const day = String(at.getDate()).padStart(2, "0");
  return `${at.getFullYear()}-${month}-${day}`;
}

/** The local "HH:mm" of a demo detail's start. */
function localTime(at: Date): string {
  const hour = String(at.getHours()).padStart(2, "0");
  const minute = String(at.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function templateNotFound(): ApiError {
  return new ApiError(404, TEMPLATE_NOT_FOUND_MESSAGE, {
    statusCode: 404,
    code: "EVENT_BATCH_TEMPLATE_NOT_FOUND",
    message: TEMPLATE_NOT_FOUND_MESSAGE,
  });
}

/** Every field the sparse demo detail cannot fill, at the template defaults. */
function baseTemplateOf(detail: GatheringDetail): EventBatchTemplateDTO {
  return {
    slug: detail.slug,
    title: detail.title,
    description: detail.body,
    timezone: DEMO_EVENT_BATCH_TIMEZONE,
    startTime: localTime(detail.date),
    endTime: null,
    coverImageUrl: detail.coverImageUrl ?? null,
    gatheringFamily: detail.gatheringFamily ?? null,
    eventType: detail.type || null,
    formatDetails: detail.formatDetails ?? null,
    neighbourhood: detail.hood || null,
    venue: null,
    listingId: null,
    venueListing: null,
    isOnline: false,
    onlineUrl: null,
    address: null,
    arrivalNotes: null,
    capacity: null,
    language: null,
    cost: null,
    costKind: null,
    paymentUrl: null,
    paymentInstructions: null,
    accessibility: { answers: {}, note: "" },
    visibility: "members",
    community: null,
    communityDropped: null,
    runByListing: null,
    runByDropped: null,
    venueListingDropped: false,
    themes: [],
    contentNotes: [],
    houseRules: null,
    rsvpCutoff: null,
    rsvpQuestions: { dietary: false, pronouns: false, access: false },
    customRsvpQuestion: null,
    allowWaitlist: true,
    showAttendeeCount: true,
  };
}

/** The slug a demo event's template fields come from: its own for a seeded
 *  event, the one it was made from for an event this stand-in created. */
function sourceTemplateSlugOf(slug: string): string {
  return createdEventSources.get(slug)?.templateSlug ?? slug;
}

/** The template view of one of the demo member's events. Throws the coded
 *  404 for any other slug, as the server does for an event the caller does
 *  not host or co-host. */
export function demoEventBatchTemplate(slug: string): EventBatchTemplateDTO {
  const templateSlug = sourceTemplateSlugOf(slug);
  const detail = gatheringDetails[slug];
  if (!DEMO_EVENT_BATCH_TEMPLATE_SLUGS.includes(templateSlug) || !detail) {
    throw templateNotFound();
  }
  const source = createdEventSources.get(slug);
  const view: EventBatchTemplateDTO = {
    ...baseTemplateOf(detail),
    ...DEMO_EVENT_BATCH_TEMPLATE_EXTRAS[templateSlug],
    slug,
  };
  if (!source) return view;
  const { placeAndCost } = source;
  return {
    ...view,
    ...placeAndCost,
    // A replaced directory link has no name the demo can read back.
    ...("listingId" in placeAndCost ? { venueListing: null } : {}),
    startTime: source.startTime,
    endTime: source.endTime,
  };
}

/** The place and cost keys `shared` carries, the ones that replace the
 *  template's values. */
function placeAndCostOf(shared: EventBatchSharedDto): PlaceAndCostOverrides {
  const overrides: Record<string, unknown> = {};
  for (const field of PLACE_AND_COST_FIELDS) {
    if (shared[field] !== undefined) overrides[field] = shared[field];
  }
  return overrides;
}

/** The ISO start of a demo event: a created one keeps its own instant, a
 *  seeded one reads its day with the template's start time in Lisbon. */
function demoStartAtOf(slug: string, view: EventBatchTemplateDTO): string {
  const detail = gatheringDetails[slug]!;
  if (createdEventSources.has(slug)) return detail.date.toISOString();
  return wallClockInstant(
    localIsoDate(detail.date),
    view.startTime,
    view.timezone,
  ).toISOString();
}

/** The starting events the demo picker offers, newest first, the order of
 *  `GET /events?filter=hosting`. */
export function demoEventBatchTemplateOptions(): EventBatchTemplateOption[] {
  const slugs = [
    ...DEMO_EVENT_BATCH_TEMPLATE_SLUGS,
    ...createdEventSources.keys(),
  ];
  const options = slugs.map((slug): EventBatchTemplateOption => {
    const view = demoEventBatchTemplate(slug);
    return {
      slug,
      title: view.title,
      startAt: demoStartAtOf(slug, view),
      timezone: view.timezone,
      place: view.isOnline ? "" : (view.venue ?? view.neighbourhood ?? ""),
      isOnline: view.isOnline,
      coverImageUrl: view.coverImageUrl,
    };
  });
  return options.sort((first, second) =>
    second.startAt.localeCompare(first.startAt),
  );
}

function badRequest(
  code: EventBatchErrorCode,
  message: string,
  extra: Record<string, unknown>,
): ApiError {
  return new ApiError(400, message, {
    statusCode: 400,
    code,
    message,
    ...extra,
  });
}

function rowRefusal(
  rowError: EventBatchRowError,
  message: string,
  extra: Record<string, unknown> = {},
): ApiError {
  const { code, rowIndex, field, date } = rowError;
  return badRequest(code, message, { rowIndex, field, date, ...extra });
}

/** A row with its resolved times and start instant. */
interface PlannedRow {
  row: EventBatchRowDto;
  rowIndex: number;
  startTime: string;
  endTime: string | null;
  startAt: Date;
}

/** Checks every row in request order, the server's order for each row:
 *  a repeated date, then a date past the last allowed one, then a start
 *  already behind `now`. The first failure throws. */
function planRows(
  dto: CreateEventBatchDto,
  timezone: string,
  now: Date,
): PlannedRow[] {
  const lastDate = lastAllowedDate(wallClockNow(timezone, now).date);
  const seenDates = new Set<string>();
  return dto.rows.map((row, rowIndex) => {
    const { date } = row;
    if (seenDates.has(date)) {
      throw rowRefusal(
        { code: "EVENT_BATCH_DUPLICATE_DATE", rowIndex, field: "date", date },
        `${date} appears twice. Each date holds one event.`,
      );
    }
    seenDates.add(date);
    if (date > lastDate) {
      throw rowRefusal(
        { code: "EVENT_BATCH_DATE_TOO_FAR", rowIndex, field: "date", date },
        `${date} is more than ${EVENT_BATCH_MAX_MONTHS_AHEAD} months away. The last date you can add is ${lastDate}.`,
        { lastDate },
      );
    }
    const startTime = row.startTime ?? dto.shared.startTime;
    const endTime =
      row.endTime !== undefined ? row.endTime : (dto.shared.endTime ?? null);
    const startAt = wallClockInstant(date, startTime, timezone);
    if (startAt.getTime() < now.getTime()) {
      throw rowRefusal(
        {
          code: "EVENT_BATCH_DATE_IN_PAST",
          rowIndex,
          field: "startTime",
          date,
        },
        `The start time on ${date} has already passed.`,
      );
    }
    return { row, rowIndex, startTime, endTime, startAt };
  });
}

/** `base`, or `base-2`, `base-3` when a demo event already holds it. */
function uniqueDemoSlug(base: string): string {
  let slug = base;
  for (let suffix = 2; gatheringDetails[slug]; suffix += 1) {
    slug = `${base}-${suffix}`;
  }
  return slug;
}

/** The venue line a demo hosting card shows, after the shared place edit. */
function hostingVenueOf(
  dto: CreateEventBatchDto,
  template: EventBatchTemplateDTO,
): string {
  const { shared } = dto;
  const isOnline = shared.isOnline ?? template.isOnline;
  const venue = shared.venue !== undefined ? shared.venue : template.venue;
  const neighbourhood =
    shared.neighbourhood !== undefined
      ? shared.neighbourhood
      : template.neighbourhood;
  if (isOnline) return venue || DEMO_EVENT_BATCH_ONLINE_VENUE;
  return venue || neighbourhood || "";
}

/**
 * The demo cover key is the picked photo's local blob URL, which the photo
 * field revokes once the form folds. Each distinct blob cover gets one copy
 * this stand-in owns, so every created event keeps showing its photo. A blob
 * it can no longer read keeps its own key. Mirrors `demoOwnImageUrl` in
 * `personaPostsDemo.ts`.
 */
async function ownCoverCopies(
  dto: CreateEventBatchDto,
): Promise<Map<string, string>> {
  const coverUrls = [
    dto.shared.coverImageUrl,
    ...dto.rows.map((row) => row.coverImageUrl),
  ];
  const blobUrls = new Set(
    coverUrls.filter((url): url is string => url?.startsWith("blob:") ?? false),
  );
  const copies = new Map<string, string>();
  await Promise.all(
    [...blobUrls].map(async (blobUrl) => {
      try {
        const picked = await (await fetch(blobUrl)).blob();
        copies.set(blobUrl, URL.createObjectURL(picked));
      } catch {
        // The original key stays, as `demoOwnImageUrl` does.
      }
    }),
  );
  return copies;
}

/**
 * Publishes a demo month, all or nothing. Checks in the server's order: the
 * row count, the starting event, then each row (`planRows`). Only once every
 * row passes does it copy the picked covers and register the events, in date
 * order (ties keep request order), and answer the way `POST /events/batch`
 * does.
 */
export async function createDemoEventBatch(
  dto: CreateEventBatchDto,
  now: Date,
): Promise<CreatedEventBatchDTO> {
  if (dto.rows.length > EVENT_BATCH_MAX_ROWS) {
    throw badRequest(
      "EVENT_BATCH_TOO_MANY_DATES",
      `You can add up to ${EVENT_BATCH_MAX_ROWS} dates at a time.`,
      { limit: EVENT_BATCH_MAX_ROWS },
    );
  }
  const template = demoEventBatchTemplate(dto.templateSlug);
  const templateDetail = gatheringDetails[dto.templateSlug]!;
  const sourceTemplateSlug = sourceTemplateSlugOf(dto.templateSlug);
  // A month made from a created event carries that event's own overrides.
  const placeAndCost = {
    ...createdEventSources.get(dto.templateSlug)?.placeAndCost,
    ...placeAndCostOf(dto.shared),
  };
  const plannedRows = planRows(dto, template.timezone, now).sort(
    (first, second) =>
      first.startAt.getTime() - second.startAt.getTime() ||
      first.rowIndex - second.rowIndex,
  );
  const venue = hostingVenueOf(dto, template);
  const isOnline = dto.shared.isOnline ?? template.isOnline;
  const coverCopies = await ownCoverCopies(dto);
  const ownCover = (url: string | undefined): string | undefined =>
    url === undefined ? undefined : (coverCopies.get(url) ?? url);
  const events = plannedRows.map(({ row, startTime, endTime, startAt }) => {
    const slug = uniqueDemoSlug(`${sourceTemplateSlug}-${row.date}`);
    gatheringDetails[slug] = {
      ...templateDetail,
      slug,
      title: row.title,
      body: row.description,
      date: startAt,
      timezone: template.timezone,
      // A new event starts with its host seated as going.
      spots: { key: "gatherings:spots.goingSoFar", values: { count: 1 } },
      coverImageUrl:
        ownCover(row.coverImageUrl) ??
        ownCover(dto.shared.coverImageUrl) ??
        templateDetail.coverImageUrl ??
        null,
    };
    createdEventSources.set(slug, {
      templateSlug: sourceTemplateSlug,
      startTime,
      endTime,
      placeAndCost,
    });
    createdHostingEvents.push({
      id: slug,
      category: "hosting",
      slug,
      title: row.title,
      date: row.date,
      start: startTime,
      ...(endTime !== null ? { end: endTime } : {}),
      ...(isEndNextDay(startTime, endTime)
        ? { endDate: nextDate(row.date) }
        : {}),
      venue,
      ...(isOnline ? { online: true } : {}),
    });
    return { slug, title: row.title, startAt: startAt.toISOString() };
  });
  return { events };
}

/** The demo hosting cards this stand-in created, for My Events. */
export function demoBatchHostingEvents(): MyEvent[] {
  return [...createdHostingEvents];
}

/** Forgets every created demo event. Tests only. */
export function resetDemoEventBatch(): void {
  for (const slug of createdEventSources.keys()) {
    delete gatheringDetails[slug];
  }
  createdEventSources.clear();
  createdHostingEvents.length = 0;
}
