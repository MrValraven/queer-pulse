import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getUnreadCount } from "./notifications.api";

/**
 * Unread notification count for the nav bell badge.
 *
 * Live mode asks the backend for the count directly (`GET
 * /notifications/unread-count`) rather than counting the fetched feed: the feed
 * is paginated at 20 rows, so deriving the badge from it would under-report the
 * moment someone has more than a page of unread. Demo mode counts the mock
 * list. In live mode the query only resolves once authenticated; until then it
 * stays at 0.
 */
export function useUnreadCount(): number {
  const { demoMode } = useDemoMode();
  const { data } = useQuery<number>({
    queryKey: ["notifications", "unread-count", demoMode],
    queryFn: async () => {
      if (demoMode) {
        // Code-split: the demo mock is only pulled into the bundle in demo mode.
        const { DEMO_UNREAD_IDS } = await import("../notificationsList.data");
        return DEMO_UNREAD_IDS.length;
      }
      return getUnreadCount();
    },
    // The nav bell shouldn't hard-fail the app if the count can't load.
    retry: false,
  });
  return data ?? 0;
}
