import { apiGet, apiPost, apiPatch } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
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
  featured: boolean;
  testimonialQuote: string | null;
  testimonialAuthor: string | null;
  testimonialRole: string | null;
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
  /** OPS-04. The staff member currently working this application, or null when
   *  nobody has claimed it. Meaningful while `status` is `pending`. */
  assignedStaffId: string | null;
  /** Only present when `assignedStaffId` is set. "Deleted member" after that
   *  reviewer's erasure. */
  assignedStaffName?: string;
  /** OPS-04. ISO 8601. When the application should have been answered by.
   *  NULL means NO CLOCK and is never overdue: applications settled before
   *  OPS-04 existed carry none. */
  dueAt: string | null;
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

/** PATCH /admin/partners/applications/:id — an admin approves or rejects an application. */
export interface TriagePartnerApplicationDto {
  action: "approve" | "reject";
  note?: string;
}

/** PATCH /admin/partners/:id — an admin sets a partner's featured flag and/or
 *  testimonial. The backend 409s a quote written without an author. */
export interface UpdatePartnerAdminDto {
  featured?: boolean;
  testimonialQuote?: string | null;
  testimonialAuthor?: string | null;
  testimonialRole?: string | null;
}

// ── Raw calls (one per endpoint) ─────────────────────────────────────────────

/** GET /partners?region=&page=&featured= — approved partners only. */
export async function getPartners(
  params: { region?: Region; page?: number; featured?: boolean } = {},
): Promise<Paginated<PartnerCardDTO>> {
  const query = new URLSearchParams();
  if (params.region) query.set("region", params.region);
  if (params.page) query.set("page", String(params.page));
  if (params.featured) query.set("featured", "true");
  const queryString = query.toString();
  const response = await apiGet<PartnerCardDTO[] | Paginated<PartnerCardDTO>>(
    `/partners${queryString ? `?${queryString}` : ""}`,
  );
  return toItemsPage(response);
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

/**
 * GET /admin/partners/applications — admin only; 403 for a non-admin viewer.
 *
 * `assignedTo` is OPS-04's "Assigned to me" narrowing, resolved server-side:
 * `me` against the caller's own session, `unassigned` against a NULL assignee.
 * The wire never carries a reviewer's id, so one reviewer cannot ask what
 * another is holding.
 */
export const getPartnerApplications = (
  params: { assignedTo?: "me" | "unassigned" } = {},
) =>
  apiGet<PartnerApplicationDTO[]>(
    `/admin/partners/applications${
      params.assignedTo ? `?assignedTo=${params.assignedTo}` : ""
    }`,
  );

/** PATCH /admin/partners/applications/:id — admin only approve/reject. */
export const triagePartnerApplication = (
  id: string,
  dto: TriagePartnerApplicationDto,
) => apiPatch<PartnerApplicationDTO>(`/admin/partners/applications/${id}`, dto);

/** GET /admin/partners — admin-only list of APPROVED partners (id + featured + testimonial). */
export const getAdminPartners = () =>
  apiGet<PartnerApplicationDTO[]>("/admin/partners");

/** PATCH /admin/partners/:id — admin sets a partner's featured flag + testimonial. */
export const updatePartnerAdmin = (id: string, dto: UpdatePartnerAdminDto) =>
  apiPatch<PartnerApplicationDTO>(`/admin/partners/${id}`, dto);
