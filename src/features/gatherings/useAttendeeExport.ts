import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { getAttendeesCsv } from "./api/events.api";
import { downloadBlob } from "../../shared/lib/downloadBlob";
import { useEventHostScope } from "./eventHostScope";

/**
 * The Attendees tab's CSV export (PRD-190). Live mode downloads the real
 * roster. Demo has no roster behind it, so it shows a toast and keeps the
 * mock guest list off the host's disk.
 */
export function useAttendeeExport(slug: string) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { apiTarget } = useEventHostScope();
  const [isExporting, setIsExporting] = useState(false);
  const exportAttendees = async () => {
    if (demoMode) {
      showToast(t("gatherings:manage.attendees.exportDemoToast"), "info");
      return;
    }
    setIsExporting(true);
    try {
      const csv = await getAttendeesCsv(slug, apiTarget);
      downloadBlob(`${slug}-attendees.csv`, csv, "text/csv;charset=utf-8;");
      showToast(t("gatherings:manage.attendees.exportedToast"), "success");
    } catch {
      showToast(t("gatherings:manage.attendees.exportFailedToast"), "error");
    } finally {
      setIsExporting(false);
    }
  };
  return { isExporting, exportAttendees };
}
