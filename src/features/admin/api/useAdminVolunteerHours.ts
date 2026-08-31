import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { periodFrom, type VolunteerHoursPeriod } from "../volunteerHoursPeriod";
import {
  getAdminVolunteerHours,
  type AdminVolunteerHoursDTO,
} from "./adminVolunteerHours.api";

/**
 * The confirmed volunteer-hours report for one period (SUS-05).
 *
 * Demo mode reads the colocated fixture and narrows it to the period locally,
 * so the control still does something with no backend; live mode calls
 * `GET /admin/volunteering/hours`, where the narrowing is the query itself.
 * Neither path reads the mock persona registry: there is no person in this
 * report to read.
 */
export function useAdminVolunteerHours(period: VolunteerHoursPeriod) {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminVolunteerHoursDTO>({
    queryKey: ["admin-volunteer-hours", demoMode, period],
    queryFn: async () => {
      if (demoMode) {
        const { adminVolunteerHoursDemo } =
          await import("../adminVolunteerHours.data");
        return adminVolunteerHoursDemo(period);
      }
      const from = periodFrom(period);
      return getAdminVolunteerHours(from ? { from } : {});
    },
  });
  return {
    report: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
