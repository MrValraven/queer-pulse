import { Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { firstName } from "../data/desk.copy";
import { PieceThread } from "./PieceThread";
import styles from "./DeskModals.module.css";

interface ChaseModalProps {
  piece: { id: string; title: string; byline: string };
  onClose: () => void;
}

/**
 * Chase-a-writer nudge, now backed by the real per-piece thread (Phase 7
 * Wave F): the editor reads the existing conversation and posts the chase
 * straight into it via `PieceThread`'s own composer — posting notifies the
 * writer server-side (see the Wave F backend report). There's no separate
 * "send" step anymore; sending a message here IS the chase.
 */
export function ChaseModal({ piece, onClose }: ChaseModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("magazine:desk.modals.chase.title", { name: firstName(piece.byline) })}
      onClose={onClose}
    >
      <p className={styles.body}>{t("magazine:desk.modals.chase.body")}</p>
      <PieceThread pieceId={piece.id} side="editor" />
    </Modal>
  );
}
