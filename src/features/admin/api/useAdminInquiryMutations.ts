import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  updateInquiryStatus,
  type AdminInquiryListDTO,
  type InquiryStatus,
} from "./adminInquiries.api";
import { ADMIN_INQUIRIES_QUERY_KEY } from "./useAdminInquiries";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";

type InquiriesData = InfiniteData<AdminInquiryListDTO>;
type CachedEntry = [QueryKey, InquiriesData | undefined];

interface HandleContext {
  previous: CachedEntry[];
}

export interface HandleInquiryVars {
  id: string;
  status: InquiryStatus;
}

/**
 * Flip one inquiry between waiting and handled. Dual-mode like every other
 * admin queue: demo patches the cache and stops there, live calls
 * `PATCH /inquiries/:id` and invalidates on settle.
 *
 * "Handled" only ever means a human read it. QueerPulse sends no email, so
 * nothing here reaches the sender.
 *
 * The optimistic patch also nudges `unhandledCount`, because that number is the
 * nav-facing badge and demo mode never invalidates: without the nudge, marking a
 * message handled in the sandbox would leave the count frozen.
 */
export function useAdminInquiryMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchStatus = (id: string, status: InquiryStatus) => {
    queryClient.setQueriesData<InquiriesData>(
      { queryKey: ADMIN_INQUIRIES_QUERY_KEY },
      (data) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => {
            const wasWaiting = page.items.some(
              (item) => item.id === id && item.status !== status,
            );
            const delta = wasWaiting ? (status === "handled" ? -1 : 1) : 0;
            return {
              ...page,
              unhandledCount: Math.max(0, page.unhandledCount + delta),
              items: page.items.map((item) =>
                item.id === id ? { ...item, status } : item,
              ),
            };
          }),
        };
      },
    );
  };

  const mutation = useMutation<
    InquiryStatus,
    Error,
    HandleInquiryVars,
    HandleContext
  >({
    mutationFn: async ({ id, status }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.inquiry.status (demo — no network)", { id, status });
        return status;
      }
      await updateInquiryStatus(id, status);
      return status;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_INQUIRIES_QUERY_KEY });
      const previous = queryClient.getQueriesData<InquiriesData>({
        queryKey: ADMIN_INQUIRIES_QUERY_KEY,
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
          queryKey: ADMIN_INQUIRIES_QUERY_KEY,
        });
      }
    },
    meta: { silentError: true },
  });

  return { setStatus: mutation.mutate, pending: mutation.isPending };
}
