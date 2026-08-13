import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  updateConcernStatus,
  type AdminConcernListDTO,
  type ConcernTriageStatus,
} from "./adminConcerns.api";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";

/** Shared prefix for every `useAdminConcerns` infinite query (the full key also
 *  carries `demoMode` + the active filter). Patched/invalidated on a triage so
 *  the row's status updates across every filter tab at once. */
const CONCERNS_QUERY_KEY = ["admin-concerns"] as const;

type ConcernsData = InfiniteData<AdminConcernListDTO>;
type CachedEntry = [QueryKey, ConcernsData | undefined];
interface TriageContext {
  previous: CachedEntry[];
}

export interface TriageConcernVars {
  id: string;
  status: ConcernTriageStatus;
}

/**
 * Move a governance concern through triage (reviewing / resolved / dismissed)
 * from the admin dashboard. Dual-mode: in demo mode the optimistic cache patch
 * IS the source of truth (no network, no invalidation — the fixture never goes
 * stale); in live mode it calls `PATCH /intakes/:id` and reconciles by
 * invalidating on settle. Both modes patch the row's `status` across every
 * cached filter tab optimistically and roll back on error.
 */
export function useAdminConcernMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchStatus = (id: string, status: ConcernTriageStatus) => {
    queryClient.setQueriesData<ConcernsData>(
      { queryKey: CONCERNS_QUERY_KEY },
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
    ConcernTriageStatus,
    Error,
    TriageConcernVars,
    TriageContext
  >({
    mutationFn: async ({ id, status }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.concern.triage (demo — no network)", { id, status });
        return status;
      }
      await updateConcernStatus(id, status);
      return status;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: CONCERNS_QUERY_KEY });
      const previous = queryClient.getQueriesData<ConcernsData>({
        queryKey: CONCERNS_QUERY_KEY,
      });
      patchStatus(id, status);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: CONCERNS_QUERY_KEY });
      }
    },
    meta: { silentError: true },
  });

  return { triage: mutation.mutate, pending: mutation.isPending };
}
