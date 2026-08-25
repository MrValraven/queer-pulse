import { apiGet, apiPost } from "../../../shared/api/client";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `roadmap` domain returns (GET /roadmap). Admin-controlled
// content: shipped/building/planned items and top ideas are seeded and edited
// from the admin roadmap tools; this module is the public read (+ member vote
// / idea submission) surface consumed by the marketing Roadmap page.

export interface HeroStatDTO {
  label: string;
  value?: string;
  note?: string;
  jade: boolean;
}

/** The most recent target-date move for a committed card — a public-safe
 *  reason only (no who/when — those stay admin-only). */
export interface SlipDTO {
  from: string;
  to: string;
  reason: string;
}

export interface ShippedItemDTO {
  id: string;
  category: string;
  name: string;
  description: string;
  date: string | null;
  requested: boolean;
  committed: boolean;
  latestSlip: SlipDTO | null;
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
  committed: boolean;
  latestSlip: SlipDTO | null;
}

export interface PlannedItemDTO {
  id: string;
  category: string;
  name: string;
  description: string;
  votes: number;
  hot: boolean;
  committed: boolean;
  latestSlip: SlipDTO | null;
}

export interface TopIdeaDTO {
  id: string;
  text: string;
  votes: number;
}

/** Closed set of member-facing reasons an idea isn't being built — mirrors
 *  the backend's `RoadmapDeclineReason`. */
export type RoadmapDeclineReason =
  "scope" | "unsafe" | "capacity" | "exists" | "harm";

/** A dismissed idea whose decline reason is member-facing — "Not building
 *  this, and why" on the public page. */
export interface NotBuildingDTO {
  id: string;
  category: string;
  reason: RoadmapDeclineReason;
  note: string;
  votes: number;
}

export interface RoadmapResponseDTO {
  heroStats: HeroStatDTO[];
  shipped: ShippedItemDTO[];
  building: BuildingItemDTO[];
  planned: PlannedItemDTO[];
  /** "Someday" — public backlog-column items, same shape as `planned`. */
  backlog: PlannedItemDTO[];
  topIdeas: TopIdeaDTO[];
  notBuilding: NotBuildingDTO[];
}

export const getRoadmap = () => apiGet<RoadmapResponseDTO>("/roadmap");

/** Ids of the items/ideas the signed-in member has already voted for, so the
 *  page can render the vote button as already-pressed after a refresh. */
export const getMyRoadmapVotes = () => apiGet<string[]>("/roadmap/my-votes");

export const castRoadmapVote = (
  targetType: "item" | "idea",
  targetId: string,
) =>
  apiPost<{ targetId: string; votes: number; voted: true }>("/roadmap/vote", {
    targetType,
    targetId,
  });

export const submitRoadmapIdea = (text: string) =>
  apiPost<{ status: "pending" }>("/roadmap/ideas", { text });
