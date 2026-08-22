import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { markAllNotificationsRead } from "./notifications.api";

/**
 * Mark every notification read. Demo mode is a no-op (the NotificationsPage
 * flips all rows to read locally); live mode POSTs /notifications/read-all and
 * then refreshes every cached notifications view (feed + bell badge).
 */
export function useMarkAllRead() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (demoMode) return;
      await markAllNotificationsRead();
    },
    // Settled, not success: a FAILED write must refetch too, so the feed and
    // the bell badge come back from the server as the truth rather than
    // leaving the page's optimistic local read state standing.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
