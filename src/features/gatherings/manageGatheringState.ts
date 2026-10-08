import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { EventVisibility, UpdateEventDto } from "./api/events.api";
import type { AttendeesResult } from "./api/useAttendees";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import type { GatheringEditableField } from "./GatheringFieldEditor";
import type { VenueSelection } from "./VenuePicker";
import type { RunByListingView, RunBySelection } from "./runByListing";
import type { GatheringDetail } from "./data";
import { MAX_GATHERING_SPAN_DAYS } from "./createGathering.data";
import {
  EXISTING_GATHERING_RSVP_QUESTIONS,
  sanitizeContentNotes,
  sanitizeThemes,
  type ContentNoteKey,
  type CostKind,
  type GatheringThemeKey,
  type RsvpCutoff,
  type RsvpQuestions,
} from "./gatheringExtras";
import {
  findFormat,
  OTHER_FORMAT_KEY,
  stripDisallowedDetails,
  type FormatDetails,
  type GatheringFamily,
} from "./gatheringCatalog";
import { gatheringWhen } from "./gatheringSchedule";
import { dateToDatetimeValue, daysUntil } from "./manageGatheringDates";
import { MAX_CAPACITY, MIN_CAPACITY } from "./steps/whoChapter.data";
import {
  ATTENDEE_COUNT,
  GATHERING_CAPACITY,
  GATHERING_DATE,
  GATHERING_DESCRIPTION,
  GATHERING_DETAILS,
  GATHERING_TITLE,
} from "./manageGathering.data";

/**
 * The manage dashboard's editable state, plus the pure transitions the page
 * applies to it. Kept out of the page component so the dashboard itself stays
 * orchestration: which modal is open, and which mutation to fire.
 */

export interface GatheringDetailRow {
  id: string;
  labelKey: string;
  value: string;
}

export interface GatheringState {
  title: string;
  /** Formatted display string for the "date" details row, derived from
   *  `startAt` and `endAt` on every change. See `startAt` for the real editable moment. */
  date: string;
  /** The gathering's real scheduled start: what actually gets sent to the
   *  backend on save. Kept in step with `date`/`details` (the display copy)
   *  whenever either changes. */
  startAt: Date;
  /** The gathering's stated end, or `null` when it has none. An end is
   *  optional on a gathering and always has been, so `null` is a real saved
   *  answer the host can choose, the same as any filled-in value.
   *  Editable in the edit modal, which is what stops a host who moves the
   *  start past a stored end from meeting a 400 with nothing on screen to
   *  change (see `buildEditPatch`). */
  endAt: Date | null;
  /** The venue as the host wrote it, the value the edit modal's location
   *  field and the venue row open on. A live gathering with no venue (an
   *  online one) holds its neighbourhood line, "Online" for most. See
   *  `liveInitialState`. */
  location: string;
  description: string;
  details: GatheringDetailRow[];
  /** The venue's directory link, or null for a free-text venue. See
   *  `VenuePicker`/`EditVenueModal`. */
  venueListingId: string | null;
  venueListing: { slug: string; name: string } | null;
  /** The business that runs this gathering, or null for none. Optional so
   *  every existing state literal stays valid; absent reads as none. */
  runByListing?: RunByListingView | null;
  /** Who can find and RSVP to this gathering. See `AudienceScopeField`. */
  visibility: EventVisibility;
  /** The community this gathering is filed to, or `""` for none, settable
   *  in the edit modal now, same "" sentinel `useGatheringForm` uses. Absent
   *  (`""`) in the demo prototype. */
  communitySlug: string;
  /** How many people can go as PERSISTED, or `null` for no limit. Same
   *  pre-edit-snapshot role `communitySlug` plays: `buildEditPatch` compares
   *  against it and sends a capacity only on a change. */
  capacity: number | null;
  /** The gathering's family as PERSISTED, so the edit modal opens on the
   *  family the gathering already carries. Same pre-edit-snapshot role
   *  `communitySlug` plays. */
  gatheringFamily: GatheringFamily | null;
  /** The persisted format key, or the host's own words. */
  eventType: string | null;
  /** The persisted details bag. */
  formatDetails: FormatDetails | null;

  // ── Cover, care and RSVPs (Create Gathering v2) ──────────────────────────
  // The persisted values, edited in the edit modal and read back into its
  // draft by `editDraftCareFields`.
  /** The cover the server holds: the resolved read URL the detail arrived
   *  with, or the storage key an edit in this visit saved. `""` for none.
   *  `buildEditPatch` compares against it and sends a cover only on a
   *  change. */
  coverImageUrl: string;
  themes: GatheringThemeKey[];
  contentNotes: ContentNoteKey[];
  /** The host's house rules, or `""` for none. */
  houseRules: string;
  /** How it is paid for. A gathering written before the field existed reads
   *  the way a duplicate reads it (see `persistedCostKind`). */
  costKind: CostKind;
  /** The host's own words about what it costs, or `""`. */
  cost: string;
  /** When RSVPs close, or `null` when they stay open until it ends. */
  rsvpCutoff: RsvpCutoff | null;
  rsvpQuestions: RsvpQuestions;
  /** The host's own RSVP question, or `""` for none. */
  customRsvpQuestion: string;
}

