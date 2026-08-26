import { apiPost } from "../../../shared/api/client";
import type {
  CommunitySupportOfferDTO,
  CommunitySupportOption,
} from "../../communities/api/communitySupportOffers.api";

/**
 * `POST /admin/communities/:slug/support-offers` — offer a struggling
 * community a hand (OPS-05).
 *
 * Open to platform moderators, admins, and the additive `communities` staff
 * grant, the same gate moderator appointment carries: offering help takes
 * nothing away from anyone and the community can decline it in one click.
 *
 * The response is the recorded offer. There is deliberately NO withdraw call:
 * the moment an offer lands, the community's owners and moderators hold a
 * notification about it, and nothing can un-ring that. The community's own
 * "not needed right now" is the honest close.
 *
 * Fails with 409 when the community already has an offer nobody has answered
 * yet, so a double-click or two staff members reaching for the same room in
 * the same week cannot bury its moderators in duplicates.
 */
export interface CreateCommunitySupportOfferInput {
  options: CommunitySupportOption[];
  note?: string;
}

export const offerCommunitySupport = (
  slug: string,
  input: CreateCommunitySupportOfferInput,
) =>
  apiPost<CommunitySupportOfferDTO>(
    `/admin/communities/${slug}/support-offers`,
    input,
  );
