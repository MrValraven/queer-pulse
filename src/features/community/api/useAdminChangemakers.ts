import {
  useMutation,
  useQuery,
  useQueryClient,
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
import { ADMIN_CHANGEMAKERS_DEMO } from "../../admin/adminChangemakers.data";

const ADMIN_KEY = ["admin", "changemakers"];
const STATS_KEY = [...ADMIN_KEY, "stats"];

export function useAdminChangemakers() {
  const { demoMode } = useDemoMode();
  return useQuery<ChangemakerDTO[]>({
    queryKey: [...ADMIN_KEY, demoMode],
    queryFn: async () => {
      if (demoMode) return ADMIN_CHANGEMAKERS_DEMO;
      return fetchAdminChangemakers();
    },
  });
}

export function useCreateChangemaker() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<ChangemakerDTO | null, Error, CreateChangemakerBody>({
    mutationFn: async (body) => (demoMode ? null : createChangemaker(body)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEY }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEY }),
  });
}

export function useDeleteChangemaker() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!demoMode) await deleteChangemaker(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEY }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEY }),
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
      queryClient.invalidateQueries({ queryKey: ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}
