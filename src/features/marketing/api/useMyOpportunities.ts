import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMyOpportunities } from "./volunteering.api";
import { MY_OPPORTUNITIES_DEMO } from "../myOpportunities.data";

/**
 * Opportunities the viewer has posted, with pending/accepted applicant
 * counts — backs the manage-applicants dashboard's opportunity list. Demo
 * mode returns the single designated demo-poster opportunity (see
 * `volunteerDemoPoster.ts`); live mode calls GET /volunteering/mine.
 */
export function useMyOpportunities() {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: ["my-opportunities", demoMode],
    queryFn: async () => {
      if (demoMode) return MY_OPPORTUNITIES_DEMO;
      return getMyOpportunities();
    },
  });
}
