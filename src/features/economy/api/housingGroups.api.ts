import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

export interface GroupScreeningQuestionDTO {
  id: string;
  prompt: string;
  required: boolean;
}

export interface HousingGroupDTO {
  id: string;
  slug: string;
  name: string;
  nameEm: string | null;
  city: string;
  blurb: string;
  isAccessGated: boolean;
  norms: string[];
  screeningQuestions: GroupScreeningQuestionDTO[];
  memberCount: number;
  published: boolean;
}

export interface GroupListingDTO {
  id: string;
  title: string;
  description: string;
  neighbourhood: string;
  priceEuros: number;
  accessibilityInfo: string;
}

/**
 * The four states a submitted room moves through. `review` is where every new
 * listing lands, `live` is on the group page, `question` means a moderator
 * needs the poster to answer something first, and `declined` means it will not
 * be published. Mirrors the backend `GroupListingStatus` enum exactly.
 */
export type GroupListingStatus = "review" | "question" | "live" | "declined";

/**
 * The POSTER's own view of a room they submitted (LOC-19). A superset of the
 * public `GroupListingDTO`: it adds the moderation state the group page hides,
 * and `decisionReason` carries the moderator's own words so a question can be
 * answered and a refusal can be understood.
 *
 * There is no `decidedBy`: that is the staff account's id, an audit key for the
 * moderation console, and the poster has no use for a staff identity.
 */
export interface MyGroupListingDTO extends GroupListingDTO {
  groupSlug: string | null;
  groupName: string | null;
  status: GroupListingStatus;
  /** A post-publication takedown, with the norm the moderator recorded. */
  hidden: boolean;
  hiddenReason: string | null;
  decidedAt: string | null;
  decisionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * `POST /housing-groups/:slug/listings` body. The price and the accessibility
 * line are group norms rather than optional extras, so the backend's
 * `CreateGroupListingDto` requires both and the form refuses to submit without
 * them.
 *
 * A 201 here means "submitted", never "published": the listing lands in
 * `review` and a moderator decides. Say so before and after the send.
 */
export interface CreateGroupListingBody {
  title: string;
  description: string;
  neighbourhood: string;
  priceEuros: number;
  accessibilityInfo: string;
}

/**
 * `PATCH /housing-groups/:slug/listings/:id` body (BE-HSG-20). Every field is
 * optional to OMIT, never optional to blank: the backend inherits the create
 * DTO's group norms, so a sent `priceEuros` still has to be a real number and a
 * sent `accessibilityInfo` still has to say something.
 *
 * Every field here is one the group page renders, which makes all of them
 * moderated: editing any of them on a listing that is currently `live` sends it
 * back to `review` server-side.
 */
export interface UpdateGroupListingBody {
  title?: string;
  description?: string;
  neighbourhood?: string;
  priceEuros?: number;
  accessibilityInfo?: string;
}

export interface GroupJoinRequestBody {
  name: string;
  relationship: string;
  answers?: { questionId: string; answer: string }[];
  note?: string;
}

export const getHousingGroups = () =>
  apiGet<HousingGroupDTO[]>("/housing-groups");

export const getHousingGroup = (slug: string) =>
  apiGet<HousingGroupDTO>(`/housing-groups/${slug}`);

export const getGroupListings = (slug: string) =>
  apiGet<GroupListingDTO[]>(`/housing-groups/${slug}/listings`);

/** The caller's own rooms in this group, in whatever state each is in. Active
 *  members only; 404 when the group slug is unknown. */
export const getMyGroupListings = (slug: string) =>
  apiGet<MyGroupListingDTO[]>(`/housing-groups/${slug}/listings/mine`);

/** POST a room into a group. Active members only, and the backend also gates on
 *  the affirming pledge and a phone-verified account. The response carries
 *  `status: "review"`: it is a receipt, never a publication. */
export const createGroupListing = (
  slug: string,
  body: CreateGroupListingBody,
) => apiPost<MyGroupListingDTO>(`/housing-groups/${slug}/listings`, body);

/** PATCH a listing you posted to a group. Poster only: 403 for someone else's,
 *  404 when the group or the listing is gone. */
export const updateGroupListing = (
  slug: string,
  listingId: string,
  body: UpdateGroupListingBody,
) =>
  apiPatch<MyGroupListingDTO>(
    `/housing-groups/${slug}/listings/${listingId}`,
    body,
  );

/** DELETE a listing you posted to a group, for when the room is let. Poster
 *  only, and a real removal rather than the moderator's `hidden` takedown, so
 *  the moderation queue never has to explain a poster's own decision. */
export const withdrawGroupListing = (slug: string, listingId: string) =>
  apiDelete<void>(`/housing-groups/${slug}/listings/${listingId}`);

export const submitGroupJoinRequest = (
  slug: string,
  body: GroupJoinRequestBody,
) => apiPost<{ id: string }>(`/housing-groups/${slug}/join-requests`, body);
