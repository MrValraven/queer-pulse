import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";

// ── Backend DTOs ─────────────────────────────────────────────────────────────
// Shapes the NestJS volunteering domain returns. `cause` is lowercase on the
// wire; the adapters Title-case it for the view-model. Prototype-only display
// fields (colours, eyebrow, urgency copy, stat tiles) aren't part of the API and
// are derived / defaulted gracefully in volunteering.adapters.tsx.

/** Cause is lowercase in the API; Title-case for display (see adapters). */
export type Cause = "rights" | "health" | "youth" | "housing" | "arts";
export type Commit = "low" | "medium";

/** A card as returned by GET /volunteering (list) — the thin listing shape. */
export interface OpportunityCardDTO {
  slug: string;
  org: string;
  partner: { slug: string; name: string } | null;
  role: string;
  cause: Cause;
  commit: Commit;
  time: string;
  location: string;
  skills: string[];
  desc: string;
  /** filled/pct are derived server-side from spotsTotal. */
  spotsTotal: number;
  spotsFilled: number;
  spotsPct: number;
  status: "open" | "closed";
  createdAt: string;
}

export interface OpportunityTask {
  title: string;
  desc: string;
}
export interface OpportunityCommitment {
  label: string;
  detail: string;
}

/** Full opportunity detail from GET /volunteering/:slug. */
export interface OpportunityDetailDTO extends OpportunityCardDTO {
  why: string[];
  tasks: OpportunityTask[];
  commitments: OpportunityCommitment[];
  goodFor: string[];
  teamIntro: string | null;
  team: MemberRefDTO[];
  applyRole: string;
  poster: MemberRefDTO | null;
  /** True when the viewer posted this opportunity (reveals the signups list). */
  isPoster: boolean;
  /** True when the viewer has already signed up (drives the "on the list" state). */
  mySignup: boolean;
}

export type SignupStatus = "pending" | "accepted" | "declined";

/** A single signup, as GET /volunteering/:slug/signups returns (poster-only). */
export interface VolunteerSignupDTO {
  id: string;
  member: MemberRefDTO | null;
  note: string | null;
  status: SignupStatus;
  decidedAt: string | null;
  createdAt: string;
}

/** A row of GET /volunteering/mine — an opportunity the viewer posted, with
 *  pending/accepted applicant counts for the manage-applicants dashboard. */
export interface MyOpportunitySummaryDTO {
  slug: string;
  role: string;
  org: string;
  status: "open" | "closed";
  pendingCount: number;
  acceptedCount: number;
  spotsTotal: number;
  createdAt: string;
}

// ── Create / update payloads ─────────────────────────────────────────────────

export interface CreateOpportunityDto {
  org: string;
  partnerSlug?: string;
  communitySlug?: string;
  role: string;
  cause: Cause;
  commit: Commit;
  time: string;
  location: string;
  skills?: string[];
  desc: string;
  spotsTotal: number;
  applyRole: string;
  why?: string[];
  tasks?: OpportunityTask[];
  commitments?: OpportunityCommitment[];
  goodFor?: string[];
  teamIntro?: string;
  /** `team` references members by slug. */
  team?: string[];
  handle?: string;
}

// ── Raw calls (one per endpoint) ─────────────────────────────────────────────

export async function getOpportunities(
  params: { cause?: Cause; commit?: Commit; page?: number } = {},
): Promise<Paginated<OpportunityCardDTO>> {
  const q = new URLSearchParams();
  if (params.cause) q.set("cause", params.cause);
  if (params.commit) q.set("commit", params.commit);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiGet<
    OpportunityCardDTO[] | Paginated<OpportunityCardDTO>
  >(`/volunteering${qs ? `?${qs}` : ""}`);
  return toItemsPage(res);
}

export const getOpportunity = (slug: string) =>
  apiGet<OpportunityDetailDTO>(`/volunteering/${slug}`);

export const createOpportunity = (dto: CreateOpportunityDto) =>
  apiPost<OpportunityDetailDTO>("/volunteering", dto);

export const closeOpportunity = (slug: string) =>
  apiPost<OpportunityDetailDTO>(`/volunteering/${slug}/close`);

/**
 * Sign the viewer up for an opportunity. Throws ApiError with status 409 when
 * the opportunity is full OR the member has already signed up — the caller
 * distinguishes the two from the message where possible.
 */
export const signUpForOpportunity = (slug: string, note?: string) =>
  apiPost<VolunteerSignupDTO>(
    `/volunteering/${slug}/signups`,
    note ? { note } : {},
  );

/** Withdraw the viewer's OWN signup (204 No Content). */
export const withdrawSignup = (slug: string) =>
  apiDelete<void>(`/volunteering/${slug}/signups`);

/** Poster-only roster of everyone who signed up. */
export const getSignups = (slug: string) =>
  apiGet<VolunteerSignupDTO[]>(`/volunteering/${slug}/signups`);

/** Poster-only: accept or decline an applicant. */
export const decideSignup = (
  slug: string,
  signupId: string,
  status: "accepted" | "declined",
) =>
  apiPatch<VolunteerSignupDTO>(`/volunteering/${slug}/signups/${signupId}`, {
    status,
  });

/** Opportunities the viewer has posted, with pending/accepted counts. */
export const getMyOpportunities = () =>
  apiGet<MyOpportunitySummaryDTO[]>(`/volunteering/mine`);
