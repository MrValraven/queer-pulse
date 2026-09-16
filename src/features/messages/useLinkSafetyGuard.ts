// src/features/messages/useLinkSafetyGuard.ts
import { useMemo, useState, type MouseEvent } from "react";
import { assessLinkSafety, type LinkSafetyReason } from "./linkSafety";

/** A plain left-click with no modifier held — the gesture this guard
 *  intercepts. A modified click (open-in-new-tab, open-in-new-window) or a
 *  non-primary button is left to the browser's native anchor handling, same
 *  as an ordinary (non-suspicious) link gets everywhere else in the app. */
function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export interface LinkSafetyGuard {
  isSuspicious: boolean;
  reasons: LinkSafetyReason[];
  displayHost: string;
  isConfirmOpen: boolean;
  /** Wire to the anchor's `onClick`. No-ops (lets the native anchor navigate)
   *  when the link isn't suspicious, or the click was modified. */
  handleAnchorClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** "Open anyway": closes the confirm dialog and opens the real href exactly
   *  the way the original anchor would have (a new tab, no opener). */
  openAnyway: () => void;
  /** "Go back": closes the confirm dialog without navigating anywhere. */
  cancel: () => void;
}

/**
 * PRD-371: the click-intercept + confirm-dialog state shared by every place a
 * chat link can be opened from (`linkify.tsx`'s inline anchor, `LinkPreview`'s
 * unfurl card, `ConversationMediaLinkList`'s Links shelf row) — one hook so
 * the three never drift on what counts as suspicious or how the confirm step
 * behaves. A non-suspicious link is completely unaffected: its anchor keeps
 * its real `href` and ordinary browser behaviour (copy link, open in new tab,
 * hover preview) exactly as before; only a suspicious one intercepts the
 * plain click to interpose `OpenExternalConfirmDialog`.
 */
export function useLinkSafetyGuard(href: string): LinkSafetyGuard {
  const assessment = useMemo(() => assessLinkSafety(href), [href]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!assessment.isSuspicious) return;
    if (event.defaultPrevented || !isPlainLeftClick(event)) return;
    event.preventDefault();
    setIsConfirmOpen(true);
  }

  function openAnyway() {
    setIsConfirmOpen(false);
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function cancel() {
    setIsConfirmOpen(false);
  }

  return {
    ...assessment,
    isConfirmOpen,
    handleAnchorClick,
    openAnyway,
    cancel,
  };
}