/** The day options the "date" details row and the header read a schedule in. */
const DASHBOARD_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
};

/**
 * How the "date" details row and the header render a schedule.
 *
 * A gathering that runs across several days says so here ("17 to 19 October
 * 2025"), because a three-day festival whose dashboard reads "Friday, 17
 * October 2025" tells its own host the wrong thing. `gatheringWhen` is the one
 * place that decides how a schedule reads, so this row says exactly what the
 * public page says.
 */
function dateDisplay(
  startAt: Date,
  endAt: Date | null,
  fmt: Formatters,
  t: TFunction,
): string {
  return gatheringWhen(startAt, endAt, fmt, t, DASHBOARD_DATE_OPTIONS).dateText;
}

/**
 * How the "time" details row renders a schedule: "11:00 – 14:00", the start
 * alone when there is no stated end, and "(next day)" after an end that falls
 * on the following morning. Read off the same `gatheringWhen` call shape as
 * `dateDisplay`, so the two rows always describe one schedule.
 */
function timeDisplay(
  startAt: Date,
  endAt: Date | null,
  fmt: Formatters,
  t: TFunction,
): string {
  const when = gatheringWhen(startAt, endAt, fmt, t, DASHBOARD_DATE_OPTIONS);
  return when.nextDayNote
    ? `${when.timeText} ${when.nextDayNote}`
    : when.timeText;
}

/** The demo prototype's brunch runs 11:00 to 14:00 on `GATHERING_DATE`, the
 *  hours its "time" details row prints, so the schedule editor opens on the
 *  times the row shows. */
function demoScheduleAt(hour: number): Date {
  const at = new Date(GATHERING_DATE);
  at.setHours(hour, 0, 0, 0);
  return at;
}

/** The demo dashboard's starting state: the static Pride-Brunch prototype.
 *  Its date and time rows read through `dateDisplay` and `timeDisplay`, the
 *  same functions a save uses, so a row keeps one format before and after. */
export function demoInitialState(
  fmt: Formatters,
  t: TFunction,
): GatheringState {
  const startAt = demoScheduleAt(11);
  const endAt = demoScheduleAt(14);
  const dateDetail = dateDisplay(startAt, endAt, fmt, t);
  const timeDetail = timeDisplay(startAt, endAt, fmt, t);
  const venueDetail =
    GATHERING_DETAILS.find((detail) => detail.id === "venue")?.value ?? "";
  return {
    title: GATHERING_TITLE,
    date: dateDetail,
    startAt,
    endAt,
    location: venueDetail,
    description: GATHERING_DESCRIPTION,
    details: GATHERING_DETAILS.map((detail) => {
      if (detail.id === "date") return { ...detail, value: dateDetail };
      if (detail.id === "time") return { ...detail, value: timeDetail };
      return detail;
    }),
    // The static prototype has no gathering linked to a real directory
    // listing.
    venueListingId: null,
    venueListing: null,
    // The static prototype has no audience-scope of its own; "members"
    // (Public) matches the wizard's default and prior behaviour.
    visibility: "members",
    communitySlug: "",
    // The number its "capacity" details row shows.
    capacity: GATHERING_CAPACITY,
    // The static prototype predates families and carries none of it.
    gatheringFamily: null,
    eventType: null,
    formatDetails: null,
    // Nor does it carry a cover or any of the care a v2 gathering sets. Its
    // RSVP form asks what the form asked before the questions existed (R8).
    coverImageUrl: "",
    themes: [],
    contentNotes: [],
    houseRules: "",
    costKind: "free",
    cost: "",
    rsvpCutoff: null,
    rsvpQuestions: EXISTING_GATHERING_RSVP_QUESTIONS,
    customRsvpQuestion: "",
  };
}

/**
 * The cost kind a saved gathering carries, or the closest reading of an older
 * one, the same reading `gatheringSeed`'s `seedCostKind` gives a duplicate.
 *
 * A gathering written before the field existed has only its free-text `cost`.
 * One the server does not read as free opens as `fixed` with the host's words
 * beside it, so the modal does not show a priced evening as free.
 */
function persistedCostKind(gathering: GatheringDetail): CostKind {
  if (gathering.costKind) return gathering.costKind;
  return gathering.cost?.trim() && gathering.isFree === false
    ? "fixed"
    : "free";
}

