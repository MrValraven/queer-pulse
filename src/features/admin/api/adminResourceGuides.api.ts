import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type { GuideSection } from "../../../shared/contracts/contracts";

export type {
  GuideBlock,
  GuideBlockKind,
  GuideSection,
} from "../../../shared/contracts/contracts";

/** Sort keys `GET /admin/resources` accepts. `reviewDue` is the default and
 *  the reason the list exists: which guides are stale? */
export type AdminResourceSort = "reviewDue" | "title" | "updated";

export interface AdminResourceGuideDTO {
  id: string;
  slug: string;
  category: string;
  title: string;
  titlePt: string | null;
  description: string;
  descriptionPt: string | null;
  body: string;
  meta: string | null;
  externalUrl: string | null;
  routePath: string | null;
  /** Empty means the guide is metadata-only: the frontend keeps rendering
   *  its hardcoded page until an editor adds a section here. */
  sections: GuideSection[];
  sectionsPt: GuideSection[] | null;
  lastVerifiedAt: string | null;
  lastReviewedOn: string | null;
  reviewedBy: string | null;
  reviewDueOn: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceGuideWriteBody {
  slug?: string;
  category?: string;
  title?: string;
  titlePt?: string;
  description?: string;
  descriptionPt?: string;
  meta?: string;
  externalUrl?: string;
  routePath?: string;
  sections?: GuideSection[];
  sectionsPt?: GuideSection[];
  lastReviewedOn?: string;
  reviewedBy?: string;
  reviewDueOn?: string;
}

export interface ReviewGuideBody {
  lastReviewedOn?: string;
  reviewedBy: string;
  reviewDueOn?: string;
}

export const getAdminResourceGuides = (params: {
  category?: string;
  sort?: AdminResourceSort;
}) => {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.sort) query.set("sort", params.sort);
  const queryString = query.toString();
  return apiGet<AdminResourceGuideDTO[]>(
    `/admin/resources${queryString ? `?${queryString}` : ""}`,
  );
};

export const createResourceGuide = (
  body: ResourceGuideWriteBody & { slug: string },
) => apiPost<AdminResourceGuideDTO>("/admin/resources", body);

export const updateResourceGuide = (id: string, body: ResourceGuideWriteBody) =>
  apiPatch<AdminResourceGuideDTO>(`/admin/resources/${id}`, body);

/** "I read this guide end to end and it is still accurate." Deliberately its
 *  own endpoint, so a typo fix never silently resets a crisis guide's
 *  freshness clock. */
export const reviewResourceGuide = (id: string, body: ReviewGuideBody) =>
  apiPost<AdminResourceGuideDTO>(`/admin/resources/${id}/review`, body);

export const setResourceGuidePublished = (id: string, isPublished: boolean) =>
  apiPost<AdminResourceGuideDTO>(
    `/admin/resources/${id}/${isPublished ? "publish" : "unpublish"}`,
  );

export const deleteResourceGuide = (id: string) =>
  apiDelete<void>(`/admin/resources/${id}`);

// ── Glossary ────────────────────────────────────────────────────────────────

export interface AdminGlossaryTermDTO {
  id: string;
  slug: string;
  term: string;
  definition: string;
  definitionPt: string | null;
  category: string | null;
  lastReviewedOn: string | null;
  reviewedBy: string | null;
  reviewDueOn: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GlossaryTermWriteBody {
  slug?: string;
  term?: string;
  definition?: string;
  definitionPt?: string;
  category?: string;
  lastReviewedOn?: string;
  reviewedBy?: string;
  reviewDueOn?: string;
}

export const getAdminGlossaryTerms = () =>
  apiGet<AdminGlossaryTermDTO[]>("/admin/glossary");

export const createGlossaryTerm = (
  body: GlossaryTermWriteBody & {
    slug: string;
    term: string;
    definition: string;
  },
) => apiPost<AdminGlossaryTermDTO>("/admin/glossary", body);

export const updateGlossaryTerm = (id: string, body: GlossaryTermWriteBody) =>
  apiPatch<AdminGlossaryTermDTO>(`/admin/glossary/${id}`, body);

export const reviewGlossaryTerm = (id: string, body: ReviewGuideBody) =>
  apiPost<AdminGlossaryTermDTO>(`/admin/glossary/${id}/review`, body);

export const deleteGlossaryTerm = (id: string) =>
  apiDelete<void>(`/admin/glossary/${id}`);
