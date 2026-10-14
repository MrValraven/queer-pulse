import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioCreditPendingCount } from "./studioDiscovery.api";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const PENDING_COUNT_STALE_MS = 60_000;

/** The nav badge's number. A failure reads as zero, so the badge stays
 *  folded and nothing toasts. */
export function useStudioCreditPendingCount(): { count: number } {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.creditPendingCount(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : PENDING_COUNT_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () => {
        const dto = demoMode
          ? (
              await import("./studioDemoCreditReads")
            ).demoStudioCreditPendingCount()
          : await getStudioCreditPendingCount();
        return Math.max(0, dto.count);
      }),
  });
  return { count: query.data ?? 0 };
}
