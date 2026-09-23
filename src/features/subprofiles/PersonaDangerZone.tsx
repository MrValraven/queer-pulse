import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { LeavePersonaModal } from "./LeavePersonaModal";
import { SubprofileDeleteModal } from "./SubprofileDeleteModal";
import { usePersonaIsCreator } from "./usePersonaCreatorSlug";
import styles from "./SubprofilePublishPanel.module.css";

/**
 * The Publish pane's bottom band: the irreversible thing (or things) this
 * member can do to this persona.
 *
 * Which action that is depends on who they are. `SubprofilesService.remove` is
 * creator-only, so a co-owner who confirmed a delete could only ever collect a
 * generic failure toast. They get Leave here instead, in the place they went
 * looking, with copy that offers the action rather than explaining a
 * permission they don't have.
 *
 * A creator of a SHARED persona (other members present) sees both: Delete,
 * and Leave. Leaving no longer strands the persona, the backend transfers
 * creator status to the longest-standing remaining co-owner, so it's as real
 * a choice for the creator as it already was for a co-owner.
 * `creatorLeaveCopy` below and `LeavePersonaModal`'s own body say what the
 * successor can then do with the persona, without naming who that will be
 * (the frontend can't tell an active co-owner from a suspended one, and the
 * backend prefers an active successor when it picks).
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
  const isShared = subprofile.memberCount > 1;
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  if (isCreator === undefined) return null;

  return (
    <>
      {!isCreator && (
        <div className={styles.dangerZone}>
          <p className={styles.dangerCopy}>
            {t("subprofiles:publishPanel.leaveCopy")}
          </p>
          <Button variant="ghost" onClick={() => setLeaving(true)}>
            {t("subprofiles:owners.leaveCta")}
          </Button>
        </div>
      )}

      {isCreator && (
        <div className={styles.dangerZone}>
          <p className={styles.dangerCopy}>
            {t("subprofiles:publishPanel.deleteCopy")}
          </p>
          <Button variant="danger" onClick={() => setDeleting(true)}>
            {t("subprofiles:publishPanel.deleteCta")}
          </Button>
        </div>
      )}

      {isCreator && isShared && (
        // Its own row (not appended to the Delete row above): each dashed
        // divider belongs to one action, so Delete and Leave read as two
        // separate choices rather than one crowded line.
        <div className={styles.dangerZone}>
          <p className={styles.dangerCopy}>
            {t("subprofiles:publishPanel.creatorLeaveCopy")}
          </p>
          <Button variant="ghost" onClick={() => setLeaving(true)}>
            {t("subprofiles:owners.leaveCta")}
          </Button>
        </div>
      )}

      {deleting && (
        <SubprofileDeleteModal
          subprofile={subprofile}
          onClose={() => setDeleting(false)}
        />
      )}

      {leaving && (
        <LeavePersonaModal
          subprofileId={subprofile.id}
          onClose={() => setLeaving(false)}
        />
      )}
    </>
  );
}
