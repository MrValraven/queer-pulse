import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiEye, FiSearch, FiX } from "react-icons/fi";
import { useDismiss, useScrimDismiss } from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks";
import { mediaMax } from "../../../shared/theme/breakpoints";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { routes } from "../../../app/routeMap";
import styles from "./ComposeRail.module.css";

// ── The composer's right-hand rail ──────────────────────────────────────────
// Four blocks of advice beside the writing: who the post comes from, what it
// will look like, whether it has already been asked, and what is still
// missing. On a wide screen they are all visible at once, sticky beside the
// main column, because none of them is worth a click.
//
// Below 1023px there is no room for a second column, so the same four blocks
// move into a bottom sheet opened from a segmented row. The sheet is a real
// dialog: `useDismiss` owns its focus trap, its scroll lock and its place in
// the Escape stack, and it is PORTALLED to <body> so the fixed overlay anchors
// to the viewport rather than to the composer's own transformed ancestors.
//
// `inert` is deliberately absent. It breaks `useDismiss`'s trap (the trap
// enumerates focusables inside the dialog, and an inert subtree elsewhere is
// not what keeps focus in), and the trap is the thing doing the work here.

/** Which block the sheet is showing. */
export type ComposeRailPane = "preview" | "similar" | "checklist";

const PANES: readonly ComposeRailPane[] = ["preview", "similar", "checklist"];

const PANE_LABEL_KEY: Record<ComposeRailPane, string> = {
  preview: "forum:composePage.rail.tabPreview",
  similar: "forum:composePage.rail.tabSimilar",
  checklist: "forum:composePage.rail.tabChecklist",
};

export interface ComposeRailProps {
  /** The byline block. Shown beside the preview, since it is what the
   *  preview's byline reflects. */
  postingAs: ReactNode;
  preview: ReactNode;
  similar: ReactNode;
  checklist: ReactNode;
  /** How many threads already cover this title. Shown on the Similar tab so
   *  the sheet is worth opening before it is opened. */
  similarCount?: number;
  /** Required checklist rows satisfied, and how many there are. */
  readyCount?: number;
  readyTotal?: number;
}

export function ComposeRail({
  postingAs,
  preview,
  similar,
  checklist,
  similarCount = 0,
  readyCount,
  readyTotal,
}: ComposeRailProps) {
  const { t } = useTranslation();
  const isCompact = useMediaQuery(mediaMax(1023));
  const [openPane, setOpenPane] = useState<ComposeRailPane | null>(null);

  const blocks = { postingAs, preview, similar, checklist };
  const counts = { similarCount, readyCount, readyTotal };

  if (!isCompact)
    return (
      <aside
        className={styles.rail}
        aria-label={t("forum:composePage.rail.label")}
      >
        {postingAs}
        {preview}
        {similar}
        {checklist}
        <HouseRulesNote />
      </aside>
    );

  return (
    <aside
      className={styles.compactRail}
      aria-label={t("forum:composePage.rail.label")}
    >
      <p className={styles.compactLead}>{t("forum:composePage.rail.lead")}</p>
      <div className={styles.tabs}>
        {PANES.map((pane) => (
          <button
            key={pane}
            type="button"
            className={styles.tab}
            aria-haspopup="dialog"
            onClick={() => setOpenPane(pane)}
          >
            <PaneIcon pane={pane} />
            {t(PANE_LABEL_KEY[pane])}
            <PaneCount pane={pane} {...counts} />
          </button>
        ))}
      </div>
      <HouseRulesNote />
      {openPane && (
        <ComposeRailSheet
          pane={openPane}
          onPaneChange={setOpenPane}
          onClose={() => setOpenPane(null)}
          blocks={blocks}
          counts={counts}
        />
      )}
    </aside>
  );
}

interface PaneCounts {
  similarCount?: number;
  readyCount?: number;
  readyTotal?: number;
}

