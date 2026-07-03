import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getNotifications } from "./notifications.api";
import { notificationDtoToView } from "./notifications.adapters";
import { notifications as mockNotifications } from "../notificationsList.data";
import type { Notification } from "../notifications.types";

/**
 * Unread notification count for the nav bell badge. Kept cheap by sharing the
 * exact same cache entry as `useNotifications()` — identical queryKey AND
 * queryFn — and deriving the count with `select`, so mounting it in the nav
 * reuses the already-fetched feed instead of firing a second request. Demo mode
 * counts the mock list; live mode counts the fetched feed. In live mode the
 * query only resolves once authenticated; until then it stays at 0.
 */
export function useUnreadCount(): number {
  const { demoMode } = useDemoMode();
  const { data } = useQuery<Notification[], Error, number>({
    queryKey: ["notifications", demoMode, false],
    queryFn: async () => {
      if (demoMode) return mockNotifications;
      const res = await getNotifications(false);
      return res.map(notificationDtoToView);
    },
    select: (list) => list.filter((n) => n.unread).length,
    // The nav bell shouldn't hard-fail the app if the feed can't load.
    retry: false,
  });
  return data ?? 0;
}
