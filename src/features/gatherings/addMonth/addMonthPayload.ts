import type {
  CreateEventBatchDto,
  EventBatchRowDto,
  EventBatchSharedDto,
} from "../api/eventBatch.api";
import { paymentDetailsPayload } from "../paymentDetails";
import { ONLINE_HOOD_VALUE } from "../steps/dateNotes.data";
import type {
  AddMonthCostValues,
  AddMonthPlaceValues,
  AddMonthRow,
  AddMonthState,
} from "./addMonthState";

// ── Add a month of events: the request body ────────────────────────────────
// Turns the page state into `POST /events/batch`. An absent shared key keeps
// the starting event's value on the server, so place, cost and cover travel
// only once the host has changed them.

type PlaceOverrides = Pick<
  EventBatchSharedDto,
  | "neighbourhood"
  | "venue"
  | "listingId"
  | "isOnline"
  | "onlineUrl"
  | "address"
  | "arrivalNotes"
>;

type CostOverrides = Pick<
  EventBatchSharedDto,
  "cost" | "costKind" | "paymentUrl" | "paymentInstructions"
>;

function trimmedOrNull(value: string): string | null {
  return value.trim() || null;
}

/**
 * The edited place in the server's names. An online place clears every door
 * field. A blank join link travels as null, which clears the link, since the
 * server refuses an empty string as a link. A door clears the join link and
 * falls back to the hood for a blank venue, the way the wizard's create
 * payload does.
 */
export function placeOverrides(place: AddMonthPlaceValues): PlaceOverrides {
  if (place.hood === ONLINE_HOOD_VALUE) {
    return {
      isOnline: true,
      onlineUrl: trimmedOrNull(place.onlineUrl),
      neighbourhood: null,
      venue: null,
      listingId: null,
      address: null,
      arrivalNotes: null,
    };
  }
  return {
    isOnline: false,
    onlineUrl: null,
    neighbourhood: place.hood || null,
    venue: place.venue.trim() || place.hood || null,
    listingId: place.venueListingId,
    address: trimmedOrNull(place.address),
    arrivalNotes: trimmedOrNull(place.directions),
  };
}

/** The edited cost in the server's names. A free event, or a blank price,
 *  sends a null cost, and a free event sends no payment details. */
export function costOverrides(cost: AddMonthCostValues): CostOverrides {
  const isFree = cost.costKind === "free";
  return {
    costKind: cost.costKind,
    cost: isFree ? null : trimmedOrNull(cost.cost),
    ...paymentDetailsPayload(
      cost.costKind,
      cost.paymentUrl,
      cost.paymentInstructions,
    ),
  };
}

function sharedOf(state: AddMonthState): EventBatchSharedDto {
  return {
    startTime: state.times.startTime,
    // Absent reads as "no end" on the server.
    ...(state.times.endTime !== null ? { endTime: state.times.endTime } : {}),
    ...(state.place ? placeOverrides(state.place) : {}),
    ...(state.cost ? costOverrides(state.cost) : {}),
    ...(state.sharedCover ? { coverImageUrl: state.sharedCover.key } : {}),
  };
}

/** One date of the month. Its own times and photo travel only when the host
 *  set them; an own end of null means this date has no end. */
function rowOf(row: AddMonthRow): EventBatchRowDto {
  return {
    date: row.date,
    title: row.title.trim(),
    description: row.description.trim(),
    ...(row.timeOverride
      ? {
          startTime: row.timeOverride.startTime,
          endTime: row.timeOverride.endTime,
        }
      : {}),
    ...(row.photo ? { coverImageUrl: row.photo.key } : {}),
  };
}

/** The request body for the whole month, rows in date order. The page only
 *  calls this once a starting event is picked. */
export function addMonthStateToDto(state: AddMonthState): CreateEventBatchDto {
  if (state.templateSlug === null) {
    throw new Error(
      "addMonthStateToDto needs a templateSlug: pick a starting event first",
    );
  }
  const rows = [...state.rows].sort((first, second) =>
    first.date.localeCompare(second.date),
  );
  return {
    templateSlug: state.templateSlug,
    shared: sharedOf(state),
    rows: rows.map(rowOf),
  };
}

/**
 * The size of the request body as the server counts it (contract section 6):
 * Express measures the JSON limit in UTF-8 bytes of the body, and a
 * character outside ASCII takes 2 to 4 of them, so the string length alone
 * reads a Portuguese or emoji-heavy month as smaller than it is.
 */
export function eventBatchBodyBytes(payload: CreateEventBatchDto): number {
  return new TextEncoder().encode(JSON.stringify(payload)).length;
}
