import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { sampleJoinRequests } from "../../auth/api/joinRequest.api";
import { dtoToView, type JoinRequestView } from "./useJoinRequests";

/**
 * A random sample of past-reviewed join requests, for a second admin to
 * re-look at as a periodic quality-sampling pass (guideline audit P8). Demo
 * mode reuses the colocated mock queue's approved/declined rows — there's no
 * separate sample fixture, since "random N of the same pool" needs no
 * distinct data to demonstrate the page.
 */
export function useJoinRequestSample(n = 10) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  return useQuery<JoinRequestView[]>({
    queryKey: ["join-requests-sample", demoMode, n, language],
    queryFn: async () => {
      if (demoMode) {
        const { JOIN_REQUESTS } = await import("./joinRequests.data");
        return JOIN_REQUESTS.filter(
          (row) => row.status !== "pending" && row.status !== "waitlisted",
        )
          .slice(0, n)
          .map((row) => dtoToView(row, t, language));
      }
      const rows = await sampleJoinRequests(n);
      return rows.map((row) => dtoToView(row, t, language));
    },
  });
}
