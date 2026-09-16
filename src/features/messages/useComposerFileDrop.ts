// src/features/messages/useComposerFileDrop.ts
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type DragEvent as ReactDragEvent,
} from "react";
import type { AttachmentStaging } from "./useAttachmentStaging";

/** How long after the last `dragover` the drop overlay stays up before the
 *  watchdog below (I4) assumes the drag left the document without ever
 *  firing a `dragleave` on the composer, and hides it anyway. */
const DRAG_WATCHDOG_MS = 200;

/** Splits an arbitrary file list into the two buckets `useAttachmentStaging`
 *  already validates: images go to `onImagePicked` (runs
 *  `validateTypeAndSize`, the SAME allow-list the gallery input's `accept`
 *  mirrors), everything else goes to `onDocumentPicked` (runs
 *  `validateDocumentTypeAndSize`, which toasts a rejection for a type the
 *  backend doesn't accept). This is the SAME pair `ComposerAttachButton`'s
 *  menu already calls, so a pasted or dropped file gets identical
 *  validation, preview and background-upload treatment as one picked from
 *  the menu. Returns whether a handler actually ran, so callers can decide
 *  whether to swallow the browser's own default behaviour (a paste inserting
 *  nothing, a drop navigating to the file); on a surface that never wired
 *  `onImagePicked`/`onDocumentPicked` at all, nothing runs and the browser's
 *  default is left alone rather than silently swallowing the gesture. */
function stageFilesByType(staging: AttachmentStaging, files: File[]): boolean {
  if (files.length === 0) return false;
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));
  const documentFiles = files.filter((file) => !file.type.startsWith("image/"));
  let didStage = false;
  if (imageFiles.length > 0 && staging.onImagePicked) {
    staging.onImagePicked(imageFiles);
    didStage = true;
  }
  if (documentFiles.length > 0 && staging.onDocumentPicked) {
    staging.onDocumentPicked(documentFiles);
    didStage = true;
  }
  return didStage;
}

/** Extracts the real `File` objects a paste carried. `clipboardData.items`
 *  holds a `"string"` item for a plain-text paste, never a `"file"` one, so
 *  an ordinary Ctrl+V of words yields nothing here. Falls back to
 *  `clipboardData.files` only when `items` yielded no files at all (some
 *  paste sources populate one and not the other); the two lists are never
 *  combined, since some browsers duplicate the same file across both. */
