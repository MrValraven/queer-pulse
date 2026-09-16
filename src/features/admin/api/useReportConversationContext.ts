import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { demoReportConversationContext } from "../adminReportConversationContext.data";
import {
  getReportConversationContext,
  type ReportConversationContextDTO,
} from "./moderation.api";

/**
 * PRD-360: the conversation around a message report, fetched ONLY after the
 * moderator asks for it (`isRequested`).
 *
 * Every live fetch writes a `conversation_context_viewed` audit row, so this
 * query never runs on its own: no mount fetch, no window-focus or reconnect
 * refetch, no automatic retry, and `gcTime: 0` so closing the drawer drops the
 * data and the next opening is a new, audited request. A retry is the
 * moderator's own click. Demo mode returns a colocated fixture and never
 * touches the network.
 */
export function useReportConversationContext(
  reportId: string,
  isRequested: boolean,
) {
  const { demoMode } = useDemoMode();
  return useQuery<ReportConversationContextDTO>({
    queryKey: ["mod-report-conversation-context", demoMode, reportId],
    queryFn: () =>
      demoMode
        ? Promise.resolve(demoReportConversationContext(reportId))
        : getReportConversationContext(reportId),
    enabled: isRequested,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}
