import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button } from "../../shared/components/ui";
import { useModerationQueueHealth } from "./api/useModerationQueueHealth";
import {
  MODERATION_HEALTH_HREF,
  severityPresentation,
} from "./moderationQueueHealth";
import { AdminNotice } from "./ui";
import styles from "./ModerationQueueHealth.module.css";

/**
 * The compact queue-health reading, for the surfaces a moderator already opens
 * (TS-04).
 *
 * SILENT WHEN THERE IS NOTHING TO SAY. It renders only at `warning` or
 * `critical`. A banner that is always present is a banner nobody reads, and an
 * all-clear notice on every page would be exactly the low-grade background
 * pressure this feature exists to remove.
 *
 * The level is carried by the word as well as the tone (amber for warning,
 * red for critical), and the whole thing deep-links into the full panel.
 *
 * `isInStack` is for a page that already spaces its children (a grid with a
 * gap); on its own the notice keeps a gap under it.
 */
export function ModerationHealthIndicator({
  isInStack = false,
}: { isInStack?: boolean } = {}) {
  const { t } = useTranslation();
  const { data } = useModerationQueueHealth();
  const severity = data?.overallSeverity;
  if (!data || (severity !== "warning" && severity !== "critical")) return null;

  const { labelKey } = severityPresentation(severity);
  const breachedCount = data.queues.filter(
    (entry) => entry.severity !== "ok",
  ).length;

  return (
    <div className={isInStack ? undefined : styles.indicator}>
      <AdminNotice
        tone={severity === "critical" ? "error" : "warn"}
        liveRole="status"
        action={
          <Button variant="quiet" size="sm" to={MODERATION_HEALTH_HREF}>
            {t("admin:moderationHealth.indicator.cta")}
          </Button>
        }
      >
        {t(`admin:moderationHealth.indicator.${severity}`, {
          count: breachedCount,
          level: t(labelKey),
        })}
      </AdminNotice>
    </div>
  );
}
