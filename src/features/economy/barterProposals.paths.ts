import { routes } from "../../app/routeMap";

/**
 * The owner's proposal inbox. A static segment under the board, registered
 * before `${routes.barter}/:id` so a listing id can never swallow it.
 *
 * It lives in its own module rather than in `barter.data.ts` because the
 * notifications adapter deep-links here: importing the board's fixture file for
 * one string would pull the whole mock member registry into a live chunk.
 */
export const MY_BARTER_PROPOSALS_PATH = `${routes.barter}/proposals`;

/** The inbox with one listing already selected — where a
 *  `barter_proposal_received` notification lands the owner. */
export function barterProposalsPath(listingId: string): string {
  return `${MY_BARTER_PROPOSALS_PATH}?listing=${encodeURIComponent(listingId)}`;
}
