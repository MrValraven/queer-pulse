import { apiGet, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

/**
 * The four kinds of support platform staff can offer a community that is
 * having a hard time, as stable keys.
 *
 * This is the frontend half of one registry: the backend's copy lives in
 * `queerpulse-backend/src/communities/community-support-options.ts` and is what
 * the write endpoint validates against. Three surfaces read this list — the
 * admin modal that offers the support, the mod-tools pane that reads it back,
 * and the notification behind it — so the keys, their order, and the copy they
 * resolve to are declared here once rather than typed out at each of them.
 *
 * The keys themselves are never shown. Each resolves to a label through
 * {@link SUPPORT_OPTION_LABEL_KEY} below.
 */
export const COMMUNITY_SUPPORT_OPTIONS = [
  "message_moderators",
  "staff_buddy",
  "deescalation_toolkit",
  "recruit_moderator",
] as const;

export type CommunitySupportOption = (typeof COMMUNITY_SUPPORT_OPTIONS)[number];

/**
 * The MEMBER-facing label for each option: what a community's own moderators
 * read in mod tools. Deliberately separate from the admin console's
 * `admin:communities.support.option.*` copy, which is written to the person
 * choosing what to offer ("Assign a staff buddy for 2 weeks") rather than to
 * the people being offered it.
 */
export const SUPPORT_OPTION_LABEL_KEY: Record<CommunitySupportOption, string> =
  {
    message_moderators: "communities:detail.modtools.support.option.message",
    staff_buddy: "communities:detail.modtools.support.option.buddy",
    deescalation_toolkit: "communities:detail.modtools.support.option.toolkit",
    recruit_moderator: "communities:detail.modtools.support.option.recruit",
  };

/** Guards a value off the wire before it is used to look up copy. */
export function isCommunitySupportOption(
  value: string,
): value is CommunitySupportOption {
  return (COMMUNITY_SUPPORT_OPTIONS as readonly string[]).includes(value);
}

/** How long a staff member's note may be. Mirrors the backend's
 *  `MAX_SUPPORT_OFFER_NOTE_LENGTH`, which is what actually enforces it. */
export const MAX_SUPPORT_OFFER_NOTE_LENGTH = 1000;

/** Where an offer stands. `new` is the platform's to write; the other two are
 *  the community's answer. */
export type CommunitySupportOfferStatus = "new" | "acknowledged" | "declined";

/** The two answers a community's staff may give. */
export type CommunitySupportOfferResponse = "acknowledged" | "declined";

/**
 * One offer of support, mirroring the backend's `CommunitySupportOfferDTO`
 * field for field.
 *
 * `offeredBy` is null once the staff member who made the offer has erased
 * their account; `offeredByName` is the write-time snapshot that keeps the row
 * from going anonymous in that case.
 */
export interface CommunitySupportOfferDTO {
  id: string;
  options: string[];
  note: string | null;
  status: CommunitySupportOfferStatus;
  offeredBy: MemberRefDTO | null;
  offeredByName: string | null;
  respondedBy: MemberRefDTO | null;
  respondedAt: string | null;
  createdAt: string;
}

export interface CommunitySupportOfferListDTO {
  offers: CommunitySupportOfferDTO[];
  /** How many are still unanswered, so the mod rail can badge the section. */
  openCount: number;
}

/** `GET /communities/:slug/support-offers` — owner, co-owner or moderator. */
export const getCommunitySupportOffers = (slug: string) =>
  apiGet<CommunitySupportOfferListDTO>(`/communities/${slug}/support-offers`);

/** `POST /communities/:slug/support-offers/:id/respond` — take an offer up, or
 *  say it is not needed. One-way: an answered offer cannot be re-answered. */
export const respondToCommunitySupportOffer = (
  slug: string,
  offerId: string,
  response: CommunitySupportOfferResponse,
) =>
  apiPost<CommunitySupportOfferDTO>(
    `/communities/${slug}/support-offers/${offerId}/respond`,
    { response },
  );
