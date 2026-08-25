import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getRoadmap, type RoadmapResponseDTO } from "./roadmap.api";
import type {
  BacklogItem,
  BuildingItem,
  IdeaItem,
  NotBuildingItem,
  PlannedItem,
  ShippedItem,
} from "../roadmap.data";

// ── View model ──────────────────────────────────────────────────────────────
// The Roadmap page and its cards render this directly. Both demo and live
// converge on it, so the DTO-null → view-field fallback mapping (date/stage/eta
// default to "") lives in this one adapter, never in the page or cards.

export interface RoadmapView {
  heroStats: { label: string; value?: string; note?: string; jade?: boolean }[];
  shipped: ShippedItem[];
  building: BuildingItem[];
  planned: PlannedItem[];
  /** "Someday" — public backlog-column items. */
  backlog: BacklogItem[];
  topIdeas: IdeaItem[];
  /** "Not building this, and why" — dismissed ideas with a public reason. */
  notBuilding: NotBuildingItem[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
}

// Demo mode reshapes the page's own mocks into the view model — byte-for-byte
// the same demo experience, no network. The `roadmap.data` mock is imported on
// demand inside the demo queryFn (see below) so it never ships in the live
// bundle.
async function buildDemo(): Promise<Omit<RoadmapView, "loading">> {
  const {
    HERO_STATS,
    SHIPPED,
    BUILDING,
    PLANNED,
    BACKLOG,
    TOP_IDEAS,
    NOT_BUILDING,
  } = await import("../roadmap.data");
  return {
    heroStats: HERO_STATS,
    shipped: SHIPPED,
    building: BUILDING,
    planned: PLANNED,
    backlog: BACKLOG,
    topIdeas: TOP_IDEAS.map((idea) => ({ ...idea })),
    notBuilding: NOT_BUILDING,
  };
}

function fromDto(dto: RoadmapResponseDTO): Omit<RoadmapView, "loading"> {
  return {
    heroStats: dto.heroStats.map((stat) => ({
      label: stat.label,
      value: stat.value,
      note: stat.note,
      jade: stat.jade,
    })),
    shipped: dto.shipped.map((item) => ({ ...item, date: item.date ?? "" })),
    building: dto.building.map((item) => ({
      ...item,
      stage: item.stage ?? "",
      eta: item.eta ?? "",
    })),
    planned: dto.planned,
    backlog: dto.backlog,
    topIdeas: dto.topIdeas.map((idea) => ({
      id: idea.id,
      text: idea.text,
      votes: idea.votes,
    })),
    notBuilding: dto.notBuilding,
  };
}

const EMPTY: Omit<RoadmapView, "loading"> = {
  heroStats: [],
  shipped: [],
  building: [],
  planned: [],
  backlog: [],
  topIdeas: [],
  notBuilding: [],
};

/**
 * Data source for the public `/about/roadmap` page — hero stats plus the
 * shipped / building / planned / backlog columns, the top-voted ideas list,
 * and the not-building list. Demo returns the page's own mocks; live calls
 * `GET /roadmap` once (the admin owns the content, this hook is the public
 * read).
 */
export function useRoadmap(): RoadmapView {
  const { demoMode } = useDemoMode();

  const query = useQuery<Omit<RoadmapView, "loading">>({
    queryKey: ["roadmap", demoMode],
    queryFn: async () => (demoMode ? buildDemo() : fromDto(await getRoadmap())),
  });

  if (!query.data) {
    return { ...EMPTY, loading: query.isPending };
  }

  return { ...query.data, loading: false };
}
