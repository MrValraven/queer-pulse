import type { ReactNode } from "react";
import {
  FiCornerUpLeft,
  FiDownload,
  FiShare2,
  FiStar,
  FiX,
} from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import {
  setViewerMotionVariant,
  type ViewerMotionVariant,
} from "./chatViewerMotion";
import type { ViewerPhoto } from "./useThreadImageGallery";
import styles from "./chatImageViewer.module.css";

/**
 * TEMPORARY. Flips the viewer between its two candidate open/close animations
 * so they can be compared in the real app rather than described. Tapping it
 * changes THIS close and every open after it, so one tap plus a close plus a
 * reopen shows both halves of a variant.
 *
 * Deliberately not translated, and deliberately not in the i18n catalogs:
 * "Scale" and "Zoom" are the two variants' own names for the length of this
 * comparison, and this control is deleted along with the losing variant. Keys
 * for it would be catalog churn in two languages for something with a known
 * expiry. Delete this component, `chatViewerMotion`'s variant store, and the
 * `?photoAnim=` parameter together.
 */
function MotionVariantToggle({ variant }: { variant: ViewerMotionVariant }) {
  const next: ViewerMotionVariant = variant === "scale" ? "zoom" : "scale";
  return (
    <button
      type="button"
      className={styles.motionToggle}
      onClick={() => setViewerMotionVariant(next)}
      aria-label={`Photo animation: ${variant}. Switch to ${next}.`}
    >
      <span aria-hidden="true">{variant === "scale" ? "Scale" : "Zoom"}</span>
    </button>
  );
}

/** Class list for the top bar: the base bar class plus `barHidden` while the
 *  chrome is tapped away. */
function barClass(base: string | undefined, isChromeVisible: boolean): string {
  return [base, !isChromeVisible && styles.barHidden].filter(Boolean).join(" ");
}

/**
 * One action in the top bar's icon row. These carry no visible word any more,
 * so each needs an explicit `aria-label`, and the same string doubles as the
 * `title` so a mouse user gets the word back as a tooltip.
 */
function ViewerIconButton({
  label,
  onClick,
  isDisabled = false,
  isActive = false,
  isPressed,
  children,
}: {
  label: string;
  onClick: () => void;
  isDisabled?: boolean;
  /** Paints the icon in the accent, for a state the icon alone would not show. */
  isActive?: boolean;
  /** Only Star is a toggle. Left undefined everywhere else so no `aria-pressed`
   *  is written at all, rather than a button claiming a state it does not have. */
  isPressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={[styles.iconButton, isActive && styles.iconButtonActive]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={label}
      aria-pressed={isPressed}
      title={label}
    >
      {children}
    </button>
  );
}

/**
 * The viewer's only bar: who sent the photo and when on the left, every action
 * on the right as a row of wordless icons, Close last. It fades out on a single
 * tap so the photo can be seen unobstructed, staying in the tab order
 * throughout (`opacity` plus `pointer-events`, never `display` or `inert`, so
 * the shared focus trap in `useDismiss` keeps working: any keydown re-shows the
 * chrome, per `ChatImageViewer.tsx`, so a keyboard user's next Tab always lands
 * on something visible).
 *
 * The labelled bottom bar this replaced is gone: its four actions moved up here
 * and row three of the dialog grid is the thumbnail filmstrip instead.
 */
export function ChatImageViewerTopBar({
  photo,
  index,
  total,
  isChromeVisible,
  isSaving,
  canAct,
  onClose,
  onSave,
  onReply,
  onForward,
  onToggleStar,
  motionVariant,
}: {
  photo: ViewerPhoto;
  index: number;
  total: number;
  isChromeVisible: boolean;
  isSaving: boolean;
  /** False for a demo or still-optimistic message, which has no server id and
   *  so cannot be replied to, forwarded or starred. */
  canAct: boolean;
  onClose: () => void;
  onSave: () => void;
  onReply?: () => void;
  onForward?: () => void;
  onToggleStar?: () => void;
  /** Which open/close animation is currently selected. */
  motionVariant: ViewerMotionVariant;
}) {
  const { t } = useTranslation();

  return (
    <div className={barClass(styles.topBar, isChromeVisible)}>
      <div className={styles.identity}>
        {/* Decorative on purpose: no `name`, no `alt`. The sender's name is
            rendered visibly right beside it, and naming the image too would
            read the same person twice. */}
        <Avatar
          className={styles.identityAvatar}
          size={36}
          src={photo.senderAvatar}
          /* The canonical display-name helper, which every avatar in the app
             routes through: first word plus LAST word, so a three-word name
             gives the same two letters here as it does in the conversation
             behind this viewer. */
          initials={initialsFromName(photo.senderName)}
        />
        <span className={styles.sender}>
          <span className={styles.senderName}>{photo.senderName}</span>
          <span className={styles.senderTime}>
            {photo.dayLabel} {photo.timeLabel}
          </span>
        </span>
        {/* The counter IS the live region: stepping through photos only swaps
            this number and the <img alt> in place, which is silent. The digits
            read badly out loud, so they are hidden from the reader and a
            worded equivalent sits beside them. The digits also stand down on
            pointer devices, where the filmstrip shows position better than a
            number does; the worded half stays on every viewport. */}
        <span className={styles.counter} role="status">
          <span className={styles.counterDigits} aria-hidden="true">
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
      <MotionVariantToggle variant={motionVariant} />
      <div className={styles.actions}>
        {canAct && onToggleStar && (
          <ViewerIconButton
            /* Fixed in both states, per the APG toggle-button pattern: the
               name says WHAT the button is about and `aria-pressed` says what
               state it is in. Swapping this to "Unstar" while `aria-pressed`
               is true made a reader announce "Unstar, toggle button, pressed",
               where the name and the state contradict each other. Sighted
               members read the state off the glyph instead: filled and coral
               when starred, hollow otherwise. */
            label={t("messages:actions.star")}
            onClick={onToggleStar}
            isActive={!!photo.message.starred}
            isPressed={!!photo.message.starred}
          >
            {/* Two signals, not one. `isActive` above recolours this to
                --accent, and hue alone is not a state a colour-blind or
                low-vision member can read (WCAG 1.4.1), so the star is also
                FILLED when starred. Feather glyphs are stroked outlines with
                `fill="none"` on the <svg> and nothing on the <polygon>, and
                react-icons spreads caller props AFTER that attribute, so a
                `fill` here overrides it and the polygon inherits the new
                value. Written out in both branches on purpose: `undefined`
                would not restore "none", it would delete the attribute and
                leave the star filled in the SVG default black. */}
            <FiStar
              aria-hidden
              size={20}
              fill={photo.message.starred ? "currentColor" : "none"}
            />
          </ViewerIconButton>
        )}
        {canAct && onReply && (
          <ViewerIconButton
            label={t("messages:actions.reply")}
            onClick={onReply}
          >
            <FiCornerUpLeft aria-hidden size={20} />
          </ViewerIconButton>
        )}
        {canAct && onForward && (
          <ViewerIconButton
            label={t("messages:actions.forward")}
            onClick={onForward}
          >
            <FiShare2 aria-hidden size={20} />
          </ViewerIconButton>
        )}
        <ViewerIconButton
          label={t("messages:viewer.save")}
          onClick={onSave}
          isDisabled={isSaving}
        >
          <FiDownload aria-hidden size={20} />
        </ViewerIconButton>
        <ViewerIconButton label={t("messages:viewer.close")} onClick={onClose}>
          <FiX aria-hidden size={22} />
        </ViewerIconButton>
      </div>
    </div>
  );
}
