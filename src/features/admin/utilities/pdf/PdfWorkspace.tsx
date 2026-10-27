import { useEffect, useRef, useState, type ReactNode } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { PdfThumbnail } from "./sources/PdfThumbnail";
import type { PdfExport } from "./state/usePdfExport";
import type {
  PdfEditKind,
  PdfEditorApi,
  PdfLastEdit,
} from "./state/usePdfEditor";
import type { PdfFileIntake } from "./state/usePdfFileIntake";
import { PdfDropZone } from "./ui/PdfDropZone";
import { PdfFileList } from "./ui/PdfFileList";
import { PdfOutputBar } from "./ui/PdfOutputBar";
import { PdfPageGrid } from "./ui/PdfPageGrid";
import { PdfSelectionBar } from "./ui/PdfSelectionBar";
import styles from "./PdfToolkitPage.module.css";

/** The --ease token and --dur-base, for motion: the tiles glide on the same curve. */
const PANEL_FADE = { duration: 0.25, ease: [0.22, 0.68, 0.16, 1] } as const;
const INSTANT = { duration: 0 } as const;

interface PdfSwapPanelProps {
  /**
   * Read once on mount. When focus was lost because the panel this one
   * replaced took the focused control with it, focus moves to this panel's
   * first enabled button.
   */
  shouldClaimFocus: boolean;
  children: ReactNode;
}

/**
 * One side of a fade swap inside an AnimatePresence (instant under reduced
 * motion). The side fading out is inert, so a click or a dropped file there
 * cannot reach a session that is closing.
 */
export function PdfSwapPanel({
  shouldClaimFocus,
  children,
}: PdfSwapPanelProps) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const panelRef = useRef<HTMLDivElement>(null);
  const [shouldClaimFocusOnMount] = useState(shouldClaimFocus);

  useEffect(() => {
    if (!shouldClaimFocusOnMount) return;
    const focused = document.activeElement;
    if (focused && focused !== document.body) return;
    panelRef.current
      ?.querySelector<HTMLElement>("button:not([disabled])")
      ?.focus();
  }, [shouldClaimFocusOnMount]);

  return (
    <m.div
      ref={panelRef}
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reducedMotion ? INSTANT : PANEL_FADE}
    >
      {children}
    </m.div>
  );
}

const ANNOUNCE_KEY_BY_KIND: Record<PdfEditKind, string> = {
  removed: "admin:utilities.pdf.announce.removed",
  rotated: "admin:utilities.pdf.announce.rotated",
  moved: "admin:utilities.pdf.announce.moved",
  added: "admin:utilities.pdf.announce.added",
  cutAdded: "admin:utilities.pdf.announce.cutAdded",
  cutRemoved: "admin:utilities.pdf.announce.cutRemoved",
  undone: "admin:utilities.pdf.announce.undone",
  redone: "admin:utilities.pdf.announce.redone",
};

/**
 * Says what the last edit did. The line is keyed on the edit's sequence, so
 * the same edit twice in a row is still read out the second time.
 */
