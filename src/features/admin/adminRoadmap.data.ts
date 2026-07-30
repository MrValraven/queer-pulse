import {
  BUILDING,
  HERO_STATS,
  PLANNED,
  SHIPPED,
  TOP_IDEAS,
} from "../marketing/roadmap.data";
import type {
  AdminRoadmapItemDTO,
  AdminRoadmapIdeaDTO,
  RoadmapAdminHeroStatDTO,
} from "./api/roadmapAdmin.api";

/**
 * View types for the admin roadmap tools — identical in shape to the
 * backend's admin DTOs (`api/roadmapAdmin.api.ts`), since this is an editor:
 * unlike the public `/about/roadmap` page's `RoadmapView` (which folds
 * `null` fields to `""` for display), the admin board needs the raw nullable
 * fields back so an item can be edited without losing "unset".
 */
export type AdminRoadmapItem = AdminRoadmapItemDTO;
export type AdminRoadmapIdea = AdminRoadmapIdeaDTO;
export type AdminRoadmapHeroStat = RoadmapAdminHeroStatDTO;

export interface DemoRoadmapState {
  items: AdminRoadmapItem[];
  ideas: AdminRoadmapIdea[];
  heroStats: AdminRoadmapHeroStat[];
}

// ── Demo-override store ──────────────────────────────────────────────────────
// The DEMO source of truth for the admin roadmap tools. In live mode the
// server owns this content (`GET/POST/PATCH/DELETE /roadmap/admin/*`); in
// demo mode there is no backend, so admin edits (create/update/delete an
// item or idea, reorder, edit hero stats) persist here instead, keyed to
// localStorage so they survive a reload (mirrors `outbox.ts` /
// `DeletedConversationsProvider`'s "demo edits are local fiction" idiom).
// Seeded once per browser from the public roadmap page's own mock content
// (`marketing/roadmap.data.ts`) the first time it's read — after that, the
// stored copy (not the seed) is the source of truth until it's cleared.

const STORAGE_KEY = "qp:demo:roadmap";

function buildSeed(): DemoRoadmapState {
  const items: AdminRoadmapItem[] = [
    ...SHIPPED.map(
      (item, index): AdminRoadmapItem => ({
        id: item.id,
        column: "shipped",
        category: item.category,
        name: item.name,
        description: item.description,
        date: item.date,
        stage: null,
        eta: null,
        progress: null,
        votes: 0,
        liveVotes: 0,
        requested: item.requested ?? false,
        hot: false,
        sortOrder: index,
      }),
    ),
    ...BUILDING.map(
      (item, index): AdminRoadmapItem => ({
        id: item.id,
        column: "building",
        category: item.category,
        name: item.name,
        description: item.description,
        date: null,
        stage: item.stage,
        eta: item.eta,
        progress: item.progress,
        votes: 0,
        liveVotes: 0,
        requested: item.requested ?? false,
        hot: false,
        sortOrder: index,
      }),
    ),
    ...PLANNED.map(
      (item, index): AdminRoadmapItem => ({
        id: item.id,
        column: "planned",
        category: item.category,
        name: item.name,
        description: item.description,
        date: null,
        stage: null,
        eta: null,
        progress: null,
        votes: item.votes,
        liveVotes: 0,
        requested: false,
        hot: item.hot ?? false,
        sortOrder: index,
      }),
    ),
  ];

  const ideas: AdminRoadmapIdea[] = TOP_IDEAS.map(
    (idea, index): AdminRoadmapIdea => ({
      id: idea.id,
      text: idea.text,
      status: "published",
      votes: idea.votes,
      liveVotes: 0,
      fromMember: true,
      sortOrder: index,
      // Seed mock has no real submission date — stagger by index so a
      // sort-by-newest reads sensibly.
      createdAt: new Date(2026, 6, 1 + index).toISOString(),
    }),
  );

  const heroStats: AdminRoadmapHeroStat[] = HERO_STATS.map((stat) => ({
    ...stat,
  }));

  return { items, ideas, heroStats };
}

function isDemoRoadmapState(value: unknown): value is DemoRoadmapState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DemoRoadmapState>;
  return (
    Array.isArray(candidate.items) &&
    Array.isArray(candidate.ideas) &&
    Array.isArray(candidate.heroStats)
  );
}

function readStored(): DemoRoadmapState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isDemoRoadmapState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function persist(state: DemoRoadmapState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

/**
 * Read the demo-mode admin roadmap store, seeding it from the public
 * roadmap page's mock content on first read in this browser.
 */
export function readDemoRoadmap(): DemoRoadmapState {
  const stored = readStored();
  if (stored) return stored;
  const seeded = buildSeed();
  persist(seeded);
  return seeded;
}

/** Overwrite the demo roadmap store — every admin mutation calls this
 *  (via `useAdminRoadmapMutations`) after computing the next state. */
export function writeDemoRoadmap(next: DemoRoadmapState): void {
  persist(next);
}
