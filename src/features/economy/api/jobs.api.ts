import { apiGet, apiPost, apiPatch } from "../../../shared/api/client";
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

export type UpdateJobDto = Partial<CreateJobDto>;

export interface CreateJobApplicationDto {
  answers: JobApplicationAnswer[];
  coverNote?: string;
}

// ── Raw calls (one per endpoint) ─────────────────────────────────────────────

/** GET /jobs?cat=&type=&page= — `cat` filters category, `type` filters commitment. */
export function getJobs(
  params: { cat?: string; type?: string; page?: number } = {},
) {
  const q = new URLSearchParams();
  if (params.cat) q.set("cat", params.cat);
  if (params.type) q.set("type", params.type);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  return apiGet<Paginated<JobCardDTO>>(`/jobs${qs ? `?${qs}` : ""}`);
}

export const getJob = (slug: string) => apiGet<JobDetailDTO>(`/jobs/${slug}`);

export const createJob = (dto: CreateJobDto) =>
  apiPost<JobDetailDTO>("/jobs", dto);

export const updateJob = (slug: string, dto: UpdateJobDto) =>
  apiPatch<JobDetailDTO>(`/jobs/${slug}`, dto);

export const closeJob = (slug: string) =>
  apiPost<JobDetailDTO>(`/jobs/${slug}/close`);

export const applyToJob = (slug: string, dto: CreateJobApplicationDto) =>
  apiPost<JobApplicationDTO>(`/jobs/${slug}/applications`, dto);

/** GET /jobs/:slug/applications — poster-only. */
export const getJobApplications = (slug: string) =>
  apiGet<JobApplicationDTO[]>(`/jobs/${slug}/applications`);

/** GET /me/applications — the viewer's own applications. */
export const getMyApplications = () =>
  apiGet<JobApplicationDTO[]>("/me/applications");