export function PdfEditAnnouncer({
  lastEdit,
}: {
  lastEdit: PdfLastEdit | null;
}) {
  const { t } = useTranslation();
  return (
    <div className="visuallyHidden" role="status" aria-live="polite">
      {lastEdit ? (
        <span key={lastEdit.sequence}>
          {t(ANNOUNCE_KEY_BY_KIND[lastEdit.kind], { count: lastEdit.count })}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Removed pages stay in the DOM for a moment while they fade, so a live tile
 * is one whose list item is not popping out.
 */
function liveTileSelector(index: number): string {
  return `li:not([data-motion-pop-id]) [data-page-tile="${index}"]`;
}

/**
 * Remove pages disables itself once the selection clears, so focus moves to
 * the page that now stands where the first removed one stood (or the last
 * page when the run reached the end).
 */
function useFocusAfterRemove(editor: PdfEditorApi) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const pendingFocusIndexRef = useRef<number | null>(null);
  const { pages } = editor;

  useEffect(() => {
    const removedIndex = pendingFocusIndexRef.current;
    if (removedIndex === null) return;
    pendingFocusIndexRef.current = null;
    const lastIndex = pages.length - 1;
    if (lastIndex < 0) return;
    workspaceRef.current
      ?.querySelector<HTMLElement>(
        liveTileSelector(Math.min(removedIndex, lastIndex)),
      )
      ?.focus();
  }, [pages]);

  function removeSelected() {
    const { selectedIds } = editor.selection;
    const firstRemovedIndex = pages.findIndex((page) =>
      selectedIds.has(page.id),
    );
    // The editor keeps the whole grid, so that press changes nothing.
    const shouldMoveFocus =
      firstRemovedIndex >= 0 && !editor.isWholeGridSelected;
    if (shouldMoveFocus) pendingFocusIndexRef.current = firstRemovedIndex;
    editor.removeSelected();
  }

  return { workspaceRef, removeSelected };
}

interface PdfWorkspaceProps {
  editor: PdfEditorApi;
  intake: PdfFileIntake;
  exporter: PdfExport;
  onStartOver: () => void;
}

/**
 * The toolkit once a PDF is open: the open files with room to add more, the
 * sticky selection bar over the page grid, and the output bar.
 */
export function PdfWorkspace({
  editor,
  intake,
  exporter,
  onStartOver,
}: PdfWorkspaceProps) {
  const { reducedMotion } = useMotionPrefs();
  const { workspaceRef, removeSelected } = useFocusAfterRemove(editor);
  const isBusy = intake.openingCount > 0 || exporter.busyKind !== null;
  return (
    <div ref={workspaceRef} className={styles.workspace}>
      <div className={styles.intake}>
        <PdfFileList files={editor.files} />
        <PdfDropZone
          variant="compact"
          openingCount={intake.openingCount}
          onFiles={(files) => void intake.openFiles(files)}
        />
      </div>
      <div className={styles.pages}>
        <PdfSelectionBar
          selectedCount={editor.selection.selectedIds.size}
          isWholeGridSelected={editor.isWholeGridSelected}
          isUndoAvailable={editor.isUndoAvailable}
          isRedoAvailable={editor.isRedoAvailable}
          onSelectAll={() => editor.selectAll()}
          onClearSelection={() => editor.clearSelection()}
          onRemove={removeSelected}
          onRotate={(direction) => editor.rotateSelected(direction)}
          onNudge={(direction) => editor.nudgeSelected(direction)}
          onUndo={() => editor.undo()}
          onRedo={() => editor.redo()}
        />
        <PdfPageGrid
          pages={editor.pages}
          filesById={editor.filesById}
          isMultiFile={editor.files.length > 1}
          selectedIds={editor.selection.selectedIds}
          onTogglePage={(pageId) => editor.togglePage(pageId)}
          onSelectRange={(pageId) => editor.selectRange(pageId)}
          onMovePage={(pageId, toIndex) => editor.movePage(pageId, toIndex)}
          onToggleCut={(pageId) => editor.toggleCut(pageId)}
          renderThumbnail={(page) => (
            <PdfThumbnail
              fileId={page.fileId}
              sourceIndex={page.sourceIndex}
              rotation={page.rotation}
            />
          )}
        />
      </div>
      {/* Glides with the tiles when the grid gains or loses a row, so the
          bar never jumps under a page that is still moving. */}
      <m.div
        layout="position"
        className={styles.output}
        transition={{ layout: reducedMotion ? INSTANT : PANEL_FADE }}
      >
        <PdfOutputBar
          chunkCount={editor.chunkCount}
          busyKind={exporter.busyKind}
          isStartOverDisabled={isBusy}
          onExport={(kind) => void exporter.exportAs(kind)}
          onStartOver={onStartOver}
        />
      </m.div>
    </div>
  );
}
