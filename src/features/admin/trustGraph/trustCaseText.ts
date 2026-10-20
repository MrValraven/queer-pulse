import type { TrustCase } from "./trustGraphModel";
import type { Translate } from "./trustPathSentence";

const HOURS_PER_DAY = 24;
const MAX_HOURS_SHOWN = 48;

/** B1/B2: how long a ring took to sign up. Under an hour reads "an hour",
 *  under 48 hours reads whole hours, anything longer reads whole days.
 *  Returns "" when the window is unknown. */
export function formatCreationWindow(
  hours: number | null,
  t: Translate,
): string {
  if (hours === null || !Number.isFinite(hours) || hours < 0) return "";
  if (hours < 1) return t("admin:vouchGraph.window.underHour");
  if (hours < MAX_HOURS_SHOWN) {
    return t("admin:vouchGraph.window.hours", { count: Math.ceil(hours) });
  }
  return t("admin:vouchGraph.window.days", {
    count: Math.ceil(hours / HOURS_PER_DAY),
  });
}

/** B1: the one-line reason under a triage row. */
export function describeTrustCase(trustCase: TrustCase, t: Translate): string {
  switch (trustCase.kind) {
    case "ring": {
      const windowText = formatCreationWindow(trustCase.windowHours, t);
      if (!windowText) {
        return t("admin:vouchGraph.triage.reason.ringNoWindow", {
          count: trustCase.memberCount,
        });
      }
      return t("admin:vouchGraph.triage.reason.ring", {
        count: trustCase.memberCount,
        window: windowText,
      });
    }
    case "isolated":
      return t("admin:vouchGraph.triage.reason.isolated", {
        count: trustCase.weakVoucherCount,
      });
    case "flagged":
      return t("admin:vouchGraph.triage.reason.flagged", {
        count: trustCase.openReportCount,
      });
  }
}
