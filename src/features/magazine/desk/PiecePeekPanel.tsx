import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { FiMaximize2 } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useExitTransition, useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { mediaMax } from "../../../shared/theme/breakpoints";
import { cx } from "../../../shared/lib/cx";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { Viewer } from "../api/useDeskPresence";
import type { Piece } from "../data/desk.data";
import type { DeskTrack } from "./deskTrack";
import type { PieceNextAction } from "./pieceNextAction";
import { PiecePeekHeader, PiecePeekToolbar } from "./PiecePeekHeader";
import { PiecePeekStatus } from "./PiecePeekStatus";
import { PiecePeekBody } from "./PiecePeekBody";
import { usePiecePeekDialog } from "./usePiecePeekDialog";
import styles from "./PiecePeekPanel.module.css";

/** Below 768px the panel becomes a full-screen modal sheet. Off the shared
 *  ladder on purpose: the brief sets the cutover at 768, and the CSS module
 *  carries the matching `max-width: 767px`. */
const PEEK_SHEET_QUERY = mediaMax(767);

/** MUST match the `.exiting` transition duration (`--dur-fast`) in the CSS. */
const PEEK_EXIT_MS = 150;

export interface PiecePeekPanelProps {
  /** The piece to show; `null` closes the panel. */
  piece: Piece | null;
  track: DeskTrack;
  onClose: () => void;
  /** The existing full-page navigation to the piece record. */
  onOpenFullRecord: (piece: Piece) => void;
  onNextAction: (piece: Piece, action: PieceNextAction) => void;
  /** Step to the piece above / below in the table. Omit both to hide the pair. */
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  /** Where focus returns on close. Defaults to the element focused at open. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Editors viewing this piece right now, shown in the header beside the
   *  step buttons. Empty or omitted renders nothing. */
  viewers?: Viewer[];
  /** The viewing editor's id, forwarded to `PiecePeekStatus` (the page's
   *  `activeMe`). Omitted, the status block reads the signed-in editor
   *  itself. */
  me?: string;
}

/**
 * A side panel that lets an editor check and nudge a piece without leaving
 * the desk: where it stands, what moves it next, when it is due, the brief,
 * the latest messages and the money. On a desktop it slides over the rail as
 * a non-modal dialog, so the table beside it stays clickable and j/k can walk
 * the rows while it follows along. On a phone it is a full-screen modal sheet.
 *
 * The header and status read the desk's own `Piece`, so they paint at once;
 * the record sections below load through `usePieceRecord`, the same query
 * the full record page uses, so opening the full record afterwards is served
 * from cache.
 *
 * It stays mounted through a short leave transition after `piece` goes null,
 * showing the last piece it had, so it slides out smoothly.
 */
export function PiecePeekPanel({
  piece,
  track,
  onClose,
  onOpenFullRecord,
  onNextAction,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  returnFocusRef,
  viewers,
  me,
}: PiecePeekPanelProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOpen = piece !== null;
  const isSheet = useMediaQuery(PEEK_SHEET_QUERY);
  const { reducedMotion } = useMotionPrefs();
  const { isMounted, isExiting } = useExitTransition(
    isOpen,
    reducedMotion ? 0 : PEEK_EXIT_MS,
  );

  // The last piece shown, kept through the leave transition. Adjusted during
  // render (React's pattern for state derived from a changed prop).
  const [shownPiece, setShownPiece] = useState<Piece | null>(piece);
  if (piece !== null && piece !== shownPiece) setShownPiece(piece);

  usePiecePeekDialog({
    isOpen,
    isModal: isSheet,
    panelRef,
    onClose,
    returnFocusRef,
  });

  // A new piece starts at the top of the panel. Focus stays where it was, so
  // pressing "Next" repeatedly keeps walking the table.
  const shownPieceId = shownPiece?.id;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [shownPieceId]);

  if (!isMounted || shownPiece === null) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal={isSheet}
      aria-labelledby={titleId}
      tabIndex={-1}
      inert={isExiting}
      className={cx(styles.panel, isExiting && styles.exiting)}
      data-piece-id={shownPiece.id}
    >
      <div ref={scrollRef} className={styles.scroll}>
        {/* Desktop: the toolbar lives in the scroll flow so its own sticky
            positioning can pin it to the top as the panel scrolls. On
            the phone sheet it renders after this whole block instead (see
            below), so Tab meets the record's own controls before it. */}
        {!isSheet && (
          <PiecePeekToolbar
            piece={shownPiece}
            onClose={onClose}
            onPrevious={onPrevious}
            onNext={onNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            isSheet={isSheet}
            viewers={viewers}
          />
        )}
        <PiecePeekHeader
          piece={shownPiece}
          titleId={titleId}
          isSheet={isSheet}
          viewers={viewers}
        />
        <PiecePeekStatus
          piece={shownPiece}
          track={track}
          onNextAction={onNextAction}
          me={me}
        />
        <PiecePeekBody
          key={shownPiece.id}
          piece={shownPiece}
          onOpenFullRecord={onOpenFullRecord}
        />
      </div>
      {/* Phone sheet: the toolbar sits outside `.scroll` so it never scrolls
          with the record, and now sits after it in the DOM too (dropped the
          earlier CSS-`order` reshuffle), so close and the step
          pair land at the bottom of the screen, in thumb's reach, exactly
          where the Tab order already puts them: `.scroll`'s own controls,
          then this, then the footer's "Open full record" last. */}
      {isSheet && (
        <PiecePeekToolbar
          piece={shownPiece}
          onClose={onClose}
          onPrevious={onPrevious}
          onNext={onNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          isSheet={isSheet}
          viewers={viewers}
        />
      )}
      <div className={styles.footer}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenFullRecord(shownPiece)}
        >
          <FiMaximize2 aria-hidden />
          {t("magazine:desk.peek.openFullRecord")}
        </Button>
      </div>
    </div>
  );
}
