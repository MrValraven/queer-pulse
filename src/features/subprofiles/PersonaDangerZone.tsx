import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { LeavePersonaModal } from "./LeavePersonaModal";
import { SubprofileDeleteModal } from "./SubprofileDeleteModal";
import { usePersonaIsCreator } from "./usePersonaCreatorSlug";
import styles from "./SubprofilePublishPanel.module.css";

/**
 * The Publish pane's bottom band: the one irreversible thing this member can do
 * to this persona.
 *
 * Which one that is depends on who they are. `SubprofilesService.remove` is
 * creator-only, so a co-owner who confirmed a delete could only ever collect a
 * generic failure toast. They get Leave here instead, in the place they went
 * looking, with copy that offers the action rather than explaining a
 * permission they don't have.
 *
 * While the members roster is still resolving the band renders nothing, so the
 * wrong destructive action is never shown first and then swapped.
 */
export function PersonaDangerZone({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const isCreator = usePersonaIsCreator(subprofile.id, subprofile.memberCount);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  if (isCreator === undefined) return null;

  if (!isCreator) {
    return (
      <>
        <div className={styles.dangerZone}>
          <p className={styles.dangerCopy}>
            {t("subprofiles:publishPanel.leaveCopy")}
          </p>
          <Button variant="ghost" onClick={() => setLeaving(true)}>
            {t("subprofiles:owners.leaveCta")}
          </Button>
        </div>

        {leaving && (
          <LeavePersonaModal
            subprofileId={subprofile.id}
            onClose={() => setLeaving(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={styles.dangerZone}>
        <p className={styles.dangerCopy}>
          {t("subprofiles:publishPanel.deleteCopy")}
        </p>
        <Button variant="danger" onClick={() => setDeleting(true)}>
          {t("subprofiles:publishPanel.deleteCta")}
        </Button>
      </div>

      {deleting && (
        <SubprofileDeleteModal
          subprofile={subprofile}
          onClose={() => setDeleting(false)}
        />
      )}
    </>
  );
}
