import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import type {
  CreateReportInput,
  ReportDTO,
} from "../../safety/api/reports.api";
import { useCreateReport } from "../../safety/api/useCreateReport";
import { useMatchedChat } from "../matchedChatContext";
import { reportMatchedChatMember } from "./messages.api";

/** How long demo mode pretends the round-trip takes, as `useCreateReport`. */
const DEMO_LATENCY_MS = 650;

/**
 * The report mutation `ConversationReportModal` files through. A member
 * report inside a matched Go together chat (PRD-423) names the member by
 * their per-chat key, so it goes to
 * `POST /conversations/:id/members/:memberKey/report`, which resolves the key
 * inside that conversation; every other report keeps `useCreateReport`. The
 * two share one input and result shape, so the modal never branches.
 */
export function useConversationReportMutation(isGroupReport: boolean) {
  const createReport = useCreateReport();
  const matchedChatReport = useReportMatchedChatMember();
  const matchedChat = useMatchedChat();
  return matchedChat && !isGroupReport ? matchedChatReport : createReport;
}

function useReportMatchedChatMember() {
  const { demoMode } = useDemoMode();
  const matchedChat = useMatchedChat();
  return useMutation<ReportDTO, Error, CreateReportInput>({
    // The modal renders its own failure toast, see `useCreateReport`.
    meta: { silentError: true },
    mutationFn: async ({
      subjectId,
      subjectType,
      reasonCode,
      detail,
      anonymous,
      evidence,
    }) => {
      if (demoMode || !matchedChat) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("report.matchedChatMember (demo, offline)", {
          reasonCode,
        });
        return {
          id: `demo-r-${Date.now()}`,
          subjectType,
          subjectId,
          reasonCode,
          severity: "medium",
          status: "open",
          createdAt: new Date().toISOString(),
          acknowledgement: "Report received. A moderator is on it.",
        };
      }
      const filed = await reportMatchedChatMember(
        matchedChat.conversationId,
        subjectId,
        { reasonCode, detail, anonymous, evidence },
      );
      return { ...filed, subjectId };
    },
  });
}
