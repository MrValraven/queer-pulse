import {
  FiCheckCircle,
  FiClock,
  FiHash,
  FiPauseCircle,
  FiShield,
  FiXCircle,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useHasStaffRole } from "../auth/api/useMyStaffRoles";
import type { DirectoryPlace } from "./directoryPlaces";
import styles from "./DirectoryStaffBand.module.css";

/** The safe-space states that are worth a chip. `"none"` (and an absent value)
 *  means the listing has no safe-space history at all, so the band stays quiet
 *  about it. */
type ReportableSafeSpaceStatus = "verified" | "suspended" | "removed";

const SAFE_SPACE_ICON: Record<ReportableSafeSpaceStatus, typeof FiCheckCircle> =
  {
    verified: FiCheckCircle,
    suspended: FiPauseCircle,
    removed: FiXCircle,
  };

/** One band per page, so a fixed id is safe. The landmark is named by its own
 *  visible label, which keeps the accessible name and the copy in sync. */
const LABEL_ID = "directory-staff-band-label";

function reportableSafeSpaceStatus(
  place: DirectoryPlace,
): ReportableSafeSpaceStatus | null {
  const status = place.safeSpaceStatus;
  if (status === undefined || status === "none") return null;
  return status;
}

/**
 * Moderator chrome for a public listing page: the reference a moderation call
 * is keyed by, what the safe-space badge currently says, and the two consoles
 * that can act on either.
 *
 * It is deliberately absent inside the admin moderation drawer. That drawer IS
 * the moderator surface, so a band there would point at the console its reader
 * is already standing in.
 *
 * Demo mode grants every staff role (see `useMyStaffRoles`), so every demo
 * visitor sees this band. That is intended: the sandbox is meant to show the
 * gated surfaces.
 */
export function DirectoryStaffBand({
  place,
  preview,
}: {
  place: DirectoryPlace;
  preview?: boolean;
}) {
  if (preview) return null;
  return <StaffBandForModerators place={place} />;
}

function StaffBandForModerators({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const isDirectoryModerator = useHasStaffRole("directory_moderator");
  if (!isDirectoryModerator) return null;

  const listingReference = place.ref;
  const safeSpaceStatus = reportableSafeSpaceStatus(place);
  const isBadgeDueForReReview = place.isBadgeDueForReReview === true;

  return (
    <section className={styles.band} aria-labelledby={LABEL_ID}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.label} id={LABEL_ID}>
            <FiShield className={styles.labelIcon} aria-hidden />
            {t("marketing:directory.detail.staffBand.label")}
          </span>
          <StaffBandChips
            listingReference={listingReference}
            safeSpaceStatus={safeSpaceStatus}
            safeSpaceTier={place.safeSpaceTier ?? null}
            isBadgeDueForReReview={isBadgeDueForReReview}
          />
        </div>

        <div className={styles.actions}>
          {listingReference && (
            <Button
              variant="ghost-dark"
              size="sm"
              to={`${routes.adminListings}?q=${encodeURIComponent(listingReference)}`}
            >
              {t("marketing:directory.detail.staffBand.openInQueue")}
            </Button>
          )}
          {safeSpaceStatus && (
            <Button variant="ghost-dark" size="sm" to={routes.adminSafeSpaces}>
              {t("marketing:directory.detail.staffBand.safeSpaceReview")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

/** The fact chips. Each one renders only when the listing actually carries the
 *  data behind it, so the band states only what the payload can back. */
function StaffBandChips({
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
