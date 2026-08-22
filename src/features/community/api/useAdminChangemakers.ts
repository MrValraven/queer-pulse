import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createChangemaker,
  deleteChangemaker,
  fetchAdminChangemakers,
  fetchChangemakers,
  publishChangemaker,
  updateChangemaker,
  updateDirectoryStats,
  type ChangemakerDTO,
  type CreateChangemakerBody,
  type UpdateChangemakerBody,
} from "./changemakers.api";

const ADMIN_KEY = ["admin", "changemakers"];
const STATS_KEY = [...ADMIN_KEY, "stats"];
/** Public read roots: the directory list (`useChangemakers`) and a single
 *  story (`useChangemaker`). They sit under different query roots from the
 *  admin console, so an admin write that only touches ADMIN_KEY leaves
 *  `/changemakers` and `/changemaker/:slug` serving stale cache. */
const PUBLIC_LIST_KEY = ["changemakers"];
const PUBLIC_DETAIL_KEY = ["changemaker"];

/** Invalidate the admin console AND every public surface a changemaker write
 *  can change. Called from every admin mutation's `onSuccess`. */
function invalidateChangemakers(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ADMIN_KEY });
  void queryClient.invalidateQueries({ queryKey: PUBLIC_LIST_KEY });
  void queryClient.invalidateQueries({ queryKey: PUBLIC_DETAIL_KEY });
}

export function useAdminChangemakers() {
  const { demoMode } = useDemoMode();
  return useQuery<ChangemakerDTO[]>({
    queryKey: [...ADMIN_KEY, demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { ADMIN_CHANGEMAKERS_DEMO } = await import(
          "../../admin/adminChangemakers.data"
        );
        return ADMIN_CHANGEMAKERS_DEMO;
      }
      return fetchAdminChangemakers();
    },
  });
}

export function useCreateChangemaker() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<ChangemakerDTO | null, Error, CreateChangemakerBody>({
    mutationFn: async (body) => (demoMode ? null : createChangemaker(body)),
    onSuccess: () => invalidateChangemakers(queryClient),
  });
}

export function useUpdateChangemaker() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    ChangemakerDTO | null,
    Error,
    { id: string; body: UpdateChangemakerBody }
  >({
    mutationFn: async ({ id, body }) =>
      demoMode ? null : updateChangemaker(id, body),
    onSuccess: () => invalidateChangemakers(queryClient),
  });
}

export function useDeleteChangemaker() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!demoMode) await deleteChangemaker(id);
    },
    onSuccess: () => invalidateChangemakers(queryClient),
  });
}

export function usePublishChangemaker() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    ChangemakerDTO | null,
    Error,
    { id: string; published: boolean }
  >({
    mutationFn: async ({ id, published }) =>
      demoMode ? null : publishChangemaker(id, published),
    onSuccess: () => invalidateChangemakers(queryClient),
  });
}

/**
 * Current raw values for the two hand-set hero stats (`peopleHelped`,
 * `activeCampaigns`) — the public list endpoint already returns them as
 * numbers, so the admin stats form can pre-fill from the same source rather
 * than starting blank and risking a save that silently zeroes live data.
 */
export function useDirectoryStats() {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: [...STATS_KEY, demoMode],
    queryFn: async () => {
      if (demoMode) return { peopleHelped: 1200, activeCampaigns: 12 };
      const response = await fetchChangemakers();
      return {
        peopleHelped: response.stats.peopleHelped,
        activeCampaigns: response.stats.activeCampaigns,
      };
    },
  });
}

export function useUpdateDirectoryStats() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    Error,
    { peopleHelped: number; activeCampaigns: number }
  >({
    mutationFn: async (body) => (demoMode ? null : updateDirectoryStats(body)),
    onSuccess: () => {
      invalidateChangemakers(queryClient);
      void queryClient.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}
