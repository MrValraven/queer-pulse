/**
 * The join/triage half of the communities API, kept out of `communities.api.ts`
 * so the newer house-rules + applicant-review fields live next to the surfaces
 * that read them (the join wizard and the mod queue).
 *
 * Every call here maps 1:1 onto a backend route that already exists:
 *   POST   /communities/:slug/join                  (rules acceptance, involvement)
 *   GET    /communities/:slug                       (rules + version, for the wizard)
 *   GET    /communities/:slug/join-requests         (with reviewer context)
 *   PATCH  /communities/:slug/join-requests/:id     (approve / kinded decline)
 */
import {
  ApiError,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { JoinRequestStatus, RosterRole } from "./communities.api";

/** `CommunityJoinRequestInvolvement` on the backend: how an applicant says they
 *  want to take part. The ids are the stored enum values, so they are the same
 *  strings `joinModal.data.ts` offers as chips. */
export type JoinInvolvement = "updates" | "active" | "organise";

/** `CommunityJoinRequestDeclineKind`: which of the two kinds of "no" a decline
 *  is. `not_now` carries a short reapply wait, `not_a_fit` a long one. */
export type DeclineKind = "not_now" | "not_a_fit";

/** The join body. `note` is now purely what the applicant typed: the
 *  involvement answer travels in its own field rather than being folded into
 *  the note as a text tag, and the rules version is the applicant's explicit
 *  agreement to the covenant they were shown. */
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
  /** When the applicant's ACCOUNT was created (not when they applied). Null on
   *  any surface that computed no context. */
  accountCreatedAt: string | null;
  sharedConnectionCount: number | null;
  sharedCommunityCount: number | null;
  createdAt: string;
}

export interface JoinResultDTO {
  outcome: "joined" | "requested";
  role: "member" | null;
  request: CommunityJoinRequestReviewDTO | null;
}

/** Just the house-rules slice of `GET /communities/:slug`. Typed narrowly so
 *  this file never has to restate the whole detail DTO. */
export interface CommunityRulesDTO {
  rules: string[];
  rulesVersion: number;
  /** The version THIS viewer last agreed to: null for a non-member, and for a
   *  member who joined before acceptance was recorded. */
  rulesAcceptedVersion: number | null;
  myRole: RosterRole | null;
  name: string;
}

export const joinCommunityWithRules = (
  slug: string,
  payload: JoinCommunityPayload,
) => apiPost<JoinResultDTO>(`/communities/${slug}/join`, payload);

export const getCommunityRules = (slug: string) =>
  apiGet<CommunityRulesDTO>(`/communities/${slug}`);

/**
 * GET /communities/:slug/join-requests?page — one page of the community's
 * PENDING join-request queue, oldest first.
 *
 * The route used to answer with a flat array capped at 200 rows. Oldest-first
 * plus a hard cap means the requests that fell off the end were the NEWEST
 * arrivals, so a gated community with 201 pending requests hid the most recent
 * one from every moderator and said nothing about it (ENG-41). It now answers
 * with the `{ items, total, page, pageSize }` envelope; `total` is the size of
 * the whole pending queue, not of this page. Wrapped in `toItemsPage` so a
 * deploy where the backend is still on the old array shape reads as one full
 * page instead of throwing on `.items`.
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
 * The three machine-readable refusals `POST /join` can answer with, read off
 * the error body's `code` rather than its prose (which is server-worded and
 * not translatable).
 *
 *  - `rulesChanged` (400): the community has house rules the caller did not
 *    agree to, or agreed to an older version of. Carries the version to
 *    re-prompt for, which is how a rules edit mid-wizard is recovered.
 *  - `banned` (403): no reason and no reviewer is ever exposed here, and the
 *    UI must not invent either.
 *  - `reapplyTooSoon` (403): a previous decline set a wait; `reapplyAfter` is
 *    the ISO moment the applicant may try again.
 */
export type JoinRefusal =
  | { kind: "rulesChanged"; rulesVersion: number | null }
  | { kind: "banned" }
  | { kind: "reapplyTooSoon"; reapplyAfter: string | null };

export function joinRefusalFor(error: unknown): JoinRefusal | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data as
    | { code?: string; rulesVersion?: number; reapplyAfter?: string }
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
    default:
      return null;
  }
}
