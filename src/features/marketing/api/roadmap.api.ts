import { apiGet, apiPost } from "../../../shared/api/client";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `roadmap` domain returns (GET /roadmap). Admin-controlled
// content: shipped/building/planned items and top ideas are seeded and edited
// from the admin roadmap tools; this module is the public read (+ member vote
// / idea submission) surface consumed by the marketing Roadmap page.

export interface HeroStatDTO {
  label: string;
  jade: boolean;
}

export interface ShippedItemDTO {
  id: string;
  category: string;
  name: string;
  description: string;
  date: string | null;
  requested: boolean;
}

export interface BuildingItemDTO {
  id: string;
  category: string;
  name: string;
  description: string;
  stage: string | null;
  eta: string | null;
  progress: number;
  requested: boolean;
}

export interface PlannedItemDTO {
  id: string;
  category: string;
  name: string;
  description: string;
  votes: number;
  hot: boolean;
}

export interface TopIdeaDTO {
  id: string;
  text: string;
  votes: number;
}

export interface RoadmapResponseDTO {
  heroStats: HeroStatDTO[];
  shipped: ShippedItemDTO[];
  building: BuildingItemDTO[];
  planned: PlannedItemDTO[];
  topIdeas: TopIdeaDTO[];
}

export const getRoadmap = () => apiGet<RoadmapResponseDTO>("/roadmap");

/** Ids of the items/ideas the signed-in member has already voted for, so the
 *  page can render the vote button as already-pressed after a refresh. */
export const getMyRoadmapVotes = () => apiGet<string[]>("/roadmap/my-votes");

export const castRoadmapVote = (targetType: "item" | "idea", targetId: string) =>
  apiPost<{ targetId: string; votes: number; voted: true }>("/roadmap/vote", {
    targetType,
    targetId,
  });

export const submitRoadmapIdea = (text: string) =>
  apiPost<{ status: "pending" }>("/roadmap/ideas", { text });
