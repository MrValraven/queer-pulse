import {
  FiCornerUpLeft,
  FiDownload,
  FiShare2,
  FiStar,
  FiX,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ViewerPhoto } from "./useThreadImageGallery";
import styles from "./chatImageViewer.module.css";

/** Shared class list for the top and bottom bars: the base bar class plus
 *  `barHidden` while the chrome is tapped away. */
function barClass(base: string | undefined, isChromeVisible: boolean): string {
  return [base, !isChromeVisible && styles.barHidden].filter(Boolean).join(" ");
}

/**
 * The viewer's top bar: who sent the photo and when, close, and the position
 * in the thread's photo sequence. It fades out on a single tap so the photo
 * can be seen unobstructed, staying in the tab order throughout (`opacity`
 * plus `pointer-events`, never `display` or `inert`, so the shared focus trap
 * in `useDismiss` keeps working: any keydown re-shows the chrome, per
 * `ChatImageViewer.tsx`, so a keyboard user's next Tab always lands on
 * something visible).
 *
 * Split from the bottom bar (`ChatImageViewerBottomBar`, same file) so each
 * returns its own single element: the shell's grid renders top bar, stage,
 * bottom bar as three sibling rows, and a fragment holding both bars would
 * put the stage in the wrong row.
 */
export function ChatImageViewerTopBar({
  photo,
  index,
  total,
  isChromeVisible,
  onClose,
}: {
  photo: ViewerPhoto;
  index: number;
  total: number;
  isChromeVisible: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={barClass(styles.topBar, isChromeVisible)}>
      <button
        type="button"
        className={styles.iconButton}
        onClick={onClose}
        aria-label={t("messages:viewer.close")}
      >
        <FiX aria-hidden size={22} />
      </button>
      <span className={styles.sender}>
        <span className={styles.senderName}>{photo.senderName}</span>
        <span className={styles.senderTime}>
          {photo.dayLabel} {photo.timeLabel}
        </span>
      </span>
      {/* The counter IS the live region: stepping through photos only swaps
          this number and the <img alt> in place, which is silent. The digits
          read badly out loud, so they are hidden from the reader and a
          worded equivalent sits beside them. */}
      <span className={styles.counter} role="status">
        <span aria-hidden="true">
          {t("messages:viewer.counter", { index: index + 1, total })}
        </span>
        <span className="visuallyHidden">
          {t("messages:viewer.counterAnnouncement", {
            index: index + 1,
            total,
            sender: photo.senderName,
          })}
        </span>
      </span>
    </div>
  );
}

/**
 * The viewer's bottom bar: Save plus, when the photo's message can be acted
 * on, Reply/Forward/Star. Fades in lockstep with the top bar and stays in
 * the tab order for the same reason; see `ChatImageViewerTopBar` above for
 * why the two are separate components in this one file.
 */
export function ChatImageViewerBottomBar({
  photo,
  isChromeVisible,
  isSaving,
  canAct,
  onSave,
  onReply,
  onForward,
  onToggleStar,
}: {
  photo: ViewerPhoto;
  isChromeVisible: boolean;
  isSaving: boolean;
  /** False for a demo or still-optimistic message, which has no server id and
   *  so cannot be replied to, forwarded or starred. */
  canAct: boolean;
  onSave: () => void;
  onReply?: () => void;
  onForward?: () => void;
  onToggleStar?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={barClass(styles.bottomBar, isChromeVisible)}>
      <button
        type="button"
        className={styles.actionButton}
        onClick={onSave}
        disabled={isSaving}
      >
        <FiDownload aria-hidden size={20} />
        {t("messages:viewer.save")}
      </button>
      {canAct && onReply && (
        <button type="button" className={styles.actionButton} onClick={onReply}>
          <FiCornerUpLeft aria-hidden size={20} />
          {t("messages:actions.reply")}
        </button>
      )}
      {canAct && onForward && (
        <button
          type="button"
          className={styles.actionButton}
          onClick={onForward}
        >
          <FiShare2 aria-hidden size={20} />
          {t("messages:actions.forward")}
        </button>
      )}
      {canAct && onToggleStar && (
        <button
          type="button"
          className={[
            styles.actionButton,
            photo.message.starred && styles.actionButtonActive,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onToggleStar}
          aria-pressed={!!photo.message.starred}
        >
          <FiStar aria-hidden size={20} />
          {photo.message.starred
            ? t("messages:actions.unstar")
            : t("messages:actions.star")}
        </button>
      )}
    </div>
  );
}