/** The live dashboard's starting state, seeded from the fetched event. Its
 *  details rows are the ones the demo prototype shows: date, time, venue and
 *  capacity, each the row a focused Overview editor opens from. The time row
 *  is left out when the schedule reads no time at all, so the row never sits
 *  empty. The capacity is also kept as `capacity`, which the editors open on
 *  and the attendees bar reads from its own query.
 *
 *  The location and the venue row hold the venue the host wrote. `hood` is
 *  the neighbourhood line the public cards print (the neighbourhood first,
 *  then "Online", then the venue), so seeding from it opened the edit modal
 *  and the venue editor on "Intendente" for a gathering held at a named bar.
 *  `hood` stays the fallback for a gathering with no venue at all. */
export function liveInitialState(
  gathering: GatheringDetail,
  fmt: Formatters,
  t: TFunction,
): GatheringState {
  const endAt = gathering.endAt ?? null;
  const dateValue = dateDisplay(gathering.date, endAt, fmt, t);
  const timeValue = timeDisplay(gathering.date, endAt, fmt, t);
  const capacity = gathering.capacity ?? null;
  const location = gathering.venue || gathering.hood;
  return {
    title: gathering.title,
    date: dateValue,
    startAt: gathering.date,
    endAt,
    location,
    description: gathering.body,
    details: [
      {
        id: "date",
        labelKey: "gatherings:manage.details.date",
        value: dateValue,
      },
      ...(timeValue
        ? [
            {
              id: "time",
              labelKey: "gatherings:manage.details.time",
              value: timeValue,
            },
          ]
        : []),
      {
        id: "venue",
        labelKey: "gatherings:manage.details.venue",
        value: location,
      },
      {
        id: "capacity",
        labelKey: "gatherings:manage.details.capacity",
        value: capacityDisplay(capacity, t),
      },
    ],
    venueListingId: gathering.venueListingId ?? null,
    venueListing: gathering.venueListing ?? null,
    runByListing: gathering.runByListing ?? null,
    visibility: gathering.visibility ?? "members",
    communitySlug: gathering.communitySlug ?? "",
    capacity,
    gatheringFamily: gathering.gatheringFamily ?? null,
    eventType: gathering.type || null,
    formatDetails: gathering.formatDetails ?? null,
    coverImageUrl: gathering.coverImageUrl ?? "",
    themes: gathering.themes ?? [],
    contentNotes: gathering.contentNotes ?? [],
    houseRules: gathering.houseRules ?? "",
    costKind: persistedCostKind(gathering),
    cost: gathering.cost ?? "",
    rsvpCutoff: gathering.rsvpCutoff ?? null,
    // A live detail always carries the map. Without it, the gathering keeps
    // asking what the RSVP form asked before the questions existed (R8).
    rsvpQuestions: gathering.rsvpQuestions ?? EXISTING_GATHERING_RSVP_QUESTIONS,
    customRsvpQuestion: gathering.customRsvpQuestion ?? "",
  };
}

/**
 * The family/format half of an edit draft, read off the persisted state.
 *
 * A stored format that is not a catalog key is the host's own words, so the
 * modal opens on "Something else" with the words in the box. A blank select
 * there would silently drop them on the next save.
 *
 * Shared by both surfaces that open the edit modal (the manage dashboard and
 * the detail page's host bar), so the two cannot drift into different readings
 * of the same stored `event_type`.
 */
export function editDraftFormatFields(
  state: GatheringState,
): Pick<
  GatheringDetailsDraft,
  "gatheringFamily" | "format" | "otherText" | "formatDetails"
> {
  const curatedFormat = findFormat(state.eventType);
  return {
    gatheringFamily: state.gatheringFamily ?? "",
    format: curatedFormat
      ? curatedFormat.key
      : state.eventType
        ? OTHER_FORMAT_KEY
        : "",
    otherText: curatedFormat ? "" : (state.eventType ?? ""),
    formatDetails: state.formatDetails ?? {},
  };
}

/**
 * The cover, care, capacity and RSVP half of an edit draft, read off the
 * persisted state. Shared by both surfaces that open the edit modal, beside
 * `editDraftFormatFields`, so the two read a saved gathering the same way.
 *
 * Themes are narrowed against the saved family, and access needs open on
 * (ruling R8) whatever an older row stored, since the modal shows that switch
 * locked on. A gathering with no limit opens on an empty stepper, the `""`
 * the draft reads as no limit.
 */
export function editDraftCareFields(
  state: GatheringState,
): Pick<
  GatheringDetailsDraft,
  | "coverImageUrl"
  | "themes"
  | "contentNotes"
  | "houseRules"
  | "costKind"
  | "cost"
  | "capacity"
  | "rsvpCutoff"
  | "rsvpQuestions"
  | "customRsvpQuestion"
> {
  return {
    capacity: state.capacity === null ? "" : String(state.capacity),
    coverImageUrl: state.coverImageUrl,
    themes: sanitizeThemes(state.themes, state.gatheringFamily),
    contentNotes: [...state.contentNotes],
    houseRules: state.houseRules,
    costKind: state.costKind,
    cost: state.cost,
    rsvpCutoff: state.rsvpCutoff,
    rsvpQuestions: { ...state.rsvpQuestions, access: true },
    customRsvpQuestion: state.customRsvpQuestion,
  };
}

