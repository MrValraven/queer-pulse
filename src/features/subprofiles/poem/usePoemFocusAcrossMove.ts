import { useCallback, useLayoutEffect, useRef } from "react";
import { useFocusAcrossMove } from "../useFocusAcrossMove";

/** Where a selection sat, by node and offset. A live Range would not do:
 *  taking its node out of the document collapses it to the parent. */
interface SelectionSnapshot {
  element: HTMLElement;
  anchorNode: Node;
  anchorOffset: number;
  focusNode: Node;
  focusOffset: number;
}

function selectionInside(element: HTMLElement): SelectionSnapshot | null {
  const selection = window.getSelection();
  const anchorNode = selection?.anchorNode;
  const focusNode = selection?.focusNode;
  if (!selection || !anchorNode || !focusNode) return null;
  if (!element.contains(anchorNode) || !element.contains(focusNode)) {
    return null;
  }
  return {
    element,
    anchorNode,
    anchorOffset: selection.anchorOffset,
    focusNode,
    focusOffset: selection.focusOffset,
  };
}

/**
 * `useFocusAcrossMove` for the poem's blocks. A stanza or note is a
 * contentEditable field, so on top of the focus the base hook puts back, the
 * caret or selection inside it is noted by node and offset and set again on
 * the next commit. The text nodes ride along with the block, so the offsets
 * still point where they did. Nothing is set when focus went elsewhere.
 */
export function usePoemFocusAcrossMove() {
  const { remember: rememberFocus } = useFocusAcrossMove();
  const selectionRef = useRef<SelectionSnapshot | null>(null);

  const remember = useCallback(() => {
    rememberFocus();
    const active = document.activeElement;
    selectionRef.current =
      active instanceof HTMLElement && active.isContentEditable
        ? selectionInside(active)
        : null;
  }, [rememberFocus]);

  // Declared after the base hook's effect, so focus is back when this runs.
  useLayoutEffect(() => {
    const snapshot = selectionRef.current;
    if (!snapshot) return;
    selectionRef.current = null;
    const { element, anchorNode, anchorOffset, focusNode, focusOffset } =
      snapshot;
    if (document.activeElement !== element) return;
    if (!element.contains(anchorNode) || !element.contains(focusNode)) return;
    try {
      window
        .getSelection()
        ?.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
    } catch {
      // The text changed under the offsets: keep the caret focus() placed.
    }
  });

  return { remember };
}
