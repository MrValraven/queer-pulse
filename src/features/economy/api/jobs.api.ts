import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";
import type { CreateCompanyDto } from "./companies.api";

// ── Backend DTOs ─────────────────────────────────────────────────────────────
// Shapes the NestJS jobs domain returns. Only the fields the prototype pages
// render are mapped richly; prototype-only view-model fields are defaulted in
// the adapters. `JobCardDTO` is defined here and re-used by companies.api for a
// company's `openRoles`.

export type JobFormat = "remote" | "in_person" | "hybrid" | "either";
export type JobStatus = "open" | "closed";
export type ApplicationStatus =
  "submitted" | "reviewing" | "accepted" | "declined";

export interface JobPay {
  salary: string | null;
  rateMin: number | null;
  rateMax: number | null;
  currency: string | null;
  ratePer: string | null;
  hidePay: boolean;
  barter: boolean;
}

/** A job as returned by GET /jobs (list) and inside a company's `openRoles`. */
export interface JobCardDTO {
  slug: string;
  title: string;
  company: { slug: string; nameText: string } | null;
  category: string;
  commitment: string;
  seniority: string;
  format: JobFormat;
  location: string;
  city: string | null;
  timezone: string | null;
  pay: JobPay;
  deadline: string | null;
  startDate: string | null;
  desc: string;
  tags: string[];
  queerRun: boolean;
  qrLabel: string | null;
  status: JobStatus;
  createdAt: string;
}

export interface JobDetailBody {
  about: string[];
  dayToDay: string[];
  lookingFor: string[];
  offer: string[];
  reviewerNote: string | null;
}

export interface JobDetailDTO extends JobCardDTO {
  detail: JobDetailBody;
  benefits: string[];
  inclusivity: string[];
  screening: string[];
  contacts: string[];
  email: string | null;
  link: string | null;
  poster: MemberRefDTO | null;
  isPoster: boolean;
  myApplicationStatus: ApplicationStatus | null;
}

export interface JobApplicationAnswer {
  question: string;
  answer: string;
}

export interface JobApplicationDTO {
  id: string;
  job: { slug: string; title: string };
  applicant: MemberRefDTO | null;
  answers: JobApplicationAnswer[];
  coverNote: string | null;
  status: ApplicationStatus;
  createdAt: string;
}

export interface CreateJobDto {
  title: string;
  category: string;
  commitment: string;
  seniority: string;
  format: JobFormat;
  location: string;
  city?: string;
  timezone?: string;
  description: string;
  deadline?: string;
  startDate?: string;
  salary?: string;
  rateMin?: number;
  rateMax?: number;
  currency?: string;
  ratePer?: string;
  hidePay?: boolean;
  barter?: boolean;
  benefits?: string[];
  inclusivity?: string[];
  tags?: string[];
  screening?: string[];
  contacts?: string[];
  email?: string;
  link?: string;
  detail?: JobDetailBody;
  queerRun?: boolean;
  qrLabel?: string;
  /** Existing company the poster is affiliated with (owner or team member). */
  companySlug?: string;
  /** …or inline-create a company when `companySlug` is omitted. */
  company?: CreateCompanyDto;
  /** Must be true — the poster confirms the Code of Care. */
  agreement: boolean;
}

/**
 * PATCH /jobs/:slug body. Every field is optional and the backend only writes
 * the ones that are present, so an edit form sends the whole set it owns and a
 * field it never showed stays untouched.
 *
 * Two rules the backend enforces that this type encodes:
 *  - `forbidNonWhitelisted` is on globally, so a key that is not part of
 *    `CreateJobDto` rejects the WHOLE request with a 400. Never spread extra
 *    view-model fields in here.
 *  - `null` clears a nullable column (class-validator's `@IsOptional()` skips
 *    validation for `null`, and the service maps `value ?? null` onto the
 *    row). `undefined` is dropped by `JSON.stringify` and means "leave alone",
 *    which is NOT the same thing: an emptied email has to be sent as `null`,
 *    because `""` would fail `@IsEmail`.
 *
 * `companySlug` / `company` / `agreement` are deliberately absent: the backend
 * accepts them for compatibility but `JobsService.update` never reads them, so
 * a job's company affiliation is fixed at creation. `queerRun` / `qrLabel` are
 * derived from the company at creation and are not the poster's to edit here.
 */
export interface UpdateJobDto {
  title?: string;
  category?: string;
  commitment?: string;
  seniority?: string;
  format?: JobFormat;
  location?: string;
  city?: string | null;
  timezone?: string | null;
  description?: string;
  deadline?: string | null;
  startDate?: string | null;
  salary?: string | null;
  rateMin?: number | null;
  rateMax?: number | null;
  currency?: string | null;
  ratePer?: string | null;
  hidePay?: boolean;
  barter?: boolean;
  benefits?: string[];
  inclusivity?: string[];
  tags?: string[];
  screening?: string[];
  contacts?: string[];
  email?: string | null;
  link?: string | null;
  detail?: JobDetailBody;
}

