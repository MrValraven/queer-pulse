import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  getBanEvasionForJoinRequests,
  type BanEvasionAssessmentDTO,
} from "./api/adminInvites.api";

/**
 * Ban-evasion assessments for a batch of join requests, as a Map the invite
 * review queue can hand out row by row. One request covers the whole page in
 * either mode: demo reads the colocated fixture, live calls
 * `GET /admin/ban-evasion/join-requests`.
 *
 * Lives beside `AdminBanEvasionFlag` rather than inside it so that file stays a
 * component module (the react-refresh rule wants one or the other).
 *
 * Read-only and advisory. Nothing here decides anything: the queue shows the
 * tier and the reasons, and the reviewer makes the call.
 */
export function useBanEvasionAssessments(
  joinRequestIds: string[],
): Map<string, BanEvasionAssessmentDTO> {
  const { demoMode } = useDemoMode();
  // Sorted so a re-render that reorders the queue does not refetch.
  const stableIds = [...joinRequestIds].sort();
  const { data } = useQuery<BanEvasionAssessmentDTO[]>({
    queryKey: ["ban-evasion", "join-requests", demoMode, stableIds.join(",")],
    enabled: stableIds.length > 0,
    queryFn: async () => {
      if (demoMode) {
        const { BAN_EVASION_ASSESSMENTS } =
          await import("./AdminBanEvasionFlag.data");
        return stableIds
          .map((id) => BAN_EVASION_ASSESSMENTS[id])
          .filter((row): row is BanEvasionAssessmentDTO => !!row);
      }
      return getBanEvasionForJoinRequests(stableIds);
    },
  });

  return new Map((data ?? []).map((row) => [row.subjectId, row]));
}
