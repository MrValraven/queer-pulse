import { useState } from "react";
import { FiCheck, FiSettings } from "react-icons/fi";
import { Button, LoadErrorState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { CommunityRole } from "./membership.types";
import { isCommunityStaff } from "./communityStaff";
import { useCommunityResources } from "./api/useCommunityResources";
import { CommunityResourcesEditor } from "./CommunityResourcesEditor";
import { CommunityResourcesShelf } from "./CommunityResourcesShelf";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityResources.module.css";

/**
 * The About tab's resource shelf, now backed by a real endpoint.
 *
 * The shelf keeps the rule it has always had: a member sees nothing at all
 * when the community has pinned nothing, rather than a heading over an empty
 * frame. Staff are the one exception, and only in live mode, because somebody
 * has to be able to put the first entry on an empty shelf.
 *
 * Demo mode still reads the flagship's fixtures and shows no editor: those
 * rows have no server id, so there is nothing an editor could address.
 */
export function CommunityResourcesSection({
  slug,
  role,
  isMember,
}: {
  slug: string;
  role: CommunityRole | null;
  /** The shelf is a members-only read on the backend, so the query is only
   *  enabled once the viewer is on the roster. */
  isMember: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [isEditing, setIsEditing] = useState(false);
  const shelf = useCommunityResources(slug, { enabled: isMember || demoMode });
  const canEditShelf = !demoMode && isCommunityStaff(role);

  const hasResources = shelf.resources.length > 0;
  // A failed shelf read used to hide the whole section from a member and show
  // staff the "empty shelf" hint, both of which claim the shelf is empty when
  // it never loaded (DES-22).
  if (!hasResources && shelf.isError) {
    return (
      <>
        <div className={styles.head}>
          <div className={detail.secLbl}>
            {t("communities:detail.aboutResources.resources")}
          </div>
        </div>
        <LoadErrorState compact onRetry={shelf.refetch} />
      </>
    );
  }
  if (!hasResources && !canEditShelf) return null;

  return (
    <>
      <div className={styles.head}>
        <div className={detail.secLbl}>
          {t("communities:detail.aboutResources.resources")}
        </div>
        {canEditShelf && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.manageCta}
            aria-pressed={isEditing}
            onClick={() => setIsEditing((editing) => !editing)}
          >
            {isEditing ? <FiCheck aria-hidden /> : <FiSettings aria-hidden />}
            {t(
              isEditing
                ? "communities:detail.resources.doneCta"
                : "communities:detail.resources.manageCta",
            )}
          </Button>
        )}
      </div>

      {isEditing ? (
        <CommunityResourcesEditor
          slug={slug}
          resources={shelf.resources}
          maxResources={shelf.maxResources}
        />
      ) : hasResources ? (
        <CommunityResourcesShelf resources={shelf.resources} />
      ) : (
        // Staff only: the empty shelf they are about to fill.
        <p className={styles.emptyHint}>
          {t("communities:detail.resources.emptyStaffHint")}
        </p>
      )}
    </>
  );
}
