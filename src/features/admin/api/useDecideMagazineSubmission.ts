import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  decideAdminMagazineSubmission,
  type AdminMagazineSubmissionListDTO,
  type MagazineSubmissionDecision,
  type MagazineSubmissionStatus,
} from "./adminMagazineSubmissions.api";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";

const MAGAZINE_SUBMISSIONS_QUERY_KEY = ["admin-magazine-submissions"] as const;

type SubmissionsData = InfiniteData<AdminMagazineSubmissionListDTO>;
type CachedEntry = [QueryKey, SubmissionsData | undefined];
interface DecideContext {
  previous: CachedEntry[];
}

/** The status each decision lands the row on, mirroring the backend's
 *  `STATUS_FOR_DECISION` so the optimistic patch matches what commits. */
const STATUS_FOR_DECISION: Record<
  MagazineSubmissionDecision,
  MagazineSubmissionStatus
> = {
  accepted: "accepted",
  declined: "rejected",
  commissioned: "accepted",
};

export interface DecideMagazineSubmissionVars {
  id: string;
  decision: MagazineSubmissionDecision;
  replyNote?: string;
}

/**
 * Accept, decline, or commission a reader story submission from the admin
 * queue. Dual-mode, mirrors `useTriageWriterApplication`: demo mode's
 * optimistic cache patch is the source of truth (no network); live mode calls
 * `PATCH /admin/magazine-submissions/:id` and reconciles on settle.
 */
export function useDecideMagazineSubmission() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchDecision = (
    id: string,
    decision: MagazineSubmissionDecision,
    decisionNote: string | null,
  ) => {
    queryClient.setQueriesData<SubmissionsData>(
      { queryKey: MAGAZINE_SUBMISSIONS_QUERY_KEY },
      (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        decision,
                        decisionNote,
                        status: STATUS_FOR_DECISION[decision],
                        decidedAt: new Date().toISOString(),
                      }
                    : item,
                ),
              })),
            }
          : data,
    );
  };

  const mutation = useMutation<
    void,
    Error,
    DecideMagazineSubmissionVars,
    DecideContext
  >({
    mutationFn: async ({ id, decision, replyNote }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.magazineSubmission.decide (demo — no network)", {
          id,
          decision,
        });
        return;
      }
      await decideAdminMagazineSubmission(id, { decision, replyNote });
    },
    onMutate: async ({ id, decision, replyNote }) => {
      await queryClient.cancelQueries({
        queryKey: MAGAZINE_SUBMISSIONS_QUERY_KEY,
      });
      const previous = queryClient.getQueriesData<SubmissionsData>({
        queryKey: MAGAZINE_SUBMISSIONS_QUERY_KEY,
      });
      patchDecision(id, decision, replyNote ?? null);
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
          queryKey: MAGAZINE_SUBMISSIONS_QUERY_KEY,
        });
      }
    },
    meta: { silentError: true },
  });

  return { decide: mutation.mutate, pending: mutation.isPending };
}
