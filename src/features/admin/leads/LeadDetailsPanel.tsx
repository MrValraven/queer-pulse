import { useEffect, useId, useRef, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse } from "../../../shared/components/ui";
import type { CollapseTransition } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { LeadDTO } from "./api/leads.types";
import { LeadDetailsEditor } from "./LeadDetailsEditor";
import { LeadDetailsView } from "./LeadDetailsView";
import { LeadFadeInline } from "./LeadFadeInline";
import { LeadStageControl } from "./LeadStageControl";
import adminStyles from "./AdminLead.module.css";
import styles from "./LeadDetails.module.css";

/** One fold of the swap between the list and the form. The editor waits
 *  this long after it mounts before Name takes focus, so the focus ring
 *  lands on a panel that has stopped moving. */
const DETAILS_FOLD: CollapseTransition = {
  duration: 0.28,
  ease: [0.22, 0.68, 0.16, 1],
};

type DetailsPane = "view" | "editor";

/**
 * The lead's details in a card. It opens to read: the stage as the first
 * row (it saves on its own, so it stays in reach in both modes), then every
 * field as a list. Edit details folds the list away first and only then
 * folds the form in, so the card never holds both; Name takes focus once
 * the form has opened. Leaving the form (a save or Cancel) runs the same
 * swap the other way and puts focus back on Edit details.
 */
export function LeadDetailsPanel({ lead }: { lead: LeadDTO }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const shouldFocusEditButtonRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [shownPane, setShownPane] = useState<DetailsPane>("view");
  const idPrefix = `lead-${lead.id}-details`;
  const cardId = `${idPrefix}-card`;
  const isViewOpen = !isEditing && shownPane === "view";
  const isEditorOpen = isEditing && shownPane === "editor";

  // Edit details mounts again as edit mode closes, so it takes focus once
  // it is back.
  useEffect(() => {
    if (isEditing || !shouldFocusEditButtonRef.current) return;
    shouldFocusEditButtonRef.current = false;
    editButtonRef.current?.focus();
  }, [isEditing]);

  // Name takes focus once the form has finished folding in, so its ring
  // is never clipped by the moving fold.
  useEffect(() => {
    if (!isEditorOpen) return;
    const delay = reducedMotion ? 0 : DETAILS_FOLD.duration * 1000;
    const timer = window.setTimeout(() => {
      document.getElementById(`${idPrefix}-name`)?.focus();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [isEditorOpen, idPrefix, reducedMotion]);

  const finishEditing = (shouldMoveFocus: boolean) => {
    shouldFocusEditButtonRef.current = shouldMoveFocus;
    setIsEditing(false);
  };

  return (
    <section className={adminStyles.section} aria-labelledby={headingId}>
      <div className={styles.panelHeader}>
        <h2 id={headingId} className={adminStyles.sectionHeading}>
          {t("admin:leads.details.heading")}
        </h2>
        <LeadFadeInline isShown={!isEditing}>
          <Button
            ref={editButtonRef}
            variant="ghost"
            size="sm"
            className={`${styles.phoneTarget} ${styles.editButton}`}
            aria-controls={cardId}
            onClick={() => setIsEditing(true)}
          >
            <FiEdit2 aria-hidden />
            {t("admin:leads.details.edit")}
          </Button>
        </LeadFadeInline>
      </div>
      <div id={cardId} className={styles.card}>
        <LeadStageControl lead={lead} shouldShowSaveNote={isEditing} />
        <Collapse
          isOpen={isViewOpen}
          transition={DETAILS_FOLD}
          onExitComplete={() => {
            if (isEditing) setShownPane("editor");
          }}
        >
          <LeadDetailsView lead={lead} idPrefix={idPrefix} />
        </Collapse>
        <Collapse
          isOpen={isEditorOpen}
          transition={DETAILS_FOLD}
          onExitComplete={() => {
            if (!isEditing) setShownPane("view");
          }}
        >
          <LeadDetailsEditor
            lead={lead}
            idPrefix={idPrefix}
            onDone={finishEditing}
          />
        </Collapse>
      </div>
    </section>
  );
}
