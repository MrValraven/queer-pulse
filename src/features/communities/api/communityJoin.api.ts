/**
 * The join/triage half of the communities API, kept out of `communities.api.ts`
 * so the newer house-rules + applicant-review fields live next to the surfaces
 * that read them (the join wizard and the mod queue).
 *
 * Every call here maps 1:1 onto a backend route that already exists:
 *   POST   /communities/:slug/join                  (rules acceptance, involvement)
 *   GET    /communities/:slug/rules                 (rules + versions, for the wizard)
 *   GET    /communities/:slug/join-requests         (with reviewer context)
 *   PATCH  /communities/:slug/join-requests/:id     (approve / kinded decline)
 *   DELETE /communities/:slug/join-requests/mine    (withdraw your own request)
 */
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { JoinRequestStatus } from "./communities.api";

/** `CommunityJoinRequestInvolvement` on the backend: how an applicant says they
 *  want to take part. The ids are the stored enum values, so they are the same
 *  strings `joinModal.data.ts` offers as chips. */
export type JoinInvolvement = "updates" | "active" | "organise";

/** `CommunityJoinRequestDeclineKind`: which of the two kinds of "no" a decline
 *  is. `not_now` carries a short reapply wait, `not_a_fit` a long one. */
export type DeclineKind = "not_now" | "not_a_fit";

/** The join body. `note` is now purely what the applicant typed: the
 *  involvement answer travels in its own field (the note carries no text tag
 *  for it), and the rules version is the applicant's explicit agreement to
 *  the covenant they were shown. */
export interface JoinCommunityPayload {
  note?: string;
  involvement?: JoinInvolvement;
  acceptedRulesVersion?: number;
}

/** The applicant's member ref, which the backend's `MemberRef` carries pronouns
 *  on (the shared frontend `MemberRefDTO` predates that field). */
export interface JoinRequestMemberRefDTO extends MemberRefDTO {
  pronouns?: string | null;
}

/** One row of the mod queue, with the reviewer-side context the decision needs. */
export interface CommunityJoinRequestReviewDTO {
  id: string;
  member: JoinRequestMemberRefDTO;
  note: string | null;
  involvement: JoinInvolvement | null;
  status: JoinRequestStatus;
  declineKind: DeclineKind | null;
  declineReason: string | null;
  reapplyAfter: string | null;
  /** When the applicant's ACCOUNT was created (`createdAt` is when they
   *  applied). Null on any surface that computed no context. */
  accountCreatedAt: string | null;
  sharedConnectionCount: number | null;
  sharedCommunityCount: number | null;
  createdAt: string;
}

export interface JoinResultDTO {
  /**
   * `invite_required` (PRD-141) is the `invite` tier's refusal: the caller
   * holds no pending invitation, so there is no door for them yet. It arrives
   * as a 201 with `role` and `request` both null, because it describes a state
   * of the community ("invitation only") and nothing the member did wrong. A
   * `private` community answers the same
   * caller with a 404 instead: that tier does not confirm it exists.
   */
  outcome: "joined" | "requested" | "invite_required";
  role: "member" | null;
  request: CommunityJoinRequestReviewDTO | null;
}

const JOIN_OUTCOMES: readonly JoinResultDTO["outcome"][] = [
  "joined",
  "requested",
  "invite_required",
];

/**
 * The outcome a settled join answered with, or null when the value carries
 * none (demo mode resolves `null`, and a caller may resolve `undefined`).
 * The server decides the outcome, so every surface that shows what happened
 * reads it here: an invitation spent on a gated tier answers `joined`, and an
 * open community can hold a join for review and answer `requested`.
 *
 * Typed against `unknown` so the join wizard can call it on whatever its
 * `onJoined`/`onRequested` prop resolved to.
 */
export function joinOutcomeOf(
  result: unknown,
): JoinResultDTO["outcome"] | null {
  if (typeof result !== "object" || result === null) return null;
  const outcome = (result as { outcome?: unknown }).outcome;
  return JOIN_OUTCOMES.find((known) => known === outcome) ?? null;
}

/**
 * Whether a settled join says "you need an invitation first". Read off the
 * RESOLVED value, because this refusal is a successful response:
 * `joinRefusalFor` below can never see it.
 */
export function isInviteRequiredResult(result: unknown): boolean {
  return joinOutcomeOf(result) === "invite_required";
}

/**
 * Whether a settled join was held for review. A gated tier answers
 * `requested`, and so can an OPEN community: a second-vouch hold, or a joiner
 * who correlates with somebody this community banned (ENG-428).
 */
export function isRequestedResult(result: unknown): boolean {
  return joinOutcomeOf(result) === "requested";
}

/** `GET /communities/:slug/rules` (PRD-410): the house rules the join wizard
 *  asks an applicant to agree to. A route of its own because the detail read
 *  answers a gated outsider with a 403, and that outsider is exactly who has
 *  to read the rules at the door. Visible to anyone who can see the gate card
 *  (plus the roster of an archived community); 404 otherwise. */
export interface CommunityRulesDTO {
  /** Preset rule KEYS or member-written text, as stored. */
  rules: string[];
  rulesVersion: number;
  /** The version THIS viewer last agreed to: null for a non-member, and for a
   *  member who joined before acceptance was recorded. */
  rulesAcceptedVersion: number | null;
}

export const joinCommunityWithRules = (
  slug: string,
  payload: JoinCommunityPayload,
) => apiPost<JoinResultDTO>(`/communities/${slug}/join`, payload);

