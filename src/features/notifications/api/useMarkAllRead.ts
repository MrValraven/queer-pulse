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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
