import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip } from "./ui";
import type { VerificationSignalsDTO } from "./api/adminVerifications.api";
import styles from "./VerificationRequestDrawer.module.css";

/**
 * Phase 3's anti-fraud signals panel — replaces the Phase-2 placeholder in
 * `VerificationRequestDrawer`'s body. Reads the `VerificationSignalsDTO`
 * snapshot straight off the request detail (no fetch of its own, same as
 * `VerificationHistoryPanel`) and renders one `AdminChip` per signal:
 *
 * - account age — always shown, neutral (`plum`) tone; there's no "bad" age.
 * - prior rejections — `warn` tone once there's at least one; `plum` at zero.
 * - duplicate provider-ref — only rendered when the snapshot flags one, same
 *   `warn` tone as the other "needs a look" signals here and the row chip in
 *   `VerificationRequestRows` (`.chip_warn` is this codebase's shared
 *   "needs attention" semantic — see `adminUi.module.css`). The drawer's
 *   `duplicateBanner` above this panel is what escalates the visual weight
 *   for that signal, not a louder chip colour.
 *
 * `signals` is `null` for a request from before Phase 3 (or any snapshot gap)
 * — rendered as a short empty note rather than an empty chip row.
 */
export function VerificationSignalsPanel({
  signals,
}: {
  signals: VerificationSignalsDTO | null;
}) {
  const { t } = useTranslation();

  if (!signals) {
    return (
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          {t("admin:verifications.requests.drawer.signalsHeading")}
        </h4>
        <p className={styles.signalsEmpty}>
          {t("admin:verifications.requests.drawer.signalsEmpty")}
        </p>
      </div>
    );
  }

  const hasPriorRejections = signals.priorRejections > 0;
  const duplicate = signals.duplicateProviderRef;

  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>
        {t("admin:verifications.requests.drawer.signalsHeading")}
      </h4>
      <div className={styles.signalsChips}>
        <AdminChip tone="plum">
          {t("admin:verifications.requests.drawer.signals.accountAge", {
            days: signals.accountAgeDays,
          })}
        </AdminChip>
        <AdminChip
          tone={hasPriorRejections ? "warn" : "plum"}
          dot={hasPriorRejections}
        >
          {hasPriorRejections
            ? t("admin:verifications.requests.drawer.signals.priorRejections", {
                count: signals.priorRejections,
              })
            : t(
                "admin:verifications.requests.drawer.signals.noPriorRejections",
              )}
        </AdminChip>
        {duplicate && (
          <AdminChip
            tone="warn"
            dot
            title={t(
              "admin:verifications.requests.drawer.signals.duplicateTitle",
            )}
          >
            {t("admin:verifications.requests.drawer.signals.duplicate", {
              count: duplicate.count,
            })}
          </AdminChip>
        )}
      </div>
    </div>
  );
}
