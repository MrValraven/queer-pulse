import type { BadgeTone } from "../../../../shared/components/ui";
import { ApiError } from "../../../../shared/api/client";
import type { CoManagerStatus } from "../api/listingCoManagers.api";

/**
 * Static vocabulary for the co-manager surfaces: how each roster status reads,
 * and how a refused invitation is explained.
 *
 * Colocated per the repo's data rule, and shared by the editor's roster, the
 * invitation inbox and the member's own places grid, so one status can never
 * read two different ways in two places.
 */

/** How one roster status is labelled and toned. */
export interface CoManagerStatusView {
  labelKey: string;
  tone: BadgeTone;
}

/**
 * Only the two live statuses have a badge. The three ended ones (declined,
 * revoked, left) never reach the roster the editor shows, which lists who can
 * edit right now and who has been asked.
 */
export const CO_MANAGER_STATUS_VIEW: Partial<
  Record<CoManagerStatus, CoManagerStatusView>
> = {
  active: {
    labelKey: "marketing:listBusiness.coManagers.status.active",
    tone: "jade",
  },
  invited: {
    labelKey: "marketing:listBusiness.coManagers.status.invited",
    tone: "amber",
  },
};

/** The statuses that hold one of the five places on a listing. */
export const CO_MANAGER_LIVE_STATUSES: CoManagerStatus[] = [
  "invited",
  "active",
];

/**
 * Turn a failed invitation into something the owner can act on.
 *
 * The API answers 400 for inviting yourself and 409 for three different
 * situations: this person already has an invitation or a place, the invitation
 * has already been answered, or every place is taken. Only the last one can be
 * told apart from here, and it can be told apart reliably, because the roster
 * the owner is looking at is what fills the places up. Everything else gets
 * one honest message rather than a guess.
 */
export function coManagerInviteErrorKey(
  error: unknown,
  isSeatCapReached: boolean,
): string {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return "marketing:listBusiness.coManagers.error.self";
    }
    if (error.status === 409) {
      return isSeatCapReached
        ? "marketing:listBusiness.coManagers.error.seatsFull"
        : "marketing:listBusiness.coManagers.error.alreadyThere";
    }
  }
  return "marketing:listBusiness.coManagers.error.generic";
}
