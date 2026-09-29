import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  PIECE_PUBLISH_CONFIRM,
  type PiecePublishIntent,
} from "./deskModals.data";
import styles from "./DeskModals.module.css";

/** A past `publishedAt` the piece never got settled with: it is already
 *  live, so the publish confirm's sub-line says that. */
const SETTLE_SUB_KEY = "magazine:piece.publish.confirmSettleSub";

export interface PiecePublishModalProps {
  /** Which confirm to show, or `null` for none. */
  intent: PiecePublishIntent | null;
  title: string;
  isPending: boolean;
  /** The piece already has a past `publishedAt` and is live to readers, so a
   *  `publish` confirm settles it. Ignored for `unpublish`. Defaults to
   *  `false` for a caller that has no such piece to settle. */
  isAlreadyLive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * The piece record's publish and unpublish confirms. Same chrome as every
 * other desk overlay (the shared `Modal` primitive, which portals to
 * `document.body`, plus `DeskModals.module.css`'s footer action row) with the
 * copy coming from `PIECE_PUBLISH_CONFIRM` in `deskModals.data.ts`, except the
 * publish sub-line: `isAlreadyLive` swaps it to `SETTLE_SUB_KEY` for a piece
 * whose date already passed with no job ever marking it Published.
 *
 * It sits beside `DeskModals` rather than inside it because the desk's overlay
 * dispatcher is driven by `useDeskModals` off the pipeline, while these two are
 * raised by one piece's own header and rail.
 */
export function PiecePublishModal({
  intent,
  title,
  isPending,
  isAlreadyLive = false,
  onClose,
  onConfirm,
}: PiecePublishModalProps) {
  const { t } = useTranslation();

  if (!intent) return null;

  const copy = PIECE_PUBLISH_CONFIRM[intent];
  const subKey =
    intent === "publish" && isAlreadyLive ? SETTLE_SUB_KEY : copy.subKey;

  return (
    <Modal
      title={t(copy.titleKey, { title })}
      sub={t(subKey)}
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
