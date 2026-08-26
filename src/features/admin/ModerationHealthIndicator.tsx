import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useModerationQueueHealth } from "./api/useModerationQueueHealth";
import {
  MODERATION_HEALTH_HREF,
  severityPresentation,
} from "./moderationQueueHealth";
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
 * The level is carried by the word and the glyph as well as the tone, matching
 * `ModerationQueueSeverityChip`, and the whole thing deep-links into the full
 * panel rather than trying to be it.
 */
export function ModerationHealthIndicator() {
  const { t } = useTranslation();
  const { data } = useModerationQueueHealth();
  const severity = data?.overallSeverity;
  if (!data || (severity !== "warning" && severity !== "critical")) return null;

  const { Glyph, labelKey } = severityPresentation(severity);
  const breachedCount = data.queues.filter(
    (entry) => entry.severity !== "ok",
  ).length;

  return (
    <div
      className={[
        styles.indicator,
        severity === "warning" && styles.indicatorWarning,
        severity === "critical" && styles.indicatorCritical,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      <Glyph className={styles.indicatorIcon} aria-hidden />
      <span>
        {t(`admin:moderationHealth.indicator.${severity}`, {
          count: breachedCount,
          level: t(labelKey),
        })}
      </span>
      <Link className={styles.indicatorLink} to={MODERATION_HEALTH_HREF}>
        {t("admin:moderationHealth.indicator.cta")}
      </Link>
    </div>
  );
}
