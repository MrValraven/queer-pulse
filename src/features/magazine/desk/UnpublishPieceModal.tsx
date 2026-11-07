import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { UnpublishLandingStage } from "../api/piecePublish.api";
import { UNPUBLISH_CONFIRM_COPY } from "./unpublishPieceModal.data";
import styles from "./DeskModals.module.css";

export interface UnpublishPieceModalProps {
  title: string;
  stage: UnpublishLandingStage;
  /** True while the request is out: the confirm button is disabled and busy. */
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * The confirm in front of the desk's one-click unpublish (row More menu and
 * Published board card). Same chrome as the other desk overlays: the shared
 * `Modal`, which returns focus to whatever raised it on close, and the footer
 * action row from `DeskModals.module.css`. The sub-line and the confirm label
 * name the landing stage; the body says what readers lose.
 */
export function UnpublishPieceModal({
  title,
  stage,
  isPending,
  onClose,
  onConfirm,
}: UnpublishPieceModalProps) {
  const { t } = useTranslation();
  const copy = UNPUBLISH_CONFIRM_COPY[stage];

  return (
    <Modal
      title={t("magazine:desk.unpublishConfirm.title", { title })}
      sub={t(copy.subKey)}
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:desk.modals.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isPending}
            aria-busy={isPending}
          >
            {t(copy.confirmKey)}
          </Button>
        </div>
      }
    >
      <p className={styles.body}>{t("magazine:desk.unpublishConfirm.body")}</p>
    </Modal>
  );
}
