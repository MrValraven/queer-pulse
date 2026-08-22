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

/** PATCH a listing you posted to a group. Poster only: 403 for someone else's,
 *  404 when the group or the listing is gone. */
export const updateGroupListing = (
  slug: string,
  listingId: string,
  body: UpdateGroupListingBody,
) =>
  apiPatch<GroupListingDTO>(
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
