import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getNotifications } from "./notifications.api";
import { notificationDtoToView } from "./notifications.adapters";
import { notifications as mockNotifications } from "../notificationsList.data";
import type { Notification } from "../notifications.types";

/**
 * Notification feed source. Demo mode returns the colocated mock list (full
 * fidelity: avatars + action buttons); live mode calls GET /notifications and
 * adapts each row. `unreadOnly` filters to unread notifications on both paths.
 */
export function useNotifications(unreadOnly = false) {
  const { demoMode } = useDemoMode();
  return useQuery<Notification[]>({
    queryKey: ["notifications", demoMode, unreadOnly],
    queryFn: async () => {
      if (demoMode) {
        return unreadOnly
          ? mockNotifications.filter((n) => n.unread)
          : mockNotifications;
      }
      const res = await getNotifications(unreadOnly);
      return res.map(notificationDtoToView);
    },
  });
}
