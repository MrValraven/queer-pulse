import { useCallback } from "react";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import styles from "./MessagesPage.module.css";

/**
 * The ONE scroll-to + briefly-highlight-a-message mechanism, shared by the
 * reply-quote jump and cross-inbox search. Scrolls the bubble whose DOM id is
 * `message-<id>` (see `MessageBubble`) into view and flashes the existing
 * `.messageHighlight` outline for ~1.2s. Honours `prefers-reduced-motion` (an
 * instant jump, no smooth glide; the flash keyframes are already disabled under
 * reduced motion in CSS). Returns whether the target bubble was actually in the
 * rendered DOM — callers use that to retry while a thread is still mounting, or
 * to accept that an off-page (older, not-yet-paged) message can't be reached.
 */
export function useJumpToMessage(): (messageId: string) => boolean {
  return useCallback((messageId: string): boolean => {
    const node = document.getElementById(`message-${messageId}`);
    if (!node) return false;
    node.scrollIntoView({
      behavior: prefersReducedMotionNow() ? "auto" : "smooth",
      block: "center",
    });
    const highlightClass = styles.messageHighlight;
    if (highlightClass) {
      node.classList.add(highlightClass);
      window.setTimeout(() => node.classList.remove(highlightClass), 1200);
    }
    return true;
  }, []);
}
