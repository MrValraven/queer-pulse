import { apiGet, apiPost, apiPatch, apiDelete } from "../../../shared/api/client";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `roadmap` domain's admin surface returns/accepts
// (`/roadmap/admin/*`). This is the admin-only read+write counterpart to the
// public `marketing/api/roadmap.api.ts` (`GET /roadmap`) — the admin tools
// edit shipped/building/planned items, ideas, and the hero-stat chips that
// page reads.

export type RoadmapColumn = "shipped" | "building" | "planned";
export type RoadmapIdeaStatus = "pending" | "published" | "dismissed";

export interface AdminRoadmapItemDTO {
  id: string;
  column: RoadmapColumn;
  category: string;
  name: string;
  description: string;
  date: string | null;
  stage: string | null;
  eta: string | null;
  progress: number | null;
  votes: number;
  liveVotes: number;
  requested: boolean;
  hot: boolean;
  sortOrder: number;
}

export interface AdminRoadmapIdeaDTO {
  id: string;
  text: string;
  status: RoadmapIdeaStatus;
  votes: number;
  liveVotes: number;
  fromMember: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface RoadmapAdminHeroStatDTO {
  label: string;
  jade?: boolean;
}

export interface RoadmapAdminResponseDTO {
  items: AdminRoadmapItemDTO[];
  ideas: AdminRoadmapIdeaDTO[];
  heroStats: RoadmapAdminHeroStatDTO[];
}

/** Every roadmap item/idea, published or not, plus the hero-stat chips. */
export const getAdminRoadmap = () =>
  apiGet<RoadmapAdminResponseDTO>("/roadmap/admin");

// ── Items ───────────────────────────────────────────────────────────────────

export type RoadmapItemWriteBody = Omit<AdminRoadmapItemDTO, "id" | "liveVotes">;

export const createRoadmapItem = (body: RoadmapItemWriteBody) =>
  apiPost<AdminRoadmapItemDTO>("/roadmap/admin/items", body);

export const updateRoadmapItem = (
  id: string,
  body: Partial<RoadmapItemWriteBody>,
) => apiPatch<AdminRoadmapItemDTO>(`/roadmap/admin/items/${id}`, body);

export const deleteRoadmapItem = (id: string) =>
  apiDelete<void>(`/roadmap/admin/items/${id}`);

// ── Ideas ───────────────────────────────────────────────────────────────────

export interface RoadmapIdeaUpdateBody {
  text?: string;
  status?: RoadmapIdeaStatus;
  sortOrder?: number;
  votes?: number;
}

/** Admin-authored ideas post straight to "published" (no triage needed). */
export const createRoadmapIdea = (text: string) =>
  apiPost<AdminRoadmapIdeaDTO>("/roadmap/admin/ideas", { text });

export const updateRoadmapIdea = (id: string, body: RoadmapIdeaUpdateBody) =>
  apiPatch<AdminRoadmapIdeaDTO>(`/roadmap/admin/ideas/${id}`, body);

export const deleteRoadmapIdea = (id: string) =>
  apiDelete<void>(`/roadmap/admin/ideas/${id}`);

// ── Settings ────────────────────────────────────────────────────────────────

export const updateRoadmapSettings = (heroStats: RoadmapAdminHeroStatDTO[]) =>
  apiPatch<{ heroStats: RoadmapAdminHeroStatDTO[] }>("/roadmap/admin/settings", {
    heroStats,
  });
