import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useWorkshops } from "../../app/providers/WorkshopsProvider";
import { AddWorkshopModal } from "./AddWorkshopModal";
import type { Workshop } from "./workshops.data";
import styles from "./WorkshopPage.module.css";

/**
 * The host's own controls for a workshop: edit, and delete.
 *
 * Rendered only when `workshop.isHost` — PATCH and DELETE are host-only and the
 * backend 403s anyone else, so offering the buttons to a non-host would only
 * ever produce a failure. Edit reuses `AddWorkshopModal` rather than growing a
 * second form.
 *
 * Delete is confirmed in a modal, not typed-phrase gated. A typed phrase is the
 * right friction for deleting an account — irreversible, identity-wide, and
 * nothing else in the app can restore it. Deleting one workshop you listed is a
 * much smaller blast radius, and the same modal pattern already covers the
 * closest analogue in this codebase (deleting a subprofile). The weight belongs
 * in the copy, which says plainly what will and won't happen.
 */
export function WorkshopHostControls({ workshop }: { workshop: Workshop }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { deleteWorkshop } = useWorkshops();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!workshop.isHost) return null;

  const closeConfirm = () => {
    if (deleting) return; // don't yank the modal out from under a live request
    setConfirming(false);
    setFailed(false);
  };

  const confirmDelete = async () => {
    setFailed(false);
    setDeleting(true);
    const ok = await deleteWorkshop(workshop.id);
    if (!ok) {
      // Stay on the confirm step with the reason shown; the workshop is intact.
      setFailed(true);
      setDeleting(false);
      return;
    }
    setDeleting(false);
    setConfirming(false);
    showToast(t("economy:deleteWorkshop.toast"), "success");
    // This page is about to 404 for its own host — send them back to the board.
    navigate(routes.skills);
  };

  return (
    <div className={styles.hostCard}>
      <h4 className={styles.cardLabel}>{t("economy:workshopHost.label")}</h4>
      <p className={styles.hostNote}>{t("economy:workshopHost.note")}</p>
      <div className={styles.hostActions}>
        <Button variant="ghost" onClick={() => setEditing(true)}>
          <FiEdit2 aria-hidden /> {t("economy:workshopHost.editCta")}
        </Button>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          <FiTrash2 aria-hidden /> {t("economy:workshopHost.deleteCta")}
        </Button>
      </div>

      {editing && (
        <AddWorkshopModal
          workshop={workshop}
          onClose={() => setEditing(false)}
        />
      )}

      {confirming && (
        <Modal
          title={t("economy:deleteWorkshop.title")}
          sub={workshop.title}
          onClose={closeConfirm}
          footer={
            <>
              <Button
                variant="ghost"
                onClick={closeConfirm}
                disabled={deleting}
              >
                {t("economy:deleteWorkshop.keepCta")}
              </Button>
              <Button
                variant="danger"
                onClick={() => void confirmDelete()}
                disabled={deleting}
              >
                {deleting
                  ? t("economy:deleteWorkshop.deletingLabel")
                  : t("economy:deleteWorkshop.confirmCta")}
              </Button>
            </>
          }
        >
          <p>{t("economy:deleteWorkshop.body")}</p>
          <p>{t("economy:deleteWorkshop.attendeesNote")}</p>
          {failed && (
            <p role="alert">{t("economy:deleteWorkshop.failedNote")}</p>
          )}
        </Modal>
      )}
    </div>
  );
}
