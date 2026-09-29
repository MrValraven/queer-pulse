import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Viewer } from "../api/useDeskPresence";
import type { Piece } from "../data/desk.data";
import { FormatBadge } from "./FormatBadge";
import { PresenceStack } from "./PresenceStack";
import styles from "./PiecePeekPanel.module.css";

export interface PiecePeekToolbarProps {
  piece: Piece;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  /** Whether the panel is the full-screen phone sheet. Decides where the
   *  presence stack goes (see `viewers` below): the toolbar is too tight
   *  for it there, next to three 44px icon buttons. */
  isSheet: boolean;
  /** Editors viewing this piece right now, shown beside the step buttons.
   *  Empty or omitted renders nothing; on the phone sheet the stack moves to
   *  `PiecePeekHeader`'s title block instead (see there). */
  viewers?: Viewer[];
}

/**
 * Format and section, the step buttons and close. The step pair only renders
 * when the desk wires both handlers; at either end of the table one of them
 * turns `aria-disabled`, since a pressed button that went truly `disabled`
 * would drop keyboard focus to the page body.
 *
 * `PiecePeekPanel` places exactly one instance of this component, in one of
 * two spots depending on `isSheet`: on the desktop panel, inside `.scroll`
 * just before
 * `PiecePeekHeader`'s title block, where its own `position: sticky` has the
 * whole scrolling area to stick within rather than being trapped inside a
 * short parent that scrolls away as one piece. On the phone sheet,
 * outside `.scroll`, stacked above the footer: a fixed row so close and the
 * step pair sit in the thumb's reach at the bottom of the screen instead of
 * the far top corner, the same "move it to the bottom" fallback the
 * finding names when converting to a true bottom-anchored drag sheet is not
 * a clean fit for a panel this tall (brief, thread and money all need to
 * scroll under it, where the app's other bottom sheets size to their
 * content).
 */
export function PiecePeekToolbar({
  piece,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  isSheet,
  viewers,
}: PiecePeekToolbarProps) {
  const { t } = useTranslation();
  const canStep = onPrevious !== undefined && onNext !== undefined;
  const viewerStack = viewers && viewers.length > 0 ? viewers : null;

  return (
    <div className={styles.toolbar}>
      <FormatBadge format={piece.format} />
      <span className={styles.section}>{piece.section}</span>
      <div className={styles.toolbarActions}>
        {viewerStack && !isSheet && (
          <PresenceStack
            viewers={viewerStack}
            size={20}
            className={styles.headerPresence}
          />
        )}
        {canStep && (
          <>
            <IconButton
              size="sm"
              aria-label={t("magazine:desk.peek.previousAria")}
              aria-disabled={!hasPrevious}
              onClick={hasPrevious ? onPrevious : undefined}
            >
              <FiChevronUp aria-hidden />
            </IconButton>
            <IconButton
              size="sm"
              aria-label={t("magazine:desk.peek.nextAria")}
              aria-disabled={!hasNext}
              onClick={hasNext ? onNext : undefined}
            >
              <FiChevronDown aria-hidden />
            </IconButton>
          </>
        )}
        <IconButton
          size="sm"
          aria-label={t("magazine:desk.peek.closeAria")}
          onClick={onClose}
        >
          <FiX aria-hidden />
        </IconButton>
      </div>
    </div>
  );
}

export interface PiecePeekHeaderProps {
  piece: Piece;
  /** The id the panel's `aria-labelledby` points at. */
  titleId: string;
  /** Whether the panel is the full-screen phone sheet: decides whether the
   *  presence stack (see `viewers`) shows here, under the byline. */
  isSheet: boolean;
  /** Editors viewing this piece right now. On the phone sheet only, shown as
   *  a face stack on its own line under the byline, since `PiecePeekToolbar`
   *  moves there for that layout. Empty or omitted renders nothing. */
  viewers?: Viewer[];
}

/**
 * The peek's title block: the title in the editorial serif and the byline. A
 * plain `<div>`: a `<header>` here would surface as a second banner
 * landmark.
 */
export function PiecePeekHeader({
  piece,
  titleId,
  isSheet,
  viewers,
}: PiecePeekHeaderProps) {
  const viewerStack = viewers && viewers.length > 0 ? viewers : null;

  return (
    <div className={styles.headerBody}>
      <h2 id={titleId} className={styles.title}>
        {piece.title}
      </h2>
      {piece.byline && <p className={styles.byline}>{piece.byline}</p>}
      {viewerStack && isSheet && (
        <PresenceStack
          viewers={viewerStack}
          size={18}
          className={styles.headerPresenceLine}
        />
      )}
    </div>
  );
}
