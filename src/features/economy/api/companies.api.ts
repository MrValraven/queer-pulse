import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";
import type { JobCardDTO } from "./jobs.api";

// ── Backend DTOs ─────────────────────────────────────────────────────────────
// Shapes the NestJS companies domain returns. A company's `openRoles` are its
// open jobs, typed with `JobCardDTO` imported from jobs.api (single source).

export interface CompanyBadges {
  queerRun: boolean;
  queerLed: boolean;
  verified: boolean;
}

export interface CompanyCardDTO {
  slug: string;
  nameText: string;
  tagline: string;
  badges: CompanyBadges;
  reviewScore: number | null;
  reviewCount: number;
  /** Derived count of the company's open roles. */
  openRolesCount: number;
}

export interface CompanyValue {
  title: string;
  desc: string;
}
export interface CompanyInfoItem {
  label: string;
  value: string;
}
export interface CompanyWorkItem {
  label: string;
  imageUrl: string | null;
}
export interface HiringContact {
  name: string;
  role: string;
}
/** Star-rating histogram (count of reviews at each star level). */
export interface CompanyReviewBars {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
}

export interface CompanyDetailDTO extends CompanyCardDTO {
  about: string;
  values: CompanyValue[];
  info: CompanyInfoItem[];
  team: MemberRefDTO[];
  teamCount: number;
  hiringContact: HiringContact | null;
  work: CompanyWorkItem[];
  reviewBars: CompanyReviewBars;
  openRoles: JobCardDTO[];
  owner: MemberRefDTO | null;
  isOwner: boolean;
  createdAt: string;
}

/**
 * The employer's one public reply to a review of them. Same shape the business
 * directory returns for a listing owner's reply, on purpose: PRD-47 is about
 * the five review primitives converging on one contract.
 *
 * No author rides along. The reply is signed by the company, never by the
 * member who happens to hold `ownerId`.
 */
export interface CompanyReviewOwnerReplyDTO {
  text: string;
  at: string;
}

export interface CompanyReviewDTO {
  id: string;
  author: MemberRefDTO | null;
  title: string;
  stars: number;
  byline: string;
  body: string[];
  createdAt: string;
  /** When the review's author last changed it, or `null` if never. */
  editedAt: string | null;
  /**
   * Server-precomputed: the review was changed AFTER the employer answered it,
   * so the reply on screen may be answering words that are no longer there.
   * Never re-derived on the client from the two timestamps.
   */
  isEditedAfterOwnerReply: boolean;
  /** The employer's reply, or `null` when they have not answered. */
  ownerReply: CompanyReviewOwnerReplyDTO | null;
}

export interface CreateCompanyDto {
  nameText: string;
  tagline: string;
  about: string;
  queerRun?: boolean;
  queerLed?: boolean; // `verified` is admin-only — the client cannot set it.
  values?: CompanyValue[];
  info?: CompanyInfoItem[];
  team?: string[]; // member slugs
  hiringContact?: HiringContact;
  work?: CompanyWorkItem[];
  handle?: string;
}

export interface CreateReviewDto {
  title: string;
  stars: number; // 1..5
  byline: string;
  body: string[];
}

// ── Raw calls (one per endpoint) ─────────────────────────────────────────────

export async function getCompanies(params: { page?: number } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiGet<CompanyCardDTO[] | Paginated<CompanyCardDTO>>(
    `/companies${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

/** GET /companies/:slug — accepts an `AbortSignal` (react-query forwards its
 *  `queryFn` signal here) so navigating away from a company page mid-fetch
 *  cancels the underlying request instead of letting it run to completion. */
export const getCompany = (slug: string, signal?: AbortSignal) =>
  apiGet<CompanyDetailDTO>(`/companies/${slug}`, undefined, undefined, signal);

export const createCompany = (dto: CreateCompanyDto) =>
  apiPost<CompanyDetailDTO>("/companies", dto);

export async function getCompanyReviews(
  slug: string,
  params: { page?: number } = {},
) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiGet<CompanyReviewDTO[] | Paginated<CompanyReviewDTO>>(
    `/companies/${slug}/reviews${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

export const createReview = (slug: string, dto: CreateReviewDto) =>
  apiPost<CompanyReviewDTO>(`/companies/${slug}/reviews`, dto);

/**
 * PATCH /companies/:slug/reviews/:reviewId/reply — the EMPLOYER's single public
 * reply to one review of them. Owner-gated server-side, and refused outright on
 * an unclaimed company profile (one with no owner). Sending again overwrites the
 * previous reply; there is no thread and no delete.
 */
export const replyToCompanyReview = (
  slug: string,
  reviewId: string,
  text: string,
) =>
  apiPatch<CompanyReviewDTO>(`/companies/${slug}/reviews/${reviewId}/reply`, {
    text,
  });

/** PATCH /companies/:slug/reviews/:reviewId — the review's AUTHOR changing
 *  their own words. The employer's reply on the same row is always kept. */
export const updateCompanyReview = (
  slug: string,
  reviewId: string,
  dto: CreateReviewDto,
) => apiPatch<CompanyReviewDTO>(`/companies/${slug}/reviews/${reviewId}`, dto);
