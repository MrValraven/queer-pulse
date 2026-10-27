import { useCallback, useEffect, useRef, useState } from "react";
import { openPdfFile } from "../io/openPdfFile";
import type { OpenedPdf } from "../io/openPdfFile";
import { PdfOpenError } from "../io/pdfOpenErrors";
import type { OpenFailureNotice, PdfOpenFailure } from "../io/pdfOpenErrors";
import { closePdfjsDocument } from "../io/pdfjsLoader";
import { FILE_TONE_COUNT } from "../model/pdfEditModel";
import type { OpenedFileInfo } from "../model/pdfEditModel";

/** Where an opened file's documents live while the editor uses them. */
export interface PdfSourceSink {
  add(fileId: string, source: OpenedPdf): void;
}

export interface PdfFileIntake {
  openFiles(files: readonly File[]): Promise<void>;
  openingCount: number;
  notices: readonly OpenFailureNotice[];
  dismissNotice(noticeId: string): void;
  clearNotices(): void;
}

function failureReasonOf(error: unknown): PdfOpenFailure {
  return error instanceof PdfOpenError ? error.reason : "damaged";
}

/**
 * Opens picked files one after another, so the grid follows the picked order
 * and the files load one at a time. A refused file becomes a
 * notice that names its reason.
 */
export function usePdfFileIntake(options: {
  sink: PdfSourceSink;
  onFileOpened: (info: OpenedFileInfo) => void;
}): PdfFileIntake {
  const { sink, onFileOpened } = options;
  const fileCounterRef = useRef(0);
  const toneCounterRef = useRef(0);
  const noticeCounterRef = useRef(0);
  const isMountedRef = useRef(true);
  const [openingCount, setOpeningCount] = useState(0);
  const [notices, setNotices] = useState<readonly OpenFailureNotice[]>([]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const addNotice = useCallback((fileName: string, error: unknown) => {
    noticeCounterRef.current += 1;
    const notice: OpenFailureNotice = {
      id: `notice-${noticeCounterRef.current}`,
      fileName,
      reason: failureReasonOf(error),
    };
    setNotices((current) => [...current, notice]);
  }, []);

  const openOne = useCallback(
    async (file: File) => {
      let opened: OpenedPdf;
      try {
        opened = await openPdfFile(file);
      } catch (error) {
        if (isMountedRef.current) addNotice(file.name, error);
        return;
      }
      // A file that finishes after the toolkit closed is freed straight away.
      if (!isMountedRef.current) {
        closePdfjsDocument(opened.pdfjsDocument);
        return;
      }
      fileCounterRef.current += 1;
      const fileId = `file-${fileCounterRef.current}`;
      const toneIndex = toneCounterRef.current % FILE_TONE_COUNT;
      toneCounterRef.current += 1;
      sink.add(fileId, opened);
      onFileOpened({
        id: fileId,
        name: file.name,
        pageCount: opened.pageCount,
        toneIndex,
        isSigned: opened.isSigned,
        isLarge: opened.isLarge,
      });
    },
    [addNotice, onFileOpened, sink],
  );

  const openFiles = useCallback(
    async (files: readonly File[]) => {
      if (files.length === 0) return;
      setOpeningCount((count) => count + files.length);
      for (const file of files) {
        // Leaving the toolkit (or starting over) stops the rest of the batch.
        if (!isMountedRef.current) break;
        try {
          await openOne(file);
        } finally {
          if (isMountedRef.current) setOpeningCount((count) => count - 1);
        }
      }
    },
    [openOne],
  );

  const dismissNotice = useCallback((noticeId: string) => {
    setNotices((current) => current.filter((notice) => notice.id !== noticeId));
  }, []);
  const clearNotices = useCallback(() => setNotices([]), []);

  return { openFiles, openingCount, notices, dismissNotice, clearNotices };
}
