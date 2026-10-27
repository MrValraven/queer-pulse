import { useCallback, useEffect, useRef, useState } from "react";
import { downloadBlobFile } from "../../../../../shared/lib/downloadBlob";
import { everyPageChunks, splitIntoChunks } from "../model/pdfEditModel";
import type { OpenedFileInfo, PageItem } from "../model/pdfEditModel";
import { buildPdf, buildPdfSet } from "../output/buildPdf";
import type { PdfLibSourceLookup } from "../output/buildPdf";
import { buildZip } from "../output/buildZip";
import {
  partFileNames,
  singleOutputName,
  splitZipName,
} from "../output/outputNames";
import type { PdfExportKind } from "../output/outputNames";
import { PdfBuildError } from "../output/pdfBuildError";
import type { PdfBuildStep } from "../output/pdfBuildError";

export interface PdfExport {
  exportAs(kind: PdfExportKind): Promise<void>;
  busyKind: PdfExportKind | null;
  failedStep: PdfBuildStep | null;
  dismissFailure(): void;
}

interface ExportFile {
  readonly fileName: string;
  readonly blob: Blob;
}

const PDF_TYPE = "application/pdf";
const ZIP_TYPE = "application/zip";

function blobOf(bytes: Uint8Array, type: string): Blob {
  return new Blob([new Uint8Array(bytes)], { type });
}

async function buildExportFile(
  kind: PdfExportKind,
  pages: readonly PageItem[],
  getSource: PdfLibSourceLookup,
  firstFileName: string,
): Promise<ExportFile> {
  if (kind === "single") {
    const isMerged = new Set(pages.map((page) => page.fileId)).size > 1;
    return {
      fileName: singleOutputName(firstFileName, isMerged),
      blob: blobOf(await buildPdf(pages, getSource), PDF_TYPE),
    };
  }
  const chunks =
    kind === "split" ? splitIntoChunks(pages) : everyPageChunks(pages);
  const entries = await buildPdfSet(
    chunks,
    getSource,
    partFileNames(firstFileName, chunks.length),
  );
  return {
    fileName: splitZipName(firstFileName),
    blob: blobOf(buildZip(entries), ZIP_TYPE),
  };
}

/** Thrown into the build when the toolkit closed while it was running. */
class ExportAbandonedError extends Error {}

/**
 * Builds the chosen output in the browser and downloads it. Leaving the
 * toolkit mid-build stops it: the next part's source lookup throws, nothing
 * is downloaded on the page the person moved to, and no failure is raised
 * on a toolkit that is gone.
 */
export function usePdfExport(options: {
  getSource: PdfLibSourceLookup;
  pages: readonly PageItem[];
  filesById: ReadonlyMap<string, OpenedFileInfo>;
}): PdfExport {
  const { getSource, pages, filesById } = options;
  const [busyKind, setBusyKind] = useState<PdfExportKind | null>(null);
  const [failedStep, setFailedStep] = useState<PdfBuildStep | null>(null);
  const isBusyRef = useRef(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const exportAs = useCallback(
    async (kind: PdfExportKind) => {
      const firstPage = pages[0];
      if (!firstPage || isBusyRef.current) return;
      // An unknown file falls back to the generic base name in outputNames.
      const firstFileName = filesById.get(firstPage.fileId)?.name ?? "";
      isBusyRef.current = true;
      setBusyKind(kind);
      setFailedStep(null);
      // Each part looks its sources up as it starts, so a split stops between
      // parts once the toolkit has closed.
      const getLiveSource: PdfLibSourceLookup = (fileId) => {
        if (!isMountedRef.current) throw new ExportAbandonedError();
        return getSource(fileId);
      };
      try {
        const exportFile = await buildExportFile(
          kind,
          pages,
          getLiveSource,
          firstFileName,
        );
        if (!isMountedRef.current) return;
        downloadBlobFile(exportFile.fileName, exportFile.blob);
      } catch (error) {
        if (!isMountedRef.current) return;
        setFailedStep(error instanceof PdfBuildError ? error.step : "pdf");
      } finally {
        isBusyRef.current = false;
        setBusyKind(null);
      }
    },
    [filesById, getSource, pages],
  );

  const dismissFailure = useCallback(() => setFailedStep(null), []);

  return { exportAs, busyKind, failedStep, dismissFailure };
}
