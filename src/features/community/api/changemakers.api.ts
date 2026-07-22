import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

export type ChangemakerTint = "coral" | "jade" | "plum";
export type ChangemakerStatus = "draft" | "published";

export interface ChangemakerDTO {
  id: string;
  slug: string;
  name: string;
  initials: string;
  cause: string;
  tint: ChangemakerTint;
  tags: string[];
  summary: string;
  imageUrl: string | null;
  impact: string[];
  byline: string;
  heroNote: string;
  lead: string;
  body: string[];
  pullQuoteText: string;
  pullQuoteCite: string;
  status: ChangemakerStatus;
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DirectoryStatsDTO {
  profiled: number;
  causeAreas: number;
  peopleHelped: number;
  activeCampaigns: number;
}

export interface ChangemakerListResponseDTO {
  profiles: ChangemakerDTO[];
  stats: DirectoryStatsDTO;
}

export interface CreateChangemakerBody {
  name: string;
  initials: string;
  cause: string;
  tint: ChangemakerTint;
  tags: string[];
  summary: string;
  imageUrl?: string;
  impact: string[];
  byline?: string;
  heroNote?: string;
  lead?: string;
  body?: string[];
  pullQuoteText?: string;
  pullQuoteCite?: string;
  isFeatured?: boolean;
  sortOrder?: number;
}

export type UpdateChangemakerBody = Partial<CreateChangemakerBody>;

// ── Public reads ────────────────────────────────────────────────────────────
export const fetchChangemakers = () =>
  apiGet<ChangemakerListResponseDTO>("/changemakers");

export const fetchChangemaker = (slug: string) =>
  apiGet<ChangemakerDTO>(`/changemakers/${slug}`);

// ── Admin CRUD ──────────────────────────────────────────────────────────────
export const fetchAdminChangemakers = () =>
  apiGet<ChangemakerDTO[]>("/admin/changemakers");

export const createChangemaker = (body: CreateChangemakerBody) =>
  apiPost<ChangemakerDTO>("/admin/changemakers", body);

export const updateChangemaker = (id: string, body: UpdateChangemakerBody) =>
  apiPatch<ChangemakerDTO>(`/admin/changemakers/${id}`, body);

export const deleteChangemaker = (id: string) =>
  apiDelete<void>(`/admin/changemakers/${id}`);

export const publishChangemaker = (id: string, published: boolean) =>
  apiPatch<ChangemakerDTO>(`/admin/changemakers/${id}/publish`, { published });

export const updateDirectoryStats = (body: {
  peopleHelped: number;
  activeCampaigns: number;
}) => apiPatch<DirectoryStatsDTO>("/admin/changemakers/stats", body);
