import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getNotifications } from "./notifications.api";
import { notificationDtoToView } from "./notifications.adapters";
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
  const fmt = useFormat();
  return useQuery<Notification[]>({
    queryKey: ["notifications", demoMode, unreadOnly, language],
    queryFn: async () => {
      if (demoMode) {
        // Code-split: the demo mock is only pulled into the bundle in demo mode.
        const { buildNotifications } = await import("../notificationsList.data");
        const list = buildNotifications(t, fmt);
        return unreadOnly ? list.filter((n) => n.unread) : list;
      }
      const res = await getNotifications(unreadOnly);
      return res.map((dto) => notificationDtoToView(dto, t, fmt));
    },
  });
}