function filesFromClipboard(clipboardData: DataTransfer | null): File[] {
  if (!clipboardData) return [];
  const filesFromItems = Array.from(clipboardData.items ?? [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
  if (filesFromItems.length > 0) return filesFromItems;
  return Array.from(clipboardData.files ?? []);
}

/** Whether a drag event is carrying files at all, as opposed to a dragged
 *  text selection or link, checked before every handler below so the
 *  composer never paints its drop affordance, or calls `preventDefault`,
 *  over a non-file drag. Shared between the React drag handlers (which see a
 *  React `DragEvent`) and the window-level listeners below (which see the
 *  native one); both carry the same `dataTransfer.types`. */
function isFileDrag(dataTransfer: DataTransfer | null): boolean {
  return Array.from(dataTransfer?.types ?? []).includes("Files");
}

/**
 * DES-204: pasting or dropping files onto the composer stages them through
 * the SAME `useAttachmentStaging` entry points the attach menu uses
 * (`stageFilesByType` above), instead of a plain-text paste inserting
 * nothing useful and a file drop navigating the tab away to the file.
 *
 * The drag affordance is tracked with a DEPTH COUNTER: `dragenter`/
 * `dragleave` fire once per element boundary the pointer crosses, including
 * every child of the drop target, so a boolean flag flickers `false` for a
 * frame each time the pointer crosses into a child, which reads as the
 * "drop to send" overlay stuttering while dragging over the composer. The
 * counter only reaches zero once the pointer has actually left every nested
 * element, which is when the affordance should hide.
 */
export function useComposerFileDrop(staging: AttachmentStaging) {
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragDepthRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const watchdogTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearWatchdog = useCallback(() => {
    if (watchdogTimeoutRef.current) {
      clearTimeout(watchdogTimeoutRef.current);
      watchdogTimeoutRef.current = null;
    }
  }, []);

  // I4: re-armed on every `dragenter`/`dragover` over the composer; if none
  // follows within `DRAG_WATCHDOG_MS`, the drag most likely left the
  // document entirely (dropped on the OS desktop, dragged into another
  // window) without ever firing the `dragleave` the depth counter above
  // relies on, so this hides the overlay and resets the counter on its own.
  const armWatchdog = useCallback(() => {
    clearWatchdog();
    watchdogTimeoutRef.current = setTimeout(() => {
      dragDepthRef.current = 0;
      setIsDraggingFiles(false);
    }, DRAG_WATCHDOG_MS);
  }, [clearWatchdog]);

  const onDragEnter = useCallback(
    (event: ReactDragEvent) => {
      if (!isFileDrag(event.dataTransfer)) return;
      event.preventDefault();
      dragDepthRef.current += 1;
      setIsDraggingFiles(true);
      armWatchdog();
    },
    [armWatchdog],
  );

  const onDragOver = useCallback(
    (event: ReactDragEvent) => {
      if (!isFileDrag(event.dataTransfer)) return;
      // Required for the browser to fire `drop` here at all, rather than
      // treating the gesture as "not a valid drop target" and navigating away.
      event.preventDefault();
      armWatchdog();
    },
    [armWatchdog],
  );

  const onDragLeave = useCallback(
    (event: ReactDragEvent) => {
      if (!isFileDrag(event.dataTransfer)) return;
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDraggingFiles(false);
        clearWatchdog();
      }
    },
    [clearWatchdog],
  );

  const onDrop = useCallback(
    (event: ReactDragEvent) => {
      if (!isFileDrag(event.dataTransfer)) return;
      event.preventDefault();
      dragDepthRef.current = 0;
      setIsDraggingFiles(false);
      clearWatchdog();
      stageFilesByType(staging, Array.from(event.dataTransfer.files));
    },
    [staging, clearWatchdog],
  );

  // I3: dropping just outside the composer's own boundary still lands on
  // `window`, and left unhandled the browser navigates the whole tab to the
  // file. Listens at the window level so a drag that never crosses the
  // composer at all is covered too, and only intervenes OUTSIDE the
  // composer: inside it, the element's own handlers above already call
  // `preventDefault` and own the drop.
  useEffect(() => {
    function isOutsideComposer(target: EventTarget | null): boolean {
      return (
        !(target instanceof Node) || !containerRef.current?.contains(target)
      );
    }
    function handleWindowDragOver(event: DragEvent) {
      if (!isFileDrag(event.dataTransfer)) return;
      if (isOutsideComposer(event.target)) {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "none";
      }
    }
    function handleWindowDrop(event: DragEvent) {
      if (isFileDrag(event.dataTransfer) && isOutsideComposer(event.target)) {
        event.preventDefault();
      }
      // I4: any drop anywhere in the window clears the watchdog and any
      // affordance still showing, whether or not it landed on the composer.
      dragDepthRef.current = 0;
      setIsDraggingFiles(false);
      clearWatchdog();
    }
    function handleWindowBlur() {
      // I4: the OS file chooser, another app gaining focus, or the drag
      // leaving the browser window entirely all blur the window without
      // firing `dragleave` or `drop` here, so this is the last line of
      // defence against a stuck overlay.
      dragDepthRef.current = 0;
      setIsDraggingFiles(false);
      clearWatchdog();
    }
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
      window.removeEventListener("blur", handleWindowBlur);
      clearWatchdog();
    };
  }, [clearWatchdog]);

  const onPaste = useCallback(
    (event: ReactClipboardEvent<HTMLTextAreaElement>) => {
      const clipboardData = event.clipboardData;
      // I1: a paste that also carries text (Excel/Numbers/Word/Sheets put
      // `text/plain` alongside `image/png` when copying a cell or a
      // selection) keeps that text. The member almost always wants the
      // pasted words themselves, so this returns before ever looking at the
      // file list.
      if (clipboardData?.getData("text/plain").trim()) return;
      const files = filesFromClipboard(clipboardData);
      // Only swallow the paste when a handler actually ran on it: an
      // ordinary text paste, or a file paste this surface never wired up,
      // falls through to the textarea's own default handling.
      if (stageFilesByType(staging, files)) event.preventDefault();
    },
    [staging],
  );

  return {
    isDraggingFiles,
    containerRef,
    dropHandlers: { onDragEnter, onDragOver, onDragLeave, onDrop },
    onPaste,
  };
}
