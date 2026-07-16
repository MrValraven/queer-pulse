import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getNotifications } from "./notifications.api";
import { notificationDtoToView } from "./notifications.adapters";
import { notifications as mockNotifications } from "../notificationsList.data";
import type { Notification } from "../notifications.types";

/**
 * Notification feed source. Demo mode returns the colocated mock list (full
 * fidelity: avatars + action buttons); live mode calls GET /notifications and
 * adapts each row, rendering its text from `type` + `payload` via i18n.
 * `unreadOnly` filters to unread notifications on both paths.
 *
 * `language` is part of the queryKey because the adapted rows carry translated
 * text — switching language must re-render the feed in the new language rather
 * than serve a stale English cache entry.
 */
export function useNotifications(unreadOnly = false) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  return useQuery<Notification[]>({
    queryKey: ["notifications", demoMode, unreadOnly, language],
    queryFn: async () => {
      if (demoMode) {
        return unreadOnly
          ? mockNotifications.filter((n) => n.unread)
          : mockNotifications;
      }
      const res = await getNotifications(unreadOnly);
      return res.map((dto) => notificationDtoToView(dto, t));
    },
  });
}
