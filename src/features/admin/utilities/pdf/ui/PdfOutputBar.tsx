import { useId, type ReactNode } from "react";
import { FiCopy, FiDownload, FiRefreshCw, FiScissors } from "react-icons/fi";
import { Button, Collapse, Spinner } from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { PdfExportKind } from "../output/outputNames";
import styles from "./PdfChrome.module.css";

interface PdfOutputBarProps {
  chunkCount: number;
  busyKind: PdfExportKind | null;
  isStartOverDisabled: boolean;
  onExport: (kind: PdfExportKind) => void;
  onStartOver: () => void;
}

interface OutputSlotProps {
  isBusy: boolean;
  children: ReactNode;
}

/** One output button with the building line that grows in under it while busy. */
function OutputSlot({ isBusy, children }: OutputSlotProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.outputSlot}>
      {children}
      <div role="status">
        <Collapse isOpen={isBusy}>
          <span className={styles.building}>
            <Spinner />
            {t("admin:utilities.pdf.output.building")}
          </span>
        </Collapse>
      </div>
    </div>
  );
}

/**
 * The ways out of the toolkit: one PDF, one file per part once splits exist,
 * one file per page, or start over. Every output waits while a file builds.
 * A waiting output stays focusable (aria-disabled, its press ignored), so the
 * keyboard keeps its place on the button just pressed.
 */
export function PdfOutputBar({
  chunkCount,
  busyKind,
  isStartOverDisabled,
  onExport,
  onStartOver,
}: PdfOutputBarProps) {
  const { t } = useTranslation();
  const splitHintId = useId();
  const isBuilding = busyKind !== null;
  const hasCuts = chunkCount > 1;
  const isSplitBlocked = !hasCuts;
  const waitingProps = { "aria-disabled": isBuilding || undefined };

  function exportUnlessBuilding(kind: PdfExportKind) {
    if (!isBuilding) onExport(kind);
  }

  return (
    <div className={styles.outputBar}>
      <div className={styles.outputActions}>
        <OutputSlot isBusy={busyKind === "single"}>
          <Button
            variant={hasCuts ? "ghost" : "primary"}
            {...waitingProps}
            onClick={() => exportUnlessBuilding("single")}
          >
            <FiDownload aria-hidden />
            {t("admin:utilities.pdf.output.download")}
          </Button>
        </OutputSlot>
        <OutputSlot isBusy={busyKind === "split"}>
          <Button
            variant={hasCuts ? "primary" : "ghost"}
            disabled={isSplitBlocked}
            {...waitingProps}
            aria-describedby={isSplitBlocked ? splitHintId : undefined}
            onClick={() => exportUnlessBuilding("split")}
          >
            <FiScissors aria-hidden />
            {hasCuts
              ? t("admin:utilities.pdf.output.splitCount", {
                  count: chunkCount,
                })
              : t("admin:utilities.pdf.output.split")}
          </Button>
        </OutputSlot>
        <OutputSlot isBusy={busyKind === "every-page"}>
          <Button
            variant="ghost"
            {...waitingProps}
            onClick={() => exportUnlessBuilding("every-page")}
          >
            <FiCopy aria-hidden />
            {t("admin:utilities.pdf.output.everyPage")}
          </Button>
        </OutputSlot>
        <Button
          variant="quiet"
          className={styles.startOver}
          disabled={isStartOverDisabled}
          onClick={onStartOver}
        >
          <FiRefreshCw aria-hidden />
          {t("admin:utilities.pdf.output.startOver")}
        </Button>
      </div>
      {/* Its own row under the buttons, so it never widens the Split slot. */}
      <Collapse isOpen={isSplitBlocked}>
        <p id={splitHintId} className={styles.hint}>
          {t("admin:utilities.pdf.output.splitHint")}
        </p>
      </Collapse>
    </div>
  );
}
