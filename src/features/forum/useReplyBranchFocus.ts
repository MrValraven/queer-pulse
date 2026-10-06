import { useEffect, useRef } from "react";

/** Where focus (or the viewport) goes once a collapse toggle has re-rendered
 *  the branch. A keyboard member who collapses with the circled minus lands on
 *  the "N hidden replies" row that replaced it, and back on the minus after
 *  expanding, so focus never drops to the page. A click on the thread line
 *  scrolls the reply back into view when collapsing left it above the fold. */
export type PendingBranchFocus =
  "branchToggle" | "gutterToggle" | "scrollIntoView";

/**
 * Focus and scroll bookkeeping for one reply node in the thread tree. Every
 * control that replaces itself on click (the circled minus, the "N hidden
 * replies" row, "Continue this thread", the inline composer opening) hands
 * focus to whatever took its place, so a keyboard member never lands on the
 * page body.
 */
export function useReplyBranchFocus({
  isCollapsed,
  isContinued,
  isReplyTarget,
  onToggleCollapse,
}: {
  isCollapsed: boolean;
  isContinued: boolean;
  isReplyTarget: boolean;
  onToggleCollapse: () => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const inlineTextareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterToggleRef = useRef<HTMLButtonElement>(null);
  const branchToggleRef = useRef<HTMLButtonElement>(null);
  const firstFlattenedRowRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<PendingBranchFocus | null>(null);

  // Move focus into the inline composer when it opens for THIS node, only on
  // the transition into being the active reply target.
  useEffect(() => {
    if (isReplyTarget) {
      inlineTextareaRef.current?.focus();
    }
  }, [isReplyTarget]);

  useEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (pendingFocus === "branchToggle") branchToggleRef.current?.focus();
    if (pendingFocus === "gutterToggle") gutterToggleRef.current?.focus();
    const nodeElement = nodeRef.current;
    if (pendingFocus !== "scrollIntoView" || !nodeElement) return;
    // `scroll-margin-top` is the height the fixed nav covers, so a reply
    // tucked under the nav counts as off screen too.
    const navCoveredHeight =
      parseFloat(getComputedStyle(nodeElement).scrollMarginTop) || 0;
    // Instant on purpose. The branch above the viewport is about to animate
    // shut, and a smooth scroll cannot keep pace with it: the page would
    // flash the content below (the footer, on a long thread) before arriving.
    // Landing on the reply first lets the member watch its branch fold away
    // beneath it. The reply's own top does not move as its branch closes, so
    // this position is already the final one.
    if (nodeElement.getBoundingClientRect().top < navCoveredHeight) {
      nodeElement.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [isCollapsed]);

  // "Continue this thread" unmounts the button that had focus. Hand focus to
  // the first row of the column it opened, without scrolling: that row sits
  // exactly where the button was.
  useEffect(() => {
    if (isContinued) {
      firstFlattenedRowRef.current?.focus({ preventScroll: true });
    }
  }, [isContinued]);

  const toggleBranch = (pendingFocus: PendingBranchFocus) => {
    pendingFocusRef.current = pendingFocus;
    onToggleCollapse();
  };

  return {
    nodeRef,
    inlineTextareaRef,
    gutterToggleRef,
    branchToggleRef,
    firstFlattenedRowRef,
    toggleBranch,
  };
}
