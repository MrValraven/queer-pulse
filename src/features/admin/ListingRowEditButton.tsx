import { FiEdit2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { adminListingEditPath } from "./api/adminListingEdit.api";
import type { ListingQueueRow } from "./api/adminListings.api";
import menuStyles from "./ListingOverflowMenu.module.css";

/**
 * The queue row's "Edit" link into the admin listing editor.
 *
 * The edit route and its PATCH are Admin only, so a moderator without the
 * admin role never sees the link. An owned listing is edited by its owner
 * (the PATCH answers 409 LISTING_HAS_OWNER), so the link also needs an
 * ownerless listing: one with no `submittedBy`. Renders nothing otherwise.
 */
export function ListingRowEditButton({ row }: { row: ListingQueueRow }) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  const isAdmin = demoMode || role === "admin";
  const isOwnerless = !row.detail.submittedBy;
  if (!isAdmin || !isOwnerless) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={menuStyles.primaryAction}
      to={adminListingEditPath(row.ref)}
      aria-label={t("admin:adminListings.row.editAriaLabel", {
        name: row.name,
      })}
    >
      <FiEdit2 aria-hidden />
      {t("admin:adminListings.row.editCta")}
    </Button>
  );
}
