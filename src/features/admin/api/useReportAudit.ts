import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getReportAudit, type AuditEntryDTO } from "./moderation.api";
import { isReportAboutActorError } from "./enforcementTargetError";

/** A demo audit trail for a report — the "report opened" entry every report has. */
function demoAudit(reportId: string): AuditEntryDTO[] {
  return [
    {
      id: `${reportId}-created`,
      reportId,
      actorId: "system",
      actorName: "QueerPulse",
      action: "created",
      at: new Date(Date.now() - 26 * 60_000).toISOString(),
      note: "Report received and assigned to the moderation queue.",
    },
  ];
}

/**
 * The immutable action history for a report (spec 04), shown read-only in the
 * mod drawer so moderators can see the full trail. Demo mode returns a synthetic
 * "opened" entry; live mode fetches `GET /mod/reports/audit?reportId=`.
 */
export function useReportAudit(reportId: string) {
  const { demoMode } = useDemoMode();
  return useQuery<AuditEntryDTO[]>({
    queryKey: ["mod-report-audit", demoMode, reportId],
    queryFn: async () => {
      if (demoMode) return demoAudit(reportId);
      try {
        return await getReportAudit(reportId);
      } catch (error) {
        // SEC-31: the trail of a report about the signed-in staff member is
        // refused with a reason code. The drawer names that reason where the
        // report's context would be (`useModReportDetail`'s `isAboutViewer`)
        // and drops this section, so it settles empty here and raises no
        // second, generic error toast.
        if (isReportAboutActorError(error)) return [];
        throw error;
      }
    },
  });
}