/** The numbers the dashboard chrome shows around the tabs. */
export interface ManageGatheringCounts {
  /** Header "N days to go". */
  daysToGo: number;
  /** Cancel-confirm "this will tell N people" count. */
  attendeeCount: number;
  /** Overview stat chips. `undefined` leaves `OverviewTab` on its own demo
   *  trio, which is exactly what demo mode wants. */
  overviewCounts?: { going: number; waitlist: number; spotsLeft: number };
}

/** Real in live, static in demo, so the demo prototype reads exactly as it
 *  always did while a live dashboard shows its own gathering's numbers. */
export function manageGatheringCounts(
  demoMode: boolean,
  gathering: GatheringDetail | null,
  attendees: AttendeesResult | undefined,
): ManageGatheringCounts {
  return {
    daysToGo: demoMode || !gathering ? 12 : daysUntil(gathering.date),
    attendeeCount: demoMode
      ? ATTENDEE_COUNT
      : (attendees?.goingCount ?? gathering?.spots.values?.count ?? 0),
    ...(demoMode || !attendees
      ? {}
      : {
          overviewCounts: {
            going: attendees.goingCount,
            waitlist: attendees.waitlistCount,
            // Counted in seats (LOC-07): a going member who declared two
            // guests occupies three of them.
            spotsLeft: attendees.capacity
              ? Math.max(0, attendees.capacity - attendees.seatsTaken)
              : 0,
          },
        }),
  };
}

/** A venue pick from `VenuePicker`: free text, or a real directory listing. */
export function applyVenueSelection(
  current: GatheringState,
  selection: VenueSelection,
): GatheringState {
  return {
    ...current,
    location: selection.text,
    venueListingId: selection.listingId,
    venueListing: selection.venueListing,
    details: current.details.map((detail) =>
      detail.id === "venue" ? { ...detail, value: selection.text } : detail,
    ),
  };
}

/** A "Run by" pick from `EditRunByModal`: a business, or none. */
export function applyRunBySelection(
  current: GatheringState,
  selection: RunBySelection,
): GatheringState {
  return { ...current, runByListing: selection.listing };
}

/** `draft.startAt` is the modal's local `"yyyy-mm-ddThh:mm"` wire value (no
 *  timezone suffix), which `new Date(...)` parses as local time, the same
 *  convention the create-gathering wizard uses for its own date+time fields. */
function draftStartAt(draft: GatheringDetailsDraft): Date {
  return new Date(draft.startAt);
}

/** The draft's end as an instant, or `null` when the host stated none (`""`,
 *  the sentinel `GatheringDetailsDraft.endAt` documents) or typed something
 *  the browser cannot read as a moment. */
