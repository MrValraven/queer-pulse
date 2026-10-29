import {
  FiCheckCircle,
  FiClock,
  FiHash,
  FiPauseCircle,
  FiXCircle,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./DirectoryStaffBand.module.css";

/** The safe-space states that are worth a chip. `"none"` (and an absent value)
 *  means the listing has no safe-space history at all, so the band stays quiet
 *  about it. */
export type ReportableSafeSpaceStatus = "verified" | "suspended" | "removed";

const SAFE_SPACE_ICON: Record<ReportableSafeSpaceStatus, typeof FiCheckCircle> =
  {
    verified: FiCheckCircle,
    suspended: FiPauseCircle,
    removed: FiXCircle,
  };

/** The fact chips. Each one renders only when the listing actually carries the
 *  data behind it, so the band states only what the payload can back. */
export function StaffBandChips({
  listingReference,
  safeSpaceStatus,
  safeSpaceTier,
  isBadgeDueForReReview,
}: {
  listingReference: string | null | undefined;
  safeSpaceStatus: ReportableSafeSpaceStatus | null;
  safeSpaceTier: number | null;
  isBadgeDueForReReview: boolean;
}) {
  const { t } = useTranslation();
  const SafeSpaceIcon = safeSpaceStatus
    ? SAFE_SPACE_ICON[safeSpaceStatus]
    : null;
  const hasTier = safeSpaceStatus === "verified" && safeSpaceTier !== null;

  if (!listingReference && !safeSpaceStatus && !isBadgeDueForReReview) {
    return null;
  }

  return (
    <ul className={styles.chips}>
      {listingReference && (
        <li className={styles.chip}>
          <FiHash aria-hidden />
          {t("marketing:directory.detail.staffBand.reference", {
            reference: listingReference,
          })}
        </li>
      )}
      {safeSpaceStatus && SafeSpaceIcon && (
        <li className={styles.chip}>
          <SafeSpaceIcon aria-hidden />
          {hasTier
            ? t("marketing:directory.detail.staffBand.safeSpace.verifiedTier", {
                tier: String(safeSpaceTier),
              })
            : t(
                `marketing:directory.detail.staffBand.safeSpace.${safeSpaceStatus}`,
              )}
        </li>
      )}
      {isBadgeDueForReReview && (
        <li className={`${styles.chip} ${styles.chipDue}`}>
          <FiClock aria-hidden />
          {t("marketing:directory.detail.staffBand.dueForReReview")}
        </li>
      )}
    </ul>
  );
}
