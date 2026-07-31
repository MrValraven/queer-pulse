import { apiGet } from "../../../shared/api/client";
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
