import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { dismissNotification } from "./notifications.api";

/**
 * Clear one notification for good (PRD-224). Demo mode is a no-op (the
 * NotificationsPage drops the row locally); live mode DELETEs
 * /notifications/:id so the row is gone on every device, then refreshes every
 * cached notifications view (feed + bell badge).
 *
 * Same `onSettled` invalidation as the two read mutations beside it, for the
 * same reason: a FAILED write must refetch too, so a row that is still there
 * comes back from the server rather than staying hidden by an optimistic local
 * removal that never happened.
 */
export function useDismissNotification() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, number | string>({
    mutationFn: async (id) => {
      if (demoMode) return;
      await dismissNotification(id);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
