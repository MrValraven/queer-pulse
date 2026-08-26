import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { MODERATION_QUEUE_HEALTH_DEMO } from "../moderationQueueHealth.data";
import {
  getModerationQueueHealth,
  type ModerationQueueHealthDTO,
} from "./moderationHealth.api";

export const MODERATION_QUEUE_HEALTH_KEY = "admin-moderation-queue-health";

/**
 * Moderator workload across every queue (TS-04). Demo mode returns the
 * colocated fixture and never reaches the network; live mode calls the
 * moderator-readable `GET /admin/moderation/queue-health`.
 *
 * The server computes this live on every call, so a stale reading is worse than
 * a slightly costly one: `staleTime` is short and the panel refetches when the
 * tab regains focus. A moderator opening the console after lunch is asking what
 * is waiting NOW.
 */
export function useModerationQueueHealth() {
  const { demoMode } = useDemoMode();
  return useQuery<ModerationQueueHealthDTO>({
    queryKey: [MODERATION_QUEUE_HEALTH_KEY, demoMode],
    queryFn: () =>
      demoMode
        ? Promise.resolve(MODERATION_QUEUE_HEALTH_DEMO)
        : getModerationQueueHealth(),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
