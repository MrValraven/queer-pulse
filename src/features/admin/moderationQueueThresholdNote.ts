import type { TFunction } from "../../shared/i18n/types";
import type { ModerationQueueThresholdBandDTO } from "./api/moderationHealth.api";

/**
 * The band this figure is measured against next, as a sentence.
 *
 * NEVER A HARD-CODED NUMBER. Every value comes off `entry.thresholds`, which
 * the server sends with the reading it produced, so the policy moves in one
 * backend edit and this line moves with it. Which band is "applicable" depends
 * on where the figure already sits: below the warning level the next thing that
 * happens is a warning, at or above it the next thing is critical, and past
 * critical there is nothing further to trip, so the line says the figure is
 * already past every level.
 */
export function thresholdNote(
  value: number,
  band: ModerationQueueThresholdBandDTO,
  formatNumber: (value: number) => string,
  t: TFunction,
): string {
  if (value >= band.critical) {
    return t("admin:moderationHealth.threshold.pastCritical", {
      value: formatNumber(band.critical),
    });
  }
  if (value >= band.warning) {
    return t("admin:moderationHealth.threshold.criticalAt", {
      value: formatNumber(band.critical),
    });
  }
  return t("admin:moderationHealth.threshold.warnsAt", {
    value: formatNumber(band.warning),
  });
}
