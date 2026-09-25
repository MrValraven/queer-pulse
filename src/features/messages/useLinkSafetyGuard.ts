// src/features/messages/useLinkSafetyGuard.ts
import { useMemo, useState, type MouseEvent } from "react";
import { isPlainLeftClick } from "../../shared/links/inAppLinks";
import { useInAppAnchorClick } from "../../shared/links/useInAppLinkRouting";
import { assessLinkSafety, type LinkSafetyReason } from "./linkSafety";

export interface LinkSafetyGuard {
  isSuspicious: boolean;
  reasons: LinkSafetyReason[];
  displayHost: string;
  isConfirmOpen: boolean;
  /** Wire to the anchor's `onClick`. Routes a plain click on a link back into
   *  QueerPulse through the SPA; otherwise no-ops (lets the native anchor
   *  navigate) when the link isn't suspicious, or the click was modified. */
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
 *
 * A plain click on a link back into QueerPulse is routed in-app instead of
 * following the anchor's `target="_blank"`: an installed PWA opens a new tab
 * in the system browser, which throws the reader out of the app. That routing
 * is the shared `useInAppAnchorClick` (`src/shared/links/useInAppLinkRouting.ts`),
 * which also leaves a chat link rendered outside a router working as an
 * ordinary new-tab anchor.
 */
export function useLinkSafetyGuard(href: string): LinkSafetyGuard {
  const assessment = useMemo(() => assessLinkSafety(href), [href]);
  const handleInAppAnchorClick = useInAppAnchorClick();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || !isPlainLeftClick(event)) return;
    if (assessment.isSuspicious) {
      event.preventDefault();
      setIsConfirmOpen(true);
      return;
    }
    handleInAppAnchorClick(event);
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