function ComposeRailSheet({
  pane,
  onPaneChange,
  onClose,
  blocks,
  counts,
}: {
  pane: ComposeRailPane;
  onPaneChange: (pane: ComposeRailPane) => void;
  onClose: () => void;
  blocks: Pick<
    ComposeRailProps,
    "postingAs" | "preview" | "similar" | "checklist"
  >;
  counts: PaneCounts;
}) {
  const { t } = useTranslation();
  // Focus trap, scroll lock, Escape and focus restore, all from one hook. The
  // sheet is mounted only while open, so it runs once per opening.
  const sheetRef = useDismiss<HTMLDivElement>(onClose);
  const scrimProps = useScrimDismiss(onClose);
  const grabberProps = useSheetDrag(sheetRef, onClose);

  return createPortal(
    <div className={styles.scrim} role="presentation" {...scrimProps}>
      <div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t("forum:composePage.rail.label")}
        className={styles.sheet}
      >
        {/* Drag down to dismiss. Decorative to a screen reader: Escape, the
            scrim and the Close button all reach the same outcome, so the
            gesture is never the only way out. */}
        <span className={styles.grabber} aria-hidden="true" {...grabberProps} />
        <div className={styles.sheetHead}>
          <div
            className={styles.tabs}
            role="group"
            aria-label={t("forum:composePage.rail.tabsLabel")}
          >
            {PANES.map((candidate) => (
              <button
                key={candidate}
                type="button"
                className={styles.tab}
                aria-pressed={candidate === pane}
                onClick={() => onPaneChange(candidate)}
              >
                <PaneIcon pane={candidate} />
                {t(PANE_LABEL_KEY[candidate])}
                <PaneCount pane={candidate} {...counts} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label={t("shared:modal.close")}
            onClick={onClose}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        <div className={styles.sheetBody}>
          {pane === "preview" && (
            <>
              {blocks.postingAs}
              {blocks.preview}
            </>
          )}
          {pane === "similar" && blocks.similar}
          {pane === "checklist" && blocks.checklist}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Past this much downward travel the sheet closes; anything shorter springs
 *  back. Matches the shared `ModalSheet`, so every sheet in the app dismisses
 *  at the same distance. */
const DRAG_TO_DISMISS_PX = 120;

/**
 * Drag-to-dismiss for the grabber. Touch only: a mouse has the Close button
 * and the scrim, and a pointer-agnostic version would fight text selection.
 * The transform is written straight to the element so the drag never goes
 * through a React render.
 */
function useSheetDrag(
  sheetRef: RefObject<HTMLDivElement | null>,
  onClose: () => void,
) {
  const dragStartYRef = useRef<number | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") return;
    dragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const sheet = sheetRef.current;
    if (dragStartYRef.current === null || !sheet) return;
    const travelled = Math.max(0, event.clientY - dragStartYRef.current);
    sheet.style.transition = "none";
    sheet.style.transform = `translateY(${travelled}px)`;
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const sheet = sheetRef.current;
    if (dragStartYRef.current === null || !sheet) return;
    const travelled = event.clientY - dragStartYRef.current;
    dragStartYRef.current = null;
    if (travelled > DRAG_TO_DISMISS_PX) {
      onClose();
      return;
    }
    sheet.style.transition = `transform var(--dur-base) var(--ease)`;
    sheet.style.transform = "translateY(0)";
  };

  // The system can steal a gesture (a notification, a call), so a cancel has
  // to put the sheet back rather than leave it half-dragged.
  const onPointerCancel = () => {
    const sheet = sheetRef.current;
    dragStartYRef.current = null;
    if (!sheet) return;
    sheet.style.transition = "";
    sheet.style.transform = "";
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel,
  };
}

function PaneIcon({ pane }: { pane: ComposeRailPane }) {
  if (pane === "preview") return <FiEye aria-hidden="true" />;
  if (pane === "similar") return <FiSearch aria-hidden="true" />;
  return <FiCheckCircle aria-hidden="true" />;
}

/** The number on a tab, when that tab has one worth showing. */
function PaneCount({
  pane,
  similarCount,
  readyCount,
  readyTotal,
}: { pane: ComposeRailPane } & PaneCounts) {
  const format = useFormat();
  if (pane === "similar" && similarCount && similarCount > 0)
    return (
      <span className={styles.tabCount}>{format.number(similarCount)}</span>
    );
  if (pane === "checklist" && readyCount !== undefined && readyTotal)
    return (
      <span className={styles.tabCount}>
        {format.number(readyCount)}/{format.number(readyTotal)}
      </span>
    );
  return null;
}

function HouseRulesNote() {
  const { t } = useTranslation();
  return (
    <p className={styles.note}>
      {t("forum:composePage.rail.note")}{" "}
      <Link to={routes.guidelines} className={styles.noteLink}>
        {t("forum:composePage.rail.houseRules")}
      </Link>
    </p>
  );
}
