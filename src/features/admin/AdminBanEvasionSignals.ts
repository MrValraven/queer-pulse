import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { getBanEvasionForUser } from "./api/adminBanEvasion.api";
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

/**
 * The ban-evasion assessment for ONE account already on the platform, for the
 * member drawer. The per-user twin of `useBanEvasionAssessments` above: demo
 * reads the colocated fixture, live calls `GET /admin/ban-evasion/users/:id`.
 *
 * FETCHED ON DEMAND, never on every member view. `isEnabled` stays false until
 * a staff member explicitly asks for the check, because this is a
 * privacy-sensitive correlation against removed accounts and it should be run
 * when someone has a reason to ask, rather than compiled silently for every
 * member a moderator happens to open.
 *
 * Returns the whole query, `isError` included, because the caller MUST be able
 * to tell "checked, nothing matched" from "the check did not run". Collapsing a
 * failed fetch into a clear result would tell a moderator that a known evader
 * is clean.
 */
export function useBanEvasionAssessmentForUser(
  userId: string | undefined,
  isEnabled: boolean,
) {
  const { demoMode } = useDemoMode();
  return useQuery<BanEvasionAssessmentDTO>({
    queryKey: ["ban-evasion", "user", demoMode, userId],
    enabled: isEnabled && !!userId,
    // A signal about removed accounts changes only when someone is banned, and
    // staff re-open the same drawer while working a case. Never retried
    // silently on failure: a failed check has to reach the reviewer as a
    // failure.
    retry: false,
    queryFn: async () => {
      const subjectId = userId as string;
      if (demoMode) {
        const { BAN_EVASION_USER_ASSESSMENTS, clearBanEvasionAssessment } =
          await import("./AdminBanEvasionFlag.data");
        return (
          BAN_EVASION_USER_ASSESSMENTS[subjectId] ??
          clearBanEvasionAssessment(subjectId)
        );
      }
      return getBanEvasionForUser(subjectId);
    },
  });
}
