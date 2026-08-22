import type { Formatters } from "../../shared/i18n/format";
import type { EventVisibility, UpdateEventDto } from "./api/events.api";
import type { AttendeesResult } from "./api/useAttendees";
import type { GatheringDetailsDraft } from "./EditDetailsModal";
import type { VenueSelection } from "./VenuePicker";
import type { GatheringDetail } from "./data";
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
}

/** How the "date" details row and the header render a start moment. */
function dateDisplay(startAt: Date, fmt: Formatters): string {
  return fmt.date(startAt, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  };
}

/** The live dashboard's starting state, seeded from the fetched event. Only the
 *  fields the event DTO actually carries (date, venue, description) become
 *  editable rows — time/capacity aren't on the detail view-model. */
export function liveInitialState(
  gathering: GatheringDetail,
  fmt: Formatters,
): GatheringState {
  const dateValue = dateDisplay(gathering.date, fmt);
  return {
    title: gathering.title,
    date: dateValue,
    startAt: gathering.date,
    location: gathering.hood,
    description: gathering.body,
    details: [
      { id: "date", labelKey: "gatherings:manage.details.date", value: dateValue },
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
            spotsLeft: attendees.capacity
              ? Math.max(0, attendees.capacity - attendees.goingCount)
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

/** The saved edit, folded into the dashboard's own state. */
export function applyEditDraft(
  current: GatheringState,
  draft: GatheringDetailsDraft,
  fmt: Formatters,
): GatheringState {
  const newStartAt = draftStartAt(draft);
  const newDateDisplay = dateDisplay(newStartAt, fmt);
  return {
    ...current,
    title: draft.title,
    date: newDateDisplay,
    startAt: newStartAt,
    location: draft.location,
    description: draft.description,
    visibility: draft.visibility,
    communitySlug: draft.communitySlug,
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
    venue: draft.location,
    ...(locationChanged ? { listingId: null } : {}),
    visibility: draft.visibility,
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
