import { FiRotateCcw, FiRotateCw } from "react-icons/fi";
import type { ToastContextValue } from "../../../shared/components/feedback/toastContext";
import {
  exportQuizCsv,
  quizCsvFileName,
  type QuizshowCsvSeparator,
} from "../builder/quizshowCsv";
import type { QuizshowDraft } from "../builder/quizshowDraft";
import type { QuizshowDraftController } from "../builder/useQuizshowDraft";
import type {
  QuizshowStudioContextValue,
  QuizshowStudioSave,
} from "./QuizshowStudioContext";
import type { QuizshowStudioMenuEntry } from "./QuizshowStudioMenu";

/**
 * The More menu's quiz tools (item 22, item 62): the CSV download and the
 * print sheets. Each helper takes the copy and the toast function it needs,
 * so the menu only wires them up.
 */

type ShowToast = ToastContextValue["showToast"];

/** How long the download link lives after its click; the browser has the file by then. */
const DOWNLOAD_URL_LIFETIME_MS = 10_000;

/** Saves the draft as `<quiz title>.csv` in the browser (a Blob URL); nothing is uploaded. */
export function downloadQuizCsv(
  draft: QuizshowDraft,
  fallbackFileName: string,
  separator: QuizshowCsvSeparator = ",",
): void {
  // The byte order mark lets spreadsheet apps read the accents as UTF-8.
  const blob = new Blob(["﻿", exportQuizCsv(draft, separator)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = quizCsvFileName(draft.title, fallbackFileName);
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_LIFETIME_MS);
}

export interface QuizshowCsvDownloadCopy {
  /** The file name for a quiz with a blank title, without `.csv`. */
  fallbackFileName: string;
  /** The toast title once the file is saved. */
  downloadedTitle: string;
  /** The toast detail naming what the file keeps and leaves out. */
  keepsDetail: string;
  /** `;` for a Portuguese app, so pt-PT spreadsheet apps split the columns. */
  separator?: QuizshowCsvSeparator;
}

/** Saves the CSV, then says what the file keeps, so the host knows what a re-import brings back. */
export function downloadQuizCsvWithNote(
  draft: QuizshowDraft,
  copy: QuizshowCsvDownloadCopy,
  showToast: ShowToast,
): void {
  downloadQuizCsv(draft, copy.fallbackFileName, copy.separator);
  showToast({ title: copy.downloadedTitle, detail: copy.keepsDetail }, "info");
}

export interface QuizshowPrintSheetRequest {
  /** The print page, from `quizshowPrintPath`. */
  path: string;
  save: Pick<QuizshowStudioSave, "isUnsaved" | "saveFirst">;
  copy: {
    /** The browser blocked the new tab. */
    tabBlocked: string;
    /** The save failed without a reason of its own. */
    saveFailed: string;
  };
  showToast: ShowToast;
  /**
   * Demo mode: goes to the print page in this tab. The demo quizzes live in
   * this tab's memory and a new tab would start again from the seeds, so the
   * sheet opens here and its own Back returns to the studio.
   */
  navigateInTab?: (path: string) => void;
}

/**
 * Opens the print page: in a new tab on the live app, in this tab in demo
 * (`navigateInTab`). The live tab opens at once, inside the click, and with
 * unsaved edits it waits for the save: it goes to the sheet once the quiz is
 * stored, and closes again with the reason in a toast when the save does not
 * land. A browser that blocks the tab gets a toast too. In demo the same
 * save runs first, and a save that does not land keeps the studio open with
 * the reason in a toast.
 */
export function openQuizshowPrintSheet({
  path,
  save,
  copy,
  showToast,
  navigateInTab,
}: QuizshowPrintSheetRequest): void {
  if (navigateInTab !== undefined) {
    if (!save.isUnsaved) {
      navigateInTab(path);
      return;
    }
    save.saveFirst().then(
      (reason) => {
        if (reason === null) navigateInTab(path);
        else showToast(reason, "error");
      },
      () => showToast(copy.saveFailed, "error"),
    );
    return;
  }
  const printTab = window.open(save.isUnsaved ? "" : path, "_blank");
  if (printTab === null) {
    showToast(copy.tabBlocked, "error");
    return;
  }
  printTab.opener = null;
  if (!save.isUnsaved) return;
  const closeWithReason = (reason: string) => {
    printTab.close();
    showToast(reason, "error");
  };
  save.saveFirst().then(
    (reason) => {
      if (reason === null) printTab.location.href = path;
      else closeWithReason(reason);
    },
    () => closeWithReason(copy.saveFailed),
  );
}

/** The textarea's line height when the browser reports none (the dialog sets 1.55). */
const FALLBACK_LINE_HEIGHT_RATIO = 1.55;
const FALLBACK_FONT_SIZE_PX = 16;

/**
 * Selects `line` (1-based, as the parser counts it) in the textarea, focuses
 * it and scrolls the line to the middle of the box. A line past the end
 * selects the last one.
 */
export function selectLineIn(
  textarea: HTMLTextAreaElement,
  text: string,
  line: number,
): void {
  const lines = text.split(/\r\n|\r|\n/);
  const lineIndex = Math.min(Math.max(line, 1), lines.length) - 1;
  const start = lines
    .slice(0, lineIndex)
    .reduce((offset, earlierLine) => offset + earlierLine.length + 1, 0);
  textarea.focus({ preventScroll: true });
  textarea.setSelectionRange(start, start + (lines[lineIndex] ?? "").length);
  const style = window.getComputedStyle(textarea);
  const lineHeight =
    Number.parseFloat(style.lineHeight) ||
    (Number.parseFloat(style.fontSize) || FALLBACK_FONT_SIZE_PX) *
      FALLBACK_LINE_HEIGHT_RATIO;
  textarea.scrollTop = Math.max(
    0,
    lineIndex * lineHeight - (textarea.clientHeight - lineHeight) / 2,
  );
  // The focus above kept the page still; this brings the box itself into view.
  textarea.scrollIntoView({ block: "nearest" });
}

/**
 * Below 1024px there is no keyboard shortcut to lean on, so Undo and Redo sit
 * in More; they take the paths Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z take
 * (`studio.history`). Each is disabled, with its reason, while there is
 * nothing to step to.
 */
export function historyEntriesOf(
  studio: Pick<QuizshowStudioContextValue, "isWide" | "history"> & {
    controller: Pick<QuizshowDraftController, "canUndo" | "canRedo">;
  },
  t: (key: string) => string,
): QuizshowStudioMenuEntry[] {
  const { history, controller } = studio;
  if (studio.isWide || history === null) return [];
  return [
    {
      key: "undo",
      label: t("quizshow:studio.more.undo"),
      icon: FiRotateCcw,
      isDisabled: controller.canUndo !== true,
      disabledReason: t("quizshow:studio.more.undoEmpty"),
      onSelect: history.undo,
    },
    {
      key: "redo",
      label: t("quizshow:studio.more.redo"),
      icon: FiRotateCw,
      isDisabled: controller.canRedo !== true,
      disabledReason: t("quizshow:studio.more.redoEmpty"),
      onSelect: history.redo,
    },
  ];
}
