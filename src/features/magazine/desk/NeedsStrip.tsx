import { FiFileText, FiSend } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./NeedsStrip.module.css";

/**
 * "Needs your attention" strip: up to 3 cards for pieces that are late, or
 * waiting on the currently-viewing editor. Renders nothing when empty.
 */
export function NeedsStrip({
  pieces,
  me,
  onOpen,
  onEdit,
  onChase,
}: {
  pieces: Piece[];
  me: string;
  onOpen: (piece: Piece) => void;
  onEdit: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
}) {
  const { t } = useTranslation();
  const needsAttention = pieces
    .filter(
      (piece) => piece.late || (piece.wait === "you" && piece.editorId === me),
    )
    .slice(0, 3);

  if (needsAttention.length === 0) return null;

  return (
    <div className={styles.needs}>
      {needsAttention.map((piece) => (
        <div
          key={piece.id}
          className={cx(styles.needsCard, piece.late && styles.urgent)}
        >
          <span
            className={cx(styles.eyebrow, piece.late && styles.eyebrowLate)}
          >
            {piece.late
              ? t("magazine:desk.needsStrip.lateDue", { due: piece.due })
              : t("magazine:desk.needsStrip.waitingOnYou")}
          </span>
          <h4 className={styles.title}>{piece.title}</h4>
          <span className={styles.tiny}>
            {piece.byline} · {piece.note || piece.stage}
          </span>
          <div className={styles.needsRow}>
            {piece.wait === "writer" ? (
              <Button size="sm" variant="ghost" onClick={() => onChase(piece)}>
                <FiSend aria-hidden />
                {t("magazine:desk.needsStrip.chase")}
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => onEdit(piece)}>
                <FiFileText aria-hidden />
                {t("magazine:desk.needsStrip.pickUp")}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onOpen(piece)}>
              {t("magazine:desk.needsStrip.open")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
