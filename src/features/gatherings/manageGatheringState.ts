import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { EventVisibility, UpdateEventDto } from "./api/events.api";
import type { AttendeesResult } from "./api/useAttendees";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import type { VenueSelection } from "./VenuePicker";
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
import { daysUntil } from "./manageGatheringDates";
import {
  ATTENDEE_COUNT,
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
  /** Formatted display string for the "date" details row — derived, never
   *  edited directly. See `startAt` for the real editable moment. */
  date: string;
  /** The gathering's real scheduled start — what actually gets sent to the
   *  backend on save. Kept in step with `date`/`details` (the display copy)
   *  whenever either changes. */
  startAt: Date;
  /** The gathering's stated end, or `null` when it has none. An end is
   *  optional on a gathering and always has been, so `null` is a real saved
   *  answer the host can choose rather than a value still to be filled in.
   *  Editable in the edit modal, which is what stops a host who moves the
   *  start past a stored end from meeting a 400 with nothing on screen to
   *  change (see `buildEditPatch`). */
  endAt: Date | null;
  location: string;
  description: string;
  details: GatheringDetailRow[];
  /** The venue's directory link, or null for a free-text venue. See
   *  `VenuePicker`/`EditVenueModal`. */
  venueListingId: string | null;
  venueListing: { slug: string; name: string } | null;
  /** Who can find and RSVP to this gathering. See `AudienceScopeField`. */
  visibility: EventVisibility;
  /** The community this gathering is filed to, or `""` for none — settable
   *  in the edit modal now, same "" sentinel `useGatheringForm` uses. Absent
   *  (`""`) in the demo prototype. */
  communitySlug: string;
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

/** The demo dashboard's starting state — the static Pride-Brunch prototype. */
export function demoInitialState(): GatheringState {
  const dateDetail =
    GATHERING_DETAILS.find((detail) => detail.id === "date")?.value ?? "";
  const venueDetail =
    GATHERING_DETAILS.find((detail) => detail.id === "venue")?.value ?? "";
  return {
    title: GATHERING_TITLE,
    date: dateDetail,
    startAt: GATHERING_DATE,
    // The static prototype runs one afternoon and states no end.
    endAt: null,
    location: venueDetail,
    description: GATHERING_DESCRIPTION,
    details: GATHERING_DETAILS,
    // The static prototype has no gathering linked to a real directory
    // listing.
    venueListingId: null,
    venueListing: null,
    // The static prototype has no audience-scope of its own; "members"
    // (Public) matches the wizard's default and prior behaviour.
    visibility: "members",
    communitySlug: "",
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

/** The live dashboard's starting state, seeded from the fetched event. Only the
 *  fields the event DTO actually carries (date, venue, description) become
 *  editable rows — time/capacity aren't on the detail view-model. */
export function liveInitialState(
  gathering: GatheringDetail,
  fmt: Formatters,
  t: TFunction,
): GatheringState {
  const endAt = gathering.endAt ?? null;
  const dateValue = dateDisplay(gathering.date, endAt, fmt, t);
  return {
    title: gathering.title,
    date: dateValue,
    startAt: gathering.date,
    endAt,
    location: gathering.hood,
    description: gathering.body,
    details: [
      {
        id: "date",
        labelKey: "gatherings:manage.details.date",
        value: dateValue,
      },
      {
        id: "venue",
        labelKey: "gatherings:manage.details.venue",
        value: gathering.hood,
      },
    ],
    venueListingId: gathering.venueListingId ?? null,
    venueListing: gathering.venueListing ?? null,
    visibility: gathering.visibility ?? "members",
    communitySlug: gathering.communitySlug ?? "",
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
 * modal opens on "Something else" with the words in the box rather than on a
 * blank select that would silently drop them on the next save.
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
 * The cover, care and RSVP half of an edit draft, read off the persisted
 * state. Shared by both surfaces that open the edit modal, beside
 * `editDraftFormatFields`, so the two read a saved gathering the same way.
 *
 * Themes are narrowed against the saved family, and access needs open on
 * (ruling R8) whatever an older row stored, since the modal shows that switch
 * locked on.
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
  | "rsvpCutoff"
  | "rsvpQuestions"
  | "customRsvpQuestion"
> {
  return {
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

/** Real in live, static in demo — so the demo prototype reads exactly as it
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
            // Seats, never rows (LOC-07): a going member who declared two
            // guests occupies three of them.
            spotsLeft: attendees.capacity
              ? Math.max(0, attendees.capacity - attendees.seatsTaken)
              : 0,
          },
        }),
  };
}

/** One inline-edited details row. */
export function applyDetailValue(
  current: GatheringState,
  id: string,
  value: string,
): GatheringState {
  return {
    ...current,
    details: current.details.map((detail) =>
      detail.id === id ? { ...detail, value } : detail,
    ),
    ...(id === "date" ? { date: value } : {}),
  };
}

/** A venue pick from `VenuePicker` — free text, or a real directory listing. */
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

/** `draft.startAt` is the modal's local `"yyyy-mm-ddThh:mm"` wire value (no
 *  timezone suffix), which `new Date(...)` parses as local time — the same
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
 * a save is being held rather than letting the API answer it.
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

/** Everything the edit modal needs before it will let a host save: the three
 *  fields a gathering cannot go without, the words that go with "Something
 *  else", and a schedule the API will take. */
export function canSaveEditDraft(draft: GatheringDetailsDraft): boolean {
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
    editScheduleProblem(draft) === null
  );
}

/**
 * The edit modal only offers a plain-text location field — it can't specify
 * (or preserve) a directory link, so any change to the location text
 * implicitly detaches an existing one rather than leaving it silently pointing
 * at stale text. An untouched location (only the title/date/etc. changed)
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
    // session opens on the family and format the first one saved rather than
    // on the values the page was seeded with.
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
    details: current.details.map((detail) =>
      detail.id === "date"
        ? { ...detail, value: newDateDisplay }
        : detail.id === "venue"
          ? { ...detail, value: draft.location }
          : detail,
    ),
  };
}

/**
 * The PATCH body for a saved edit. `current` must be the PRE-edit snapshot —
 * the community comparison below depends on it.
 */
export function buildEditPatch(
  current: GatheringState,
  draft: GatheringDetailsDraft,
): UpdateEventDto {
  const locationChanged = hasLocationChanged(current, draft);
  return {
    title: draft.title,
    description: draft.description,
    // Reschedules the real event — the backend applies `startAt` on PATCH and
    // fans out an "event updated" notice to every attendee/invitee when it
    // actually changes (events.service.ts `update()`'s `materialChanges`
    // check). Never propagated to future series siblings even under
    // `scope: "future"` — each occurrence keeps its own date (see the
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
    venue: draft.location,
    ...(locationChanged ? { listingId: null } : {}),
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
    // Only include `communitySlug` when it actually changed from the PERSISTED
    // value (`current.communitySlug`, the pre-edit snapshot — never compare
    // against `draft` itself). The backend re-runs community-membership
    // authorization (`assertMemberBySlug`, 403/404) whenever this key is
    // present at all, so sending it unconditionally would spuriously reject an
    // unrelated edit (e.g. just the title) on an event whose host has since
    // left the community's roster. "" (no community) sends explicit `null` —
    // the edit modal's only way to CLEAR a gathering's community. See
    // `UpdateEventDto` (events.api.ts) for why this is `| null`.
    ...(draft.communitySlug !== current.communitySlug
      ? { communitySlug: draft.communitySlug || null }
      : {}),
  };
}
