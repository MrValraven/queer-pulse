import { apiGet, apiPost } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `resources` domain returns (GET /resources, /resources/:slug,
// GET /glossary, /glossary/:slug). Read-only + seeded — there is no authoring
// endpoint on either resource kind.

/** A single guide row, as returned by both GET /resources (list) and
 *  GET /resources/:slug (detail) — the backend declares no separate
 *  list-item shape, so list and detail share this one type. */
export interface ResourceResponseDTO {
  slug: string;
  category: string;
  title: string;
  description: string;
  body: string;
  /** Card-footer chip, e.g. "Guide · 12 min · PT / EN". Null on unauthored rows. */
  meta: string | null;
  externalUrl: string | null;
  /** ISO timestamp of the last editorial verification, or null if never verified. */
  lastVerifiedAt: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** A single glossary entry, as returned by both GET /glossary (list) and
 *  GET /glossary/:slug (detail). */
export interface GlossaryTermResponseDTO {
  slug: string;
  term: string;
  definition: string;
  category: string | null;
}

/** `POST|GET /resources/guides/:contentKey/rating` (CNT-18) response shape —
 *  `ResourceGuideRatingsController`'s `GuideRatingResult`. */
export type GuideRatingValue = "helpful" | "not_helpful";

export interface GuideRatingResponseDTO {
  contentKey: string;
  helpfulCount: number;
  notHelpfulCount: number;
  myVote: GuideRatingValue | null;
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export async function getResources(
  params: { category?: string; page?: number } = {},
): Promise<Paginated<ResourceResponseDTO>> {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiGet<
    ResourceResponseDTO[] | Paginated<ResourceResponseDTO>
  >(`/resources${qs ? `?${qs}` : ""}`);
  return toItemsPage(res);
}

export function getGlossaryTerms(params: { category?: string } = {}) {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  const qs = q.toString();
  return apiGet<GlossaryTermResponseDTO[]>(`/glossary${qs ? `?${qs}` : ""}`);
}

export function fetchGuideRating(contentKey: string) {
  return apiGet<GuideRatingResponseDTO>(
    `/resources/guides/${encodeURIComponent(contentKey)}/rating`,
  );
}

export function rateGuide(contentKey: string, value: GuideRatingValue) {
  return apiPost<GuideRatingResponseDTO>(
    `/resources/guides/${encodeURIComponent(contentKey)}/rating`,
    { value },
  );
}

// ── Resource listings + suggestions (CNT-14) ────────────────────────────────
// Shapes the NestJS `resources` domain's CNT-14 additions return: a real,
// admin-curated Legal Aid / Sexual Health Testing directory
// (GET /resources/listings) plus the public "suggest a resource" submission
// pathway (POST /resources/suggestions) that feeds the admin review queue.

/** A single listing row, as returned by GET /resources/listings. */
export interface ResourceListingResponseDTO {
  id: string;
  category: string;
  title: string;
  description: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  region: string | null;
}

/** Active listings only, optionally filtered by category
 *  ("legal_aid" | "sexual_health_testing"). */
export function getResourceListings(
  category: string,
): Promise<ResourceListingResponseDTO[]> {
  const q = new URLSearchParams({ category });
  return apiGet<ResourceListingResponseDTO[]>(
    `/resources/listings?${q.toString()}`,
  );
}

export interface SubmitResourceSuggestionBody {
  category: string;
  name: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
}

/** Echo of the suggestion the backend recorded — always lands `Pending`. */
export interface ResourceSuggestionResponseDTO {
  id: string;
  category: string;
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  createdAt: string;
}

export function submitResourceSuggestion(
  body: SubmitResourceSuggestionBody,
): Promise<ResourceSuggestionResponseDTO> {
  return apiPost<ResourceSuggestionResponseDTO>("/resources/suggestions", body);
}