function draftEndAt(draft: GatheringDetailsDraft): Date | null {
  if (!draft.endAt) return null;
  const parsed = new Date(draft.endAt);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * What the draft's format choice actually stores in `events.event_type`: a
 * curated catalog key, or the host's own words when they picked "something
 * else". `null` when they chose nothing, or typed nothing but whitespace into
 * their own line, since a blank line is the same fact as no format at all.
 */
function draftEventType(draft: GatheringDetailsDraft): string | null {
  if (draft.format === OTHER_FORMAT_KEY) return draft.otherText.trim() || null;
  return draft.format || null;
}

/** The draft's answers narrowed to the questions its family actually asks, so
 *  a family changed in this same edit is what the stripping runs against.
 *  `null` when nothing survives, which is what the column holds for a
 *  gathering whose host answered none of them. */
function draftFormatDetails(
  draft: GatheringDetailsDraft,
): FormatDetails | null {
  return stripDisallowedDetails(
    draft.gatheringFamily || null,
    draft.formatDetails,
  );
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** Why a draft's schedule cannot be saved, or `null` when it can. */
export type EditScheduleProblem = "endBeforeStart" | "spanTooLong";

/**
 * The edit modal's schedule gate, and the reason it refuses.
 *
 * A host who moved a 23:00 start to 06:00 used to send a start that landed
 * after the stored end, get `400 endAt must be after startAt` back, and find
 * nothing on the form to change. The end is editable now, so this answers WHY
 * a save is being held, before the API gets to answer it.
 *
 * The two rules mirror the wizard's `evaluateSchedule` (useGatheringForm.ts)
 * and, through it, the backend's `assertScheduleValid` exactly. The cap is
 * ELAPSED MILLISECONDS between the two instants, which is what the server
 * measures. Counting calendar days instead would wave through 09:00 on the
 * 17th to 23:00 on the 31st: fourteen days on the calendar, fourteen days and
 * fourteen hours on the clock, the save button lit and a 400 waiting behind
 * it. This arithmetic is deliberate; do not swap it for a day count.
 *
 * A draft with no end is valid by definition: an end is optional on a
 * gathering, and clearing it is a real thing a host may do.
 */
export function editScheduleProblem(
  draft: GatheringDetailsDraft,
): EditScheduleProblem | null {
  const endAt = draftEndAt(draft);
  if (!endAt) return null;
  const startAt = draftStartAt(draft);
  // An unreadable start is the start field's own problem, and the title/start/
  // location emptiness checks in `canSaveEditDraft` already hold the save.
  if (Number.isNaN(startAt.getTime())) return null;
  if (endAt.getTime() <= startAt.getTime()) return "endBeforeStart";
  if (
    endAt.getTime() - startAt.getTime() >
    MAX_GATHERING_SPAN_DAYS * MILLISECONDS_PER_DAY
  ) {
    return "spanTooLong";
  }
  return null;
}

/** A capacity as the stepper holds it, read as a number, or `null` for the
 *  empty field (no limit) and for anything that does not read as a number. */
function parsedCapacity(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** The draft's capacity as it goes on the wire: a number, or `null` for no
 *  limit. `canSaveEditDraft` holds a save until the field reads as one. */
function draftCapacity(draft: GatheringDetailsDraft): number | null {
  return parsedCapacity(draft.capacity);
}

/** Why a draft's capacity cannot be saved, or `null` when it can. */
export type EditCapacityProblem = "outOfRange";

/**
 * The edit modal's capacity gate, and the reason it refuses.
 *
 * An empty field is no limit and always saves. A number saves when it is a
 * whole number inside the stepper's own range (`MIN_CAPACITY` to
 * `MAX_CAPACITY`, the range the wizard offers), or when it is exactly the
 * number the modal opened with: a gathering saved before that range existed
 * (a capacity of 1, or 500) can still save its other edits with the capacity
 * left as it is.
 *
 * `openedWithCapacity` is the draft value the modal was seeded with. Without
 * it, only the range applies.
 */
export function editCapacityProblem(
  draft: GatheringDetailsDraft,
  openedWithCapacity?: string,
): EditCapacityProblem | null {
  if (!draft.capacity.trim()) return null;
  const capacity = parsedCapacity(draft.capacity);
  if (capacity === null) return "outOfRange";
  if (
    openedWithCapacity !== undefined &&
    capacity === parsedCapacity(openedWithCapacity)
  ) {
    return null;
  }
  return Number.isInteger(capacity) &&
    capacity >= MIN_CAPACITY &&
    capacity <= MAX_CAPACITY
    ? null
    : "outOfRange";
}

/**
 * Whether the draft lets fewer people go than the gathering allowed when the
 * modal opened: a lower number, or a first limit on a gathering that had
 * none. The server keeps everyone already going when the number drops, and
 * only new RSVPs meet the new limit, so the field says so.
 */
export function isEditCapacityLowered(
  draft: GatheringDetailsDraft,
  openedWithCapacity: string,
): boolean {
  const capacity = draftCapacity(draft);
  if (capacity === null) return false;
  const openedCapacity = parsedCapacity(openedWithCapacity);
  return openedCapacity === null || capacity < openedCapacity;
}

/** Everything the edit modal needs before it will let a host save: the three
 *  fields a gathering cannot go without, the words that go with "Something
 *  else", a schedule the API will take, and a capacity the stepper allows.
 *  `openedWithCapacity` is the capacity the modal opened with (see
 *  `editCapacityProblem`). */
export function canSaveEditDraft(
  draft: GatheringDetailsDraft,
  openedWithCapacity?: string,
): boolean {
  return (
    draft.title.trim().length > 0 &&
    draft.startAt.trim().length > 0 &&
    draft.location.trim().length > 0 &&
    // "Something else" needs the words that go with it, mirroring the wizard's
    // `isFormatChosen` (useGatheringForm.ts). Left blank, a save sends a null
    // `eventType` (see `draftEventType`) and silently clears the stored format
    // while the box on screen still says the host picked their own words.
    // A draft that names no format at all stays saveable, as it was before:
    // a gathering may carry none, and clearing one is a real choice.
    (draft.format !== OTHER_FORMAT_KEY || draft.otherText.trim().length > 0) &&
    editScheduleProblem(draft) === null &&
    editCapacityProblem(draft, openedWithCapacity) === null
  );
}

/**
 * The edit modal only offers a plain-text location field. It can't specify
 * (or preserve) a directory link, so any change to the location text
 * implicitly detaches an existing one, so the link never silently points at
 * stale text. An untouched location (only the title/date/etc. changed)
 * leaves the link exactly as it was.
 */
function hasLocationChanged(
  current: GatheringState,
  draft: GatheringDetailsDraft,
): boolean {
  return draft.location !== current.location;
}

/** The draft's themes as the server keeps them for the draft's family, which
 *  may have changed in this same edit (ruling R6). */
function draftThemes(draft: GatheringDetailsDraft): GatheringThemeKey[] {
  return sanitizeThemes(draft.themes, draft.gatheringFamily || null);
}

/** What the cost column holds after a save: nothing for a free gathering
 *  (ruling F11, the server's own rule), otherwise the host's words, trimmed,
 *  or `null` when they left the line blank. */
function draftCost(draft: GatheringDetailsDraft): string | null {
  if (draft.costKind === "free") return null;
  return draft.cost.trim() || null;
}

/**
 * Whether the host changed what it costs. A gathering written before the
 * field existed opens on a READING of its cost words (`persistedCostKind`),
 * so the pair goes on the wire only when the host changes the kind, or the
 * words of a paid kind. An untouched reading stays off the wire.
 */
function hasCostChanged(
  current: GatheringState,
  draft: GatheringDetailsDraft,
): boolean {
  if (draft.costKind !== current.costKind) return true;
  return draft.costKind !== "free" && draft.cost.trim() !== current.cost.trim();
}

/** Whether the host picked or removed a cover. The detail arrives with the
 *  resolved read URL and a pick is a storage key, so any difference is a real
 *  change. */
function hasCoverChanged(
  current: GatheringState,
  draft: GatheringDetailsDraft,
): boolean {
  return draft.coverImageUrl !== current.coverImageUrl;
}

/** Whether the host changed how many people can go. Under a series
 *  `scope: "future"` edit the server copies what the patch carries onto every
 *  later date, so an untouched capacity stays off the wire and each date
 *  keeps its own. */
function hasCapacityChanged(
  current: GatheringState,
  draft: GatheringDetailsDraft,
): boolean {
  return draftCapacity(draft) !== current.capacity;
}

/** The "capacity" details row's text for a capacity: "45 people", or "No
 *  limit" for `null`. */
function capacityDisplay(capacity: number | null, t: TFunction): string {
  return capacity === null
    ? t("gatherings:manage.details.capacityUnlimited")
    : t("gatherings:manage.details.capacityValue", { count: capacity });
}

/**
 * Whether the draft moves the start or the end. Compared in the draft's own
 * minute-precision wire values (the ones `editDraftFor` seeds it with), so an
 * untouched schedule reads as unchanged even when the stored instant carries
 * seconds.
 */
function hasScheduleChanged(
  current: GatheringState,
  draft: GatheringDetailsDraft,
): boolean {
  const currentEnd = current.endAt ? dateToDatetimeValue(current.endAt) : "";
  return (
    draft.startAt !== dateToDatetimeValue(current.startAt) ||
    draft.endAt !== currentEnd
  );
}

/** The saved edit, folded into the dashboard's own state. */
export function applyEditDraft(
  current: GatheringState,
  draft: GatheringDetailsDraft,
  fmt: Formatters,
  t: TFunction,
): GatheringState {
  const newStartAt = draftStartAt(draft);
  const newEndAt = draftEndAt(draft);
  const newDateDisplay = dateDisplay(newStartAt, newEndAt, fmt, t);
  const newCapacity = draftCapacity(draft);
  const isCapacityChanged = hasCapacityChanged(current, draft);
  const isScheduleChanged = hasScheduleChanged(current, draft);
  return {
    ...current,
    title: draft.title,
    date: newDateDisplay,
    startAt: newStartAt,
    endAt: newEndAt,
    location: draft.location,
    description: draft.description,
    visibility: draft.visibility,
    communitySlug: draft.communitySlug,
    // Folded in exactly as they go on the wire, so a second edit in the same
    // session opens on the family and format the first one saved, over the
    // values the page was seeded with.
    gatheringFamily: draft.gatheringFamily || null,
    eventType: draftEventType(draft),
    formatDetails: draftFormatDetails(draft),
    // The cover and care, folded in as they go on the wire for the same
    // reason. The cost pair folds only when it was sent, so the next edit
    // compares against what the server holds.
    coverImageUrl: draft.coverImageUrl,
    themes: draftThemes(draft),
    contentNotes: sanitizeContentNotes(draft.contentNotes),
    houseRules: draft.houseRules.trim(),
    rsvpCutoff: draft.rsvpCutoff,
    rsvpQuestions: { ...draft.rsvpQuestions, access: true },
    customRsvpQuestion: draft.customRsvpQuestion.trim(),
    ...(hasCostChanged(current, draft)
      ? { costKind: draft.costKind, cost: draftCost(draft) ?? "" }
      : {}),
    ...(hasLocationChanged(current, draft)
      ? { venueListingId: null, venueListing: null }
      : {}),
    // As it goes on the wire, so the next edit compares against what the
    // server holds. Unchanged, it is the value already here.
    capacity: newCapacity,
    details: current.details.map((detail) => {
      if (detail.id === "date") return { ...detail, value: newDateDisplay };
      if (detail.id === "venue") return { ...detail, value: draft.location };
      // Rewritten only when the schedule moved, so an edit to anything else
      // keeps the text it has. A live gathering whose schedule read no time
      // when the page loaded has no such row to rewrite.
      if (detail.id === "time" && isScheduleChanged) {
        return { ...detail, value: timeDisplay(newStartAt, newEndAt, fmt, t) };
      }
      // Demo and live both carry this row. It is rewritten only when the
      // number changed, so an untouched row keeps the text it arrived with.
      if (detail.id === "capacity" && isCapacityChanged) {
        return { ...detail, value: capacityDisplay(newCapacity, t) };
      }
      return detail;
    }),
  };
}

/**
 * The PATCH body for a saved edit. `current` must be the PRE-edit snapshot:
 * the location, cover, cost, capacity and community comparisons below
 * depend on it.
 */
export function buildEditPatch(
  current: GatheringState,
  draft: GatheringDetailsDraft,
): UpdateEventDto {
  const isLocationChanged = hasLocationChanged(current, draft);
  return {
    title: draft.title,
    description: draft.description,
    // Reschedules the real event. The backend applies `startAt` on PATCH and
    // fans out an "event updated" notice to every attendee/invitee when it
    // actually changes (events.service.ts `update()`'s `materialChanges`
    // check). Never propagated to future series siblings even under
    // `scope: "future"`: each occurrence keeps its own date (see the
    // backend's `update()` doc).
    startAt: draftStartAt(draft).toISOString(),
    // Sent on EVERY save, as an explicit `null` when the host cleared the end,
    // and that is the whole point of the field. The backend validates the
    // RESULTING schedule (`assertScheduleValid` over its `nextStartAt` /
    // `nextEndAt`), so a host moving the start past a stored end has to send
    // the new end in the same patch or meet a 400 with nothing to act on.
    //
    // Unconditional here, unlike `communitySlug` below, because neither thing
    // that makes the community key conditional applies. The backend
    // re-authorizes nothing on `endAt`, it reads `dto.endAt !== undefined` as
    // "change it", and its "event updated" fan-out (`materialChanges` in
    // events.service.ts `update()`) watches only `startAt` and the location,
    // so resending an unchanged end bells nobody. A `scope: "future"` series
    // edit strips `startAt`/`endAt` before touching the siblings, so an
    // absolute end never lands on an occurrence held on another date.
    endAt: draftEndAt(draft)?.toISOString() ?? null,
    // The venue, only when the host changed the location text (see
    // `hasLocationChanged`), and with it the directory link the plain text
    // detaches. The server stores any `venue` it receives, and one that
    // differs from the stored venue counts in `update()`'s `materialChanges`,
    // which notifies everyone going. The dashboard once seeded the location
    // from the neighbourhood line, so a title typo fix wrote "Intendente"
    // over the bar's name and belled the whole guest list. Change-only also
    // keeps a `scope: "future"` edit from copying this date's venue onto
    // every later one when the host never touched it.
    ...(isLocationChanged ? { venue: draft.location, listingId: null } : {}),
    visibility: draft.visibility,
    // Family, format and the details bag, all three unconditional. Unlike
    // `communitySlug` below, none of them re-runs an authorization check on
    // the server and none of them appears in `update()`'s `materialChanges`
    // fan-out, so resending an unchanged value bells nobody. An explicit
    // `null` on the family is how the modal UN-classifies a gathering. The
    // server strips the details against the effective family, so a family
    // change carried in this same patch is what the stripping runs against,
    // which is what `draftFormatDetails` does on this side too.
    gatheringFamily: draft.gatheringFamily || null,
    eventType: draftEventType(draft),
    formatDetails: draftFormatDetails(draft),
    // The cover, only when the host picked or removed one. Resending the
    // resolved URL the detail arrived with would put a URL where the server
    // expects a storage key. `""` clears it: the server's image-reference
    // check reads an empty string as no image.
    ...(hasCoverChanged(current, draft)
      ? { coverImageUrl: draft.coverImageUrl }
      : {}),
    // Care and RSVPs, sent on every save like the title. None of them is in
    // `update()`'s "event updated" fan-out, so resending an unchanged value
    // notifies nobody. Both arrays replace wholesale on the server, so an
    // empty list clears. Under `scope: "future"` all of them land on every
    // later date, which the series prompt says out loud.
    themes: draftThemes(draft),
    contentNotes: sanitizeContentNotes(draft.contentNotes),
    houseRules: draft.houseRules.trim() || null,
    // `null` is "When it ends".
    rsvpCutoff: draft.rsvpCutoff,
    // Ruling R8: access needs are asked on every RSVP, the same
    // `access: true` the create payload sends.
    rsvpQuestions: { ...draft.rsvpQuestions, access: true },
    customRsvpQuestion: draft.customRsvpQuestion.trim() || null,
    // The cost pair, only when the host changed it (see `hasCostChanged`). A
    // free gathering sends `cost: null` (ruling F11).
    ...(hasCostChanged(current, draft)
      ? { costKind: draft.costKind, cost: draftCost(draft) }
      : {}),
    // The capacity, only when the host changed it (see `hasCapacityChanged`).
    // A cleared field sends `null`, which the server stores as no limit. A
    // higher number on a published gathering promotes people off the
    // waitlist; a lower one keeps everyone already going.
    ...(hasCapacityChanged(current, draft)
      ? { capacity: draftCapacity(draft) }
      : {}),
    // Only include `communitySlug` when it actually changed from the PERSISTED
    // value (`current.communitySlug`, the pre-edit snapshot, read before
    // `applyEditDraft` folds the draft in). The backend re-runs community-membership
    // authorization (`assertMemberBySlug`, 403/404) whenever this key is
    // present at all, so sending it unconditionally would spuriously reject an
    // unrelated edit (e.g. just the title) on an event whose host has since
    // left the community's roster. "" (no community) sends explicit `null`,
    // the edit modal's only way to CLEAR a gathering's community. See
    // `UpdateEventDto` (events.api.ts) for why this is `| null`.
    ...(draft.communitySlug !== current.communitySlug
      ? { communitySlug: draft.communitySlug || null }
      : {}),
  };
}

/**
 * Which of the Overview's focused editors a draft changed, compared against
 * the saved state in the same terms the page's `editDraftFor` seeds a draft
 * with: the schedule in its minute-precision wire values, the capacity as a
 * parsed number ("045" reads as 45, "" as no limit), the description as
 * trimmed text. Each editor touches only its own field, so a field save lists
 * exactly one.
 */
export function changedEditableFields(
  current: GatheringState,
  draft: GatheringDetailsDraft,
): GatheringEditableField[] {
  const fields: GatheringEditableField[] = [];
  if (hasScheduleChanged(current, draft)) fields.push("schedule");
  if (hasCapacityChanged(current, draft)) fields.push("capacity");
  if (draft.description.trim() !== current.description.trim()) {
    fields.push("description");
  }
  return fields;
}

/**
 * The PATCH body for one focused editor's save: that field's keys and
 * nothing else. The full `buildEditPatch` resends the title, the themes, the
 * care settings and the start on every save. Under a series
 * `scope: "future"` edit the server copies whatever the patch carries onto
 * every later date, so a field save carries its own field only.
 *
 * The schedule pair is built exactly as `buildEditPatch` builds it (the end
 * sent as an explicit `null` when cleared). The capacity goes on the wire
 * only when the number changed, as `null` for no limit. The description goes
 * trimmed, the text the dashboard folds in.
 */
export function buildFieldPatch(
  field: GatheringEditableField,
  current: GatheringState,
  draft: GatheringDetailsDraft,
): UpdateEventDto {
  if (field === "schedule") {
    return {
      startAt: draftStartAt(draft).toISOString(),
      endAt: draftEndAt(draft)?.toISOString() ?? null,
    };
  }
  if (field === "capacity") {
    return hasCapacityChanged(current, draft)
      ? { capacity: draftCapacity(draft) }
      : {};
  }
  return { description: draft.description.trim() };
}

/**
 * The PATCH body for a focused editor's save when the caller holds only the
 * draft: every field the draft changed (see `changedEditableFields`), each
 * through `buildFieldPatch`. `current` must be the PRE-edit snapshot. A draft
 * that changed nothing gives `{}`.
 */
export function buildFieldEditPatch(
  current: GatheringState,
  draft: GatheringDetailsDraft,
): UpdateEventDto {
  return changedEditableFields(current, draft).reduce<UpdateEventDto>(
    (patch, field) => ({ ...patch, ...buildFieldPatch(field, current, draft) }),
    {},
  );
}

/**
 * A focused editor's save gate, checking only the field it edits. The full
 * `canSaveEditDraft` also checks the title and the venue, which a field
 * editor never shows, so a draft it refuses would leave Save off with
 * nothing on screen to fix.
 *
 * Save lights only for a real change that the server will take: a readable
 * start and a schedule `editScheduleProblem` allows; a capacity the stepper
 * allows (see `editCapacityProblem`) whose number differs from the one the
 * editor opened on; a description with words in it (the server refuses an
 * empty one) that differs from the saved text once both are trimmed.
 * `initial` is the draft the editor opened with.
 */
export function canSaveFieldEdit(
  field: GatheringEditableField,
  draft: GatheringDetailsDraft,
  initial: GatheringDetailsDraft,
): boolean {
  if (field === "schedule") {
    return (
      !Number.isNaN(draftStartAt(draft).getTime()) &&
      editScheduleProblem(draft) === null &&
      (draft.startAt !== initial.startAt || draft.endAt !== initial.endAt)
    );
  }
  if (field === "capacity") {
    return (
      editCapacityProblem(draft, initial.capacity) === null &&
      parsedCapacity(draft.capacity) !== parsedCapacity(initial.capacity)
    );
  }
  const description = draft.description.trim();
  return description.length > 0 && description !== initial.description.trim();
}
