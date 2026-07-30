import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  readDemoRoadmap,
  writeDemoRoadmap,
  type AdminRoadmapHeroStat,
  type AdminRoadmapIdea,
  type AdminRoadmapItem,
} from "../adminRoadmap.data";
import {
  createRoadmapIdea,
  createRoadmapItem,
  deleteRoadmapIdea,
  deleteRoadmapItem,
  getAdminRoadmap,
  updateRoadmapIdea,
  updateRoadmapItem,
  updateRoadmapSettings,
  type RoadmapAdminResponseDTO,
  type RoadmapIdeaUpdateBody,
  type RoadmapItemWriteBody,
} from "./roadmapAdmin.api";

// ── Read ─────────────────────────────────────────────────────────────────────

/** Query key root shared by the read hook and every mutation's invalidation. */
export const ADMIN_ROADMAP_KEY = "admin-roadmap";
/** Public page's query key (`marketing/api/useRoadmap.ts`) — invalidated by
 *  live-mode mutations so `/about/roadmap` reflects admin edits immediately. */
const PUBLIC_ROADMAP_KEY = "roadmap";

export interface AdminRoadmapView {
  items: AdminRoadmapItem[];
  ideas: AdminRoadmapIdea[];
  heroStats: AdminRoadmapHeroStat[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
}

function fromDto(dto: RoadmapAdminResponseDTO): Omit<AdminRoadmapView, "loading"> {
  return { items: dto.items, ideas: dto.ideas, heroStats: dto.heroStats };
}

const EMPTY: Omit<AdminRoadmapView, "loading"> = {
  items: [],
  ideas: [],
  heroStats: [],
};

/**
 * Data source for the admin roadmap tools (`/admin/roadmap`) — every item
 * and idea, published or not, plus the hero-stat chips shown atop the public
 * page. Demo mode reads (and seeds) the localStorage-backed
 * `readDemoRoadmap()` store; live mode calls `GET /roadmap/admin`
 * (admin-only — a non-admin gets a 403).
 */
export function useAdminRoadmap(): AdminRoadmapView {
  const { demoMode } = useDemoMode();

  const query = useQuery<Omit<AdminRoadmapView, "loading">>({
    queryKey: [ADMIN_ROADMAP_KEY, demoMode],
    queryFn: async () =>
      demoMode ? readDemoRoadmap() : fromDto(await getAdminRoadmap()),
  });

  if (!query.data) {
    return { ...EMPTY, loading: query.isPending };
  }
  return { ...query.data, loading: false };
}

// ── Mutations ────────────────────────────────────────────────────────────────
// Every mutation is dual-mode: demo reads the current store, computes the
// next state locally, and writes it back via `writeDemoRoadmap`; live calls
// the matching `/roadmap/admin/*` endpoint. Both branches then invalidate
// `[ADMIN_ROADMAP_KEY, demoMode]` so `useAdminRoadmap` refetches, and live
// additionally invalidates the public page's `["roadmap"]` query, since these
// are the same admin-controlled items/ideas/hero-stats it renders.

function demoItemId(): string {
  return `item-${crypto.randomUUID()}`;
}

function demoIdeaId(): string {
  return `idea-${crypto.randomUUID()}`;
}

export interface UpdateRoadmapItemVars {
  id: string;
  body: Partial<RoadmapItemWriteBody>;
}

export interface UpdateRoadmapIdeaVars {
  id: string;
  body: RoadmapIdeaUpdateBody;
}

/**
 * All admin roadmap write actions, dual-mode. Returns bound `mutate`
 * functions (each still accepts a per-call `{ onSuccess, onError }` like any
 * react-query mutate function) so callers can toast locally, matching the
 * rest of the admin panels (see `AdminOrgTiersPage`).
 */
export function useAdminRoadmapMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({
      queryKey: [ADMIN_ROADMAP_KEY, demoMode],
    });
    if (!demoMode) {
      void queryClient.invalidateQueries({ queryKey: [PUBLIC_ROADMAP_KEY] });
    }
  }

  const createItemMutation = useMutation({
    mutationFn: async (body: RoadmapItemWriteBody) => {
      if (demoMode) {
        const store = readDemoRoadmap();
        const item: AdminRoadmapItem = {
          ...body,
          id: demoItemId(),
          liveVotes: body.votes,
        };
        writeDemoRoadmap({ ...store, items: [...store.items, item] });
        return item;
      }
      return createRoadmapItem(body);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, body }: UpdateRoadmapItemVars) => {
      if (demoMode) {
        const store = readDemoRoadmap();
        const items = store.items.map((item) =>
          item.id === id ? { ...item, ...body } : item,
        );
        writeDemoRoadmap({ ...store, items });
        return items.find((item) => item.id === id);
      }
      return updateRoadmapItem(id, body);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      if (demoMode) {
        const store = readDemoRoadmap();
        writeDemoRoadmap({
          ...store,
          items: store.items.filter((item) => item.id !== id),
        });
        return;
      }
      return deleteRoadmapItem(id);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (text: string) => {
      if (demoMode) {
        const store = readDemoRoadmap();
        const idea: AdminRoadmapIdea = {
          id: demoIdeaId(),
          text,
          status: "published",
          votes: 0,
          liveVotes: 0,
          fromMember: false,
          sortOrder: store.ideas.length,
          createdAt: new Date().toISOString(),
        };
        writeDemoRoadmap({ ...store, ideas: [...store.ideas, idea] });
        return idea;
      }
      return createRoadmapIdea(text);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const updateIdeaMutation = useMutation({
    mutationFn: async ({ id, body }: UpdateRoadmapIdeaVars) => {
      if (demoMode) {
        const store = readDemoRoadmap();
        const ideas = store.ideas.map((idea) =>
          idea.id === id ? { ...idea, ...body } : idea,
        );
        writeDemoRoadmap({ ...store, ideas });
        return ideas.find((idea) => idea.id === id);
      }
      return updateRoadmapIdea(id, body);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      if (demoMode) {
        const store = readDemoRoadmap();
        writeDemoRoadmap({
          ...store,
          ideas: store.ideas.filter((idea) => idea.id !== id),
        });
        return;
      }
      return deleteRoadmapIdea(id);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (heroStats: AdminRoadmapHeroStat[]) => {
      if (demoMode) {
        const store = readDemoRoadmap();
        writeDemoRoadmap({ ...store, heroStats });
        return { heroStats };
      }
      return updateRoadmapSettings(heroStats);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  return {
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    createIdea: createIdeaMutation.mutate,
    updateIdea: updateIdeaMutation.mutate,
    deleteIdea: deleteIdeaMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    pending:
      createItemMutation.isPending ||
      updateItemMutation.isPending ||
      deleteItemMutation.isPending ||
      createIdeaMutation.isPending ||
      updateIdeaMutation.isPending ||
      deleteIdeaMutation.isPending ||
      updateSettingsMutation.isPending,
  };
}
