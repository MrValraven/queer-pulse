import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { markNotificationRead } from "./notifications.api";

/**
 * Mark a single notification read. Demo mode is a no-op (the NotificationsPage
 * tracks read state locally); live mode POSTs /notifications/:id/read and then
 * refreshes every cached notifications view (feed + bell badge).
 */
export function useMarkNotificationRead() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, number | string>({
    mutationFn: async (id) => {
      if (demoMode) return;
      await markNotificationRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
