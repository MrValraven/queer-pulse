import { Modal, Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../DeskModals.module.css";

/** Every overlay the deck editor can raise. `null` renders nothing. */
export type DeckModal = { kind: "delete" } | { kind: "convert" } | null;

export interface DeckModalsProps {
  modal: DeckModal;
  onClose: () => void;
  /** Confirmed delete — the caller owns the actual `deleteDeck` mutation and
   *  the post-delete navigate (see `DeckEditorPage`'s `useDeckEditorActions`
   *  wiring); this only fires the confirmation. */
  onConfirmDelete: () => void;
  deletePending: boolean;
}

/**
 * Dispatches the deck editor's two overlays (delete / convert) by
 * `modal.kind`, mirroring the desk's own `DeskModals` dispatch pattern and
 * reusing its shared modal chrome styles.
 */
export function DeckModals({ modal, onClose, onConfirmDelete, deletePending }: DeckModalsProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  if (!modal) return null;

  if (modal.kind === "delete") {
    return (
      <Modal
        title={t("magazine:deck.editor.deleteModal.title")}
        onClose={onClose}
        footer={
          <div className={styles.actions}>
            <Button variant="ghost" onClick={onClose} disabled={deletePending}>
              {t("magazine:desk.modals.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={onConfirmDelete}
              disabled={deletePending}
              aria-busy={deletePending}
            >
              {t("magazine:deck.editor.delete")}
            </Button>
          </div>
        }
      >
        <p className={styles.body}>{t("magazine:deck.editor.deleteModal.body")}</p>
      </Modal>
    );
  }

  // "convert" — article↔deck conversion is a future cross-phase feature
  // (see the Phase 4 plan); this is a toast stub, not a real conversion.
  return (
    <Modal
      title={t("magazine:deck.editor.convertModal.title")}
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:desk.modals.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              showToast(t("magazine:deck.editor.convertModal.toast"));
              onClose();
            }}
          >
            {t("magazine:deck.editor.convertModal.cta")}
          </Button>
        </div>
      }
    >
      <p className={styles.body}>{t("magazine:deck.editor.convertModal.body")}</p>
    </Modal>
  );
}
