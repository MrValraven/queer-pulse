import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  PIECE_PUBLISH_CONFIRM,
  type PiecePublishIntent,
} from "./deskModals.data";
import styles from "./DeskModals.module.css";

export interface PiecePublishModalProps {
  /** Which confirm to show, or `null` for none. */
  intent: PiecePublishIntent | null;
  title: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * The piece record's publish and unpublish confirms. Same chrome as every
 * other desk overlay (the shared `Modal` primitive, which portals to
 * `document.body`, plus `DeskModals.module.css`'s footer action row) with the
 * copy coming from `PIECE_PUBLISH_CONFIRM` in `deskModals.data.ts`.
 *
 * It sits beside `DeskModals` rather than inside it because the desk's overlay
 * dispatcher is driven by `useDeskModals` off the pipeline, while these two are
 * raised by one piece's own header and rail.
 */
export function PiecePublishModal({
  intent,
  title,
  isPending,
  onClose,
  onConfirm,
}: PiecePublishModalProps) {
  const { t } = useTranslation();

  if (!intent) return null;

  const copy = PIECE_PUBLISH_CONFIRM[intent];

  return (
    <Modal
      title={t(copy.titleKey, { title })}
      sub={t(copy.subKey)}
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:piece.publish.confirmCancel")}
          </Button>
          <Button
            variant={intent === "publish" ? "plum" : "danger"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {t(copy.confirmKey)}
          </Button>
        </div>
      }
    >
      <p className={styles.body}>{t(copy.bodyKey)}</p>
    </Modal>
  );
}
