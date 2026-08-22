import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  readDemoRoadmap,
  type AdminRoadmapHeroStat,
  type AdminRoadmapIdea,
  type AdminRoadmapItem,
} from "../adminRoadmap.data";
import {
  getAdminRoadmap,
  type RoadmapAdminResponseDTO,
  type RoadmapAuditEntryDTO,
  type RoadmapTeamMemberDTO,
} from "./roadmapAdmin.api";
import { ADMIN_ROADMAP_KEY, roadmapKeys } from "./roadmapKeys";

// Every admin roadmap WRITE action lives in the colocated
// `useAdminRoadmapMutations.ts` (split out purely for file size — this file
// stayed the read-only bundle query once B4 grew the mutations to cover
// every action in the Appendix). Import `useAdminRoadmapMutations` from
// there directly.

// ── Read ─────────────────────────────────────────────────────────────────────
// Re-exported for any pre-existing import of the bare key string (the key
// factory itself now lives in the colocated `roadmapKeys.ts`).
export { ADMIN_ROADMAP_KEY };

export interface AdminRoadmapView {
  items: AdminRoadmapItem[];
  ideas: AdminRoadmapIdea[];
  team: RoadmapTeamMemberDTO[];
  audit: RoadmapAuditEntryDTO[];
  heroStats: AdminRoadmapHeroStat[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
}

function fromDto(dto: RoadmapAdminResponseDTO): Omit<AdminRoadmapView, "loading"> {
  return {
    items: dto.items,
    ideas: dto.ideas,
    team: dto.team,
    audit: dto.audit,
    heroStats: dto.heroStats,
  };
}

const EMPTY: Omit<AdminRoadmapView, "loading"> = {
  items: [],
  ideas: [],
  team: [],
  audit: [],
  heroStats: [],
};

/**
 * Data source for the admin roadmap tools (`/admin/roadmap`) — every item
 * and idea (published or not), the team roster, the recent audit trail, and
 * the hero-stat chips shown atop the public page. Demo mode reads (and
 * seeds) the localStorage-backed `readDemoRoadmap()` store; live mode calls
 * `GET /admin/roadmap` (admin-only — a non-admin gets a 403).
 */
export function useAdminRoadmap(): AdminRoadmapView {
  const { demoMode } = useDemoMode();

  const query = useQuery<Omit<AdminRoadmapView, "loading">>({
    queryKey: roadmapKeys.admin(demoMode),
    queryFn: async () =>
      demoMode ? readDemoRoadmap() : fromDto(await getAdminRoadmap()),
  });

  if (!query.data) {
    return { ...EMPTY, loading: query.isPending };
  }
  return { ...query.data, loading: false };
}
