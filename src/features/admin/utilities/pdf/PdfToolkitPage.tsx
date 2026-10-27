import { useEffect, useRef, useState } from "react";
import { AnimatePresence, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { ConfirmDialog, FadeIn } from "../../../../shared/components/ui";
import { AdminShell } from "../../../../shared/components/layout/AdminShell";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { routes } from "../../../../app/routeMap";
import { AdminPageHeader } from "../../ui";
import { createPdfSourceRegistry } from "./sources/pdfSourceRegistry";
import type { PdfSourceRegistry } from "./sources/pdfSourceRegistry";
import { PdfSourceRegistryProvider } from "./sources/PdfSourceRegistryContext";
import { usePdfEditor } from "./state/usePdfEditor";
import { usePdfExport } from "./state/usePdfExport";
import { usePdfFileIntake } from "./state/usePdfFileIntake";
import { useUndoShortcuts } from "./state/undoShortcut";
import { PdfDropZone } from "./ui/PdfDropZone";
import { PdfOpenErrors } from "./ui/PdfOpenErrors";
import { usePreventFileDropNavigation } from "./usePreventFileDropNavigation";
import { PdfEditAnnouncer, PdfSwapPanel, PdfWorkspace } from "./PdfWorkspace";

interface PdfToolkitSessionProps {
  registry: PdfSourceRegistry;
  /** True for a session that follows Start over, whose button is gone. */
  isRestart: boolean;
  /** Undo shortcuts wait while the Start over dialog asks. */
  isStartOverOpen: boolean;
  onStartOver: () => void;
}

/**
 * Everything one round of editing holds: the open files, the edit history,
 * the notices and the download state. Start over mounts a fresh session, so
 * nothing from the last round survives and file tones begin again.
 */
function PdfToolkitSession({
  registry,
  isRestart,
  isStartOverOpen,
  onStartOver,
}: PdfToolkitSessionProps) {
  const editor = usePdfEditor();
  const intake = usePdfFileIntake({
    sink: registry,
    onFileOpened: (info) => editor.addFile(info),
  });
  const exporter = usePdfExport({
    getSource: registry.getPdfLibDocument,
    pages: editor.pages,
    filesById: editor.filesById,
  });
  // The session fading out after Start over keeps its keys off too.
  const isPresent = useIsPresent();
  // Redo stays on the keyboard after undoing the first file away.
  useUndoShortcuts({
    onUndo: () => editor.undo(),
    onRedo: () => editor.redo(),
    isEnabled:
      isPresent &&
      !isStartOverOpen &&
      (editor.isUndoAvailable || editor.isRedoAvailable),
  });
  const hasPages = editor.pages.length > 0;
  // Set during render the first time pages appear, the React pattern for
  // state that follows other state.
  const [hasHadPages, setHasHadPages] = useState(false);
  if (hasPages && !hasHadPages) setHasHadPages(true);
  const openFiles = (files: readonly File[]) => void intake.openFiles(files);

  return (
    <PdfSourceRegistryProvider registry={registry}>
      <PdfOpenErrors
        notices={intake.notices}
        failedStep={exporter.failedStep}
        onDismissNotice={(noticeId) => intake.dismissNotice(noticeId)}
        onDismissFailure={() => exporter.dismissFailure()}
      />
      <AnimatePresence mode="wait" initial={false}>
        {hasPages ? (
          <PdfSwapPanel key="workspace" shouldClaimFocus>
            <PdfWorkspace
              editor={editor}
              intake={intake}
              exporter={exporter}
              onStartOver={onStartOver}
            />
          </PdfSwapPanel>
        ) : (
          <PdfSwapPanel key="empty" shouldClaimFocus={isRestart || hasHadPages}>
            <PdfDropZone
              variant="full"
              openingCount={intake.openingCount}
              onFiles={openFiles}
            />
          </PdfSwapPanel>
        )}
      </AnimatePresence>
      <PdfEditAnnouncer lastEdit={editor.lastEdit} />
    </PdfSourceRegistryProvider>
  );
}

interface ToolkitRound {
  key: number;
  registry: PdfSourceRegistry;
}

/**
 * The PDF toolkit: open PDFs in the browser, edit their pages and download
 * the result. Nothing leaves the device.
 */
export function PdfToolkitPage() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [round, setRound] = useState<ToolkitRound>(() => ({
    key: 0,
    registry: createPdfSourceRegistry(),
  }));
  const [isStartOverOpen, setIsStartOverOpen] = useState(false);
  const [startOverExitCount, setStartOverExitCount] = useState(0);
  const shouldScrollToTopRef = useRef(false);
  const { registry } = round;
  useEffect(() => () => registry.dispose(), [registry]);
  usePreventFileDropNavigation();

  // The fresh drop zone sits at the top, so the window goes back up to it.
  // The dialog's scroll lock puts the window back where it was as the dialog
  // unmounts. The exit count changes in the commit that removes the dialog,
  // and React runs that unmount cleanup before this effect, so the climb
  // starts from the restored spot with no jump.
  useEffect(() => {
    if (!shouldScrollToTopRef.current) return;
    shouldScrollToTopRef.current = false;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, [startOverExitCount, reducedMotion]);

  function handleStartOverConfirm() {
    setIsStartOverOpen(false);
    shouldScrollToTopRef.current = true;
    // Closes every open document before the fresh session mounts.
    registry.dispose();
    const nextRegistry = createPdfSourceRegistry();
    setRound((previousRound) => ({
      key: previousRound.key + 1,
      registry: nextRegistry,
    }));
  }

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:utilities.pdf.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
        {
          label: t("admin:utilities.breadcrumb"),
          to: routes.adminUtilities,
        },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:utilities.hub.eyebrow")}
          title={
            <Translation
              i18nKey="admin:utilities.pdf.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:utilities.pdf.sub")}
        />
      </FadeIn>
      <AnimatePresence mode="wait">
        <PdfSwapPanel key={round.key} shouldClaimFocus={false}>
          <PdfToolkitSession
            registry={registry}
            isRestart={round.key > 0}
            isStartOverOpen={isStartOverOpen}
            onStartOver={() => setIsStartOverOpen(true)}
          />
        </PdfSwapPanel>
      </AnimatePresence>
      <AnimatePresence
        onExitComplete={() => setStartOverExitCount((count) => count + 1)}
      >
        {isStartOverOpen && (
          <ConfirmDialog
            key="start-over"
            open
            tone="destructive"
            initialFocus="cancel"
            title={t("admin:utilities.pdf.startOver.title")}
            description={t("admin:utilities.pdf.startOver.body")}
            confirmLabel={t("admin:utilities.pdf.startOver.confirm")}
            cancelLabel={t("admin:utilities.pdf.startOver.cancel")}
            onClose={() => setIsStartOverOpen(false)}
            onConfirm={handleStartOverConfirm}
          />
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
