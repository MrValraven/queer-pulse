import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  reopenAdminMagazineSubmission,
  type AdminMagazineSubmissionListDTO,
} from "./adminMagazineSubmissions.api";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";

const MAGAZINE_SUBMISSIONS_QUERY_KEY = ["admin-magazine-submissions"] as const;

type SubmissionsData = InfiniteData<AdminMagazineSubmissionListDTO>;
type CachedEntry = [QueryKey, SubmissionsData | undefined];
interface ReopenContext {
  previous: CachedEntry[];
}

/**
 * Take a decline back on a reader story submission, putting it in the queue
 * again. Dual-mode and shaped exactly like `useDecideMagazineSubmission`: demo
 * mode's optimistic cache patch is the source of truth (no network); live mode
 * calls `POST /admin/magazine-submissions/:id/reopen` and reconciles on settle.
 *
 * The optimistic patch mirrors what the backend writes: the decision, its note
 * and its timestamp are cleared and the status goes back to `submitted`,
 * because clearing them is the only shape the queue shows again. The reopen
 * stamp goes up alongside, so the row still says the decline was taken back
 * rather than looking like one nobody ever decided. `reopenedBy` is left as it
 * was until the server answers: the browser knows the reopen happened, and it
 * does not know the acting admin's display name.
 *
 * `onSuccess` is where the caller closes its confirm dialog, so a failure
 * leaves the dialog open with the row untouched.
 */
export function useReopenMagazineSubmission() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchReopen = (id: string) => {
    const reopenedAt = new Date().toISOString();
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
                        status: "submitted" as const,
                        decision: null,
                        decisionNote: null,
                        decidedAt: null,
                        reopenedAt,
                        reopenCount: item.reopenCount + 1,
                      }
                    : item,
                ),
              })),
            }
          : data,
    );
  };

  const mutation = useMutation<void, Error, string, ReopenContext>({
    mutationFn: async (id) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.magazineSubmission.reopen (demo — no network)", { id });
        return;
      }
      await reopenAdminMagazineSubmission(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: MAGAZINE_SUBMISSIONS_QUERY_KEY,
      });
      const previous = queryClient.getQueriesData<SubmissionsData>({
        queryKey: MAGAZINE_SUBMISSIONS_QUERY_KEY,
      });
      patchReopen(id);
      return { previous };
    },
    onError: (_error, _id, context) => {
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

  return { reopen: mutation.mutate, pending: mutation.isPending };
}
