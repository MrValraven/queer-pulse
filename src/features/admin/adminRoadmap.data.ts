import type {
  AdminRoadmapIdeaDTO,
  AdminRoadmapItemDTO,
  RoadmapAdminHeroStatDTO,
  RoadmapAuditEntryDTO,
  RoadmapTeamMemberDTO,
} from "./api/roadmapAdmin.api";
import { buildRoadmapSeed } from "./adminRoadmap.seed";

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
  team: RoadmapTeamMemberDTO[];
  audit: RoadmapAuditEntryDTO[];
  heroStats: AdminRoadmapHeroStat[];
}

// ── Demo-override store ──────────────────────────────────────────────────────
// The DEMO source of truth for the admin roadmap tools. In live mode the
// server owns this content (`GET/POST/PATCH/DELETE /roadmap/admin/*`); in
// demo mode there is no backend, so admin edits (create/update/delete an
// item/idea/team member, reorder, edit hero stats) persist here instead,
// keyed to localStorage so they survive a reload (mirrors `outbox.ts` /
// `DeletedConversationsProvider`'s "demo edits are local fiction" idiom).
// Seeded once per browser (`buildRoadmapSeed()`, in the colocated
// `adminRoadmap.seed.ts`) the first time it's read — after that, the stored
// copy (not the seed) is the source of truth until it's cleared.
//
// The storage key is versioned (`v2`): the prior shape
// (`{ items, ideas, heroStats }`, no `team`/`audit`, thin item/idea fields)
// would otherwise deserialize successfully but be missing every field the
// rich admin UI (drawer, capacity view, audit log) expects. Bumping the key
// forces a fresh seed instead of silently running with a stale shape.
const STORAGE_KEY = "qp:demo:roadmap:v2";

function isDemoRoadmapState(value: unknown): value is DemoRoadmapState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DemoRoadmapState>;
  return (
    Array.isArray(candidate.items) &&
    Array.isArray(candidate.ideas) &&
    Array.isArray(candidate.team) &&
    Array.isArray(candidate.audit) &&
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
 * Read the demo-mode admin roadmap store, seeding it from the rich prototype
 * fixture (`buildRoadmapSeed()`) on first read in this browser.
 */
export function readDemoRoadmap(): DemoRoadmapState {
  const stored = readStored();
  if (stored) return stored;
  const seeded = buildRoadmapSeed();
  persist(seeded);
  return seeded;
}

/** Overwrite the demo roadmap store — every admin mutation calls this
 *  (via `useAdminRoadmapMutations`) after computing the next state. */
export function writeDemoRoadmap(next: DemoRoadmapState): void {
  persist(next);
}
