import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMyPartnerApplications } from "./partnerApplicationMine.api";
import type { MyPartnerApplicationDTO } from "./partnerApplicationMine.api";

export type { MyPartnerApplicationDTO } from "./partnerApplicationMine.api";

/**
 * The signed-in member's own partner applications and where each one stands
 * (PRD-37).
 *
 * This is the durable half of closing the loop an organisation was left in:
 * approving or rejecting an application now reaches them as a notification,
 * and this is the page that still has the answer after the bell is cleared.
 * The member's submissions index consumes it.
 *
 * The query is NOT collapsed into an empty state on failure. Callers must
 * branch on `isError` and render the shared `LoadErrorState` panel wired to
 * `refetch`, because "we could not reach the server" and "you have never
 * applied" are opposite answers and an applicant reading the second when the
 * first is true would conclude their application was lost.
 *
 * `enabled` is here for surfaces that render before sign-in is settled:
 * GET /partner-applications/mine sits behind `ActiveMemberGuard` and 401s for
 * a signed-out visitor.
 */
export function useMyPartnerApplications(options: { enabled?: boolean } = {}) {
  const { demoMode } = useDemoMode();
  return useQuery<MyPartnerApplicationDTO[]>({
    queryKey: ["my-partner-applications", demoMode],
    enabled: options.enabled ?? true,
    queryFn: async () => {
      if (demoMode) {
        const { MY_PARTNER_APPLICATIONS_DEMO } =
          await import("./partnerApplicationMine.mock.data");
        return MY_PARTNER_APPLICATIONS_DEMO;
      }
      return getMyPartnerApplications();
    },
  });
}
