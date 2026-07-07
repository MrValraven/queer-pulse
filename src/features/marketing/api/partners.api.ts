import { apiGet, apiPost, apiPatch } from "../../../shared/api/client";
import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";

// ── Backend DTOs ─────────────────────────────────────────────────────────────
// Shapes the NestJS partners domain returns. The public listing/detail endpoints
// only ever surface APPROVED partners; a non-approved slug 404s (partners are
// hidden until triaged). Prototype-only display fields (avatar tint, org
// initials) aren't part of the API and are derived / defaulted in
// partners.adapters. Rich body strings arrive as plain text and feed straight
// into the view-model's ReactNode fields.

/** Region is lowercase on the wire; the card carries a human `regionLabel`. */
export type Region = "pt" | "eu" | "int";
export type PartnerStatus = "pending" | "approved" | "rejected";

/** A card as returned by GET /partners (list) — the thin listing shape. */
export interface PartnerCardDTO {
  slug: string;
  name: string;
  logo: string;
  region: Region;
  regionLabel: string;
  city: string;
  desc: string;
  tags: string[];
  tier: string;
  since: string;
}

export interface PartnerStat {
  value: string;
  label: string;
}
export interface PartnerSection {
  heading: string;
  body: string;
}
export interface PartnerJointWork {
  kicker: string;
  title: string;
  dek: string;
  footLeft: string;
  footRight: string;
}
export interface PartnerTimelineItem {
  date: string;
  title: string;
  body: string;
}
export interface PartnerAtGlance {
  label: string;
  value: string;
}
export interface PartnerContact {
  phone: string | null;
  phoneNote: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
}

/** Full partner detail from GET /partners/:slug (approved partners only). */
export interface PartnerDetailDTO extends PartnerCardDTO {
  eyebrow: string;
  tagline: string;
  about: string[];
  stats: PartnerStat[];
  aboutMore: PartnerSection[];
  jointWork: PartnerJointWork[];
  timeline: PartnerTimelineItem[];
  how: PartnerSection[];
  funding: string;
  atGlance: PartnerAtGlance[];
  contact: PartnerContact;
}

/** Admin view of an application — the full detail plus triage metadata. */
export interface PartnerApplicationDTO extends PartnerDetailDTO {
  id: string;
  status: PartnerStatus;
  submittedBy: MemberRefDTO | null;
  reviewNote: string | null;
  createdAt: string;
}

// ── Create / triage payloads ─────────────────────────────────────────────────

export interface CreatePartnerApplicationDto {
  name: string;
  logo: string;
  region: Region;
  regionLabel: string;
  city: string;
  desc: string;
  tags?: string[];
  tier: string;
  since: string;
  eyebrow: string;
  tagline: string;
  about?: string[];
  stats?: PartnerStat[];
  aboutMore?: PartnerSection[];
  jointWork?: PartnerJointWork[];
  timeline?: PartnerTimelineItem[];
  how?: PartnerSection[];
  funding?: string;
  atGlance?: PartnerAtGlance[];
  contact?: PartnerContact;
  /** Honeypot — a non-empty value flags a bot submission. */
  handle?: string;
}

/** PATCH /partner-applications/:id — an admin approves or rejects an application. */
export interface TriagePartnerApplicationDto {
  action: "approve" | "reject";
  note?: string;
}

// ── Raw calls (one per endpoint) ─────────────────────────────────────────────

/** GET /partners?region=&page= — approved partners only. */
export function getPartners(params: { region?: Region; page?: number } = {}) {
  const q = new URLSearchParams();
  if (params.region) q.set("region", params.region);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  return apiGet<Paginated<PartnerCardDTO>>(`/partners${qs ? `?${qs}` : ""}`);
}

/**
 * GET /partners/:slug — throws ApiError with status 404 when the partner isn't
 * approved (hidden). The caller treats that as the not-found path, NOT an error.
 */
export const getPartner = (slug: string) =>
  apiGet<PartnerDetailDTO>(`/partners/${slug}`);

/** POST /partner-applications — any member may submit; returns a pending app. */
export const createPartnerApplication = (dto: CreatePartnerApplicationDto) =>
  apiPost<PartnerApplicationDTO>("/partner-applications", dto);

/** GET /partner-applications — admin only; 403 for a non-admin viewer. */
export const getPartnerApplications = () =>
  apiGet<PartnerApplicationDTO[]>("/partner-applications");

/** PATCH /partner-applications/:id — admin only approve/reject. */
export const triagePartnerApplication = (
  id: string,
  dto: TriagePartnerApplicationDto,
) => apiPatch<PartnerApplicationDTO>(`/partner-applications/${id}`, dto);
