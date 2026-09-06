import { Modal, Button } from "../../../../shared/components/ui";
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
  /** Named in the confirm so the editor can see WHICH deck is about to go. */
  deckTitle: string;
  /** Also named there: the count is the clearest measure of what is lost. */
  slideCount: number;
  /** Confirmed convert (CNT-6) — the caller owns the actual
   *  `convertDeckToArticle` mutation, its success/error toast, and the
   *  post-convert navigate to the article editor; this only fires the
   *  confirmation. */
  onConfirmConvert: () => void;
  convertPending: boolean;
}

/**
 * Dispatches the deck editor's two overlays (delete / convert) by
 * `modal.kind`, mirroring the desk's own `DeskModals` dispatch pattern and
 * reusing its shared modal chrome styles.
 */
export function DeckModals({
  modal,
  onClose,
  onConfirmDelete,
  deletePending,
  deckTitle,
  slideCount,
  onConfirmConvert,
  convertPending,
}: DeckModalsProps) {
  const { t } = useTranslation();

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
        {/* ENG-112 — only an unpublished deck no piece points at can reach
            this confirm, so the copy says exactly that rather than the old
            vague warning about readers hitting a 404 (which a live deck's
            one-click delete really did cause, and which is now impossible). */}
        <p className={styles.body}>
          {t("magazine:deck.editor.deleteModal.detail", {
            title: deckTitle,
            count: slideCount,
          })}
        </p>
        <p className={styles.body}>
          {t("magazine:deck.editor.deleteModal.draftOnly")}
        </p>
      </Modal>
    );
  }

  // "convert" (CNT-6) — one-way, one-time deck→article transform. The
  // caller (`DeckEditorPage`/`useDeckEditorActions`) owns the mutation and
  // navigates away on success, which unmounts this modal along with it; on
  // failure it stays open with an error toast so the editor can retry.
  return (
    <Modal
      title={t("magazine:deck.editor.convertModal.title")}
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} disabled={convertPending}>
            {t("magazine:desk.modals.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirmConvert}
            disabled={convertPending}
            aria-busy={convertPending}
          >
            {t("magazine:deck.editor.convertModal.cta")}
          </Button>
        </div>
      }
    >
      <p className={styles.body}>
        {t("magazine:deck.editor.convertModal.body")}
      </p>
    </Modal>
  );
}
