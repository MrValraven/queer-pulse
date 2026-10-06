import {
  ApiError,
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

/** The member who posted a group room, as the backend's `MemberRef` carries
 *  them (PRD-443). */
export interface GroupListingPosterDTO {
  slug: string;
  firstName: string;
  lastName: string;
  pronouns: string | null;
  avatarUrl: string | null;
}

/**
 * A room as the group page reads it (PRD-443). `poster` is filled only for a
 * signed-in reader, and `isOwnListing` marks the reader's own room. Both are
 * optional so an older backend that sends neither still maps cleanly: no
 * poster means no "Message" control.
 */
export interface PublicGroupListingDTO extends GroupListingDTO {
  poster?: GroupListingPosterDTO | null;
  isOwnListing?: boolean;
}

/**
 * The four states a submitted room moves through. `review` is where every new
 * listing lands, `live` is on the group page, `question` means a moderator
 * needs the poster to answer something first, and `declined` means it will not
 * be published. Mirrors the backend `GroupListingStatus` enum exactly.
 */
export type GroupListingStatus = "review" | "question" | "live" | "declined";

/**
 * A takedown from a REPORT (PRD-443), read off the same `content_moderation`
 * row the group page withholds on. `removed` wins when both are set. Separate
 * from `hidden`, the moderator's norm takedown with its own reason.
 */
export type GroupListingModerationState = "hidden" | "removed" | null;

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
  /** Optional so an older backend that never sends it maps as "no report
   *  takedown". */
  moderationState?: GroupListingModerationState;
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

/**
 * The rooms shared inside a group. An OPEN group answers anyone. An
 * ACCESS-GATED group answers only a member and refuses everyone else with a
 * `GROUP_MEMBERSHIP_REQUIRED` 403, so read the error through
 * `groupMembershipStandingFrom` rather than letting it surface as a failure.
 */
export const getGroupListings = (slug: string) =>
  apiGet<PublicGroupListingDTO[]>(`/housing-groups/${slug}/listings`);

/**
 * Message the member who posted a group room (PRD-443). The same body and
 * answer as the member-listing enquiry, and the same pledge and phone step-up
 * gates. A 404 means the room is no longer on the group page.
 */
export const sendGroupListingEnquiry = (
  slug: string,
  listingId: string,
  body: { body: string },
) =>
  apiPost<{ conversationId: string }>(
    `/housing-groups/${slug}/listings/${listingId}/enquiries`,
    body,
  );

/** Where the caller stands with a group they are not a member of. Mirrors the
 *  backend `GroupMembershipStanding`, and only ever describes the caller's own
 *  join requests. */
export type GroupMembershipStanding = "pending" | "declined" | "none";

const MEMBERSHIP_STANDINGS: GroupMembershipStanding[] = [
  "pending",
  "declined",
  "none",
];

/**
 * Reads a `GROUP_MEMBERSHIP_REQUIRED` 403 body and returns the caller's own
 * standing with the group, so a gated surface can say what to do next: wait,
 * ask, or accept the answer. Returns `null` for any other error, which the
 * caller then handles normally. Mirrors `affirmingPledgeRequiredFrom`, which
 * reads the sibling gate on the same housing surfaces.
 *
 * Falls back to `"none"` when the body carries the code without a recognised
 * standing: the gate is real either way, and inviting someone to ask is the
 * safe thing to say when we cannot tell whether they already did.
 */
export function groupMembershipStandingFrom(
  error: unknown,
): GroupMembershipStanding | null {
  if (!(error instanceof ApiError) || error.status !== 403) return null;
  const data = error.data as
    { code?: string; membershipStanding?: string } | undefined;
  if (data?.code !== "GROUP_MEMBERSHIP_REQUIRED") return null;
  const standing = MEMBERSHIP_STANDINGS.find(
    (candidate) => candidate === data.membershipStanding,
  );
  return standing ?? "none";
}

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

/** Where a member already stands when they ask to join a group twice
 *  (ENG-472): a request still being read, or already in. */
export type GroupJoinDuplicateStanding = "pending" | "member";

/**
 * Reads a `GROUP_JOIN_ALREADY_REQUESTED` 409 body and returns the member's own
 * standing, so the join flow can say "you've already asked" or "you're already
 * in" from the code. Returns `null` for any other error. Falls back to
 * `"pending"` when the code arrives without a recognised standing, since
 * waiting is the honest answer when we cannot tell.
 */
export function groupJoinDuplicateStandingFrom(
  error: unknown,
): GroupJoinDuplicateStanding | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  const data = error.data as
    { code?: string; membershipStanding?: string } | undefined;
  if (data?.code !== "GROUP_JOIN_ALREADY_REQUESTED") return null;
  return data.membershipStanding === "member" ? "member" : "pending";
}

/** Ask to join a group. Signed-in active members only (ENG-472); a second
 *  live request answers 409, read through `groupJoinDuplicateStandingFrom`. */
export const submitGroupJoinRequest = (
  slug: string,
  body: GroupJoinRequestBody,
) => apiPost<{ id: string }>(`/housing-groups/${slug}/join-requests`, body);

/** The three states a group join request moves through. Mirrors the backend
 *  `GroupJoinRequestStatus` enum exactly, including its `approved` spelling of
 *  the outcome the co-op surface calls `accepted`. */
export type GroupJoinRequestStatus = "pending" | "approved" | "declined";

/**
 * The APPLICANT's own view of a group join request (PRD-242). Deliberately
 * leaner than the admin row: it carries which group was asked and where the
 * request stands, and none of the triage material (the `relationship` answer,
 * the screening `answers`, the `note`) or the `mutualConnections` trust signal
 * that belong to the review console.
 */
export interface MyGroupJoinRequestDTO {
  id: string;
  status: GroupJoinRequestStatus;
  createdAt: string;
  group: { slug: string; name: string } | null;
}

/** The caller's own group applications across every group, newest first.
 *  Signed-in callers only. */
export const getMyGroupJoinRequests = () =>
  apiGet<MyGroupJoinRequestDTO[]>("/housing-groups/join-requests/mine");
