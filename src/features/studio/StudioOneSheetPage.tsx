import { useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { personaPath } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePrintDocument } from "../economy/tools/usePrintDocument";
import { DEMO_DEFAULT_ARTIST_ID } from "./api/studioDemoMe.data";
import { useStudioPressKit } from "./api/useStudioPressKit";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { StudioOneSheet } from "./StudioOneSheet";
import { studioPressPath } from "./studioPaths";
import { useAutoPrint } from "./useAutoPrint";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./StudioOneSheet.module.css";
import "./studioOneSheet.print.css";

/** `/studio/press/print?id=`: the one-sheet on screen with a toolbar, and
 *  alone on paper. `&print=1` opens the print dialog once it is ready. */
export function StudioOneSheetPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isShowcase = useStudioShowcase();
  const subprofileId =
    searchParams.get("id") ?? (isShowcase ? DEMO_DEFAULT_ARTIST_ID : null);
  const shouldPrint = searchParams.get("print") === "1";
  const { pressKit, loadState } = useStudioPressKit(subprofileId);
  const printDocument = usePrintDocument();
  const rootRef = useRef<HTMLDivElement>(null);
  const name = pressKit?.artist.name ?? "";
  const print = useCallback(
    () => printDocument(t("studio:oneSheet.fileTitle", { name })),
    [printDocument, t, name],
  );
  // The print param leaves the URL once the dialog has opened, so Back,
  // Forward and a reload do not open it again.
  const printAndClearParam = useCallback(() => {
    print();
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("print");
        return next;
      },
      { replace: true },
    );
  }, [print, setSearchParams]);
  useAutoPrint({
    rootRef,
    isReady: pressKit !== null,
    shouldPrint,
    onPrint: printAndClearParam,
  });
  const personaUrl = pressKit?.personaHandle
    ? `${window.location.origin}${personaPath(pressKit.personaHandle)}`
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        {subprofileId && (
          <Button variant="ghost" to={studioPressPath(subprofileId)}>
            <FiArrowLeft aria-hidden /> {t("studio:oneSheet.backCta")}
          </Button>
        )}
        <Button
          onClick={() => {
            if (pressKit) print();
          }}
          aria-disabled={!pressKit || undefined}
        >
          <FiDownload aria-hidden /> {t("studio:oneSheet.downloadCta")}
        </Button>
        <p className={styles.toolbarHint}>{t("studio:oneSheet.saveHint")}</p>
      </div>
      {loadState.isNotFound || loadState.isWithdrawn ? (
        <StudioNotFound />
      ) : loadState.isError ? (
        <StudioLoadError loadState={loadState} />
      ) : !pressKit ? (
        <StudioDetailSkeleton />
      ) : (
        <div
          ref={rootRef}
          data-print-root
          data-studio-one-sheet
          className={styles.printRoot}
        >
          <StudioOneSheet pressKit={pressKit} personaUrl={personaUrl} />
        </div>
      )}
    </div>
  );
}