export const getCommunityRules = (slug: string) =>
  apiGet<CommunityRulesDTO>(`/communities/${slug}/rules`);

/**
 * GET /communities/:slug/join-requests?page: one page of the community's
 * PENDING join-request queue, oldest first.
 *
 * The route used to answer with a flat array capped at 200 rows. Oldest-first
 * plus a hard cap means the requests that fell off the end were the NEWEST
 * arrivals, so a gated community with 201 pending requests hid the most recent
 * one from every moderator and said nothing about it (ENG-41). It now answers
 * with the `{ items, total, page, pageSize }` envelope; `total` counts the
 * whole pending queue across every page. Wrapped in `toItemsPage` so a deploy
 * where the backend still answers the old array shape reads as one full page
 * with no throw on `.items`.
 */
export const getJoinRequestsForReview = async (
  slug: string,
  page?: number,
  signal?: AbortSignal,
) => {
  const searchParams = new URLSearchParams();
  if (page) searchParams.set("page", String(page));
  const querySuffix = searchParams.toString();
  const response = await apiGet<
    CommunityJoinRequestReviewDTO[] | ItemsPage<CommunityJoinRequestReviewDTO>
  >(
    `/communities/${slug}/join-requests${querySuffix ? `?${querySuffix}` : ""}`,
    undefined,
    undefined,
    signal,
  );
  return toItemsPage(response);
};

export interface TriageJoinRequestPayload {
  action: "approve" | "decline";
  declineKind?: DeclineKind;
  /** The reviewer's words FOR THE APPLICANT. The backend persists this on the
   *  request and shows it to the person who applied. */
  declineReason?: string;
}

export const triageJoinRequest = (
  slug: string,
  id: string,
  payload: TriageJoinRequestPayload,
) =>
  apiPatch<CommunityJoinRequestReviewDTO>(
    `/communities/${slug}/join-requests/${id}`,
    payload,
  );

/**
 * `DELETE /communities/:slug/join-requests/mine` (PRD-148): the applicant
 * takes their own pending request back.
 *
 * Applicant-side only: the backend finds the row by the CALLER'S user id, so
 * this is never a way to reach somebody else's request. The row is deleted
 * outright (no fourth status), which is what makes the member whole
 * immediately: they can ask again in the same breath, and no reapply lock is
 * left behind. Nobody is notified.
 */
export const withdrawMyJoinRequest = (slug: string) =>
  apiDelete<void>(`/communities/${slug}/join-requests/mine`);

/**
 * The machine-readable refusals `POST /join` can answer with, read off the
 * error body's `code`. The body's prose is server-worded English and never
 * reaches the screen: every refusal below renders from a catalog key.
 *
 *  - `rulesChanged` (400): the community has house rules the caller did not
 *    agree to, or agreed to an older version of. Carries the version to
 *    re-prompt for, which is how a rules edit mid-wizard is recovered.
 *  - `banned` (403): no reason and no reviewer is ever exposed here, and the
 *    UI must not invent either.
 *  - `reapplyTooSoon` (403): a previous decline set a wait; `reapplyAfter` is
 *    the ISO moment the applicant may try again.
 *  - `frozen` (403 `COMMUNITY_FROZEN`, DES-407): the community is paused.
 *    `frozenReason` picks the same body line the hub's pause banner shows.
 *  - `alreadyPending` (409 `COMMUNITY_JOIN_REQUEST_PENDING`, PRD-411): the
 *    caller already has a request with the moderators.
 *  - `parentRequired` (403 `PARENT_MEMBERSHIP_REQUIRED`): a space whose parent
 *    community the caller has not joined yet.
 */
export type JoinRefusal =
  | { kind: "rulesChanged"; rulesVersion: number | null }
  | { kind: "banned" }
  | { kind: "reapplyTooSoon"; reapplyAfter: string | null }
  /**
   * PRD-141. The `invite` tier with no invitation on file. It reaches the
   * wizard only through `isInviteRequiredResult` on a SUCCESSFUL response,
   * and it is rendered by the same refusal panel as the others because it is
   * the same kind of thing: an answer about the community.
   */
  | { kind: "inviteRequired" }
  | { kind: "frozen"; frozenReason: string | null }
  | { kind: "alreadyPending" }
  | { kind: "parentRequired" };

/** Every refusal the panel renders (all but the inline rules recovery). */
export type JoinRefusalPanelKind = Exclude<
  JoinRefusal,
  { kind: "rulesChanged" }
>;

export function joinRefusalFor(error: unknown): JoinRefusal | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data as
    | {
        code?: string;
        rulesVersion?: number;
        reapplyAfter?: string;
        frozenReason?: string | null;
      }
    | null
    | undefined;
  switch (body?.code) {
    case "RULES_ACCEPTANCE_REQUIRED":
      return {
        kind: "rulesChanged",
        rulesVersion:
          typeof body.rulesVersion === "number" ? body.rulesVersion : null,
      };
    case "BANNED_FROM_COMMUNITY":
      return { kind: "banned" };
    case "REAPPLY_TOO_SOON":
      return {
        kind: "reapplyTooSoon",
        reapplyAfter: body.reapplyAfter ?? null,
      };
    case "COMMUNITY_FROZEN":
      return {
        kind: "frozen",
        frozenReason:
          typeof body.frozenReason === "string" ? body.frozenReason : null,
      };
    case "COMMUNITY_JOIN_REQUEST_PENDING":
      return { kind: "alreadyPending" };
    case "PARENT_MEMBERSHIP_REQUIRED":
      return { kind: "parentRequired" };
    default:
      return null;
  }
}
