import { useEffect, useRef, useState, type RefObject } from "react";

type PendingFocus = { target: "row"; uid: string } | { target: "add" };

/**
 * Focus + live-region message for `SubprofileSectionEditor`'s Remove and
 * Insert examples actions (design review M2). Either action unmounts the
 * button that had focus, which otherwise drops focus to the page body with
 * no announcement. `focusRowOrAdd` records where it should land next (the
 * row taking the removed row's slot, or the Add button once the list is
 * empty); the effect applies it once the caller's row list (`rows`) has
 * re-rendered with that row in place. The target lives in a ref: consuming
 * it after focusing is a plain ref write, so nothing in the effect calls
 * setState. Extracted out of the section editor to keep that component
 * under the 200-line cap.
 */
export function useSectionEditorFocusAnnounce<Row>(
  addButtonRef: RefObject<HTMLButtonElement | null>,
  rows: Row[],
) {
  const pendingFocusRef = useRef<PendingFocus | null>(null);
  const pendingAnnounceFrameRef = useRef<number | null>(null);
  const [focusSignal, setFocusSignal] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    return () => {
      if (pendingAnnounceFrameRef.current !== null) {
        cancelAnimationFrame(pendingAnnounceFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (!pendingFocus) return;
    if (pendingFocus.target === "add") {
      addButtonRef.current?.focus();
    } else {
      const editButton = document.querySelector<HTMLButtonElement>(
        `[data-row-uid="${pendingFocus.uid}"] [data-edit-button]`,
      );
      editButton?.focus();
    }
    pendingFocusRef.current = null;
  }, [focusSignal, rows, addButtonRef]);

  function focusRowOrAdd(uid: string | undefined) {
    pendingFocusRef.current = uid ? { target: "row", uid } : { target: "add" };
    setFocusSignal((signal) => signal + 1);
  }

  /** Sets the live-region message. Clears it first and applies the new text
   *  on the next frame: a screen reader only announces a live region on a
   *  text CHANGE, so two removals in a row producing the identical string
   *  (two untitled photos, say) would otherwise announce once and go silent
   *  on the second. */
  function announce(message: string) {
    if (pendingAnnounceFrameRef.current !== null) {
      cancelAnimationFrame(pendingAnnounceFrameRef.current);
    }
    setAnnouncement("");
    pendingAnnounceFrameRef.current = requestAnimationFrame(() => {
      pendingAnnounceFrameRef.current = null;
      setAnnouncement(message);
    });
  }

  return { announcement, announce, focusRowOrAdd };
}