export interface CreateJobApplicationDto {
  answers: JobApplicationAnswer[];
  coverNote?: string;
}

// ── Raw calls (one per endpoint) ─────────────────────────────────────────────

/** GET /jobs?cat=&type=&page= — `cat` filters category, `type` filters commitment. */
export async function getJobs(
  params: { cat?: string; type?: string; page?: number } = {},
) {
  const q = new URLSearchParams();
  if (params.cat) q.set("cat", params.cat);
  if (params.type) q.set("type", params.type);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiGet<JobCardDTO[] | Paginated<JobCardDTO>>(
    `/jobs${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

/** GET /jobs/:slug — accepts an `AbortSignal` (react-query forwards its
 *  `queryFn` signal here) so navigating away from a job detail page mid-fetch
 *  cancels the underlying request instead of letting it run to completion. */
export const getJob = (slug: string, signal?: AbortSignal) =>
  apiGet<JobDetailDTO>(`/jobs/${slug}`, undefined, undefined, signal);

export const createJob = (dto: CreateJobDto) =>
  apiPost<JobDetailDTO>("/jobs", dto);

export const closeJob = (slug: string) =>
  apiPost<JobDetailDTO>(`/jobs/${slug}/close`);

/**
 * GET /me/jobs returns the caller's OWN postings, newest first, in the same
 * `JobCardDTO` shape and the same page-number envelope as the public board.
 * Scoped to `posterId` server-side, and deliberately NOT moderation-filtered:
 * a takedown withholds a job from the public grid, the poster still manages it
 * here. Backs the poster's "jobs you posted" index (PRD-44), which until now
 * had no caller at all, leaving a poster with no way back to a listing whose
 * slug they no longer held.
 */
export async function getMyJobs(
  params: { page?: number } = {},
  signal?: AbortSignal,
) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  const queryString = query.toString();
  const res = await apiGet<JobCardDTO[] | Paginated<JobCardDTO>>(
    `/me/jobs${queryString ? `?${queryString}` : ""}`,
    undefined,
    undefined,
    signal,
  );
  return toItemsPage(res);
}

/**
 * PATCH /jobs/:slug lets the poster correct their own listing (PRD-44). 403 for
 * anyone who is not the poster, 404 for an unknown slug, 400 for a field the
 * validators refuse.
 *
 * The slug is STABLE across an update: `JobsService.update` writes the changed
 * columns and never re-runs `allocateUniqueSlug`, so renaming the role keeps
 * the same URL and the form can navigate straight back to the detail page it
 * came from. Editing also does not re-open moderation and sends no
 * notification, so a fixed typo is a quiet save.
 */
export const updateJob = (slug: string, dto: UpdateJobDto) =>
  apiPatch<JobDetailDTO>(`/jobs/${slug}`, dto);

export const applyToJob = (slug: string, dto: CreateJobApplicationDto) =>
  apiPost<JobApplicationDTO>(`/jobs/${slug}/applications`, dto);

/**
 * GET /me/applications — the authenticated member's own job applications,
 * newest first. Backs `useMyApplications` (the Application Status tracker). The
 * backend hand-maps each row to `JobApplicationDTO` (no column leaks) and the
 * set is naturally bounded to one member's own applications.
 */
export const getMyApplications = () =>
  apiGet<JobApplicationDTO[]>("/me/applications");

/**
 * The three states a poster can move an application INTO. `submitted` is where
 * an application starts and is deliberately absent: the backend refuses a move
 * back to it, and `reviewing` can only be reached from `submitted`.
 */
export type JobApplicationDecision = "reviewing" | "accepted" | "declined";

/**
 * GET /jobs/:slug/applications — the poster's view of who applied to their own
 * listing. Poster only: 403 for anyone else, 404 for an unknown slug. Bounded
 * server-side to the standard list limit.
 */
export const getJobApplications = (slug: string, signal?: AbortSignal) =>
  apiGet<JobApplicationDTO[]>(
    `/jobs/${slug}/applications`,
    undefined,
    undefined,
    signal,
  );

/**
 * PATCH /jobs/:slug/applications/:id — the poster's decision (BE-HSG-16).
 * Before this route existed every application was permanently `submitted` for
 * both sides. A decision is one-way: 409 when the application was already
 * decided (including a concurrent second decision), 403 when the caller is not
 * the poster. The applicant hears about it by direct message, which the backend
 * sends.
 */
export const decideJobApplication = (
  slug: string,
  applicationId: string,
  status: JobApplicationDecision,
) =>
  apiPatch<JobApplicationDTO>(`/jobs/${slug}/applications/${applicationId}`, {
    status,
  });
