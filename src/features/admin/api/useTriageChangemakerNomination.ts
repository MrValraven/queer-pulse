import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  triageChangemakerNomination,
  type AdminChangemakerNominationListDTO,
} from "./adminChangemakerNominations.api";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";

const CHANGEMAKER_NOMINATIONS_QUERY_KEY = [
  "admin-changemaker-nominations",
] as const;

type NominationsData = InfiniteData<AdminChangemakerNominationListDTO>;
type CachedEntry = [QueryKey, NominationsData | undefined];
interface TriageContext {
  previous: CachedEntry[];
}

export interface TriageChangemakerNominationVars {
  id: string;
  status: "approved" | "dismissed";
  reviewNote?: string;
}

/**
 * Approve/dismiss a Change Makers nomination from the admin queue (COM-17:
 * nominations used to be a one-way black hole). Dual-mode, mirrors
 * `useTriageWriterApplication` exactly: demo mode's optimistic cache patch is
 * the source of truth (no network); live mode calls
 * `PATCH /admin/changemaker-nominations/:id` and reconciles on settle.
 */
export function useTriageChangemakerNomination() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchStatus = (
    id: string,
    status: "approved" | "dismissed",
    reviewNote: string | null,
  ) => {
    queryClient.setQueriesData<NominationsData>(
      { queryKey: CHANGEMAKER_NOMINATIONS_QUERY_KEY },
      (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === id ? { ...item, status, reviewNote } : item,
                ),
              })),
            }
          : data,
    );
  };

  const mutation = useMutation<
    void,
    Error,
    TriageChangemakerNominationVars,
    TriageContext
  >({
    mutationFn: async ({ id, status, reviewNote }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.changemakerNomination.triage (demo — no network)", {
          id,
          status,
        });
        return;
      }
      await triageChangemakerNomination(id, { status, reviewNote });
    },
    onMutate: async ({ id, status, reviewNote }) => {
      await queryClient.cancelQueries({
        queryKey: CHANGEMAKER_NOMINATIONS_QUERY_KEY,
      });
      const previous = queryClient.getQueriesData<NominationsData>({
        queryKey: CHANGEMAKER_NOMINATIONS_QUERY_KEY,
      });
      patchStatus(id, status, reviewNote ?? null);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: CHANGEMAKER_NOMINATIONS_QUERY_KEY,
        });
      }
    },
    meta: { silentError: true },
  });

  return { triage: mutation.mutate, pending: mutation.isPending };
}
