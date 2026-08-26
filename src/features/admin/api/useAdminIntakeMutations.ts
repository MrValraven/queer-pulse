import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  updateIntakeStatus,
  type AdminIntakeListDTO,
  type AdminIntakeTriageStatus,
} from "./adminIntakes.api";
import { ADMIN_INTAKES_QUERY_KEY } from "./useAdminIntakes";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";

type IntakesData = InfiniteData<AdminIntakeListDTO>;
type CachedEntry = [QueryKey, IntakesData | undefined];

interface TriageContext {
  previous: CachedEntry[];
}

export interface TriageIntakeVars {
  id: string;
  status: AdminIntakeTriageStatus;
}

/**
 * Move one intake row through triage from the console. Dual-mode, mirroring
 * `useAdminConcernMutations`: in demo mode the optimistic cache patch IS the
 * source of truth (no network, no invalidation, so the fixture never goes
 * stale); in live mode it calls `PATCH /intakes/:id` and reconciles by
 * invalidating on settle. Both modes patch the row's status across every cached
 * filter combination optimistically and roll back on error.
 */
export function useAdminIntakeMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchStatus = (id: string, status: AdminIntakeTriageStatus) => {
    queryClient.setQueriesData<IntakesData>(
      { queryKey: ADMIN_INTAKES_QUERY_KEY },
      (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === id ? { ...item, status } : item,
                ),
              })),
            }
          : data,
    );
  };

  const mutation = useMutation<
    AdminIntakeTriageStatus,
    Error,
    TriageIntakeVars,
    TriageContext
  >({
    mutationFn: async ({ id, status }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.intake.triage (demo — no network)", { id, status });
        return status;
      }
      await updateIntakeStatus(id, status);
      return status;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_INTAKES_QUERY_KEY });
      const previous = queryClient.getQueriesData<IntakesData>({
        queryKey: ADMIN_INTAKES_QUERY_KEY,
      });
      patchStatus(id, status);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: ADMIN_INTAKES_QUERY_KEY,
        });
      }
    },
    meta: { silentError: true },
  });

  return { triage: mutation.mutate, pending: mutation.isPending };
}
