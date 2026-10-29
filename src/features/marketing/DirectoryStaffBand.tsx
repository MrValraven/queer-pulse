import { FiEdit2, FiShield } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useHasStaffRole } from "../auth/api/useMyStaffRoles";
import { adminListingEditPath } from "../admin/api/adminListingEdit.api";
import type { DirectoryPlace } from "./directoryPlaces";
import {
  StaffBandChips,
  type ReportableSafeSpaceStatus,
} from "./DirectoryStaffBandChips";
import { DirectoryVisitorViewToggle } from "./DirectoryVisitorViewToggle";
import styles from "./DirectoryStaffBand.module.css";

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
 * is keyed by, what the safe-space badge currently says, the two consoles
 * that can act on either, and (for admins on an ownerless listing) a direct
 * link to the listing editor.
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
  onEnterVisitorView,
}: {
  place: DirectoryPlace;
  preview?: boolean;
  /** Switches the page to the visitor's view. The first action in the band. */
  onEnterVisitorView: () => void;
}) {
  if (preview) return null;
  return (
    <StaffBandForModerators
      place={place}
      onEnterVisitorView={onEnterVisitorView}
    />
  );
}

function StaffBandForModerators({
  place,
  onEnterVisitorView,
}: {
  place: DirectoryPlace;
  onEnterVisitorView: () => void;
}) {
  const { t } = useTranslation();
  const isDirectoryModerator = useHasStaffRole("directory_moderator");
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  if (!isDirectoryModerator) return null;

  const listingReference = place.ref;
  const safeSpaceStatus = reportableSafeSpaceStatus(place);
  const isBadgeDueForReReview = place.isBadgeDueForReReview === true;
  // The edit route and its PATCH are Admin only, so a moderator without the
  // admin role never sees the link. An owned listing is edited by its owner
  // (the PATCH answers 409 LISTING_HAS_OWNER), so the link needs an ownerless
  // listing too.
  const isAdmin = demoMode || role === "admin";
  const isEditableByAdmin = isAdmin && place.isUnclaimed === true;

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
          <DirectoryVisitorViewToggle
            tone="dark"
            onEnterVisitorView={onEnterVisitorView}
          />
          {isEditableByAdmin && listingReference && (
            <Button
              variant="ghost-dark"
              size="sm"
              to={adminListingEditPath(listingReference)}
            >
              <FiEdit2 aria-hidden />
              {t("marketing:directory.detail.staffBand.editListing")}
            </Button>
          )}
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
