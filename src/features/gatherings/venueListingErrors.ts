import { ApiError } from "../../shared/api/client";

/** The backend's sentence for a venue link it will not attach:
 *  `assertAttachableListing` in
 *  `queerpulse-backend/src/events/events.service.ts`. */
const VENUE_LISTING_REFUSED_MESSAGE = "Venue listing not found";

/**
 * Did the server refuse the gathering's linked venue?
 *
 * The server attaches only a listing that is still a place people can walk
 * into: live, unpaused, still operating, with premises, and outside the 18+
 * category. A duplicate, "same as last time" or a resumed draft can carry a
 * link that met that rule when it was made and no longer does, so the wizard
 * reads this 400 and points the host at the venue field instead of failing
 * the whole publish with a generic retry line.
 */
export function isRefusedVenueListingError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    error.message.includes(VENUE_LISTING_REFUSED_MESSAGE)
  );
}
