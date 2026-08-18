import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  triageWriterApplication,
  type AdminWriterApplicationsPageDTO,
} from "./adminWriterApplications.api";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";

const WRITER_APPLICATIONS_QUERY_KEY = ["admin-writer-applications"] as const;

type ApplicationsData = InfiniteData<AdminWriterApplicationsPageDTO>;
type CachedEntry = [QueryKey, ApplicationsData | undefined];
interface TriageContext {
  previous: CachedEntry[];
}

export interface TriageWriterApplicationVars {
  id: string;
  status: "approved" | "declined";
  reviewNote?: string;
}

/**
 * Approve/decline a magazine writer application from the admin queue.
 * Dual-mode, mirrors `useAdminConcernMutations`: demo mode's optimistic
 * cache patch is the source of truth (no network); live mode calls
 * `PATCH /admin/magazine-writer-applications/:id` and reconciles on settle.
 */
export function useTriageWriterApplication() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchStatus = (
    id: string,
    status: "approved" | "declined",
    reviewNote: string | null,
  ) => {
    queryClient.setQueriesData<ApplicationsData>(
      { queryKey: WRITER_APPLICATIONS_QUERY_KEY },
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
    TriageWriterApplicationVars,
    TriageContext
  >({
    mutationFn: async ({ id, status, reviewNote }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.writerApplication.triage (demo — no network)", {
          id,
          status,
        });
        return;
      }
      await triageWriterApplication(id, { status, reviewNote });
    },
    onMutate: async ({ id, status, reviewNote }) => {
      await queryClient.cancelQueries({
        queryKey: WRITER_APPLICATIONS_QUERY_KEY,
      });
      const previous = queryClient.getQueriesData<ApplicationsData>({
        queryKey: WRITER_APPLICATIONS_QUERY_KEY,
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
          queryKey: WRITER_APPLICATIONS_QUERY_KEY,
        });
      }
    },
    meta: { silentError: true },
  });

  return { triage: mutation.mutate, pending: mutation.isPending };
}
